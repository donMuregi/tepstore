'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { productsAPI, Product, ProductVariant, cartAPI } from '@/lib/api';
import { useStore } from '@/lib/store-context';
import { 
  ShoppingCartIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  CheckIcon,
  SparklesIcon,
  StarIcon,
  ArrowLeftIcon,
  ArrowPathRoundedSquareIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null | undefined) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imagePath}`;
};

export default function ShopProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { refreshCart, isAuthenticated } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Trade-in popup state
  const [showTradeInPopup, setShowTradeInPopup] = useState(false);
  const [tradeInSubmitting, setTradeInSubmitting] = useState(false);
  const [tradeInSuccess, setTradeInSuccess] = useState(false);
  const [tradeInForm, setTradeInForm] = useState({
    name: '',
    email: '',
    phone: '',
    currentDevice: '',
    deviceCondition: 'good',
    message: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsAPI.getBySlug(slug);
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    // For products without variants, check product stock; otherwise check variant stock
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants && !selectedVariant) return;
    
    setAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      await cartAPI.addItem(product.id, selectedVariant?.id || null, quantity, token || undefined);
      await refreshCart();
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleTradeInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTradeInSubmitting(true);
    
    try {
      // Send trade-in request to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trade-in-requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tradeInForm,
          product_id: product?.id,
          product_name: product?.name,
          variant_id: selectedVariant?.id,
          variant_name: selectedVariant?.name,
        }),
      });
      
      if (response.ok) {
        setTradeInSuccess(true);
        setTradeInForm({
          name: '',
          email: '',
          phone: '',
          currentDevice: '',
          deviceCondition: 'good',
          message: ''
        });
        setTimeout(() => {
          setShowTradeInPopup(false);
          setTradeInSuccess(false);
        }, 3000);
      } else {
        alert('Failed to submit trade-in request. Please try again.');
      }
    } catch (error) {
      console.error('Trade-in submission error:', error);
      alert('Failed to submit trade-in request. Please try again.');
    } finally {
      setTradeInSubmitting(false);
    }
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return parseFloat(selectedVariant.final_price || selectedVariant.price);
    }
    return product ? parseFloat(product.current_price) : 0;
  };

  const getOriginalPrice = () => {
    if (selectedVariant?.original_price) {
      return parseFloat(selectedVariant.original_price);
    }
    return product?.original_price ? parseFloat(product.original_price) : null;
  };

  const discount = getOriginalPrice() && getOriginalPrice()! > getCurrentPrice()
    ? Math.round((1 - getCurrentPrice() / getOriginalPrice()!) * 100)
    : null;

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-14 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-xl mb-4">Product not found</p>
          <Link href="/shop" className="text-pink-600 hover:text-pink-700 font-medium">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Shop</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden shadow-sm">
              {product.is_unique_variant && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Online Exclusive
                </div>
              )}
              {discount && (
                <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  -{discount}%
                </div>
              )}
              {product.images && product.images.length > 0 ? (
                <Image
                  src={getImageUrl(product.images[selectedImage].image) || ''}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : product.image ? (
                <Image
                  src={getImageUrl(product.image) || ''}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-pink-500 ring-2 ring-pink-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={getImageUrl(image.image) || ''}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <p className="text-pink-600 font-medium">{product.brand.name}</p>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= 4 ? (
                    <StarSolidIcon key={star} className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <StarIcon key={star} className="w-5 h-5 text-gray-300" />
                  )
                ))}
              </div>
              <span className="text-gray-500">(128 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gray-900">
                Ksh {getCurrentPrice().toLocaleString()}
              </span>
              {getOriginalPrice() && (
                <span className="text-xl text-gray-400 line-through">
                  Ksh {getOriginalPrice()!.toLocaleString()}
                </span>
              )}
            </div>

            {/* Description */}
            <div 
              className="text-gray-600 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Select Variant</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant: ProductVariant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-pink-500 bg-pink-50'
                          : variant.stock === 0
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{variant.name}</p>
                          <p className="text-sm text-gray-500">
                            {variant.storage && `${variant.storage}`}
                            {variant.color && ` • ${variant.color}`}
                          </p>
                        </div>
                        {selectedVariant?.id === variant.id && (
                          <CheckIcon className="w-5 h-5 text-pink-600" />
                        )}
                      </div>
                      <p className="mt-2 font-semibold text-gray-900">
                        Ksh {parseFloat(variant.final_price || variant.price).toLocaleString()}
                      </p>
                      {variant.stock === 0 ? (
                        <p className="text-xs text-red-500 mt-1">Out of stock</p>
                      ) : variant.stock < 5 ? (
                        <p className="text-xs text-orange-500 mt-1">Only {variant.stock} left</p>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 font-medium min-w-[60px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900"
                  >
                    +
                  </button>
                </div>
                {selectedVariant && selectedVariant.stock < 10 && (
                  <span className="text-sm text-orange-500">
                    {selectedVariant.stock} available
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={
                  addingToCart || 
                  (product.variants && product.variants.length > 0 
                    ? (!selectedVariant || selectedVariant.stock === 0)
                    : product.stock === 0)
                }
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : addedToCart ? (
                  <>
                    <CheckIcon className="w-6 h-6" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCartIcon className="w-6 h-6" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={() => setShowTradeInPopup(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg"
              >
                <ArrowPathRoundedSquareIcon className="w-6 h-6" />
                Trade In
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isFavorite
                    ? 'border-pink-500 bg-pink-50 text-pink-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-6 h-6" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-600">
                <TruckIcon className="w-6 h-6 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-900">Free Delivery</p>
                  <p className="text-sm">On orders over $500</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ShieldCheckIcon className="w-6 h-6 text-pink-600" />
                <div>
                  <p className="font-medium text-gray-900">1 Year Warranty</p>
                  <p className="text-sm">Full manufacturer warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {product.specifications && product.specifications.trim().length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="bg-white rounded-2xl overflow-hidden p-6">
              <div 
                className="text-gray-700 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.specifications }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Trade-In Popup Modal */}
      {showTradeInPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="text-white">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ArrowPathRoundedSquareIcon className="w-6 h-6" />
                    Trade In Your Device
                  </h2>
                  <p className="text-amber-100 mt-1">Get the best value for your current device</p>
                </div>
                <button
                  onClick={() => setShowTradeInPopup(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Form */}
            {tradeInSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                <p className="text-gray-600">
                  We&apos;ve sent confirmation emails to you and our team. 
                  We&apos;ll get back to you within 24-48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleTradeInSubmit} className="p-6 space-y-4">
                {/* Product Being Traded For */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-500">Trading in for:</p>
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  {selectedVariant && (
                    <p className="text-sm text-gray-600">{selectedVariant.name}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={tradeInForm.name}
                      onChange={(e) => setTradeInForm({ ...tradeInForm, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={tradeInForm.email}
                      onChange={(e) => setTradeInForm({ ...tradeInForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={tradeInForm.phone}
                      onChange={(e) => setTradeInForm({ ...tradeInForm, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                      placeholder="+254 712 345 678"
                    />
                  </div>
                </div>

                {/* Current Device */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Current Device *
                  </label>
                  <input
                    type="text"
                    required
                    value={tradeInForm.currentDevice}
                    onChange={(e) => setTradeInForm({ ...tradeInForm, currentDevice: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                    placeholder="e.g., iPhone 12 Pro, 128GB"
                  />
                </div>

                {/* Device Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Device Condition *
                  </label>
                  <select
                    value={tradeInForm.deviceCondition}
                    onChange={(e) => setTradeInForm({ ...tradeInForm, deviceCondition: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                  >
                    <option value="excellent">Excellent - Like New</option>
                    <option value="good">Good - Minor Scratches</option>
                    <option value="fair">Fair - Visible Wear</option>
                    <option value="poor">Poor - Functional but Damaged</option>
                  </select>
                </div>

                {/* Additional Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Information
                  </label>
                  <textarea
                    value={tradeInForm.message}
                    onChange={(e) => setTradeInForm({ ...tradeInForm, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-gray-900"
                    placeholder="Any additional details about your device..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={tradeInSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tradeInSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Trade-In Request
                      <ArrowPathRoundedSquareIcon className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to receive emails regarding your trade-in request.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
