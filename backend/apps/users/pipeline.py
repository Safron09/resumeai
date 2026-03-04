from django.conf import settings
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser


def get_or_create_user(strategy, details, backend, uid, user=None, *args, **kwargs):
    """Create or fetch user by email from Google OAuth details."""
    if user:
        return {'is_new': False}

    email = details.get('email')
    if not email:
        return None

    user, created = CustomUser.objects.get_or_create(
        email=email,
        defaults={
            'first_name': details.get('first_name', ''),
            'last_name': details.get('last_name', ''),
        },
    )
    # Google users have no password
    if created:
        user.set_unusable_password()
        user.save()

    return {'user': user, 'is_new': created}


def issue_jwt_and_redirect(strategy, user, *args, **kwargs):
    """Issue JWT tokens and redirect to frontend with tokens in query params."""
    if not user:
        return redirect(f"{settings.FRONTEND_URL}/login?error=oauth_failed")

    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    refresh_token = str(refresh)

    frontend_url = (
        f"{settings.FRONTEND_URL}/auth/callback"
        f"?access={access}&refresh={refresh_token}"
    )
    return redirect(frontend_url)
