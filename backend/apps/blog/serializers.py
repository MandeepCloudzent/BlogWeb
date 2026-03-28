from rest_framework import serializers
from .models import Category, Tag, Post, Comment
from apps.accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(source='posts.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'cover_image', 'order', 'post_count')
        read_only_fields = ('id', 'slug')


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')
        read_only_fields = ('id', 'slug')


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ('id', 'author', 'parent', 'body', 'is_approved', 'created_at', 'replies')
        read_only_fields = ('id', 'author', 'is_approved', 'created_at')

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_approved=True), many=True).data
        return []


class PostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'title', 'slug', 'excerpt', 'featured_image',
            'category', 'tags', 'status', 'is_featured',
            'read_time_minutes', 'published_at', 'comment_count',
            'likes_count', 'is_liked', 'is_bookmarked',
        )

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(id=request.user.id).exists()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.bookmarks.filter(id=request.user.id).exists()


class PostDetailSerializer(serializers.ModelSerializer):
    """Full serializer for detail views."""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            'id', 'author', 'title', 'slug', 'excerpt', 'content',
            'featured_image', 'category', 'tags', 'status', 'is_featured',
            'read_time_minutes', 'meta_title', 'meta_description',
            'published_at', 'created_at', 'updated_at', 'comments',
            'likes_count', 'is_liked', 'is_bookmarked',
        )
        read_only_fields = ('id', 'slug', 'author', 'created_at', 'updated_at')

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(id=request.user.id).exists()

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.bookmarks.filter(id=request.user.id).exists()

    def get_comments(self, obj):
        top_level = obj.comments.filter(parent__isnull=True, is_approved=True)
        return CommentSerializer(top_level, many=True).data


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating posts."""
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), many=True, write_only=True, required=False
    )

    class Meta:
        model = Post
        fields = (
            'id', 'title', 'excerpt', 'content', 'featured_image',
            'category_id', 'tag_ids', 'status', 'is_featured',
            'meta_title', 'meta_description', 'published_at',
        )

    def create(self, validated_data):
        tags = validated_data.pop('tag_ids', [])
        post = Post.objects.create(**validated_data)
        post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tags = validated_data.pop('tag_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance
