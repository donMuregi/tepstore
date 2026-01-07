import logging
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer
)
from store.models import Cart, CartItem
from store.utils import (
    LoginRateThrottle, 
    RegistrationRateThrottle, 
    SensitiveOperationThrottle,
    InputValidator,
    get_client_ip
)

logger = logging.getLogger(__name__)
security_logger = logging.getLogger('django.security')


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [RegistrationRateThrottle]
    
    def create(self, request, *args, **kwargs):
        # Log registration attempt
        ip = get_client_ip(request)
        security_logger.info(f"Registration attempt from IP: {ip}")
        
        # Validate inputs
        username = request.data.get('username', '')
        email = request.data.get('email', '')
        
        if InputValidator.check_sql_injection(username, 'username'):
            return Response(
                {'error': 'Invalid characters in username'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            security_logger.info(f"Registration failed - validation error from IP: {ip}")
            return Response({
                'success': False,
                'error': {
                    'message': 'Registration failed',
                    'details': serializer.errors
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            security_logger.info(f"User registered successfully: {user.username} from IP: {ip}")
            return Response({
                'success': True,
                'user': UserSerializer(user).data,
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                'success': False,
                'error': {'message': 'Registration failed. Please try again.'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        ip = get_client_ip(request)
        
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            security_logger.info(f"Login failed - invalid data from IP: {ip}")
            return Response({
                'success': False,
                'error': {'message': 'Invalid login data'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        username_or_email = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Check for injection attempts
        if InputValidator.check_sql_injection(username_or_email, 'username'):
            security_logger.warning(f"Potential injection in login from IP: {ip}")
            return Response({
                'success': False,
                'error': {'message': 'Invalid credentials'}
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Try to find user by email if input looks like an email
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                username_or_email = user_obj.username
            except User.DoesNotExist:
                pass
        
        user = authenticate(
            username=username_or_email,
            password=password
        )
        
        if not user:
            security_logger.info(f"Failed login attempt for '{serializer.validated_data['username']}' from IP: {ip}")
            return Response({
                'success': False,
                'error': {'message': 'Invalid credentials'}
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Merge guest cart into user cart before login
        session_key = request.session.session_key
        if session_key:
            try:
                guest_cart = Cart.objects.filter(session_key=session_key, user=None).first()
                if guest_cart and guest_cart.items.exists():
                    user_cart, _ = Cart.objects.get_or_create(user=user)
                    for item in guest_cart.items.all():
                        existing_item = user_cart.items.filter(
                            product=item.product,
                            variant=item.variant,
                            education_tablet=item.education_tablet
                        ).first()
                        if existing_item:
                            existing_item.quantity += item.quantity
                            existing_item.save()
                        else:
                            item.cart = user_cart
                            item.save()
                    guest_cart.delete()
            except Exception as e:
                logger.error(f"Error merging cart: {e}")
        
        login(request, user)
        token, _ = Token.objects.get_or_create(user=user)
        security_logger.info(f"Successful login: {user.username} from IP: {ip}")
        
        return Response({
            'success': True,
            'user': UserSerializer(user).data,
            'token': token.key
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully'})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [SensitiveOperationThrottle]

    def post(self, request):
        ip = get_client_ip(request)
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': {'message': 'Invalid password data', 'details': serializer.errors}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            security_logger.info(f"Password changed for user: {request.user.username} from IP: {ip}")
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            })
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return Response({
                'success': False,
                'error': {'message': 'Failed to change password'}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
