from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.MediaUploadView.as_view(), name='media-upload'),
    path('files/', views.MediaListView.as_view(), name='media-list'),
    path('files/<int:pk>/', views.MediaDeleteView.as_view(), name='media-delete'),
]
