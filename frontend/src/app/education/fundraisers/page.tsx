'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { educationAPI, Fundraiser } from '@/lib/api';
import { 
  ArrowLeftIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function FundraisersListPage() {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    const fetchFundraisers = async () => {
      try {
        const response = await educationAPI.getFundraisers();
        setFundraisers(response.results || []);
      } catch (error) {
        console.error('Error fetching fundraisers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFundraisers();
  }, []);

  const filteredFundraisers = fundraisers.filter(fundraiser => {
    const matchesSearch = fundraiser.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fundraiser.school_location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fundraiser.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/education" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Education
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Active Fundraisers</h1>
          <p className="text-lg text-gray-600">
            Support schools by contributing to their smart board fundraisers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by school name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fundraisers Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-6" />
                <div className="h-2 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredFundraisers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFundraisers.map((fundraiser) => (
              <Link
                key={fundraiser.id}
                href={`/education/fundraisers/${fundraiser.share_link}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-orange-600 transition-colors">
                        {fundraiser.school_name}
                      </h3>
                      <p className="text-sm text-gray-600">{fundraiser.school_location}</p>
                    </div>
                    {fundraiser.status === 'completed' && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-orange-600">
                        {fundraiser.progress_percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                        style={{ width: `${Math.min(fundraiser.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex justify-between text-sm border-t pt-4">
                    <div>
                      <span className="text-gray-600">Raised</span>
                      <div className="font-bold text-gray-900">
                        ${parseFloat(fundraiser.current_amount).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600">Goal</span>
                      <div className="font-bold text-gray-900">
                        ${parseFloat(fundraiser.target_amount).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <span className="text-orange-600 font-medium text-sm group-hover:underline">
                    View & Contribute →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No fundraisers found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Start Your Own Fundraiser</h2>
          <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
            Help your school get smart boards! Create a fundraiser and share it with alumni and supporters.
          </p>
          <Link
            href="/education/start-fundraiser"
            className="inline-block px-8 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all"
          >
            Start a Fundraiser
          </Link>
        </div>
      </div>
    </div>
  );
}
