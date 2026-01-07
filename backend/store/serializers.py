from rest_framework import serializers
from .models import (
    Category, Product, ProductImage, ProductVariant, Review, Brand,
    FinancingPlan, FinancingApplication,
    EnterpriseBundle, EnterpriseOrder,
    EducationBoard, ClassroomPackage, Fundraiser, DonationAmount, Donation,
    EducationTablet, TabletSoftware, SchoolTabletOrder, SchoolTabletOrderItem,
    Cart, CartItem, Order, OrderItem, HeroSlide, TradeInRequest, Employer, Bank, School, Policy
)


# ============ POLICY SERIALIZER ============

class PolicySerializer(serializers.ModelSerializer):
    policy_type_display = serializers.CharField(source='get_policy_type_display', read_only=True)
    
    class Meta:
        model = Policy
        fields = ['id', 'policy_type', 'policy_type_display', 'title', 'content', 'last_updated']


# ============ EMPLOYER SERIALIZER ============

class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = ['id', 'name', 'code']


# ============ BANK SERIALIZER ============

class BankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bank
        fields = ['id', 'name', 'code', 'logo', 'branch']


# ============ SCHOOL SERIALIZER ============

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ['id', 'name', 'location', 'county', 'school_type']


# ============ HERO SLIDE SERIALIZER ============

class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = [
            'id', 'title', 'highlight', 'badge_text', 'description',
            'primary_button_text', 'primary_button_link',
            'secondary_button_text', 'secondary_button_link',
            'image', 'card_icon', 'card_label', 'card_price', 'card_subtext',
            'background_color', 'order', 'is_active'
        ]


# ============ BASE SERIALIZERS ============

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'category_type', 'description', 'image']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']


class ProductVariantSerializer(serializers.ModelSerializer):
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'storage', 'color', 'ram', 'price_adjustment', 'stock', 'sku', 'final_price']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'sale_price', 'current_price',
            'category', 'brand', 'product_type', 'image', 'in_stock', 
            'is_featured', 'is_unique_variant'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'specifications', 'price', 'sale_price',
            'current_price', 'category', 'brand', 'product_type', 'image', 'images', 
            'variants', 'stock', 'in_stock', 'is_featured', 'is_unique_variant',
            'reviews', 'average_rating', 'created_at', 'updated_at'
        ]

    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(r.rating for r in reviews) / len(reviews)
        return None


# ============ MSME FINANCING SERIALIZERS ============

class FinancingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancingPlan
        fields = ['id', 'months', 'interest_rate', 'is_active']


class FinancingApplicationSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    financing_plan = FinancingPlanSerializer(read_only=True)
    
    class Meta:
        model = FinancingApplication
        fields = [
            'id', 'application_id', 'application_type', 'product', 'variant',
            'financing_plan', 'full_name', 'id_number', 'kra_pin',
            'employer_name', 'staff_number', 'preferred_bank',
            'status', 'approved_amount', 'monthly_payment', 'created_at'
        ]
        read_only_fields = ['application_id', 'status', 'approved_amount', 'monthly_payment']


class FinancingApplicationCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(write_only=True)
    variant_id = serializers.IntegerField(write_only=True, required=False)
    financing_plan_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FinancingApplication
        fields = [
            'application_type', 'product_id', 'variant_id', 'financing_plan_id',
            'full_name', 'id_number', 'kra_pin',
            'employer_name', 'staff_number', 'preferred_bank'
        ]
    
    def create(self, validated_data):
        product_id = validated_data.pop('product_id')
        variant_id = validated_data.pop('variant_id', None)
        financing_plan_id = validated_data.pop('financing_plan_id')
        
        validated_data['product'] = Product.objects.get(id=product_id)
        if variant_id:
            validated_data['variant'] = ProductVariant.objects.get(id=variant_id)
        validated_data['financing_plan'] = FinancingPlan.objects.get(id=financing_plan_id)
        
        return super().create(validated_data)


# ============ ENTERPRISE SERIALIZERS ============

class EnterpriseBundleSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = EnterpriseBundle
        fields = [
            'id', 'product', 'name', 'data_gb', 'minutes', 'sms',
            'minimum_quantity', 'price_per_device', 'additional_perks', 'is_active'
        ]


class EnterpriseOrderSerializer(serializers.ModelSerializer):
    bundle = EnterpriseBundleSerializer(read_only=True)
    
    class Meta:
        model = EnterpriseOrder
        fields = [
            'id', 'order_id', 'bundle', 'quantity', 'company_name',
            'company_registration', 'contact_person', 'contact_email', 'contact_phone',
            'preferred_bank', 'approved_amount', 'total_amount',
            'delivery_address', 'delivery_town', 'lead_time_days',
            'status', 'created_at'
        ]
        read_only_fields = ['order_id', 'approved_amount', 'status']


class EnterpriseOrderCreateSerializer(serializers.ModelSerializer):
    bundle_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = EnterpriseOrder
        fields = [
            'bundle_id', 'quantity', 'company_name', 'company_registration',
            'contact_person', 'contact_email', 'contact_phone',
            'preferred_bank', 'delivery_address', 'delivery_town'
        ]
    
    def create(self, validated_data):
        bundle_id = validated_data.pop('bundle_id')
        bundle = EnterpriseBundle.objects.get(id=bundle_id)
        validated_data['bundle'] = bundle
        validated_data['total_amount'] = bundle.price_per_device * validated_data['quantity']
        return super().create(validated_data)


# ============ EDUCATION SERIALIZERS ============

class EducationBoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationBoard
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'price',
            'installation_included', 'specifications', 'is_active'
        ]


class ClassroomPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassroomPackage
        fields = [
            'id', 'name', 'slug', 'description', 'boards_included',
            'price', 'installation_included', 'is_active'
        ]


class DonationAmountSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationAmount
        fields = ['id', 'amount_usd']


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            'id', 'donation_id', 'donor_name', 'donor_email', 'donor_phone',
            'amount', 'payment_method', 'is_anonymous', 'message',
            'status', 'created_at'
        ]
        read_only_fields = ['donation_id', 'status']


class FundraiserListSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    donor_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Fundraiser
        fields = [
            'id', 'fundraiser_id', 'fundraiser_type', 'school_name',
            'school_location', 'target_amount', 'current_amount',
            'progress_percentage', 'donor_count', 'share_link',
            'status', 'creator', 'created_at', 'end_date'
        ]
    
    def get_donor_count(self, obj):
        return obj.donations.filter(status='completed').count()


class FundraiserDetailSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)
    board = EducationBoardSerializer(read_only=True)
    classroom_package = ClassroomPackageSerializer(read_only=True)
    progress_percentage = serializers.FloatField(read_only=True)
    donations = DonationSerializer(many=True, read_only=True)
    leaderboard = serializers.SerializerMethodField()
    
    class Meta:
        model = Fundraiser
        fields = [
            'id', 'fundraiser_id', 'fundraiser_type', 'school_name',
            'school_location', 'school_description', 'board', 'classroom_package',
            'target_amount', 'current_amount', 'progress_percentage',
            'share_link', 'status', 'creator', 'donations', 'leaderboard',
            'created_at', 'end_date'
        ]
    
    def get_leaderboard(self, obj):
        donations = obj.donations.filter(status='completed', is_anonymous=False).order_by('-amount')[:10]
        return [{'name': d.donor_name, 'amount': d.amount} for d in donations]


class FundraiserCreateSerializer(serializers.ModelSerializer):
    board_id = serializers.IntegerField(write_only=True, required=False)
    classroom_package_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Fundraiser
        fields = [
            'fundraiser_type', 'school_name', 'school_location',
            'school_description', 'board_id', 'classroom_package_id', 'end_date'
        ]
    
    def create(self, validated_data):
        import secrets
        
        board_id = validated_data.pop('board_id', None)
        classroom_package_id = validated_data.pop('classroom_package_id', None)
        
        if board_id:
            board = EducationBoard.objects.get(id=board_id)
            validated_data['board'] = board
            validated_data['target_amount'] = board.price
        
        if classroom_package_id:
            package = ClassroomPackage.objects.get(id=classroom_package_id)
            validated_data['classroom_package'] = package
            validated_data['target_amount'] = package.price
        
        validated_data['share_link'] = secrets.token_urlsafe(8)
        validated_data['creator'] = self.context['request'].user
        
        return super().create(validated_data)


class EducationTabletSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationTablet
        fields = [
            'id', 'name', 'slug', 'brand', 'size', 'description',
            'specifications', 'image', 'price', 'stock', 'is_active'
        ]


class TabletSoftwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = TabletSoftware
        fields = ['id', 'name', 'slug', 'description', 'price', 'is_default']


class SchoolTabletOrderItemSerializer(serializers.ModelSerializer):
    tablet = EducationTabletSerializer(read_only=True)
    software = TabletSoftwareSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = SchoolTabletOrderItem
        fields = ['id', 'tablet', 'software', 'quantity', 'unit_price', 'total_price']


class SchoolTabletOrderSerializer(serializers.ModelSerializer):
    items = SchoolTabletOrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = SchoolTabletOrder
        fields = [
            'id', 'order_id', 'school_name', 'school_email', 'school_phone',
            'school_address', 'status', 'total_amount', 'items', 'created_at'
        ]
        read_only_fields = ['order_id', 'status', 'total_amount']


# ============ CART & CHECKOUT SERIALIZERS ============

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    education_tablet = EducationTabletSerializer(read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    item_name = serializers.CharField(read_only=True)
    item_type = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'variant', 'education_tablet', 'quantity', 'unit_price', 'total_price', 'item_name', 'item_type']
    
    def get_item_type(self, obj):
        if obj.education_tablet:
            return 'education_tablet'
        return 'product'


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'cart_id', 'items', 'total', 'item_count']


class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    education_tablet_id = serializers.IntegerField(required=False)
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate(self, data):
        if not data.get('product_id') and not data.get('education_tablet_id'):
            raise serializers.ValidationError("Either product_id or education_tablet_id is required")
        if data.get('product_id') and data.get('education_tablet_id'):
            raise serializers.ValidationError("Cannot add both product and education tablet in the same request")
        return data


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    variant = ProductVariantSerializer(read_only=True)
    education_tablet = EducationTabletSerializer(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'variant', 'education_tablet', 'quantity', 'unit_price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'full_name', 'email', 'phone',
            'town', 'address', 'subtotal', 'shipping_cost', 'total',
            'status', 'payment_status', 'tracking_number',
            'items', 'created_at'
        ]
        read_only_fields = ['order_id', 'subtotal', 'total', 'status', 'payment_status', 'tracking_number']


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['full_name', 'email', 'phone', 'town', 'address']


# ============ TRADE-IN SERIALIZER ============

class TradeInRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TradeInRequest
        fields = [
            'id', 'name', 'email', 'phone', 
            'current_device', 'device_condition', 'message',
            'product', 'product_name', 'variant', 'variant_name',
            'status', 'estimated_value', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'estimated_value', 'created_at']


class TradeInRequestCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=50)
    currentDevice = serializers.CharField(max_length=200)
    deviceCondition = serializers.CharField(max_length=20)
    message = serializers.CharField(required=False, allow_blank=True)
    product_id = serializers.IntegerField(required=False, allow_null=True)
    product_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    variant_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
