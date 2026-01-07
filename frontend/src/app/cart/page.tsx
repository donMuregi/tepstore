'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import { cartAPI, CartItem } from '@/lib/api';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function CartPage() {
  const { refreshCart, isAuthenticated } = useStore();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await cartAPI.get(token || undefined);
        setCartItems(data.items || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    try {
      const token = localStorage.getItem('token');
      await cartAPI.updateItem(itemId, quantity, token || undefined);
      await refreshCart();
      const data = await cartAPI.get(token || undefined);
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      const token = localStorage.getItem('token');
      await cartAPI.removeItem(itemId, token || undefined);
      await refreshCart();
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.total_price),
    0
  );
  const shipping = subtotal > 500 ? 0 : 15;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link 
            href="/shop" 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <ShoppingBagIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => {
                // Get item details regardless of type (product or education tablet)
                const isTablet = item.item_type === 'education_tablet';
                const itemName = item.item_name || (isTablet ? item.education_tablet?.name : item.product?.name) || 'Unknown Item';
                const itemImage = isTablet ? item.education_tablet?.image : item.product?.image;
                const itemSlug = isTablet ? item.education_tablet?.slug : item.product?.slug;
                const itemLink = isTablet ? `/education/tablets/${itemSlug}` : `/shop/${itemSlug}`;
                
                return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl p-6 shadow-sm transition-opacity ${
                    updating === item.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                      {itemImage ? (
                        <Image
                          src={itemImage.startsWith('http') ? itemImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${itemImage}`}
                          alt={itemName}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {isTablet ? '📱' : 'No Image'}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={itemLink}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
                      >
                        {itemName}
                      </Link>
                      {isTablet && (
                        <p className="text-sm text-orange-600 mt-1">
                          Education Tablet
                        </p>
                      )}
                      {item.variant && (
                        <p className="text-gray-500 mt-1">
                          {item.variant.name}
                          {item.variant.storage && ` • ${item.variant.storage}`}
                          {item.variant.color && ` • ${item.variant.color}`}
                        </p>
                      )}
                      <p className="text-lg font-bold text-gray-900 mt-2">
                        Ksh {parseFloat(item.unit_price).toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-lg font-semibold text-gray-900">
                        Ksh {parseFloat(item.total_price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>Ksh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `Ksh ${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-sm text-green-600">
                      Add Ksh {(500 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  )}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>Ksh {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={isAuthenticated ? "/checkout" : "/login?redirect=/checkout"}
                  className="block w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                </Link>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    You need to be logged in to place an order
                  </p>
                )}

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <TruckIcon className="w-5 h-5 text-blue-600" />
                    <span>Free delivery on orders over Ksh 500</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
