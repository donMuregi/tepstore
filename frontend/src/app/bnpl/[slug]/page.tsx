'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { productsAPI, Product, ProductVariant } from '@/lib/api';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  TruckIcon,
  DevicePhoneMobileIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function BNPLProductPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<6 | 12>(6);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    full_name: '',
    id_number: '',
    phone: '',
    email: '',
    town: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/bnpl/' + slug);
      return;
    }

    const fetchProduct = async () => {
      try {
        const productData = await productsAPI.getBySlug(slug);
        setProduct(productData);
        if (productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, isAuthenticated, router]);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  const getPrice = () => {
    if (selectedVariant) {
      return parseFloat(selectedVariant.final_price);
    }
    return product ? parseFloat(product.current_price) : 0;
  };

  const calculateDeposit = () => {
    return getPrice() * 0.3; // 30% deposit
  };

  const calculateInstallment = () => {
    const remaining = getPrice() * 0.7; // 70% remaining after deposit
    const interest = remaining * (selectedPlan === 6 ? 0.1 : 0.15); // 10% for 6mo, 15% for 12mo
    return (remaining + interest) / selectedPlan;
  };

  const calculateTotal = () => {
    const deposit = calculateDeposit();
    const remaining = getPrice() * 0.7;
    const interest = remaining * (selectedPlan === 6 ? 0.1 : 0.15);
    return deposit + remaining + interest;
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    setOrderSuccess(true);
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Product not found</p>
          <Link href="/bnpl" className="text-red-600 hover:underline">Back to BNPL Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link 
          href="/bnpl" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Catalog
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <DevicePhoneMobileIcon className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Product Info & BNPL Calculator */}
          <div className="space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full mb-3">
                BNPL Available
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.short_description || product.description?.substring(0, 150) + '...'}</p>
            </div>

            {/* Variant Selection */}
            {product.variants.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Select Variant</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedVariant?.id === variant.id 
                          ? 'border-red-600 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{variant.name}</p>
                      <p className="text-sm text-gray-600">{variant.storage} / {variant.color}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Plan Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Plan</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedPlan(6)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedPlan === 6 
                      ? 'border-red-600 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-2xl text-gray-900">6</p>
                  <p className="text-sm text-gray-600">Months</p>
                  <p className="text-xs text-green-600 mt-1">10% service fee</p>
                </button>
                <button
                  onClick={() => setSelectedPlan(12)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedPlan === 12 
                      ? 'border-red-600 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-bold text-2xl text-gray-900">12</p>
                  <p className="text-sm text-gray-600">Months</p>
                  <p className="text-xs text-gray-500 mt-1">15% service fee</p>
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Device Price</span>
                  <span>{formatPrice(getPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Deposit (30%)</span>
                  <span className="font-semibold text-red-600">{formatPrice(calculateDeposit())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Monthly Payment × {selectedPlan}</span>
                  <span className="font-semibold">{formatPrice(calculateInstallment())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-red-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Order Button */}
            <button
              onClick={() => setShowOrderModal(true)}
              className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-xl hover:from-red-700 hover:to-red-800 transition-colors shadow-lg"
            >
              Order Now - Pay {formatPrice(calculateDeposit())} Deposit
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-3">
                <ShieldCheckIcon className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-xs text-gray-600">Genuine Products</p>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <TruckIcon className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-xs text-gray-600">Fast Delivery</p>
              </div>
              <div className="flex flex-col items-center text-center p-3">
                <CheckCircleIcon className="w-8 h-8 text-red-600 mb-2" />
                <p className="text-xs text-gray-600">No Credit Check</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && setShowOrderModal(false)} />
            
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              {!orderSuccess ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Order</h2>
                  
                  <div className="bg-red-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">{product.name}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Deposit Due Today</span>
                      <span className="text-red-600">{formatPrice(calculateDeposit())}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={orderData.full_name}
                        onChange={(e) => setOrderData({ ...orderData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        value={orderData.id_number}
                        onChange={(e) => setOrderData({ ...orderData, id_number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                        placeholder="Enter your ID number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone (M-Pesa)</label>
                      <input
                        type="tel"
                        value={orderData.phone}
                        onChange={(e) => setOrderData({ ...orderData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                        placeholder="07XX XXX XXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Town</label>
                      <input
                        type="text"
                        value={orderData.town}
                        onChange={(e) => setOrderData({ ...orderData, town: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 bg-white text-gray-900"
                        placeholder="Enter your town"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setShowOrderModal(false)}
                      disabled={submitting}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={submitting || !orderData.full_name || !orderData.id_number || !orderData.phone}
                      className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Pay Deposit'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircleIcon className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
                  <p className="text-gray-600 mb-6">
                    You&apos;ll receive an M-Pesa prompt shortly to pay your deposit of {formatPrice(calculateDeposit())}
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-gray-600 mb-2">Your payment schedule:</p>
                    <p className="font-semibold text-gray-900">
                      {formatPrice(calculateInstallment())} / month for {selectedPlan} months
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/orders')}
                    className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700"
                  >
                    View My Orders
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
