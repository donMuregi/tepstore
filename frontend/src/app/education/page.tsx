'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { educationAPI, EducationBoard, ClassroomPackage, EducationTablet, Fundraiser } from '@/lib/api';
import { 
  AcademicCapIcon, 
  HeartIcon,
  DeviceTabletIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function EducationPage() {
  const [boards, setBoards] = useState<EducationBoard[]>([]);
  const [packages, setPackages] = useState<ClassroomPackage[]>([]);
  const [tablets, setTablets] = useState<EducationTablet[]>([]);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'boards' | 'tablets'>('boards');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardsRes, packagesRes, tabletsRes, fundraisersRes] = await Promise.all([
          educationAPI.getBoards(),
          educationAPI.getPackages(),
          educationAPI.getTablets(),
          educationAPI.getFundraisers(),
        ]);
        setBoards(boardsRes.results || []);
        setPackages(packagesRes.results || []);
        setTablets(tabletsRes.results || []);
        setFundraisers(fundraisersRes.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Education Through Technology
            </h1>
            <p className="text-xl text-orange-100 mb-8">
              Smart boards for classrooms and tablets for students. Support schools through fundraising or purchase directly.
            </p>
          </div>
        </div>
      </section>

      {/* Main Options */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Board Sponsorship */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Single Board Sponsorship</h2>
                <p className="text-gray-600">Contribute to buy a smart board for your previous school</p>
              </div>
              
              <p className="text-gray-600 mb-6">
                Alumni can start fundraisers to collect contributions from fellow alumni. 
                Donate in preset amounts: $20, $30, $50, $100, $200, $300, $500, or $1000.
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {[20, 30, 50, 100, 200, 300, 500, 1000].map((amount) => (
                  <span key={amount} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                    ${amount}
                  </span>
                ))}
              </div>

              <Link
                href="/education/start-fundraiser"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-all"
              >
                Start a Fundraiser
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {/* Classroom Package */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Classroom Package</h2>
                <p className="text-gray-600">2 smart boards + professional installation</p>
              </div>
              
              <p className="text-gray-600 mb-6">
                Complete classroom setup with two smart boards and professional installation included. 
                Perfect for schools looking to modernize their teaching infrastructure.
              </p>

              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">✓</span>
                  2 Smart Boards
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">✓</span>
                  Professional Installation
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">✓</span>
                  1 Year Warranty
                </li>
              </ul>

              <Link
                href="/education/packages"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-all"
              >
                View Packages
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Fundraisers */}
      {fundraisers.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Active Fundraisers</h2>
              <Link href="/education/fundraisers" className="text-orange-600 font-medium hover:text-orange-700">
                View All →
              </Link>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {fundraisers.slice(0, 3).map((fundraiser) => (
                <Link
                  key={fundraiser.id}
                  href={`/education/fundraisers/${fundraiser.share_link}`}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{fundraiser.school_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{fundraiser.school_location}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-orange-600">{fundraiser.progress_percentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        style={{ width: `${Math.min(fundraiser.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Raised: ${parseFloat(fundraiser.current_amount).toLocaleString()}</span>
                    <span className="text-gray-600">Goal: ${parseFloat(fundraiser.target_amount).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tablets Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Educational Tablets</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Equip your students with quality tablets. Available with pre-installed educational software 
              including Mwalimu Masomo Platform and Knox Guard.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : tablets.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                {tablets.slice(0, 3).map((tablet) => (
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {tablet.brand}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                          {tablet.size}
                        </span>
                      </div>
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

                      <Link
                        href={`/education/tablets/${tablet.slug}`}
                        className="block w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white text-center font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/education/tablets"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
                >
                  View All Tablets
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <p className="text-gray-500 text-sm mt-4">
                  Bulk discounts available • Flexible payment plans • Pre-loaded educational software
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <DeviceTabletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Tablets coming soon</p>
              <p className="text-gray-400 mt-2">Contact us for availability</p>
            </div>
          )}
        </div>
      </section>

      {/* Software Partners */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Pre-installed Educational Software
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Mwalimu Masomo Platform', desc: 'Complete learning management system' },
              { name: 'Knox Guard', desc: 'Device security and management' },
              { name: 'Google Classroom', desc: 'Collaborative learning tools' },
              { name: 'Educational Apps', desc: 'Curated learning applications' },
            ].map((software) => (
              <div key={software.name} className="bg-gray-50 rounded-xl p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{software.name}</h3>
                <p className="text-gray-600 text-sm">{software.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
