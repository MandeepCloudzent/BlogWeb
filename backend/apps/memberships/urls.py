from django.urls import path
from . import views

urlpatterns = [
    path('plans/', views.PlanListView.as_view(), name='plan-list'),
    path('plans/<slug:slug>/', views.PlanDetailView.as_view(), name='plan-detail'),
    path('subscribe/', views.SubscribeView.as_view(), name='membership-subscribe'),
    path('renew/', views.RenewView.as_view(), name='membership-renew'),
    path('upgrade/', views.UpgradeView.as_view(), name='membership-upgrade'),
    path('my-membership/', views.MyMembershipView.as_view(), name='my-membership'),
    path('cancel/', views.CancelMembershipView.as_view(), name='membership-cancel'),
    path('history/', views.MembershipHistoryView.as_view(), name='membership-history'),

    # Payments
    path('payments/create-order/', views.CreatePaymentOrderView.as_view(), name='payment-create-order'),
    path('payments/verify/', views.VerifyPaymentView.as_view(), name='payment-verify'),
]
