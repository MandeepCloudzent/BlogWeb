import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

User = get_user_model()
email = 'admin@blogverse.com'
username = 'admin'
password = 'adminpassword123'

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser created: {username} / {password}")
else:
    print(f"Superuser already exists: {username}")
