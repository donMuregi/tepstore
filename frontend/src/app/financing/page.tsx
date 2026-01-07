'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsAPI, Product } from '@/lib/api';
import { useStore } from '@/lib/store-context';
import ProductCard from '@/components/products/ProductCard';
import { FunnelIcon, MagnifyingGlassIcon, BriefcaseIcon, BuildingOfficeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function MSMEPage() {
  const { user, isAuthenticated } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getByType('msme');
        setProducts(response.results);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.current_price) - parseFloat(b.current_price);
      case 'price-high':
        return parseFloat(b.current_price) - parseFloat(a.current_price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              MSMEs Device Financing
            </h1>
            <p className="text-xl text-emerald-50 mb-6">
              Get your dream smartphone today and pay in convenient monthly installments. 
              Quick approval with just your ID and KRA PIN, or enjoy lower rates with salary deduction.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                <div className="text-2xl font-bold mb-1">Same Day</div>
                <div className="text-xs text-emerald-50">Approval</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                <div className="text-2xl font-bold mb-1">No Payslip</div>
                <div className="text-xs text-emerald-50">Required</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                <div className="text-2xl font-bold mb-1">Flexible</div>
                <div className="text-xs text-emerald-50">Payment Terms</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl">
                <div className="text-2xl font-bold mb-1">Higher Limits</div>
                <div className="text-xs text-emerald-50">For Salaried</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Salaried Employee Section - Only for authenticated salaried employees */}
      {isAuthenticated && user?.profile?.is_salaried_employee && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <BriefcaseIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold">Salary Deduction Financing</h3>
                  <p className="text-blue-100">
                    As a salaried employee, enjoy lower interest rates with direct salary deductions
                  </p>
                </div>
              </div>
              <Link
                href="/msme/salaried"
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                View Salaried Products
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}


      {/* Products Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} type="msme" />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Choose Your Device', desc: 'Browse our collection and select the phone you want' },
              { step: '2', title: 'Select Payment Plan', desc: 'Choose 3, 6, 9, or 12 month installments' },
              { step: '3', title: 'Get Approved', desc: 'Quick approval through our bank partners' },
              { step: '4', title: 'Receive Your Device', desc: 'Free delivery to your doorstep via DHL' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
