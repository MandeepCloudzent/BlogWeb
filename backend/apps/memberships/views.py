from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MembershipPlan, Membership, MembershipHistory
from .serializers import (
    MembershipPlanSerializer, MembershipSerializer,
    MembershipHistorySerializer, SubscribeSerializer,
)


# ─── Plans ─────────────────────────────────────

class PlanListView(generics.ListAPIView):
    """GET /api/memberships/plans/ — List active membership plans."""
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [permissions.AllowAny]


class PlanDetailView(generics.RetrieveAPIView):
    """GET /api/memberships/plans/<slug>/ — Plan details."""
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


# ─── Subscribe ─────────────────────────────────

class SubscribeView(APIView):
    """
    POST /api/memberships/subscribe/

    Business logic:
    1. Validate the plan exists and is active.
    2. Get or create the user's Membership record.
    3. Call membership.subscribe(plan) which sets start_date & calculates end_date.
    4. Log the action in MembershipHistory.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = MembershipPlan.objects.get(pk=serializer.validated_data['plan_id'])
        payment_ref = serializer.validated_data.get('payment_reference', '')

        membership, created = Membership.objects.get_or_create(
            user=request.user
        )
        membership.subscribe(plan, payment_ref=payment_ref)

        # Audit log
        MembershipHistory.objects.create(
            user=request.user,
            plan=plan,
            action='subscribe',
            payment_reference=payment_ref,
            metadata={'created_new': created},
        )

        return Response(
            MembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# ─── Renew ─────────────────────────────────────

class RenewView(APIView):
    """
    POST /api/memberships/renew/

    Business logic:
    - If membership is still active, extends from end_date (no lost days).
    - If expired, starts fresh from now.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            membership = Membership.objects.get(user=request.user)
        except Membership.DoesNotExist:
            return Response(
                {'detail': 'No membership found. Subscribe first.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not membership.plan:
            return Response(
                {'detail': 'No plan associated. Subscribe to a plan first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_ref = request.data.get('payment_reference', '')
        membership.renew(payment_ref=payment_ref)

        MembershipHistory.objects.create(
            user=request.user,
            plan=membership.plan,
            action='renew',
            payment_reference=payment_ref,
            metadata={'days_remaining_before': membership.days_remaining},
        )

        return Response(MembershipSerializer(membership).data)


# ─── Upgrade ───────────────────────────────────

class UpgradeView(APIView):
    """
    POST /api/memberships/upgrade/
    Body: { "plan_id": <new_plan_id> }

    Business logic:
    - Switches to a new plan, resets start_date, recalculates end_date.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'detail': 'plan_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_plan = MembershipPlan.objects.get(pk=plan_id, is_active=True)
        except MembershipPlan.DoesNotExist:
            return Response({'detail': 'Plan not found or inactive.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            membership = Membership.objects.get(user=request.user)
        except Membership.DoesNotExist:
            return Response({'detail': 'No membership found. Subscribe first.'}, status=status.HTTP_404_NOT_FOUND)

        old_plan_name = membership.plan.name if membership.plan else 'None'
        payment_ref = request.data.get('payment_reference', '')
        membership.upgrade(new_plan, payment_ref=payment_ref)

        MembershipHistory.objects.create(
            user=request.user,
            plan=new_plan,
            action='upgrade',
            payment_reference=payment_ref,
            metadata={'upgraded_from': old_plan_name},
        )

        return Response(MembershipSerializer(membership).data)


# ─── My Membership ────────────────────────────

class MyMembershipView(generics.RetrieveAPIView):
    """
    GET /api/memberships/my-membership/

    Auto-checks expiry on every access and returns current status.
    """
    serializer_class = MembershipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        membership, _ = Membership.objects.get_or_create(user=self.request.user)
        # Auto-expire check on every access
        membership.check_and_expire()
        return membership


# ─── Cancel ────────────────────────────────────

class CancelMembershipView(APIView):
    """
    POST /api/memberships/cancel/

    Business logic:
    - Sets status to 'cancelled' but retains end_date.
    - User keeps access until end_date passes.
    - auto_renew is set to False.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            membership = Membership.objects.get(user=request.user)
        except Membership.DoesNotExist:
            return Response({'detail': 'No membership found.'}, status=status.HTTP_404_NOT_FOUND)

        if membership.status in ('expired', 'cancelled'):
            return Response(
                {'detail': f'Membership is already {membership.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        membership.cancel()

        MembershipHistory.objects.create(
            user=request.user,
            plan=membership.plan,
            action='cancel',
            metadata={'days_remaining': membership.days_remaining},
        )

        return Response({
            'detail': 'Membership cancelled. You retain access until your billing period ends.',
            'end_date': membership.end_date,
            'days_remaining': membership.days_remaining,
        })


# ─── History ───────────────────────────────────

class MembershipHistoryView(generics.ListAPIView):
    """GET /api/memberships/history/ — User's subscription history."""
    serializer_class = MembershipHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MembershipHistory.objects.filter(user=self.request.user)


# ─── Payment Gateway (Razorpay) ────────────────

from .services import PaymentService

class CreatePaymentOrderView(APIView):
    """POST /api/memberships/payments/create-order/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'detail': 'plan_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = MembershipPlan.objects.get(pk=plan_id, is_active=True)
            order = PaymentService.create_order(request.user, plan)
            return Response(order)
        except MembershipPlan.DoesNotExist:
            return Response({'detail': 'Plan not found or inactive.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerifyPaymentView(APIView):
    """POST /api/memberships/payments/verify/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Expected data: razorpay_order_id, razorpay_payment_id, razorpay_signature
        success, message = PaymentService.verify_payment(request.data)
        
        if success:
            return Response({'detail': message}, status=status.HTTP_200_OK)
        else:
            return Response({'detail': message}, status=status.HTTP_400_BAD_REQUEST)
