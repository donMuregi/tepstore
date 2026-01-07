"""
Management command to import products from WooCommerce CSV export.
Usage: python manage.py import_wc_products
"""
import csv
import re
import os
import requests
from io import BytesIO
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.utils.text import slugify
from django.db import transaction
from store.models import Product, Brand, Category, ProductVariant


def clean_html(raw_html):
    """Remove HTML tags and clean up text."""
    if not raw_html:
        return ""
    # Remove HTML tags
    cleanr = re.compile(r'<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    # Replace \n with actual newlines
    cleantext = cleantext.replace('\\n', '\n')
    # Clean up extra whitespace
    cleantext = re.sub(r'\n\s*\n', '\n\n', cleantext)
    return cleantext.strip()


def extract_specs_from_short_desc(short_desc):
    """Extract specifications from short description HTML."""
    specs = {}
    if not short_desc:
        return specs
    
    # Look for patterns like "RAM: 8GB" or "Display: 6.7-inch"
    patterns = [
        r'<strong>([^<]+):\s*</strong>([^<]+)',
        r'<li><strong>([^<]+):\s*</strong>([^<]+)</li>',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, short_desc)
        for key, value in matches:
            key = key.strip()
            value = value.strip()
            if key and value:
                specs[key] = value
    
    return specs


def download_image(url):
    """Download image from URL and return ContentFile."""
    if not url:
        return None
    try:
        response = requests.get(url.strip(), timeout=10)
        if response.status_code == 200:
            # Get filename from URL
            filename = url.split('/')[-1].split('?')[0]
            return ContentFile(response.content, name=filename)
    except Exception as e:
        print(f"  Warning: Could not download image {url}: {e}")
    return None


class Command(BaseCommand):
    help = 'Import products from WooCommerce CSV export'

    def add_arguments(self, parser):
        parser.add_argument(
            '--csv',
            type=str,
            default='wc-product-export-20-12-2025-1766263123950.csv',
            help='Path to WooCommerce CSV file'
        )
        parser.add_argument(
            '--download-images',
            action='store_true',
            help='Download product images from URLs'
        )

    def handle(self, *args, **options):
        csv_path = options['csv']
        download_images = options.get('download_images', False)
        
        # Find CSV file
        if not os.path.isabs(csv_path):
            csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), csv_path)
        
        if not os.path.exists(csv_path):
            self.stderr.write(self.style.ERROR(f'CSV file not found: {csv_path}'))
            return
        
        self.stdout.write(f'Reading CSV from: {csv_path}')
        
        # Get or create default category
        shop_category, _ = Category.objects.get_or_create(
            slug='mobile-phones',
            defaults={
                'name': 'Mobile Phones',
                'category_type': 'shop',
                'description': 'Smartphones and mobile devices'
            }
        )
        
        # Get or create Samsung brand
        samsung_brand, _ = Brand.objects.get_or_create(
            slug='samsung',
            defaults={'name': 'Samsung'}
        )
        
        # Track products for variants
        parent_products = {}  # SKU -> Product
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
        
        self.stdout.write(f'Found {len(rows)} rows in CSV')
        
        # First pass: create parent products (variable and simple types)
        with transaction.atomic():
            for row in rows:
                product_type = row.get('Type', '').strip()
                
                if product_type not in ('variable', 'simple'):
                    continue
                
                name = row.get('Name', '').strip()
                sku = row.get('SKU', '').strip()
                short_desc = row.get('Short description', '')
                description = row.get('Description', '')
                regular_price = row.get('Regular price', '').strip()
                sale_price = row.get('Sale price', '').strip()
                images = row.get('Images', '').strip()
                brand_name = row.get('Brands', '').strip()
                
                if not name:
                    continue
                
                self.stdout.write(f'\nProcessing: {name}')
                
                # Generate slug
                base_slug = slugify(name)
                slug = base_slug
                counter = 1
                while Product.objects.filter(slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Get or create brand
                brand = samsung_brand
                if brand_name and brand_name.upper() != 'SAMSUNG':
                    brand, _ = Brand.objects.get_or_create(
                        slug=slugify(brand_name),
                        defaults={'name': brand_name}
                    )
                
                # Extract specs
                specs = extract_specs_from_short_desc(short_desc)
                
                # Clean description
                clean_desc = clean_html(description)
                if not clean_desc:
                    clean_desc = clean_html(short_desc)
                
                # Parse price
                price = 0
                if regular_price:
                    try:
                        price = float(regular_price)
                    except ValueError:
                        pass
                
                sp = None
                if sale_price:
                    try:
                        sp = float(sale_price)
                    except ValueError:
                        pass
                
                # Create product
                product = Product(
                    name=name,
                    slug=slug,
                    brand=brand,
                    description=clean_desc[:5000] if clean_desc else f'{name} - Premium smartphone',
                    specifications=specs,
                    price=price if price > 0 else 10000,  # Default price if not set
                    sale_price=sp,
                    category=shop_category,
                    product_type='shop',
                    stock=100,
                    is_active=True,
                    is_featured=row.get('Is featured?', '0') == '1',
                )
                
                # Handle image
                if images and download_images:
                    first_image_url = images.split(',')[0].strip()
                    image_file = download_image(first_image_url)
                    if image_file:
                        product.image = image_file
                        self.stdout.write(f'  Downloaded image: {first_image_url}')
                
                product.save()
                self.stdout.write(self.style.SUCCESS(f'  Created product: {product.name} (Price: {product.price})'))
                
                # Store for variant linking
                if sku:
                    parent_products[sku] = product
        
        # Second pass: create variants
        with transaction.atomic():
            for row in rows:
                product_type = row.get('Type', '').strip()
                
                if product_type != 'variation':
                    continue
                
                name = row.get('Name', '').strip()
                parent_sku = row.get('Parent', '').strip()
                regular_price = row.get('Regular price', '').strip()
                
                if not name or not parent_sku:
                    continue
                
                parent = parent_products.get(parent_sku)
                if not parent:
                    self.stdout.write(self.style.WARNING(f'  Parent not found for variation: {name} (Parent SKU: {parent_sku})'))
                    continue
                
                # Extract variant info from name (e.g., "Samsung Galaxy A56 5G - 256GB/8GB")
                variant_name = name
                if ' - ' in name:
                    variant_name = name.split(' - ')[-1]
                
                # Parse storage/RAM
                storage = ''
                ram = ''
                color = ''
                
                # Check attributes
                attr1_name = row.get('Attribute 1 name', '').strip()
                attr1_value = row.get('Attribute 1 value(s)', '').strip()
                attr2_name = row.get('Attribute 2 name', '').strip()
                attr2_value = row.get('Attribute 2 value(s)', '').strip()
                
                if attr1_name.lower() == 'storage':
                    storage = attr1_value
                elif attr1_name.lower() == 'color':
                    color = attr1_value
                
                if attr2_name.lower() == 'storage':
                    storage = attr2_value
                elif attr2_name.lower() == 'color':
                    color = attr2_value
                
                # Parse price
                price = 0
                if regular_price:
                    try:
                        price = float(regular_price)
                    except ValueError:
                        pass
                
                # Update parent price if this variant has a price and parent doesn't
                if price > 0 and parent.price <= 10000:
                    parent.price = price
                    parent.save()
                    self.stdout.write(f'  Updated parent price to {price}')
                
                # Generate SKU for variant
                variant_sku = row.get('SKU', '').strip()
                if not variant_sku:
                    variant_sku = f"{parent_sku}-{slugify(variant_name)}"
                
                # Calculate price adjustment
                price_adjustment = 0
                if price > 0 and parent.price > 0:
                    price_adjustment = price - float(parent.price)
                
                # Create variant
                variant, created = ProductVariant.objects.get_or_create(
                    sku=variant_sku,
                    defaults={
                        'product': parent,
                        'name': variant_name,
                        'storage': storage,
                        'color': color,
                        'ram': ram,
                        'price_adjustment': price_adjustment,
                        'stock': 100,
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Created variant: {variant_name} (Price: {price})'))
                else:
                    self.stdout.write(f'  Variant already exists: {variant_name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nImport complete! Created {len(parent_products)} products.'))
