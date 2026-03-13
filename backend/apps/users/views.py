import logging

import stripe
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser
from .serializers import (
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


def _jwt_response(user):
    """Return access + refresh tokens and user data."""
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    }


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_jwt_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(_jwt_response(serializer.validated_data['user']))


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            RefreshToken(request.data['refresh']).blacklist()
        except (TokenError, KeyError):
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def delete(self, request):
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        current = request.data.get('current_password', '')
        new_pw = request.data.get('new_password', '')

        if not request.user.check_password(current):
            return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_pw) < 8:
            return Response({'detail': 'New password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_pw)
        request.user.save()
        return Response({'detail': 'Password updated successfully.'})


class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = CustomUser.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            )
            send_mail(
                subject='Reset your ResumeAI password',
                message=f'Click the link to reset your password:\n\n{reset_url}\n\nExpires in 1 hour.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except CustomUser.DoesNotExist:
            pass  # don't reveal whether email exists

        return Response({'detail': 'If that email exists, a reset link was sent.'})


class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            pk = force_str(urlsafe_base64_decode(data['uid']))
            user = CustomUser.objects.get(pk=pk)
        except (CustomUser.DoesNotExist, ValueError, TypeError):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, data['token']):
            return Response({'detail': 'Reset link expired or already used.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(data['password'])
        user.save()
        return Response({'detail': 'Password updated successfully.'})


# ── Stripe Billing ────────────────────────────────────────────────────────────

class CreateCheckoutSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        price_id = getattr(settings, 'STRIPE_PRO_PRICE_ID', '')
        secret_key = getattr(settings, 'STRIPE_SECRET_KEY', '')

        if not price_id or not secret_key:
            return Response(
                {'detail': 'Stripe is not configured on this server.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        stripe.api_key = secret_key

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                mode='subscription',
                customer_email=request.user.email,
                line_items=[{'price': price_id, 'quantity': 1}],
                success_url=f"{settings.FRONTEND_URL}/settings/billing?upgraded=true",
                cancel_url=f"{settings.FRONTEND_URL}/settings/billing",
                metadata={'user_id': str(request.user.pk)},
            )
            return Response({'url': session.url})
        except stripe.error.StripeError as exc:
            logger.error('Stripe checkout error: %s', exc)
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        secret_key = getattr(settings, 'STRIPE_SECRET_KEY', '')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

        if not secret_key:
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)

        stripe.api_key = secret_key
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except (ValueError, stripe.error.SignatureVerificationError) as exc:
            logger.warning('Stripe webhook invalid: %s', exc)
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session.get('metadata', {}).get('user_id')
            if user_id:
                try:
                    user = CustomUser.objects.get(pk=user_id)
                    user.plan = 'pro'
                    user.save(update_fields=['plan'])
                    logger.info('Upgraded user %s to pro via Stripe', user_id)
                except CustomUser.DoesNotExist:
                    pass

        elif event['type'] in ('customer.subscription.deleted', 'customer.subscription.paused'):
            # Downgrade — find user by customer email
            customer_email = event['data']['object'].get('customer_email')
            if customer_email:
                CustomUser.objects.filter(email=customer_email, plan='pro').update(plan='free')

        return Response({'received': True})


class ContactView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        message = request.data.get('message', '').strip()
        mode = request.data.get('mode', 'contact')

        if not name or not email or not message:
            return Response({'detail': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

        subject = f"{'Bug Report' if mode == 'bug' else 'Contact'} from {name} — ProseHire"
        body = f"From: {name} <{email}>\n\n{message}"
        recipient = settings.DEFAULT_FROM_EMAIL

        try:
            send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=False)
        except Exception:
            logger.exception('ContactView: failed to send email')
            return Response({'detail': 'Failed to send message.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'detail': 'Message sent.'})
