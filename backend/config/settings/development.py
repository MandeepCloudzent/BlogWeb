"""
Development settings — extends base.
"""
from .base import *  # noqa: F401,F403

DEBUG = True

# Use console email backend in dev
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True

# Use SQLite for quick local development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
