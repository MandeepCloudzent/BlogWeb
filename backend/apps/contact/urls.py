from django.urls import path
from . import views

urlpatterns = [
    path('', views.ContactCreateView.as_view(), name='contact-create'),
    path('messages/', views.ContactMessageListView.as_view(), name='contact-messages'),
    path('messages/<int:pk>/', views.ContactMessageDetailView.as_view(), name='contact-message-detail'),
]
