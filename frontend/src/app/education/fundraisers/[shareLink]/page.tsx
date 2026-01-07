'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { educationAPI, Fundraiser } from '@/lib/api';
import { 
  ArrowLeftIcon,
  ShareIcon,
  CheckCircleIcon,
  TrophyIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{ shareLink: string }>;
}

export default function FundraiserPage({ params }: Props) {
  const { shareLink } = use(params);
  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const donationAmounts = [20, 30, 50, 100, 200, 300, 500, 1000];

  useEffect(() => {
    const fetchFundraiser = async () => {
      try {
        // First try to get from localStorage (for mock/demo fundraisers)
        const storedFundraiser = localStorage.getItem(`fundraiser_${shareLink}`);
        if (storedFundraiser) {
          setFundraiser(JSON.parse(storedFundraiser));
          setLoading(false);
          return;
        }
        
        // If not in localStorage, try API
        const data = await educationAPI.getFundraiser(shareLink);
        setFundraiser(data);
      } catch (error) {
        console.error('Error fetching fundraiser:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFundraiser();
  }, [shareLink]);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = (amount: number) => {
    setSelectedAmount(amount);
    setShowDonationForm(true);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement MPESA STK Push integration
    alert(`Donation of $${selectedAmount} - MPESA integration coming soon!`);
    setShowDonationForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
          <p className="text-gray-500">Loading fundraiser...</p>
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Fundraiser Not Found</h1>
          <Link href="/education" className="text-orange-600 hover:text-orange-700">
            Back to Education
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/education/fundraisers" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to All Fundraisers
        </Link>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-8 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{fundraiser.school_name}</h1>
              <p className="text-orange-100">{fundraiser.school_location}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-all"
            >
              {copied ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <ShareIcon className="w-5 h-5" />
                  Share
                </>
              )}
            </button>
          </div>

          {fundraiser.school_description && (
            <p className="text-orange-50 mb-6">{fundraiser.school_description}</p>
          )}

          {/* Progress */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-2xl font-bold">{fundraiser.progress_percentage.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-white/30 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(fundraiser.progress_percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span>${parseFloat(fundraiser.current_amount).toLocaleString()} raised</span>
              <span>${parseFloat(fundraiser.target_amount).toLocaleString()} goal</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Donation Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contribute to this Fundraiser</h2>
              <p className="text-gray-600 mb-6">
                Select a donation amount to help {fundraiser.school_name} reach their goal:
              </p>

              <div className="grid grid-cols-4 gap-3 mb-6">
                {donationAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleDonate(amount)}
                    className="py-4 px-2 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-center"
                  >
                    <div className="text-2xl font-bold text-orange-600">${amount}</div>
                  </button>
                ))}
              </div>

              {showDonationForm && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Donation Details - ${selectedAmount}</h3>
                  <form onSubmit={handleSubmitDonation} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (for MPESA) *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="+254 700 000 000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Leave a message of support..."
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
                      <span className="text-sm text-gray-600">Donate anonymously</span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all"
                      >
                        Proceed to Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDonationForm(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">Top Contributors</h2>
              </div>

              {fundraiser.leaderboard && fundraiser.leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {fundraiser.leaderboard.map((contributor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{contributor.name}</span>
                      </div>
                      <span className="font-bold text-orange-600">${parseFloat(contributor.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No contributions yet</p>
                  <p className="text-sm text-gray-400 mt-2">Be the first to donate!</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-orange-50 rounded-xl">
                <p className="text-sm text-orange-800 font-medium mb-2">Share this fundraiser</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
                  >
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
