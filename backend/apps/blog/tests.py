from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.blog.models import Post, Category, Tag

User = get_user_model()

class BlogModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='password123'
        )
        self.category = Category.objects.create(name='Tech', slug='tech')
        self.tag = Tag.objects.create(name='Python', slug='python')

    def test_post_creation_and_slug(self):
        post = Post.objects.create(
            author=self.user,
            title='My Test Post',
            content='This is some test content.',
            category=self.category,
            status='published'
        )
        self.assertEqual(post.slug, 'my-test-post')
        self.assertEqual(post.likes.count(), 0)
        self.assertEqual(str(post), 'My Test Post')

    def test_read_time_calculation(self):
        # 200 words approx = 1 min
        content = 'word ' * 400
        post = Post.objects.create(
            author=self.user,
            title='Long Post',
            content=content,
            category=self.category
        )
        # 400 // 200 = 2
        self.assertEqual(post.read_time_minutes, 2)

class BlogAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser', 
            email='api@example.com', 
            password='password123'
        )
        self.category = Category.objects.create(name='News', slug='news')
        self.post = Post.objects.create(
            author=self.user,
            title='API Post',
            content='Content here',
            category=self.category,
            status='published'
        )

    def test_get_post_list(self):
        response = self.client.get('/api/blog/posts/')
        self.assertEqual(response.status_code, 200)
        # Check if our post is in the results
        self.assertTrue(any(p['title'] == 'API Post' for p in response.data['results']))

    def test_like_post_unauthenticated(self):
        response = self.client.post(f'/api/blog/posts/{self.post.slug}/like/')
        # Should be 401 Unauthorized because we use JWT and no token provided
        self.assertEqual(response.status_code, 401)
