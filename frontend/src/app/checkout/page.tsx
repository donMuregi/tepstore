'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { cartAPI, ordersAPI, CartItem } from '@/lib/api';
import {
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface DeliveryForm {
  full_name: string;
  phone_number: string;
  email: string;
  town: string;
  address: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { refreshCart, isAuthenticated, user, token } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [form, setForm] = useState<DeliveryForm>({
    full_name: '',
    phone_number: '',
    email: '',
    town: '',
    address: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<DeliveryForm>>({});

  useEffect(() => {
    // Require login for checkout
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const fetchCart = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const data = await cartAPI.get(savedToken || undefined);
        if (!data.items || data.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCartItems(data.items);
        // Pre-fill email if user is logged in
        if (user?.email) {
          setForm(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [router, user, isAuthenticated]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.total_price),
    0
  );
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryForm> = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (!form.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^[\d+\-\s()]+$/.test(form.phone_number)) {
      newErrors.phone_number = 'Invalid phone number';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!form.town.trim()) {
      newErrors.town = 'Town/City is required';
    }
    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const orderData = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone_number,
        town: form.town,
        address: form.address,
      };
      
      const order = await ordersAPI.create(orderData, token || undefined);
      const savedToken = localStorage.getItem('token');
      await cartAPI.clear(savedToken || undefined);
      await refreshCart();
      setOrderId(order.order_id);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                    <div className="h-12 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. We&apos;ve sent a confirmation email to{' '}
              <span className="font-semibold">{form.email}</span>
            </p>
            {orderId && (
              <p className="text-lg text-gray-900 mb-8">
                Order Number: <span className="font-bold text-blue-600">{orderId}</span>
              </p>
            )}
            
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Details</h3>
              <p className="text-gray-600">{form.full_name}</p>
              <p className="text-gray-600">{form.address}</p>
              <p className="text-gray-600">{form.town}</p>
              <p className="text-gray-600">{form.phone_number}</p>
            </div>

            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                View Order Status
              </Link>
              <Link
                href="/shop"
                className="block w-full border border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/cart" 
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Delivery Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TruckIcon className="w-6 h-6 text-blue-600" />
                  Delivery Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                        errors.full_name ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                        errors.phone_number ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="+254 7XX XXX XXX"
                    />
                    {errors.phone_number && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                        errors.email ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Town */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      value={form.town}
                      onChange={(e) => setForm({ ...form, town: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                        errors.town ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Nairobi"
                    />
                    {errors.town && (
                      <p className="text-red-500 text-sm mt-1">{errors.town}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 ${
                        errors.address ? 'border-red-500' : 'border-gray-200'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Street address, building, etc."
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      placeholder="Any special instructions for delivery"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info (placeholder) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                  Payment Method
                </h2>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-blue-800 font-medium">Pay on Delivery</p>
                  <p className="text-blue-600 text-sm mt-1">
                    Pay with M-Pesa or cash when your order arrives
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Items */}
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.image ? (
                          <Image
                            src={item.product.image.startsWith('http') ? item.product.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.product.image}`}
                            alt={item.product.name}
                            fill
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            No img
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {item.product?.name || item.item_name || 'Unknown Item'}
                        </p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          Ksh {parseFloat(item.total_price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-3 border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Ksh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `Ksh ${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>Ksh {total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
