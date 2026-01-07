import logging
from rest_framework import viewsets, filters, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny, BasePermission
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.views import APIView
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import (
    Category, Product, Review, Brand, FinancingPlan, FinancingApplication,
    EnterpriseBundle, EnterpriseOrder,
    EducationBoard, ClassroomPackage, Fundraiser, DonationAmount, Donation,
    EducationTablet, TabletSoftware, SchoolTabletOrder, SchoolTabletOrderItem,
    Cart, CartItem, Order, OrderItem, ProductVariant, HeroSlide, TradeInRequest, Employer, Bank, School, Policy
)
from .serializers import (
    CategorySerializer, BrandSerializer,
    ProductListSerializer, ProductDetailSerializer, ReviewSerializer,
    FinancingPlanSerializer, FinancingApplicationSerializer, FinancingApplicationCreateSerializer,
    EnterpriseBundleSerializer, EnterpriseOrderSerializer, EnterpriseOrderCreateSerializer,
    EducationBoardSerializer, ClassroomPackageSerializer, DonationAmountSerializer,
    FundraiserListSerializer, FundraiserDetailSerializer, FundraiserCreateSerializer, DonationSerializer,
    EducationTabletSerializer, TabletSoftwareSerializer, SchoolTabletOrderSerializer,
    CartSerializer, CartItemSerializer, CartItemCreateSerializer,
    OrderSerializer, OrderCreateSerializer, HeroSlideSerializer,
    TradeInRequestSerializer, TradeInRequestCreateSerializer, EmployerSerializer, BankSerializer, SchoolSerializer, PolicySerializer
)
from .utils import SensitiveOperationThrottle, InputValidator, get_client_ip

logger = logging.getLogger(__name__)
security_logger = logging.getLogger('django.security')


# ============ CUSTOM PERMISSIONS ============

class IsAdminOrStaff(BasePermission):
    """
    Permission check for admin or staff users only.
    Use this for internal/admin endpoints.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission to only allow owners or admins.
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access anything
        if request.user.is_staff or request.user.is_superuser:
            return True
        # Check if obj has a user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


# ============ POLICY VIEW ============

class PolicyDetailView(generics.RetrieveAPIView):
    """Get a specific policy by type (privacy, terms, cookies, etc.)"""
    serializer_class = PolicySerializer
    permission_classes = [AllowAny]
    lookup_field = 'policy_type'
    
    def get_queryset(self):
        return Policy.objects.filter(is_active=True)


# ============ HERO SLIDES VIEW ============

class HeroSlideListView(generics.ListAPIView):
    """Get all active hero slides for homepage"""
    queryset = HeroSlide.objects.filter(is_active=True)
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]


# ============ EMPLOYER VIEW ============

class EmployerListView(generics.ListAPIView):
    """Get all active employers for salaried employee dropdown"""
    queryset = Employer.objects.filter(is_active=True).order_by('name')
    serializer_class = EmployerSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all employers without pagination


# ============ BANK VIEW ============

class BankListView(generics.ListAPIView):
    """Get all active banks for financing dropdown"""
    queryset = Bank.objects.filter(is_active=True).order_by('name')
    serializer_class = BankSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all banks without pagination


# ============ SCHOOL VIEW ============

class SchoolListView(generics.ListAPIView):
    """Get all approved schools for fundraiser dropdown"""
    serializer_class = SchoolSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Return all schools without pagination
    
    def get_queryset(self):
        queryset = School.objects.filter(is_approved=True).order_by('name')
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)[:50]  # Limit results for performance
        return queryset


# ============ BASE VIEWS ============

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category_type = self.request.query_params.get('type')
        if category_type:
            queryset = queryset.filter(category_type=category_type)
        return queryset


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = 'slug'


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand__name']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        product_type = self.request.query_params.get('type')
        brand = self.request.query_params.get('brand')
        featured = self.request.query_params.get('featured')
        unique_variant = self.request.query_params.get('unique_variant')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if category:
            queryset = queryset.filter(category__slug=category)
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        if brand:
            queryset = queryset.filter(brand__slug=brand)
        if featured:
            queryset = queryset.filter(is_featured=True)
        if unique_variant:
            queryset = queryset.filter(is_unique_variant=True)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def review(self, request, slug=None):
        product = self.get_object()
        serializer = ReviewSerializer(data=request.data)
        
        if serializer.is_valid():
            if Review.objects.filter(product=product, user=request.user).exists():
                return Response(
                    {'error': 'You have already reviewed this product'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============ MSME FINANCING VIEWS ============

class FinancingPlanListView(generics.ListAPIView):
    """List all available financing plans"""
    queryset = FinancingPlan.objects.filter(is_active=True)
    serializer_class = FinancingPlanSerializer
    permission_classes = [AllowAny]
    pagination_class = None  # Disable pagination for financing plans


class FinancingApplicationViewSet(viewsets.ModelViewSet):
    """Handle financing applications"""
    queryset = FinancingApplication.objects.all()
    permission_classes = [IsAuthenticated]  # Require authentication
    throttle_classes = [SensitiveOperationThrottle]
    lookup_field = 'application_id'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FinancingApplicationCreateSerializer
        return FinancingApplicationSerializer
    
    def get_queryset(self):
        """Users can only see their own applications, admins see all"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return FinancingApplication.objects.all()
        return FinancingApplication.objects.filter(user=self.request.user)
    
    def get_permissions(self):
        """Override permissions for specific actions"""
        if self.action in ['submit_to_bank']:
            # Only admin/staff can submit to bank
            return [IsAdminOrStaff()]
        if self.action in ['destroy', 'update', 'partial_update']:
            # Only owner or admin can modify
            return [IsOwnerOrAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        user = self.request.user
        security_logger.info(
            f"Financing application created by user {user.id} from IP {get_client_ip(self.request)}"
        )
        serializer.save(user=user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrStaff])
    def submit_to_bank(self, request, application_id=None):
        """Submit application to bank API for approval (Admin only)"""
        application = self.get_object()
        
        security_logger.info(
            f"Admin {request.user.id} submitting application {application_id} to bank"
        )
        
        # TODO: Integrate with actual bank API
        # For now, simulate bank response
        application.status = 'approved'
        application.approved_amount = application.variant.final_price if application.variant else application.product.current_price
        application.monthly_payment = application.financing_plan.calculate_monthly_payment(application.approved_amount)
        application.bank_response = {'status': 'approved', 'message': 'Loan approved'}
        application.save()
        
        return Response({
            'success': True,
            'data': FinancingApplicationSerializer(application).data
        })
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, application_id=None):
        """Customer confirms the financing application"""
        application = self.get_object()
        
        # Ensure user owns this application or is admin
        if not (request.user.is_staff or application.user == request.user):
            security_logger.warning(
                f"Unauthorized confirmation attempt by user {request.user.id} for application {application_id}"
            )
            return Response({
                'success': False,
                'error': {'code': 'FORBIDDEN', 'message': 'You do not have permission to confirm this application'}
            }, status=status.HTTP_403_FORBIDDEN)
        
        if application.status != 'approved':
            return Response({
                'success': False,
                'error': {'code': 'INVALID_STATUS', 'message': 'Application must be approved first'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        application.status = 'confirmed'
        application.save()
        
        security_logger.info(
            f"Application {application_id} confirmed by user {request.user.id}"
        )
        
        # TODO: Send confirmation to bank API to deposit to escrow
        
        return Response({
            'success': True,
            'data': FinancingApplicationSerializer(application).data
        })


# ============ ENTERPRISE VIEWS ============

class EnterpriseBundleViewSet(viewsets.ReadOnlyModelViewSet):
    """List enterprise bundles (DAAS)"""
    queryset = EnterpriseBundle.objects.filter(is_active=True)
    serializer_class = EnterpriseBundleSerializer
    permission_classes = [AllowAny]


class EnterpriseOrderViewSet(viewsets.ModelViewSet):
    """Handle enterprise orders"""
    queryset = EnterpriseOrder.objects.all()
    permission_classes = [IsAuthenticated]  # Require authentication
    throttle_classes = [SensitiveOperationThrottle]
    lookup_field = 'order_id'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EnterpriseOrderCreateSerializer
        return EnterpriseOrderSerializer
    
    def get_queryset(self):
        """Users can only see their own orders, admins see all"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return EnterpriseOrder.objects.all()
        return EnterpriseOrder.objects.filter(user=self.request.user)
    
    def get_permissions(self):
        """Override permissions for specific actions"""
        if self.action in ['credit_check']:
            # Only admin/staff can trigger credit check
            return [IsAdminOrStaff()]
        if self.action in ['destroy', 'update', 'partial_update']:
            # Only owner or admin can modify
            return [IsOwnerOrAdmin()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        user = self.request.user
        security_logger.info(
            f"Enterprise order created by user {user.id} from IP {get_client_ip(self.request)}"
        )
        serializer.save(user=user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrStaff])
    def credit_check(self, request, order_id=None):
        """Submit to bank for credit check (Admin only)"""
        order = self.get_object()
        
        security_logger.info(
            f"Admin {request.user.id} initiating credit check for order {order_id}"
        )
        
        # TODO: Integrate with Equity bank API
        # Simulate credit check response
        order.status = 'approved'
        order.approved_amount = order.total_amount
        order.bank_response = {'status': 'approved', 'amount': str(order.total_amount)}
        order.save()
        
        return Response({
            'success': True,
            'data': EnterpriseOrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'])
    def adjust_order(self, request, order_id=None):
        """Adjust order based on approved amount"""
        order = self.get_object()
        new_quantity = request.data.get('quantity')
        
        if new_quantity:
            order.quantity = int(new_quantity)
            order.total_amount = order.calculate_total()
            order.save()
        
        return Response(EnterpriseOrderSerializer(order).data)


# ============ EDUCATION VIEWS ============

class EducationBoardViewSet(viewsets.ReadOnlyModelViewSet):
    """List education boards"""
    queryset = EducationBoard.objects.filter(is_active=True)
    serializer_class = EducationBoardSerializer
    lookup_field = 'slug'


class ClassroomPackageViewSet(viewsets.ReadOnlyModelViewSet):
    """List classroom packages"""
    queryset = ClassroomPackage.objects.filter(is_active=True)
    serializer_class = ClassroomPackageSerializer
    lookup_field = 'slug'


class DonationAmountListView(generics.ListAPIView):
    """List preset donation amounts"""
    queryset = DonationAmount.objects.filter(is_active=True)
    serializer_class = DonationAmountSerializer
    permission_classes = [AllowAny]


class FundraiserViewSet(viewsets.ModelViewSet):
    """Handle fundraisers"""
    queryset = Fundraiser.objects.all()
    lookup_field = 'share_link'
    
    def get_serializer_class(self):
        if self.action == 'create':
            return FundraiserCreateSerializer
        if self.action == 'retrieve':
            return FundraiserDetailSerializer
        return FundraiserListSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Fundraiser.objects.filter(status='active')
        if self.action == 'list' and self.request.user.is_authenticated:
            # Show user's own fundraisers
            my_fundraisers = self.request.query_params.get('my_fundraisers')
            if my_fundraisers:
                queryset = Fundraiser.objects.filter(creator=self.request.user)
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def donate(self, request, share_link=None):
        """Process a donation"""
        fundraiser = self.get_object()
        serializer = DonationSerializer(data=request.data)
        
        if serializer.is_valid():
            donation = serializer.save(fundraiser=fundraiser)
            
            # TODO: Integrate with payment provider (M-Pesa STK Push)
            # For now, mark as completed
            donation.status = 'completed'
            donation.save()
            
            # Update fundraiser total
            fundraiser.current_amount += donation.amount
            if fundraiser.current_amount >= fundraiser.target_amount:
                fundraiser.status = 'completed'
            fundraiser.save()
            
            return Response(DonationSerializer(donation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EducationTabletViewSet(viewsets.ReadOnlyModelViewSet):
    """List education tablets"""
    queryset = EducationTablet.objects.filter(is_active=True)
    serializer_class = EducationTabletSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = super().get_queryset()
        brand = self.request.query_params.get('brand')
        size = self.request.query_params.get('size')
        
        if brand:
            queryset = queryset.filter(brand=brand)
        if size:
            queryset = queryset.filter(size=size)
        
        return queryset


class TabletSoftwareListView(generics.ListAPIView):
    """List available tablet software"""
    queryset = TabletSoftware.objects.all()
    serializer_class = TabletSoftwareSerializer
    permission_classes = [AllowAny]


class SchoolTabletOrderViewSet(viewsets.ModelViewSet):
    """Handle school tablet orders"""
    queryset = SchoolTabletOrder.objects.all()
    serializer_class = SchoolTabletOrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'order_id'
    
    def get_queryset(self):
        return SchoolTabletOrder.objects.filter(user=self.request.user)


# ============ CART VIEWS ============

@method_decorator(csrf_exempt, name='dispatch')
class CartView(APIView):
    """Handle shopping cart"""
    permission_classes = [AllowAny]
    authentication_classes = [TokenAuthentication]
    
    def get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            if not session_key:
                request.session.create()
                session_key = request.session.session_key
            cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
        return cart
    
    def get(self, request):
        cart = self.get_cart(request)
        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    def post(self, request):
        """Add item to cart"""
        try:
            cart = self.get_cart(request)
            serializer = CartItemCreateSerializer(data=request.data)
            
            if serializer.is_valid():
                quantity = serializer.validated_data.get('quantity', 1)
                
                # Check if this is an education tablet or a product
                if 'education_tablet_id' in serializer.validated_data:
                    tablet = get_object_or_404(EducationTablet, id=serializer.validated_data['education_tablet_id'])
                    
                    # Check if tablet already in cart
                    cart_item = CartItem.objects.filter(
                        cart=cart,
                        education_tablet=tablet
                    ).first()
                    
                    if cart_item:
                        cart_item.quantity += quantity
                        cart_item.save()
                    else:
                        CartItem.objects.create(
                            cart=cart,
                            education_tablet=tablet,
                            quantity=quantity
                        )
                else:
                    product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
                    variant = None
                    variant_id = serializer.validated_data.get('variant_id')
                    if variant_id:
                        variant = get_object_or_404(ProductVariant, id=variant_id)
                    
                    cart_item, created = CartItem.objects.get_or_create(
                        cart=cart,
                        product=product,
                        variant=variant,
                        education_tablet=None,
                        defaults={'quantity': quantity}
                    )
                    
                    if not created:
                        cart_item.quantity += quantity
                        cart_item.save()
                
                return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Cart error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        """Clear cart"""
        cart = self.get_cart(request)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared'})


@method_decorator(csrf_exempt, name='dispatch')
class CartItemView(APIView):
    """Handle individual cart items"""
    permission_classes = [AllowAny]
    authentication_classes = [TokenAuthentication]
    
    def get_cart(self, request):
        if request.user.is_authenticated:
            cart, _ = Cart.objects.get_or_create(user=request.user)
        else:
            session_key = request.session.session_key
            cart = Cart.objects.filter(session_key=session_key, user=None).first()
        return cart
    
    def patch(self, request, item_id):
        """Update cart item quantity"""
        cart = self.get_cart(request)
        if not cart:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = request.data.get('quantity', 1)
        
        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()
        
        return Response(CartSerializer(cart).data)
    
    def delete(self, request, item_id):
        """Remove item from cart"""
        cart = self.get_cart(request)
        if not cart:
            return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)
        
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        
        return Response(CartSerializer(cart).data)


# ============ ORDER VIEWS ============

class OrderViewSet(viewsets.ModelViewSet):
    """Handle orders"""
    queryset = Order.objects.all()
    lookup_field = 'order_id'
    authentication_classes = [TokenAuthentication]
    throttle_classes = [SensitiveOperationThrottle]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action in ['destroy', 'update', 'partial_update']:
            return [IsOwnerOrAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """Users can only see their own orders, admins see all"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Order.objects.all()
        if self.request.user.is_authenticated:
            return Order.objects.filter(user=self.request.user)
        return Order.objects.none()
    
    def create(self, request):
        """Create order from cart"""
        serializer = OrderCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get cart
        if request.user.is_authenticated:
            cart = Cart.objects.filter(user=request.user).first()
        else:
            session_key = request.session.session_key
            cart = Cart.objects.filter(session_key=session_key, user=None).first()
        
        if not cart or cart.items.count() == 0:
            return Response({
                'success': False,
                'error': {'code': 'EMPTY_CART', 'message': 'Cart is empty'}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create order
        user = request.user if request.user.is_authenticated else None
        order = serializer.save(
            user=user,
            subtotal=cart.total,
            total=cart.total  # TODO: Add shipping calculation
        )
        
        # Create order items
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                variant=cart_item.variant,
                education_tablet=cart_item.education_tablet,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price
            )
        
        # Clear cart
        cart.items.all().delete()
        
        security_logger.info(
            f"Order {order.order_id} created by user {user.id if user else 'anonymous'} from IP {get_client_ip(request)}"
        )
        
        # TODO: Send confirmation emails
        # TODO: Integrate with DHL API
        
        return Response({
            'success': True,
            'data': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


# ============ TRADE-IN REQUESTS ============

class TradeInRequestView(APIView):
    """Handle trade-in requests"""
    permission_classes = [AllowAny]
    throttle_classes = [SensitiveOperationThrottle]  # Rate limit form submissions
    
    def post(self, request):
        serializer = TradeInRequestCreateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': {'code': 'VALIDATION_ERROR', 'details': serializer.errors}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Validate inputs for potential injection
        text_fields = ['name', 'currentDevice', 'message']
        for field in text_fields:
            if field in data and data[field]:
                is_valid, error = InputValidator.validate_text_input(data[field])
                if not is_valid:
                    security_logger.warning(
                        f"Suspicious input in trade-in {field} from IP {get_client_ip(request)}: {error}"
                    )
                    return Response({
                        'success': False,
                        'error': {'code': 'INVALID_INPUT', 'message': error}
                    }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get product and variant if provided
        product = None
        variant = None
        if data.get('product_id'):
            try:
                product = Product.objects.get(id=data['product_id'])
            except Product.DoesNotExist:
                pass
        
        if data.get('variant_id'):
            try:
                variant = ProductVariant.objects.get(id=data['variant_id'])
            except ProductVariant.DoesNotExist:
                pass
        
        # Create trade-in request
        trade_in = TradeInRequest.objects.create(
            name=InputValidator.sanitize_html(data['name']),
            email=data['email'],
            phone=data['phone'],
            current_device=InputValidator.sanitize_html(data['currentDevice']),
            device_condition=data['deviceCondition'],
            message=InputValidator.sanitize_html(data.get('message', '')),
            product=product,
            product_name=InputValidator.sanitize_html(data.get('product_name', '')),
            variant=variant,
            variant_name=InputValidator.sanitize_html(data.get('variant_name', ''))
        )
        
        logger.info(
            f"Trade-in request {trade_in.id} created from IP {get_client_ip(request)}"
        )
        
        # Send email to user
        try:
            user_email_subject = 'Trade-In Request Received - TepStore'
            user_email_body = f"""
Dear {trade_in.name},

Thank you for your trade-in request!

We have received your request to trade in your {trade_in.current_device} for the {trade_in.product_name or 'selected product'}.

Request Details:
- Your Device: {trade_in.current_device}
- Condition: {trade_in.get_device_condition_display()}
- Product You Want: {trade_in.product_name}
{f"- Variant: {trade_in.variant_name}" if trade_in.variant_name else ""}

Our team will review your request and contact you within 24-48 hours with an estimated trade-in value.

Best regards,
The TepStore Team
"""
            send_mail(
                user_email_subject,
                user_email_body,
                settings.DEFAULT_FROM_EMAIL,
                [trade_in.email],
                fail_silently=True
            )
        except Exception as e:
            logger.error(f"Error sending user email: {e}")
        
        # Send email to admin
        try:
            admin_email_subject = f'New Trade-In Request - {trade_in.name}'
            admin_email_body = f"""
New Trade-In Request Received!

Customer Details:
- Name: {trade_in.name}
- Email: {trade_in.email}
- Phone: {trade_in.phone}

Device Being Traded:
- Device: {trade_in.current_device}
- Condition: {trade_in.get_device_condition_display()}

Product Requested:
- Product: {trade_in.product_name}
{f"- Variant: {trade_in.variant_name}" if trade_in.variant_name else ""}

Additional Message:
{trade_in.message or 'None'}

---
View in admin: /admin/store/tradeinrequest/{trade_in.id}/change/
"""
            admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@tepstore.com')
            send_mail(
                admin_email_subject,
                admin_email_body,
                settings.DEFAULT_FROM_EMAIL,
                [admin_email],
                fail_silently=True
            )
        except Exception as e:
            logger.error(f"Error sending admin email: {e}")
        
        return Response({
            'success': True,
            'data': TradeInRequestSerializer(trade_in).data
        }, status=status.HTTP_201_CREATED)
