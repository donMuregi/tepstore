from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
import uuid


class Policy(models.Model):
    """Store policies managed through admin"""
    POLICY_TYPES = [
        ('privacy', 'Privacy Policy'),
        ('terms', 'Terms of Service'),
        ('cookies', 'Cookie Policy'),
        ('returns', 'Return Policy'),
        ('shipping', 'Shipping Policy'),
        ('refund', 'Refund Policy'),
        ('warranty', 'Warranty Policy'),
    ]
    
    policy_type = models.CharField(
        max_length=20, 
        choices=POLICY_TYPES, 
        unique=True,
        help_text="Type of policy - each type can only have one entry"
    )
    title = models.CharField(max_length=200, help_text="Page title")
    content = models.TextField(help_text="Policy content (supports HTML)")
    last_updated = models.DateField(help_text="Date the policy was last updated")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['policy_type']
        verbose_name = 'Policy'
        verbose_name_plural = 'Policies'
    
    def __str__(self):
        return self.get_policy_type_display()


class Employer(models.Model):
    """Employers for salaried employee financing"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Unique employer code")
    address = models.TextField(blank=True)
    contact_person = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Employer'
        verbose_name_plural = 'Employers'
    
    def __str__(self):
        return self.name


class Bank(models.Model):
    """Partner banks for financing applications"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="Bank code (e.g., KCB, EQUITY)")
    logo = models.ImageField(upload_to='banks/', blank=True, null=True)
    branch = models.CharField(max_length=200, blank=True, help_text="Main branch")
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    api_endpoint = models.URLField(blank=True, help_text="Bank API endpoint for credit checks")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Partner Bank'
        verbose_name_plural = 'Partner Banks'
    
    def __str__(self):
        return self.name


class HeroSlide(models.Model):
    """Hero slider slides for homepage"""
    ICON_CHOICES = [
        ('phone', 'Phone/Mobile'),
        ('building', 'Building/Enterprise'),
        ('computer', 'Computer/Education'),
        ('shopping', 'Shopping Bag'),
    ]
    
    COLOR_CHOICES = [
        ('green', 'Green'),
        ('blue', 'Blue'),
        ('orange', 'Orange'),
        ('pink', 'Pink'),
        ('purple', 'Purple'),
        ('teal', 'Teal'),
        ('red', 'Red'),
        ('indigo', 'Indigo'),
        ('amber', 'Amber'),
        ('cyan', 'Cyan'),
    ]
    
    title = models.CharField(max_length=100, help_text="First line of heading (e.g., 'Your Gateway to')")
    highlight = models.CharField(max_length=100, help_text="Highlighted text (e.g., 'Smart Technology')")
    badge_text = models.CharField(max_length=100, help_text="Badge text above title")
    description = models.TextField(help_text="Description paragraph")
    
    primary_button_text = models.CharField(max_length=50)
    primary_button_link = models.CharField(max_length=200)
    secondary_button_text = models.CharField(max_length=50)
    secondary_button_link = models.CharField(max_length=200)
    
    image = models.ImageField(upload_to='hero_slides/', help_text="Hero image (recommended: 800x600px)")
    
    card_icon = models.CharField(max_length=20, choices=ICON_CHOICES, default='phone')
    card_label = models.CharField(max_length=50, help_text="e.g., 'Starting from'")
    card_price = models.CharField(max_length=50, help_text="e.g., 'Ksh 2,999'")
    card_subtext = models.CharField(max_length=100, help_text="e.g., '/month with financing'")
    
    background_color = models.CharField(
        max_length=20, 
        choices=COLOR_CHOICES, 
        default='green',
        help_text="Background color theme for this slide"
    )
    
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower = first)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Hero Slide'
        verbose_name_plural = 'Hero Slides'
    
    def __str__(self):
        return f"{self.title} {self.highlight}"


class Category(models.Model):
    """Product categories for organizing products"""
    CATEGORY_TYPES = [
        ('msme', 'MSMEs Financing'),
        ('enterprise', 'Enterprise Solutions'),
        ('education', 'Educational Solutions'),
        ('shop', 'Shop Direct'),
    ]
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_TYPES, default='shop')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Brand(models.Model):
    """Phone/device brands"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """Base product model for all product types"""
    PRODUCT_TYPES = [
        ('msme', 'MSMEs Financing'),
        ('enterprise', 'Enterprise Solutions'),
        ('education_board', 'Education Board'),
        ('education_tablet', 'Education Tablet'),
        ('shop', 'Shop Direct'),
    ]
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField()
    specifications = models.TextField(blank=True, default='')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES, default='shop')
    image = models.ImageField(upload_to='products/')
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_unique_variant = models.BooleanField(default=False, help_text="For Shop Direct unique variants")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def current_price(self):
        return self.sale_price if self.sale_price else self.price


class ProductVariant(models.Model):
    """Product variants (storage, color, etc.)"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)  # e.g., "128GB - Black"
    storage = models.CharField(max_length=50, blank=True)  # e.g., "128GB"
    color = models.CharField(max_length=50, blank=True)
    ram = models.CharField(max_length=50, blank=True)
    price_adjustment = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return f"{self.product.name} - {self.name}"
    
    @property
    def final_price(self):
        return self.product.current_price + self.price_adjustment


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)

    def __str__(self):
        return f"Image for {self.product.name}"


# ============ MSME FINANCING ============

class FinancingPlan(models.Model):
    """Financing plans available for MSME products"""
    months = models.PositiveIntegerField()  # 3, 6, 9, 12
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['months']
    
    def __str__(self):
        return f"{self.months} months @ {self.interest_rate}%"
    
    def calculate_monthly_payment(self, price):
        """Calculate monthly payment for a given price"""
        total = price * (1 + self.interest_rate / 100)
        return total / self.months


class FinancingApplication(models.Model):
    """BNPL Financing applications"""
    APPLICATION_TYPES = [
        ('individual', 'Individual'),
        ('chama', 'Chama/Group'),
        ('corporate', 'Corporate'),
        ('salaried', 'Salaried Worker'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('bank_review', 'Bank Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
    ]
    
    application_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='financing_applications', null=True, blank=True)
    application_type = models.CharField(max_length=20, choices=APPLICATION_TYPES)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    financing_plan = models.ForeignKey(FinancingPlan, on_delete=models.CASCADE)
    
    # Individual fields
    id_number = models.CharField(max_length=50, blank=True)
    full_name = models.CharField(max_length=200)
    kra_pin = models.CharField(max_length=50, blank=True)
    
    # Employer selection (for Individual applicants)
    employer = models.ForeignKey(Employer, on_delete=models.SET_NULL, null=True, blank=True, related_name='financing_applications')
    employer_name = models.CharField(max_length=200, blank=True, help_text="Used if employer not in list")
    staff_number = models.CharField(max_length=100, blank=True)
    
    # Bank selection (for all types - Individual without employer, Chama, Corporate)
    bank = models.ForeignKey('Bank', on_delete=models.SET_NULL, null=True, blank=True, related_name='financing_applications')
    preferred_bank = models.CharField(max_length=100, blank=True, help_text="Legacy field")
    
    # Chama/Corporate fields
    organization_name = models.CharField(max_length=200, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)
    certificate = models.FileField(upload_to='financing_certificates/', blank=True, null=True)
    
    # Application status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bank_response = models.JSONField(default=dict, blank=True)
    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Application {self.application_id} - {self.full_name}"


# ============ ENTERPRISE SOLUTIONS ============

class EnterpriseBundle(models.Model):
    """DAAS bundles for enterprise customers"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='enterprise_bundles')
    name = models.CharField(max_length=200)
    data_gb = models.PositiveIntegerField(default=60)  # Minimum 60GB
    minutes = models.PositiveIntegerField(default=400)  # Minimum 400 minutes
    sms = models.PositiveIntegerField(default=0)
    minimum_quantity = models.PositiveIntegerField(default=5)
    price_per_device = models.DecimalField(max_digits=10, decimal_places=2)
    additional_perks = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} - {self.product.name}"


class EnterpriseOrder(models.Model):
    """Enterprise/Corporate orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('credit_check', 'Credit Check'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]
    
    order_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enterprise_orders', null=True, blank=True)
    bundle = models.ForeignKey(EnterpriseBundle, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    
    # Company details
    company_name = models.CharField(max_length=200)
    company_registration = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    
    # Bank/Credit details
    preferred_bank = models.CharField(max_length=100, default='Equity')
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    # Order totals
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Delivery
    delivery_address = models.TextField()
    delivery_town = models.CharField(max_length=100)
    lead_time_days = models.PositiveIntegerField(default=7)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    bank_response = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Enterprise Order {self.order_id} - {self.company_name}"
    
    def calculate_total(self):
        return self.bundle.price_per_device * self.quantity


# ============ EDUCATIONAL SOLUTIONS ============

class EducationBoard(models.Model):
    """Smart boards for education fundraising"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='education/boards/')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    installation_included = models.BooleanField(default=False)
    specifications = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class ClassroomPackage(models.Model):
    """Classroom packages (2 boards + installation)"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    boards_included = models.PositiveIntegerField(default=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    installation_included = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class School(models.Model):
    """Pre-approved schools for fundraising"""
    name = models.CharField(max_length=300)
    location = models.CharField(max_length=200, blank=True)
    county = models.CharField(max_length=100, blank=True)
    school_type = models.CharField(max_length=50, blank=True, help_text="e.g., Primary, Secondary, Mixed")
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'School'
        verbose_name_plural = 'Schools'
    
    def __str__(self):
        if self.location:
            return f"{self.name} - {self.location}"
        return self.name


class Fundraiser(models.Model):
    """Alumni fundraisers for education boards"""
    FUNDRAISER_TYPES = [
        ('single_board', 'Single Board Sponsorship'),
        ('classroom', 'Classroom Package'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    fundraiser_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fundraisers')
    fundraiser_type = models.CharField(max_length=20, choices=FUNDRAISER_TYPES)
    
    # School details - link to School model
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name='fundraisers')
    school_name = models.CharField(max_length=200)  # Keep for backward compatibility
    school_location = models.CharField(max_length=200)
    school_description = models.TextField(blank=True)
    
    # Target
    board = models.ForeignKey(EducationBoard, on_delete=models.SET_NULL, null=True, blank=True)
    classroom_package = models.ForeignKey(ClassroomPackage, on_delete=models.SET_NULL, null=True, blank=True)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Sharing
    share_link = models.CharField(max_length=100, unique=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    end_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"Fundraiser for {self.school_name} by {self.creator.username}"
    
    @property
    def progress_percentage(self):
        if self.target_amount > 0:
            return (self.current_amount / self.target_amount) * 100
        return 0


class DonationAmount(models.Model):
    """Preset donation amounts in USD"""
    amount_usd = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['amount_usd']
    
    def __str__(self):
        return f"${self.amount_usd}"


class Donation(models.Model):
    """Individual donations to fundraisers"""
    PAYMENT_METHODS = [
        ('mpesa', 'M-Pesa'),
        ('card', 'Card Payment'),
        ('bank', 'Bank Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    donation_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    fundraiser = models.ForeignKey(Fundraiser, on_delete=models.CASCADE, related_name='donations')
    donor_name = models.CharField(max_length=200)
    donor_email = models.EmailField(blank=True)
    donor_phone = models.CharField(max_length=20, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    is_anonymous = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Donation of ${self.amount} to {self.fundraiser.school_name}"


class EducationTablet(models.Model):
    """Tablets for schools"""
    BRANDS = [
        ('lenovo', 'Lenovo'),
        ('samsung', 'Samsung'),
        ('faiba', 'Faiba'),
    ]
    
    SIZES = [
        ('11', '11"'),
        ('12', '12"'),
    ]
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    brand = models.CharField(max_length=20, choices=BRANDS)
    size = models.CharField(max_length=5, choices=SIZES)
    description = models.TextField()
    specifications = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='education/tablets/')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.name} ({self.size})"


class TabletSoftware(models.Model):
    """Software options for education tablets"""
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return self.name


class SchoolTabletOrder(models.Model):
    """School orders for tablets"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]
    
    order_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='school_tablet_orders')
    
    # School details
    school_name = models.CharField(max_length=200)
    school_email = models.EmailField()
    school_phone = models.CharField(max_length=20)
    school_address = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Tablet Order {self.order_id} - {self.school_name}"


class SchoolTabletOrderItem(models.Model):
    """Items in a school tablet order"""
    order = models.ForeignKey(SchoolTabletOrder, on_delete=models.CASCADE, related_name='items')
    tablet = models.ForeignKey(EducationTablet, on_delete=models.CASCADE)
    software = models.ManyToManyField(TabletSoftware, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.tablet.name}"
    
    @property
    def total_price(self):
        software_total = sum(s.price for s in self.software.all())
        return (self.unit_price + software_total) * self.quantity


# ============ SHOP DIRECT & CART ============

class Cart(models.Model):
    """Shopping cart"""
    cart_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts', null=True, blank=True)
    session_key = models.CharField(max_length=100, blank=True)  # For guest users
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Cart {self.cart_id}"
    
    @property
    def total(self):
        return sum(item.total_price for item in self.items.all())
    
    @property
    def item_count(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    """Items in a cart - supports both products and education tablets"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    education_tablet = models.ForeignKey(EducationTablet, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    
    class Meta:
        # Remove unique_together constraint since we now have multiple item types
        pass
    
    def __str__(self):
        if self.education_tablet:
            return f"{self.quantity}x {self.education_tablet.name}"
        return f"{self.quantity}x {self.product.name}"
    
    @property
    def unit_price(self):
        if self.education_tablet:
            return self.education_tablet.price
        if self.variant:
            return self.variant.final_price
        return self.product.current_price
    
    @property
    def total_price(self):
        return self.unit_price * self.quantity
    
    @property
    def item_name(self):
        """Get the name of the item regardless of type"""
        if self.education_tablet:
            return self.education_tablet.name
        return self.product.name
    
    @property
    def item_image(self):
        """Get the image of the item regardless of type"""
        if self.education_tablet:
            return self.education_tablet.image
        return self.product.image


class Order(models.Model):
    """Shop Direct orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    order_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    
    # Customer details
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Delivery details
    town = models.CharField(max_length=100)
    address = models.TextField()
    
    # Order totals
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    
    # Tracking
    tracking_number = models.CharField(max_length=100, blank=True)
    dhl_tracking_id = models.CharField(max_length=100, blank=True)
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Order {self.order_id}"


class OrderItem(models.Model):
    """Items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    education_tablet = models.ForeignKey(EducationTablet, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        if self.product:
            return f"{self.quantity}x {self.product.name}"
        elif self.education_tablet:
            return f"{self.quantity}x {self.education_tablet.name}"
        return f"{self.quantity}x Unknown Item"
    
    @property
    def total_price(self):
        return self.unit_price * self.quantity


class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user')
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.username} for {self.product.name}"


class TradeInRequest(models.Model):
    """Trade-in requests from Shop Direct products"""
    CONDITION_CHOICES = [
        ('excellent', 'Excellent - Like New'),
        ('good', 'Good - Minor Scratches'),
        ('fair', 'Fair - Visible Wear'),
        ('poor', 'Poor - Functional but Damaged'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewing', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]
    
    # Contact info
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    
    # Device being traded in
    current_device = models.CharField(max_length=200)
    device_condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    message = models.TextField(blank=True)
    
    # Product they want
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='trade_in_requests')
    product_name = models.CharField(max_length=200, blank=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    variant_name = models.CharField(max_length=200, blank=True)
    
    # Admin fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    estimated_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    admin_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Trade-In Request'
        verbose_name_plural = 'Trade-In Requests'
    
    def __str__(self):
        return f"Trade-in: {self.name} - {self.current_device}"
