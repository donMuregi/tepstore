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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required, bypasses CSRF
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # No authentication required, bypasses CSRF

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username_or_email = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
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
            if user:
                # Merge guest cart into user cart before login
                session_key = request.session.session_key
                if session_key:
                    try:
                        guest_cart = Cart.objects.filter(session_key=session_key, user=None).first()
                        if guest_cart and guest_cart.items.exists():
                            user_cart, _ = Cart.objects.get_or_create(user=user)
                            # Move items from guest cart to user cart
                            for item in guest_cart.items.all():
                                # Check if item already exists in user cart
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
                            # Delete the empty guest cart
                            guest_cart.delete()
                    except Exception as e:
                        print(f"Error merging cart: {e}")
                
                login(request, user)
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': token.key
                })
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
