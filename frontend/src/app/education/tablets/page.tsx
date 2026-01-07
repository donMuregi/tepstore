'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { educationAPI, EducationTablet, cartAPI } from '@/lib/api';
import { ShoppingCartIcon, AcademicCapIcon, ShieldCheckIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';

export default function TabletsPage() {
  const [tablets, setTablets] = useState<EducationTablet[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchTablets = async () => {
      try {
        const response = await educationAPI.getTablets();
        setTablets(response.results || []);
      } catch (error) {
        console.error('Error fetching tablets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTablets();
  }, []);

  const addToCart = async (tablet: EducationTablet) => {
    if (addingId) return;
    setAddingId(tablet.id);
    
    try {
      // Use the cartAPI to add education tablet
      const token = localStorage.getItem('token');
      await cartAPI.addEducationTablet(tablet.id, 1, token || undefined);
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Update local cart count
      setCartCount(prev => prev + 1);
      
      // Redirect to cart
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Educational Tablets for Every Student
            </h1>
            <p className="text-xl mb-8 text-orange-100">
              Affordable, durable tablets designed specifically for learning
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="h-6 w-6" />
                <span>Pre-loaded Educational Content</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-6 w-6" />
                <span>School-Controlled Security</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCartIcon className="h-6 w-6" />
                <span>Flexible Payment Plans</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablets Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Tablet</h2>
          <p className="text-gray-600">
            All tablets come with Mwalimu Masomo Platform and Knox Guard pre-installed
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                <div className="h-64 bg-gray-200 rounded-lg mb-4" />
                <div className="h-6 bg-gray-200 rounded mb-2" />
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tablets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tablets.map((tablet) => (
                <div key={tablet.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="flex items-center justify-center h-64 bg-gradient-to-br from-orange-100 to-red-100">
                      {tablet.image ? (
                        <Image
                          src={tablet.image}
                          alt={tablet.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <DeviceTabletIcon className="h-32 w-32 text-orange-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{tablet.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{tablet.description}</p>
                    <p className="text-3xl font-bold text-orange-600 mb-4">
                      KSH {parseFloat(tablet.price).toLocaleString()}
                    </p>

                    {tablet.specifications && tablet.specifications.trim().length > 0 && (
                      <div className="mb-4">
                        <div 
                          className="text-sm text-gray-600 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: tablet.specifications }}
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Link
                        href={`/education/tablets/${tablet.slug}`}
                        className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => addToCart(tablet)}
                        disabled={addingId === tablet.id}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        {addingId === tablet.id ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <DeviceTabletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tablets available yet</p>
            <p className="text-gray-400 mt-2">Check back soon or contact us for more information</p>
          </div>
        )}

        {/* Bulk Purchase Info */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8 border-2 border-orange-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">School Bulk Purchase Discounts</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-orange-600 mb-2">10-49 Tablets</p>
              <p className="text-gray-700">5% Discount</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-2">50-99 Tablets</p>
              <p className="text-gray-700">10% Discount</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-2">100+ Tablets</p>
              <p className="text-gray-700">15% Discount + Free Setup</p>
            </div>
          </div>
          <Link
            href="/education/packages"
            className="inline-block mt-6 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition"
          >
            View Classroom Packages
          </Link>
        </div>

        {/* Payment Options */}
        <div className="mt-8 bg-white rounded-lg p-8 shadow-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Flexible Payment Options</h3>
          <div className="grid md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">For Individuals:</h4>
              <ul className="space-y-2">
                <li>• Pay in full - Get 3% discount</li>
                <li>• 3-month installment plan</li>
                <li>• 6-month installment plan</li>
                <li>• M-PESA, Bank Transfer, or Card</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">For Schools:</h4>
              <ul className="space-y-2">
                <li>• Purchase Order (PO) accepted</li>
                <li>• 30-day payment terms</li>
                <li>• Lease-to-own options available</li>
                <li>• Direct invoicing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* View Cart */}
        {cartCount > 0 && (
          <div className="mt-8 bg-orange-600 text-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {cartCount} {cartCount === 1 ? 'tablet' : 'tablets'} in cart
                </p>
                <p className="text-orange-100">Ready to checkout</p>
              </div>
              <Link
                href="/cart"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition"
              >
                View Cart & Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
