'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { enterpriseAPI, EnterpriseBundle } from '@/lib/api';
import { 
  WifiIcon, 
  PhoneIcon, 
  ShieldCheckIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function EnterprisePage() {
  const [bundles, setBundles] = useState<EnterpriseBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await enterpriseAPI.getBundles();
        setBundles(response.results);
      } catch (error) {
        console.error('Error fetching bundles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'Ksh',
    }).format(parseFloat(price));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section - Three Column Layout */}
      <section className="min-h-[600px]">
        <div className="grid lg:grid-cols-3 min-h-[600px]">
          {/* Column 1 - Telco Contracts Info */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-8 lg:p-12 flex flex-col justify-center">
            <h1 className="text-2xl lg:text-3xl font-bold mb-4">
              Telco Contracts for Your Business
            </h1>
            <p className="text-emerald-100 mb-6">
              Get the latest devices with data and voice bundles included.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <WifiIcon className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-bold">Data</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <PhoneIcon className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-bold">Voice</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 text-center">
                <ShieldCheckIcon className="w-5 h-5 mx-auto mb-1" />
                <p className="text-sm font-bold">MDM</p>
              </div>
            </div>

            <Link
              href="#bundles"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-all w-fit text-sm"
            >
              Browse Bundles
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          {/* Column 2 - Build Your Solution CTA */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Build a Solution Just for You
              </h2>
              
              <p className="text-purple-100 mb-4">
                Running a <span className="font-semibold text-white">hotel</span>? Managing <span className="font-semibold text-white">riders</span>?
              </p>
              
              <p className="text-purple-200 text-sm mb-6">
                Choose your devices, pick your networks, select your bundles.
              </p>

              <Link
                href="/telco-contracts/build"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-purple-700 font-bold rounded-xl hover:bg-purple-50 transition-all shadow-lg text-sm"
              >
                <WrenchScrewdriverIcon className="w-4 h-4" />
                Build Your Solution
              </Link>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-purple-200">
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                  <span>Any device</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                  <span>Any network</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 - Get Personalized Help */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Not Sure What You Need?
              </h2>
              
              <p className="text-orange-100 mb-4">
                Tell us about your business and we'll recommend the perfect solution.
              </p>
              
              <p className="text-orange-200 text-sm mb-6">
                Quick questionnaire • Personalized recommendation • No commitment
              </p>

              <Link
                href="/telco-contracts/consult"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg text-sm"
              >
                Get Recommendations
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Section */}
      <section id="bundles" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Telco Bundles</h2>
            <p className="text-lg text-gray-600">
              Choose the perfect bundle with your preferred network and data plan.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : bundles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bundles.map((bundle) => (
                <div key={bundle.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    {bundle.product.image ? (
                      <Image
                        src={bundle.product.image}
                        alt={bundle.product.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BuildingOffice2Icon className="w-24 h-24 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Bundle Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                    <p className="text-gray-600 mb-4">{bundle.product.name}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(bundle.price_per_device)}
                      </span>
                      <span className="text-gray-500">/device/month</span>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/telco-contracts/${bundle.id}`}
                      className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-center font-medium rounded-xl hover:from-red-700 hover:to-red-600 transition-all"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <p className="text-gray-500 text-lg">No bundles available at the moment</p>
              <p className="text-gray-400 mt-2">Please contact sales for custom solutions</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Telco Contracts?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { title: 'Cost Effective', desc: 'Predictable monthly costs with no upfront capital expenditure' },
              { title: 'Always Updated', desc: 'Get the latest devices without worrying about depreciation' },
              { title: 'Full Support', desc: '24/7 technical support and device management included' },
              { title: 'Flexible Terms', desc: 'Scale up or down based on your business needs' },
            ].map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Build a Solution Just for Your Business</h2>
          <p className="text-lg text-purple-200 mb-4">
            Whether you're running a hotel, a fleet of delivery riders, a restaurant chain, or a growing startup — 
            we'll help you build the perfect telco package.
          </p>
          <p className="text-md text-purple-300 mb-8">
            Choose your devices, pick your networks, select your bundles. It's that simple.
          </p>
          <Link
            href="/telco-contracts/build"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            Build Your Custom Solution
          </Link>
        </div>
      </section>
    </div>
  );
}
