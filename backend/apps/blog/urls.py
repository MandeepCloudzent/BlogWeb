from django.urls import path
from . import views

urlpatterns = [
    # Posts
    path('posts/', views.PostListView.as_view(), name='post-list'),
    path('posts/create/', views.PostCreateView.as_view(), name='post-create'),
    path('posts/<slug:slug>/', views.PostDetailView.as_view(), name='post-detail'),
    path('posts/<slug:slug>/update/', views.PostUpdateView.as_view(), name='post-update'),
    path('posts/<slug:slug>/delete/', views.PostDeleteView.as_view(), name='post-delete'),

    # Interactions
    path('posts/<slug:slug>/like/', views.PostLikeToggleView.as_view(), name='post-like'),
    path('posts/<slug:slug>/bookmark/', views.PostBookmarkToggleView.as_view(), name='post-bookmark'),
    path('me/bookmarks/', views.BookmarkedPostsView.as_view(), name='user-bookmarks'),

    # Comments
    path('posts/<slug:slug>/comments/', views.CommentListCreateView.as_view(), name='comment-list-create'),
    path('comments/<int:pk>/delete/', views.CommentDeleteView.as_view(), name='comment-delete'),

    # Categories & Tags
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/posts/', views.CategoryPostsView.as_view(), name='category-posts'),
    path('tags/', views.TagListView.as_view(), name='tag-list'),
    path('tags/<slug:slug>/posts/', views.TagPostsView.as_view(), name='tag-posts'),

    # Search
    path('search/', views.PostSearchView.as_view(), name='post-search'),

    # Admin
    path('admin/posts/', views.AdminPostListView.as_view(), name='admin-post-list'),
    path('admin/posts/<int:pk>/moderate/', views.AdminPostModerateView.as_view(), name='admin-post-moderate'),
]
