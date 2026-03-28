from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify


class MembershipPlan(models.Model):
    """
    Defines a subscription tier.

    Business rules:
    - `duration_days` is the fallback; if billing_cycle is set,
      it auto-calculates 30 (monthly) or 365 (yearly).
    - Only plans with `is_active=True` are visible to users.
    - `features` is a JSON list of feature strings shown on pricing cards.
    """
    BILLING_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True, help_text='Plan description for pricing page')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=10, choices=BILLING_CHOICES, default='monthly')
    duration_days = models.PositiveIntegerField(
        default=30,
        help_text='Subscription duration in days. Auto-set from billing_cycle if left at default.'
    )
    features = models.JSONField(default=list, help_text='List of feature strings')
    max_posts_per_month = models.PositiveIntegerField(
        default=10,
        help_text='Maximum posts a subscriber can publish per month (0 = unlimited)'
    )
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['order', 'price']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # Auto-set duration from billing cycle
        if self.billing_cycle == 'monthly' and self.duration_days == 30:
            self.duration_days = 30
        elif self.billing_cycle == 'yearly' and self.duration_days == 30:
            self.duration_days = 365
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} — ${self.price}/{self.billing_cycle}"


class Membership(models.Model):
    """
    Tracks a user's active subscription.

    Business rules:
    - One membership per user (OneToOneField).
    - `is_active` is a computed property that checks `end_date` vs now.
    - `subscribe()` calculates end_date from plan.duration_days.
    - `renew()` extends from the current end_date (not from now) to prevent
      users from losing remaining days.
    - `cancel()` keeps end_date intact so users retain access until expiry.
    - `check_and_expire()` is called on access to auto-transition status.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
        ('paused', 'Paused'),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='membership'
    )
    plan = models.ForeignKey(
        MembershipPlan, on_delete=models.SET_NULL, null=True,
        blank=True, related_name='memberships'
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    payment_reference = models.CharField(max_length=255, blank=True)
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    # ──────────────────────────────────────────────
    # Computed properties
    # ──────────────────────────────────────────────
    @property
    def is_active(self):
        """True if status is active AND not past end_date."""
        if self.status != 'active':
            return False
        if self.end_date and timezone.now() > self.end_date:
            return False
        return True

    @property
    def days_remaining(self):
        """Days left on the current subscription, 0 if expired."""
        if not self.end_date:
            return 0
        delta = self.end_date - timezone.now()
        return max(0, delta.days)

    @property
    def is_expired(self):
        """True if end_date is in the past."""
        if not self.end_date:
            return True
        return timezone.now() > self.end_date

    # ──────────────────────────────────────────────
    # Business logic methods
    # ──────────────────────────────────────────────
    def subscribe(self, plan, payment_ref=''):
        """
        Activate a subscription to the given plan.
        Sets start_date to now and calculates end_date from plan.duration_days.
        """
        now = timezone.now()
        self.plan = plan
        self.status = 'active'
        self.start_date = now
        self.end_date = now + timezone.timedelta(days=plan.duration_days)
        self.payment_reference = payment_ref
        self.cancelled_at = None
        self.save()
        return self

    def renew(self, payment_ref=''):
        """
        Extend the subscription by another plan.duration_days.
        If still active, adds time from current end_date (no lost days).
        If expired, starts fresh from now.
        """
        if not self.plan:
            raise ValueError('No plan associated with this membership.')

        base_date = self.end_date if self.end_date and self.end_date > timezone.now() else timezone.now()
        self.end_date = base_date + timezone.timedelta(days=self.plan.duration_days)
        self.status = 'active'
        self.payment_reference = payment_ref
        self.cancelled_at = None
        self.save()
        return self

    def cancel(self):
        """
        Cancel the subscription. User retains access until end_date.
        Sets auto_renew to False.
        """
        self.status = 'cancelled'
        self.auto_renew = False
        self.cancelled_at = timezone.now()
        self.save(update_fields=['status', 'auto_renew', 'cancelled_at', 'updated_at'])
        return self

    def check_and_expire(self):
        """
        Called on access to auto-expire memberships whose end_date has passed.
        Returns True if the status was changed.
        """
        if self.status in ('active', 'cancelled') and self.is_expired:
            self.status = 'expired'
            self.save(update_fields=['status', 'updated_at'])
            return True
        return False

    def upgrade(self, new_plan, payment_ref=''):
        """
        Switch to a higher-tier plan. Resets start_date and recalculates end_date.
        """
        self.plan = new_plan
        self.start_date = timezone.now()
        self.end_date = timezone.now() + timezone.timedelta(days=new_plan.duration_days)
        self.status = 'active'
        self.payment_reference = payment_ref
        self.cancelled_at = None
        self.save()
        return self

    def __str__(self):
        plan_name = self.plan.name if self.plan else 'No plan'
        return f"{self.user.username} — {plan_name} ({self.status})"


class MembershipHistory(models.Model):
    """
    Audit log for membership changes (subscribe, renew, cancel, upgrade, expire).
    """
    ACTION_CHOICES = [
        ('subscribe', 'Subscribed'),
        ('renew', 'Renewed'),
        ('cancel', 'Cancelled'),
        ('upgrade', 'Upgraded'),
        ('expire', 'Expired'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='membership_history'
    )
    plan = models.ForeignKey(MembershipPlan, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    payment_reference = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Membership History'

    def __str__(self):
        return f"{self.user.username} — {self.action} — {self.plan}"


class Transaction(models.Model):
    """
    Audit log for payment gateway interactions.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions'
    )
    plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE)
    
    # Gateway specific IDs
    order_id = models.CharField(max_length=100, unique=True) # Razorpay/Stripe Order ID
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    signature = models.CharField(max_length=255, blank=True, null=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.order_id} - {self.status}"
