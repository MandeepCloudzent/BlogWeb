from rest_framework import serializers
from .models import MembershipPlan, Membership, MembershipHistory


class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = (
            'id', 'name', 'slug', 'description', 'price',
            'billing_cycle', 'duration_days', 'features',
            'max_posts_per_month', 'is_active', 'order',
        )


class MembershipSerializer(serializers.ModelSerializer):
    plan = MembershipPlanSerializer(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    days_remaining = serializers.IntegerField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Membership
        fields = (
            'id', 'plan', 'status', 'start_date', 'end_date',
            'cancelled_at', 'payment_reference', 'auto_renew',
            'is_active', 'days_remaining', 'is_expired',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'start_date', 'created_at', 'updated_at')


class MembershipHistorySerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True, default='N/A')

    class Meta:
        model = MembershipHistory
        fields = ('id', 'action', 'plan', 'plan_name', 'payment_reference', 'metadata', 'created_at')


class SubscribeSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()
    payment_reference = serializers.CharField(required=False, default='')

    def validate_plan_id(self, value):
        try:
            MembershipPlan.objects.get(pk=value, is_active=True)
        except MembershipPlan.DoesNotExist:
            raise serializers.ValidationError('Plan not found or inactive.')
        return value
