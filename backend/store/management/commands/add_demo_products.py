from django.core.management.base import BaseCommand
from store.models import Product, ProductVariant, Brand, Category
from decimal import Decimal


class Command(BaseCommand):
    help = 'Add demo products for each product type'

    def handle(self, *args, **kwargs):
        # Get or create brands
        samsung, _ = Brand.objects.get_or_create(name='Samsung', defaults={'slug': 'samsung'})
        apple, _ = Brand.objects.get_or_create(name='Apple', defaults={'slug': 'apple'})
        google, _ = Brand.objects.get_or_create(name='Google', defaults={'slug': 'google'})
        oneplus, _ = Brand.objects.get_or_create(name='OnePlus', defaults={'slug': 'oneplus'})
        xiaomi, _ = Brand.objects.get_or_create(name='Xiaomi', defaults={'slug': 'xiaomi'})
        oppo, _ = Brand.objects.get_or_create(name='Oppo', defaults={'slug': 'oppo'})

        # Get or create categories
        smartphones, _ = Category.objects.get_or_create(name='Smartphones', defaults={'slug': 'smartphones'})

        self.stdout.write('Adding MSME products...')
        msme_products = [
            {
                'name': 'Samsung Galaxy A54 5G',
                'brand': samsung,
                'price': Decimal('65000'),
                'description': 'Mid-range powerhouse with excellent camera and 5G connectivity',
                'product_type': 'msme',
            },
            {
                'name': 'Samsung Galaxy A34',
                'brand': samsung,
                'price': Decimal('48000'),
                'description': 'Affordable 5G smartphone with vibrant display',
                'product_type': 'msme',
            },
            {
                'name': 'Oppo Reno 10 Pro',
                'brand': oppo,
                'price': Decimal('72000'),
                'description': 'Premium design with exceptional camera capabilities',
                'product_type': 'msme',
            },
            {
                'name': 'Xiaomi Redmi Note 13 Pro',
                'brand': xiaomi,
                'price': Decimal('42000'),
                'description': 'Best value for money with 120Hz display',
                'product_type': 'msme',
            },
            {
                'name': 'OnePlus Nord CE 3',
                'brand': oneplus,
                'price': Decimal('58000'),
                'description': 'Fast charging and smooth performance',
                'product_type': 'msme',
            },
            {
                'name': 'Google Pixel 7a',
                'brand': google,
                'price': Decimal('78000'),
                'description': 'Pure Android experience with excellent camera AI',
                'product_type': 'msme',
            },
            {
                'name': 'Samsung Galaxy M54',
                'brand': samsung,
                'price': Decimal('52000'),
                'description': 'Large battery with super AMOLED display',
                'product_type': 'msme',
            },
            {
                'name': 'Oppo A98 5G',
                'brand': oppo,
                'price': Decimal('45000'),
                'description': 'Affordable 5G with sleek design',
                'product_type': 'msme',
            },
            {
                'name': 'Xiaomi 13 Lite',
                'brand': xiaomi,
                'price': Decimal('62000'),
                'description': 'Lightweight premium phone with great cameras',
                'product_type': 'msme',
            },
            {
                'name': 'OnePlus Nord 3',
                'brand': oneplus,
                'price': Decimal('68000'),
                'description': 'Flagship features at mid-range price',
                'product_type': 'msme',
            },
        ]

        for product_data in msme_products:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'slug': product_data['name'].lower().replace(' ', '-'),
                    'brand': product_data['brand'],
                    'category': smartphones,
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'product_type': product_data['product_type'],
                    'stock': 50,
                    'is_active': True,
                }
            )
            if created:
                # Create default variant
                ProductVariant.objects.create(
                    product=product,
                    name='Standard',
                    price_adjustment=Decimal('0'),
                    stock=50,
                    sku=f'{product.slug}-standard'
                )
                self.stdout.write(self.style.SUCCESS(f'Created MSME product: {product.name}'))

        self.stdout.write('Adding Shop Direct products...')
        shop_products = [
            {
                'name': 'iPhone 15 Pro Max',
                'brand': apple,
                'price': Decimal('185000'),
                'description': 'Latest iPhone with titanium design and A17 Pro chip',
                'product_type': 'shop',
            },
            {
                'name': 'Samsung Galaxy S24 Ultra',
                'brand': samsung,
                'price': Decimal('165000'),
                'description': 'Ultimate flagship with S Pen and AI features',
                'product_type': 'shop',
            },
            {
                'name': 'iPhone 14 Pro',
                'brand': apple,
                'price': Decimal('148000'),
                'description': 'Dynamic Island and pro camera system',
                'product_type': 'shop',
            },
            {
                'name': 'Google Pixel 8 Pro',
                'brand': google,
                'price': Decimal('128000'),
                'description': 'Best AI photography and pure Android',
                'product_type': 'shop',
            },
            {
                'name': 'OnePlus 12',
                'brand': oneplus,
                'price': Decimal('95000'),
                'description': 'Flagship killer with Snapdragon 8 Gen 3',
                'product_type': 'shop',
            },
            {
                'name': 'Samsung Galaxy Z Fold 5',
                'brand': samsung,
                'price': Decimal('225000'),
                'description': 'Foldable innovation with multitasking power',
                'product_type': 'shop',
            },
            {
                'name': 'iPhone 15',
                'brand': apple,
                'price': Decimal('128000'),
                'description': 'Dynamic Island comes to standard iPhone',
                'product_type': 'shop',
            },
            {
                'name': 'Samsung Galaxy S23 FE',
                'brand': samsung,
                'price': Decimal('82000'),
                'description': 'Fan Edition with flagship features',
                'product_type': 'shop',
            },
            {
                'name': 'Xiaomi 14 Pro',
                'brand': xiaomi,
                'price': Decimal('115000'),
                'description': 'Leica cameras and premium build',
                'product_type': 'shop',
            },
            {
                'name': 'Oppo Find X6 Pro',
                'brand': oppo,
                'price': Decimal('135000'),
                'description': 'Photography flagship with Hasselblad',
                'product_type': 'shop',
            },
        ]

        for product_data in shop_products:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'slug': product_data['name'].lower().replace(' ', '-'),
                    'brand': product_data['brand'],
                    'category': smartphones,
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'product_type': product_data['product_type'],
                    'stock': 25,
                    'is_active': True,
                }
            )
            if created:
                # Create variants for shop products
                colors = ['Black', 'White', 'Blue']
                storages = ['256GB', '512GB']
                for color in colors:
                    for storage in storages:
                        price_adjustment = Decimal('0')
                        if storage == '512GB':
                            price_adjustment = Decimal('15000')
                        
                        ProductVariant.objects.create(
                            product=product,
                            name=f'{storage} {color}',
                            color=color,
                            storage=storage,
                            price_adjustment=price_adjustment,
                            stock=10,
                            sku=f'{product.slug}-{storage.lower()}-{color.lower()}'
                        )
                self.stdout.write(self.style.SUCCESS(f'Created Shop product: {product.name}'))

        self.stdout.write('Adding Enterprise products...')
        enterprise_products = [
            {
                'name': 'Samsung Galaxy S24',
                'brand': samsung,
                'price': Decimal('125000'),
                'description': 'Enterprise-ready flagship for business',
                'product_type': 'enterprise',
            },
            {
                'name': 'iPhone 15 Pro',
                'brand': apple,
                'price': Decimal('158000'),
                'description': 'Pro performance for enterprise teams',
                'product_type': 'enterprise',
            },
            {
                'name': 'Samsung Galaxy A54 Enterprise',
                'brand': samsung,
                'price': Decimal('68000'),
                'description': 'Mid-range enterprise solution',
                'product_type': 'enterprise',
            },
            {
                'name': 'Google Pixel 8',
                'brand': google,
                'price': Decimal('98000'),
                'description': 'Secure enterprise phone with Titan M2',
                'product_type': 'enterprise',
            },
            {
                'name': 'Samsung Galaxy S23',
                'brand': samsung,
                'price': Decimal('105000'),
                'description': 'Powerful enterprise flagship',
                'product_type': 'enterprise',
            },
            {
                'name': 'iPhone 14',
                'brand': apple,
                'price': Decimal('118000'),
                'description': 'Reliable enterprise iPhone',
                'product_type': 'enterprise',
            },
            {
                'name': 'OnePlus 11 Enterprise',
                'brand': oneplus,
                'price': Decimal('88000'),
                'description': 'Fast performance for business users',
                'product_type': 'enterprise',
            },
            {
                'name': 'Samsung Galaxy Z Flip 5',
                'brand': samsung,
                'price': Decimal('145000'),
                'description': 'Compact foldable for executives',
                'product_type': 'enterprise',
            },
            {
                'name': 'Google Pixel 7 Pro Enterprise',
                'brand': google,
                'price': Decimal('108000'),
                'description': 'Enterprise security with AI features',
                'product_type': 'enterprise',
            },
            {
                'name': 'Xiaomi 13T Pro Enterprise',
                'brand': xiaomi,
                'price': Decimal('78000'),
                'description': 'Value enterprise solution',
                'product_type': 'enterprise',
            },
        ]

        for product_data in enterprise_products:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'slug': product_data['name'].lower().replace(' ', '-'),
                    'brand': product_data['brand'],
                    'category': smartphones,
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'product_type': product_data['product_type'],
                    'stock': 100,
                    'is_active': True,
                }
            )
            if created:
                # Create default variant
                ProductVariant.objects.create(
                    product=product,
                    name='Standard',
                    price_adjustment=Decimal('0'),
                    stock=100,
                    sku=f'{product.slug}-standard'
                )
                self.stdout.write(self.style.SUCCESS(f'Created Enterprise product: {product.name}'))

        self.stdout.write(self.style.SUCCESS('Successfully added all demo products!'))
