'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { productsAPI, Product } from '@/lib/api';
import { 
  CreditCardIcon, 
  DevicePhoneMobileIcon, 
  BanknotesIcon,
  ShieldCheckIcon,
  UserIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function BNPLPage() {
  const router = useRouter();
  const { isAuthenticated } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ type: 'msme' });
        const productsArray = Array.isArray(response) ? response : response.results || [];
        setProducts(productsArray);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  const calculateDeposit = (price: string | number) => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    return priceNum * 0.3; // 30% deposit
  };

  const calculateInstallment = (price: string | number, months: number = 6) => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    const remaining = priceNum * 0.7; // 70% remaining after deposit
    const interest = remaining * 0.1; // 10% interest
    return (remaining + interest) / months;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Chukua Simu, <br />
                <span className="text-yellow-300">Lipa Later</span>
              </h1>
              <p className="text-lg text-red-100 mb-8 leading-relaxed">
                Get the smartphone you need without needing a bank account or formal employment. 
                Pay a small deposit and spread the rest over easy monthly installments.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <BanknotesIcon className="w-5 h-5 text-yellow-300" />
                  <span>30% Deposit</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <CreditCardIcon className="w-5 h-5 text-yellow-300" />
                  <span>6-12 Month Plans</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <ShieldCheckIcon className="w-5 h-5 text-yellow-300" />
                  <span>No Credit Check</span>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-red-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Sign in to get started</h3>
                      <p className="text-red-200 text-sm">Create an account to browse our BNPL catalog</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link 
                      href="/login"
                      className="flex-1 py-3 bg-white text-red-700 font-semibold rounded-xl text-center hover:bg-gray-100 transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/register"
                      className="flex-1 py-3 bg-yellow-400 text-red-800 font-semibold rounded-xl text-center hover:bg-yellow-300 transition-colors"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-400 text-red-800 font-bold rounded-xl hover:bg-yellow-300 transition-colors"
                >
                  Browse Catalog
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
                  <div className="text-center mb-6">
                    <DevicePhoneMobileIcon className="w-24 h-24 mx-auto text-yellow-300 mb-4" />
                    <h3 className="text-2xl font-bold">How It Works</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-red-800 font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-semibold">Create an Account</h4>
                        <p className="text-red-200 text-sm">Sign up with your phone number and ID</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-red-800 font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold">Choose Your Phone</h4>
                        <p className="text-red-200 text-sm">Browse our catalog and select a device</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-red-800 font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold">Pay 30% Deposit</h4>
                        <p className="text-red-200 text-sm">Make your initial deposit via M-Pesa</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-red-800 font-bold shrink-0">4</div>
                      <div>
                        <h4 className="font-semibold">Get Your Phone</h4>
                        <p className="text-red-200 text-sm">Receive your device and pay the rest monthly</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose BNPL?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BanknotesIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bank Account Needed</h3>
              <p className="text-gray-600">
                Pay via M-Pesa or other mobile money services. No traditional bank account required.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Credit Check</h3>
              <p className="text-gray-600">
                We don&apos;t run credit checks. Your deposit secures your purchase.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCardIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Payments</h3>
              <p className="text-gray-600">
                Choose 6 or 12-month plans that fit your budget. Pay weekly or monthly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog - Only shown to authenticated users */}
      {isAuthenticated && (
        <section id="catalog" className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">BNPL Catalog</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse our selection of smartphones available for Buy Now, Pay Later
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-50 p-4 relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <DevicePhoneMobileIcon className="w-24 h-24 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <div className="space-y-1 mb-4">
                        <p className="text-sm text-gray-500">Full Price: <span className="line-through">{formatPrice(product.current_price)}</span></p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm text-gray-600">Deposit:</span>
                          <span className="text-lg font-bold text-red-600">{formatPrice(calculateDeposit(product.current_price))}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Then <span className="font-semibold text-gray-900">{formatPrice(calculateInstallment(product.current_price))}/mo</span> for 6 months
                        </p>
                      </div>
                      <Link
                        href={`/bnpl/${product.slug}`}
                        className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-center font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-colors"
                      >
                        Get This Phone
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What documents do I need?</h3>
              <p className="text-gray-600">You only need a valid national ID or passport, and a working phone number for M-Pesa payments.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How much is the deposit?</h3>
              <p className="text-gray-600">The deposit is 30% of the device price. The remaining 70% (plus a small service fee) is spread over your chosen payment period.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What if I miss a payment?</h3>
              <p className="text-gray-600">We offer a 7-day grace period. After that, a small late fee applies. Contact us if you&apos;re having difficulties—we&apos;re here to help!</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I pay off early?</h3>
              <p className="text-gray-600">Yes! You can pay off your balance at any time with no early payment penalties.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
