import razorpay
from django.conf import settings
from .models import Transaction, Membership, MembershipPlan

# Initialize Razorpay Client
# In production, these should be in your .env
RAZORPAY_KEY_ID = getattr(settings, 'RAZORPAY_KEY_ID', 'rzp_test_dummy_id')
RAZORPAY_KEY_SECRET = getattr(settings, 'RAZORPAY_KEY_SECRET', 'dummy_secret')

try:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    print(f"Warning: Razorpay client initialization failed: {e}")
    client = None

class PaymentService:
    @staticmethod
    def create_order(user, plan):
        """Step 1: Create an order on Razorpay servers"""
        print(f"DEBUG: Creating order for user {user.email}, plan {plan.name} (${plan.price})")
        if not client:
            print("DEBUG: Razorpay client is None")
            raise ValueError("Razorpay is not configured.")

        amount_in_paise = int(plan.price * 100)
        
        data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"receipt_plan_{plan.id}_{user.id}",
        }
        
        print(f"DEBUG: Razorpay request data: {data}")
        try:
            razorpay_order = client.order.create(data=data)
            print(f"DEBUG: Razorpay order created: {razorpay_order['id']}")
            
            # Save pending transaction in our DB
            Transaction.objects.create(
                user=user,
                plan=plan,
                order_id=razorpay_order['id'],
                amount=plan.price,
                status='PENDING'
            )
            
            return razorpay_order
        except Exception as e:
            print(f"DEBUG: Razorpay exception: {str(e)}")
            raise ValueError(f"Failed to create Razorpay order: {str(e)}")

    @staticmethod
    def verify_payment(data):
        """Step 2: Verify the signature returned by Razorpay"""
        if not client:
            return False, "Razorpay is not configured."

        try:
            # This will raise an error if verification fails
            client.utility.verify_payment_signature({
                'razorpay_order_id': data['razorpay_order_id'],
                'razorpay_payment_id': data['razorpay_payment_id'],
                'razorpay_signature': data['razorpay_signature']
            })
            
            # Update Transaction
            try:
                transaction = Transaction.objects.get(order_id=data['razorpay_order_id'])
            except Transaction.DoesNotExist:
                return False, "Transaction not found."

            if transaction.status == 'SUCCESS':
                return True, "Payment already verified."

            transaction.status = 'SUCCESS'
            transaction.payment_id = data['razorpay_payment_id']
            transaction.signature = data['razorpay_signature']
            transaction.save()
            
            # Activate/Update Membership
            membership, created = Membership.objects.get_or_create(user=transaction.user)
            membership.subscribe(transaction.plan, payment_ref=transaction.payment_id)
            
            return True, "Payment verified and membership activated."
            
        except Exception as e:
            # Handle signature mismatch or other errors
            if 'razorpay_order_id' in data:
                Transaction.objects.filter(order_id=data['razorpay_order_id']).update(status='FAILED')
            return False, f"Payment verification failed: {str(e)}"
