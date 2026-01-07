from django.core.management.base import BaseCommand
from store.models import (
    Category, Brand, Product, ProductVariant,
    EnterpriseBundle, EducationBoard, EducationTablet, TabletSoftware,
    ClassroomPackage, HeroSlide
)
from decimal import Decimal


class Command(BaseCommand):
    help = 'Load demo products for all categories'

    def handle(self, *args, **options):
        self.stdout.write('Creating demo data...')
        
        # ==================== HERO SLIDES ====================
        self.stdout.write('Creating Hero Slides...')
        
        HeroSlide.objects.get_or_create(
            title='Financing for',
            highlight='MSMEs & Hustlers',
            defaults={
                'badge_text': 'Trusted by 10,000+ customers',
                'description': 'Get your dream smartphone with flexible payment plans. From boda boda riders to small business owners - we make technology accessible for everyone.',
                'primary_button_text': 'Get Financing',
                'primary_button_link': '/msme',
                'secondary_button_text': 'View Phones',
                'secondary_button_link': '/msme',
                'card_icon': 'phone',
                'card_label': 'Starting from',
                'card_price': 'Ksh 2,999',
                'card_subtext': '/month with financing',
                'order': 1,
                'is_active': True
            }
        )
        
        HeroSlide.objects.get_or_create(
            title='Device as a',
            highlight='Service (DaaS)',
            defaults={
                'badge_text': 'For Businesses & Corporates',
                'description': 'Complete device bundles with 60GB data, 400 minutes, and 100 SMS. Minimum 5 devices for corporate teams.',
                'primary_button_text': 'Get a Quote',
                'primary_button_link': '/enterprise',
                'secondary_button_text': 'View Bundles',
                'secondary_button_link': '/enterprise',
                'card_icon': 'building',
                'card_label': 'Starting from',
                'card_price': 'Ksh 4,500',
                'card_subtext': '/device/month all-inclusive',
                'order': 2,
                'is_active': True
            }
        )
        
        HeroSlide.objects.get_or_create(
            title='Smart Boards &',
            highlight='Tablets for Schools',
            defaults={
                'badge_text': 'Empowering Education',
                'description': 'Interactive displays, tablets with management software, and alumni fundraising for schools across Kenya.',
                'primary_button_text': 'Explore Education',
                'primary_button_link': '/education',
                'secondary_button_text': 'Start Fundraiser',
                'secondary_button_link': '/education',
                'card_icon': 'computer',
                'card_label': 'Smart Boards from',
                'card_price': 'Ksh 249,900',
                'card_subtext': 'with installation included',
                'order': 3,
                'is_active': True
            }
        )
        
        HeroSlide.objects.get_or_create(
            title='Unique Phone',
            highlight='Variants & Colors',
            defaults={
                'badge_text': 'Exclusive Collection',
                'description': 'Discover rare color variants and exclusive models you won\'t find anywhere else. Trade-in your old device.',
                'primary_button_text': 'Shop Now',
                'primary_button_link': '/shop',
                'secondary_button_text': 'Trade-In Value',
                'secondary_button_link': '/shop',
                'card_icon': 'shopping',
                'card_label': 'Flagships from',
                'card_price': 'Ksh 129,900',
                'card_subtext': 'or trade-in and save',
                'order': 4,
                'is_active': True
            }
        )
        
        # Create Brands
        samsung, _ = Brand.objects.get_or_create(
            name='Samsung',
            defaults={'slug': 'samsung'}
        )
        lenovo, _ = Brand.objects.get_or_create(
            name='Lenovo',
            defaults={'slug': 'lenovo'}
        )
        faiba, _ = Brand.objects.get_or_create(
            name='Faiba',
            defaults={'slug': 'faiba'}
        )
        
        # Create Categories
        msme_cat, _ = Category.objects.get_or_create(
            name='Smartphones',
            category_type='msme',
            defaults={'slug': 'smartphones-msme', 'description': 'Smartphones for MSME financing'}
        )
        
        enterprise_cat, _ = Category.objects.get_or_create(
            name='Enterprise Devices',
            category_type='enterprise',
            defaults={'slug': 'enterprise-devices', 'description': 'Devices for corporate solutions'}
        )
        
        education_cat, _ = Category.objects.get_or_create(
            name='Educational Technology',
            category_type='education',
            defaults={'slug': 'educational-technology', 'description': 'Technology for schools'}
        )
        
        shop_cat, _ = Category.objects.get_or_create(
            name='Unique Variants',
            category_type='shop_direct',
            defaults={'slug': 'unique-variants', 'description': 'Exclusive phone variants'}
        )
        
        # ==================== SHOP DIRECT PRODUCTS ====================
        self.stdout.write('Creating Shop Direct products...')
        
        # Galaxy S25 Ultra
        s25_ultra, _ = Product.objects.get_or_create(
            name='Galaxy S25 Ultra',
            slug='galaxy-s25-ultra',
            defaults={
                'brand': samsung,
                'category': shop_cat,
                'product_type': 'shop_direct',
                'description': 'The ultimate Galaxy experience with S Pen, titanium frame, and advanced AI features.',
                'price': Decimal('1299.00'),
                'stock': 50,
                'is_unique_variant': True,
                'specifications': {
                    'Display': '6.9" Dynamic AMOLED 2X',
                    'Processor': 'Snapdragon 8 Elite',
                    'RAM': '12GB',
                    'Battery': '5000mAh',
                    'Camera': '200MP Main + 50MP Telephoto'
                }
            }
        )
        ProductVariant.objects.get_or_create(
            product=s25_ultra,
            name='256GB Phantom Black',
            defaults={'storage': '256GB', 'color': 'Phantom Black', 'price_adjustment': Decimal('0'), 'stock': 20, 'sku': 'S25U-256-BLK'}
        )
        ProductVariant.objects.get_or_create(
            product=s25_ultra,
            name='512GB Titanium Gray',
            defaults={'storage': '512GB', 'color': 'Titanium Gray', 'price_adjustment': Decimal('100'), 'stock': 15, 'sku': 'S25U-512-GRY'}
        )
        
        # Galaxy S25+
        s25_plus, _ = Product.objects.get_or_create(
            name='Galaxy S25+',
            slug='galaxy-s25-plus',
            defaults={
                'brand': samsung,
                'category': shop_cat,
                'product_type': 'shop_direct',
                'description': 'Premium Galaxy experience with large display and powerful performance.',
                'price': Decimal('999.00'),
                'stock': 60,
                'is_unique_variant': True,
                'specifications': {
                    'Display': '6.7" Dynamic AMOLED 2X',
                    'Processor': 'Snapdragon 8 Elite',
                    'RAM': '12GB',
                    'Battery': '4900mAh',
                    'Camera': '50MP Main + 12MP Telephoto'
                }
            }
        )
        ProductVariant.objects.get_or_create(
            product=s25_plus,
            name='256GB Cream',
            defaults={'storage': '256GB', 'color': 'Cream', 'price_adjustment': Decimal('0'), 'stock': 25, 'sku': 'S25P-256-CRM'}
        )
        ProductVariant.objects.get_or_create(
            product=s25_plus,
            name='512GB Navy',
            defaults={'storage': '512GB', 'color': 'Navy', 'price_adjustment': Decimal('100'), 'stock': 20, 'sku': 'S25P-512-NVY'}
        )
        
        # Galaxy Tab S11 Ultra
        tab_s11, _ = Product.objects.get_or_create(
            name='Galaxy Tab S11 Ultra',
            slug='galaxy-tab-s11-ultra',
            defaults={
                'brand': samsung,
                'category': shop_cat,
                'product_type': 'shop_direct',
                'description': 'The ultimate tablet for creators and professionals with massive display.',
                'price': Decimal('1199.00'),
                'stock': 30,
                'is_unique_variant': True,
                'specifications': {
                    'Display': '14.6" Dynamic AMOLED 2X',
                    'Processor': 'MediaTek Dimensity 9300+',
                    'RAM': '16GB',
                    'Battery': '11200mAh',
                    'S Pen': 'Included'
                }
            }
        )
        ProductVariant.objects.get_or_create(
            product=tab_s11,
            name='512GB Graphite',
            defaults={'storage': '512GB', 'color': 'Graphite', 'price_adjustment': Decimal('0'), 'stock': 15, 'sku': 'TABS11-512-GPH'}
        )
        
        # Galaxy Watch 7
        watch_7, _ = Product.objects.get_or_create(
            name='Galaxy Watch 7',
            slug='galaxy-watch-7',
            defaults={
                'brand': samsung,
                'category': shop_cat,
                'product_type': 'shop_direct',
                'description': 'Advanced health monitoring and fitness tracking in a sleek design.',
                'price': Decimal('399.00'),
                'stock': 80,
                'is_unique_variant': True,
                'specifications': {
                    'Display': '1.5" Super AMOLED',
                    'Processor': 'Exynos W1000',
                    'Battery': '425mAh',
                    'Water Resistance': '5ATM + IP68',
                    'Health Features': 'BioActive Sensor'
                }
            }
        )
        ProductVariant.objects.get_or_create(
            product=watch_7,
            name='44mm Silver',
            defaults={'storage': '', 'color': 'Silver', 'price_adjustment': Decimal('0'), 'stock': 40, 'sku': 'GW7-44-SLV'}
        )
        ProductVariant.objects.get_or_create(
            product=watch_7,
            name='44mm Green',
            defaults={'storage': '', 'color': 'Green', 'price_adjustment': Decimal('0'), 'stock': 20, 'sku': 'GW7-44-GRN'}
        )
        
        # ==================== MSME PRODUCTS ====================
        self.stdout.write('Creating MSME products...')
        
        # Galaxy A55
        a55, _ = Product.objects.get_or_create(
            name='Galaxy A55 5G',
            slug='galaxy-a55-5g',
            defaults={
                'brand': samsung,
                'category': msme_cat,
                'product_type': 'msme',
                'description': 'Awesome camera, awesome display, awesome performance.',
                'price': Decimal('449.00'),
                'stock': 100,
                'specifications': {
                    'Display': '6.6" Super AMOLED',
                    'Processor': 'Exynos 1480',
                    'RAM': '8GB',
                    'Battery': '5000mAh',
                    'Camera': '50MP Main'
                }
            }
        )
        ProductVariant.objects.get_or_create(
            product=a55,
            name='128GB Awesome Navy',
            defaults={'storage': '128GB', 'color': 'Awesome Navy', 'price_adjustment': Decimal('0'), 'stock': 50, 'sku': 'A55-128-NVY'}
        )
        ProductVariant.objects.get_or_create(
            product=a55,
            name='256GB Awesome Lilac',
            defaults={'storage': '256GB', 'color': 'Awesome Lilac', 'price_adjustment': Decimal('50'), 'stock': 50, 'sku': 'A55-256-LIL'}
        )
        
        # Galaxy A35
        a35, _ = Product.objects.get_or_create(
            name='Galaxy A35 5G',
            slug='galaxy-a35-5g',
            defaults={
                'brand': samsung,
                'category': msme_cat,
                'product_type': 'msme',
                'description': 'Smooth display, secure and durable design with brilliant camera.',
                'price': Decimal('349.00'),
                'stock': 120,
                'specifications': {
                    'Display': '6.6" Super AMOLED',
                    'Processor': 'Exynos 1380',
                    'RAM': '6GB',
                    'Battery': '5000mAh',
                    'Camera': '50MP Main'
                }
            }
        )
        ProductVariant.objects.get_or_create(
            product=a35,
            name='128GB Awesome Iceblue',
            defaults={'storage': '128GB', 'color': 'Awesome Iceblue', 'price_adjustment': Decimal('0'), 'stock': 60, 'sku': 'A35-128-ICE'}
        )
        
        # ==================== ENTERPRISE BUNDLES ====================
        self.stdout.write('Creating Enterprise bundles...')
        
        # Create enterprise product first
        enterprise_s25, _ = Product.objects.get_or_create(
            name='Galaxy S25 Ultra Enterprise',
            slug='galaxy-s25-ultra-enterprise',
            defaults={
                'brand': samsung,
                'category': enterprise_cat,
                'product_type': 'enterprise',
                'description': 'Premium business device with enterprise features.',
                'price': Decimal('1299.00'),
                'stock': 100,
            }
        )
        
        EnterpriseBundle.objects.get_or_create(
            name='S25 Ultra Business Bundle',
            product=enterprise_s25,
            defaults={
                'data_gb': 60,
                'minutes': 400,
                'sms': 100,
                'minimum_quantity': 5,
                'price_per_device': Decimal('89.00'),
                'is_active': True
            }
        )
        
        enterprise_s25_plus, _ = Product.objects.get_or_create(
            name='Galaxy S25+ Enterprise',
            slug='galaxy-s25-plus-enterprise',
            defaults={
                'brand': samsung,
                'category': enterprise_cat,
                'product_type': 'enterprise',
                'description': 'Business device with great performance.',
                'price': Decimal('999.00'),
                'stock': 100,
            }
        )
        
        EnterpriseBundle.objects.get_or_create(
            name='S25+ Business Bundle',
            product=enterprise_s25_plus,
            defaults={
                'data_gb': 60,
                'minutes': 400,
                'sms': 100,
                'minimum_quantity': 5,
                'price_per_device': Decimal('69.00'),
                'is_active': True
            }
        )
        
        enterprise_a55, _ = Product.objects.get_or_create(
            name='Galaxy A55 Enterprise',
            slug='galaxy-a55-enterprise',
            defaults={
                'brand': samsung,
                'category': enterprise_cat,
                'product_type': 'enterprise',
                'description': 'Cost-effective team device.',
                'price': Decimal('449.00'),
                'stock': 200,
            }
        )
        
        EnterpriseBundle.objects.get_or_create(
            name='Galaxy A55 Team Bundle',
            product=enterprise_a55,
            defaults={
                'data_gb': 40,
                'minutes': 200,
                'sms': 100,
                'minimum_quantity': 10,
                'price_per_device': Decimal('45.00'),
                'is_active': True
            }
        )
        
        # ==================== EDUCATION PRODUCTS ====================
        self.stdout.write('Creating Education products...')
        
        # Education Boards
        board_65, _ = EducationBoard.objects.get_or_create(
            name='65" Interactive Display',
            slug='65-interactive-display',
            defaults={
                'description': 'Premium 65-inch interactive flat panel for classrooms with 4K resolution.',
                'price': Decimal('2499.00'),
                'installation_included': True,
                'specifications': {
                    'Size': '65"',
                    'Resolution': '4K UHD',
                    'Touch Points': '40-point',
                    'Built-in': 'Android OS, WiFi, Bluetooth',
                    'Warranty': '3 years'
                }
            }
        )
        
        board_75, _ = EducationBoard.objects.get_or_create(
            name='75" Interactive Display',
            slug='75-interactive-display',
            defaults={
                'description': 'Large 75-inch interactive flat panel ideal for bigger classrooms and auditoriums.',
                'price': Decimal('3499.00'),
                'installation_included': True,
                'specifications': {
                    'Size': '75"',
                    'Resolution': '4K UHD',
                    'Touch Points': '40-point',
                    'Built-in': 'Android OS, WiFi, Bluetooth',
                    'Warranty': '3 years'
                }
            }
        )
        
        board_86, _ = EducationBoard.objects.get_or_create(
            name='86" Interactive Display',
            slug='86-interactive-display',
            defaults={
                'description': 'Extra-large 86-inch interactive display for large venues and lecture halls.',
                'price': Decimal('4999.00'),
                'installation_included': True,
                'specifications': {
                    'Size': '86"',
                    'Resolution': '4K UHD',
                    'Touch Points': '40-point',
                    'Built-in': 'Android OS, WiFi, Bluetooth',
                    'Warranty': '3 years'
                }
            }
        )
        
        # Classroom Packages
        ClassroomPackage.objects.get_or_create(
            name='Single Board Package',
            slug='single-board-package',
            defaults={
                'description': 'Single interactive board for one classroom with installation.',
                'boards_included': 1,
                'price': Decimal('2499.00'),
                'installation_included': True
            }
        )
        
        ClassroomPackage.objects.get_or_create(
            name='Classroom Set (5 Boards)',
            slug='classroom-set-5',
            defaults={
                'description': '5 interactive boards for small schools with bulk discount.',
                'boards_included': 5,
                'price': Decimal('11495.00'),
                'installation_included': True
            }
        )
        
        ClassroomPackage.objects.get_or_create(
            name='School Package (10 Boards)',
            slug='school-package-10',
            defaults={
                'description': '10 interactive boards for medium schools with significant discount.',
                'boards_included': 10,
                'price': Decimal('20990.00'),
                'installation_included': True
            }
        )
        
        # Education Tablets
        tablet_lenovo_11, _ = EducationTablet.objects.get_or_create(
            name='Lenovo Tab M11',
            slug='lenovo-tab-m11',
            defaults={
                'brand': 'lenovo',
                'size': '11',
                'description': 'Durable education tablet with long battery life and robust build.',
                'price': Decimal('299.00'),
                'stock': 100,
                'specifications': {
                    'Display': '11" IPS LCD',
                    'Processor': 'MediaTek Helio G88',
                    'RAM': '4GB',
                    'Storage': '64GB',
                    'Battery': '7040mAh'
                }
            }
        )
        
        tablet_samsung_11, _ = EducationTablet.objects.get_or_create(
            name='Samsung Galaxy Tab A9+',
            slug='samsung-galaxy-tab-a9-plus',
            defaults={
                'brand': 'samsung',
                'size': '11',
                'description': 'Reliable Samsung tablet for education with Knox security.',
                'price': Decimal('329.00'),
                'stock': 100,
                'specifications': {
                    'Display': '11" TFT LCD',
                    'Processor': 'Snapdragon 695',
                    'RAM': '4GB',
                    'Storage': '64GB',
                    'Battery': '7040mAh'
                }
            }
        )
        
        tablet_faiba_12, _ = EducationTablet.objects.get_or_create(
            name='Faiba Edu Tablet',
            slug='faiba-edu-tablet',
            defaults={
                'brand': 'faiba',
                'size': '12',
                'description': 'Large screen education tablet with 4G connectivity included.',
                'price': Decimal('349.00'),
                'stock': 100,
                'specifications': {
                    'Display': '12" IPS LCD',
                    'Processor': 'Unisoc T618',
                    'RAM': '4GB',
                    'Storage': '64GB',
                    'Battery': '8000mAh',
                    'Connectivity': '4G LTE'
                }
            }
        )
        
        # Tablet Software
        mwalimu, _ = TabletSoftware.objects.get_or_create(
            name='Mwalimu Masomo Platform',
            slug='mwalimu-masomo',
            defaults={
                'description': 'Centralized tablet & content management platform for schools. Includes content management, remote control, usage analytics, and app management.',
                'price': Decimal('15.00'),
                'is_default': True
            }
        )
        
        knox, _ = TabletSoftware.objects.get_or_create(
            name='Knox Guard Protection',
            slug='knox-guard',
            defaults={
                'description': 'Device protection & remote management with lock and wipe capabilities. Features remote lock, remote wipe, location tracking, and policy enforcement.',
                'price': Decimal('8.00'),
                'is_default': False
            }
        )
        
        self.stdout.write(self.style.SUCCESS('Demo data created successfully!'))
