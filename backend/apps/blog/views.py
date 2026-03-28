from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from .models import Post, Category, Tag, Comment
from .serializers import (
    PostListSerializer, PostDetailSerializer, PostCreateUpdateSerializer,
    CategorySerializer, TagSerializer, CommentSerializer,
)
from .permissions import IsAuthorOrReadOnly, IsCommentAuthorOrAdmin
from .filters import PostFilter
from .pagination import PostPagination


# ─── Posts ─────────────────────────────────────

class PostListView(generics.ListAPIView):
    """GET /api/blog/posts/ — List published posts with filtering."""
    serializer_class = PostListSerializer
    pagination_class = PostPagination
    filterset_class = PostFilter
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['published_at', 'created_at', 'title']

    def get_queryset(self):
        return Post.objects.filter(status='published').select_related('author', 'category').prefetch_related('tags')


class PostDetailView(generics.RetrieveAPIView):
    """GET /api/blog/posts/<slug>/ — Single post detail."""
    serializer_class = PostDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_staff:
            return Post.objects.all()
        return Post.objects.filter(status='published')


class PostCreateView(generics.CreateAPIView):
    """POST /api/blog/posts/ — Create a new post."""
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostUpdateView(generics.UpdateAPIView):
    """PATCH /api/blog/posts/<slug>/ — Update a post."""
    serializer_class = PostCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    queryset = Post.objects.all()


class PostDeleteView(generics.DestroyAPIView):
    """DELETE /api/blog/posts/<slug>/ — Delete a post."""
    permission_classes = [permissions.IsAuthenticated, IsAuthorOrReadOnly]
    lookup_field = 'slug'
    queryset = Post.objects.all()


# ─── Interactions ──────────────────────────────

class PostLikeToggleView(APIView):
    """POST /api/blog/posts/<slug>/like/ — Toggle like status."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            post = Post.objects.get(slug=slug)
        except Post.DoesNotExist:
            return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if post.likes.filter(id=user.id).exists():
            post.likes.remove(user)
            liked = False
        else:
            post.likes.add(user)
            liked = True

        return Response({
            'liked': liked,
            'likes_count': post.likes.count()
        })


class PostBookmarkToggleView(APIView):
    """POST /api/blog/posts/<slug>/bookmark/ — Toggle bookmark status."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slug):
        try:
            post = Post.objects.get(slug=slug)
        except Post.DoesNotExist:
            return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if post.bookmarks.filter(id=user.id).exists():
            post.bookmarks.remove(user)
            bookmarked = False
        else:
            post.bookmarks.add(user)
            bookmarked = True

        return Response({
            'bookmarked': bookmarked,
            'bookmarks_count': post.bookmarks.count()
        })


class BookmarkedPostsView(generics.ListAPIView):
    """GET /api/blog/me/bookmarks/ — List user's bookmarked posts."""
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PostPagination

    def get_queryset(self):
        return self.request.user.bookmarked_posts.all().select_related('author', 'category').prefetch_related('tags')


# ─── Search ────────────────────────────────────

class PostSearchView(APIView):
    """GET /api/blog/search/?q= — Search across posts (works on any DB)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'results': []})

        results = (
            Post.objects
            .filter(status='published')
            .filter(
                Q(title__icontains=query) |
                Q(excerpt__icontains=query) |
                Q(content__icontains=query)
            )[:20]
        )
        serializer = PostListSerializer(results, many=True, context={'request': request})
        return Response({'results': serializer.data})


# ─── Categories & Tags ────────────────────────

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryPostsView(generics.ListAPIView):
    serializer_class = PostListSerializer
    pagination_class = PostPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        slug = self.kwargs['slug']
        return Post.objects.filter(
            status='published', category__slug=slug
        ).select_related('author', 'category').prefetch_related('tags')


class TagListView(generics.ListAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class TagPostsView(generics.ListAPIView):
    serializer_class = PostListSerializer
    pagination_class = PostPagination
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        slug = self.kwargs['slug']
        return Post.objects.filter(
            status='published', tags__slug=slug
        ).select_related('author', 'category').prefetch_related('tags')


# ─── Comments ──────────────────────────────────

class CommentListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/blog/posts/<slug>/comments/"""
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        slug = self.kwargs['slug']
        return Comment.objects.filter(
            post__slug=slug, parent__isnull=True, is_approved=True
        ).select_related('author')

    def perform_create(self, serializer):
        slug = self.kwargs['slug']
        post = Post.objects.get(slug=slug)
        serializer.save(author=self.request.user, post=post)


class CommentDeleteView(generics.DestroyAPIView):
    """DELETE /api/blog/comments/<id>/"""
    queryset = Comment.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsCommentAuthorOrAdmin]


# ─── Admin Post Moderation ─────────────────────

class AdminPostListView(generics.ListAPIView):
    """GET /api/blog/admin/posts/ — All posts including drafts (admin only)."""
    queryset = Post.objects.all().select_related('author')
    serializer_class = PostListSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = PostPagination
    filterset_class = PostFilter


class AdminPostModerateView(APIView):
    """PATCH /api/blog/admin/posts/<id>/moderate/ — Change post status."""
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'detail': 'Post not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['draft', 'published', 'archived']:
            return Response({'detail': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        post.status = new_status
        post.save(update_fields=['status'])
        return Response(PostListSerializer(post, context={'request': request}).data)
