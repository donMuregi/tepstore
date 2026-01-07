'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TruckIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Policy {
  id: number;
  policy_type: string;
  policy_type_display: string;
  title: string;
  content: string;
  last_updated: string;
}

const policyIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  privacy: ShieldCheckIcon,
  terms: DocumentTextIcon,
  cookies: DocumentTextIcon,
  returns: ArrowPathIcon,
  shipping: TruckIcon,
  refund: ArrowPathIcon,
  warranty: ClipboardDocumentCheckIcon,
};

const policyColors: { [key: string]: string } = {
  privacy: 'from-red-600 to-red-700',
  terms: 'from-red-600 to-red-700',
  cookies: 'from-red-600 to-red-700',
  returns: 'from-red-600 to-red-700',
  shipping: 'from-red-600 to-red-700',
  refund: 'from-red-600 to-red-700',
  warranty: 'from-red-600 to-red-700',
};

export default function PolicyPage() {
  const params = useParams();
  const policyType = params.type as string;
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/policies/${policyType}/`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('This policy is not available yet.');
          } else {
            setError('Failed to load policy.');
          }
          return;
        }
        
        const data = await response.json();
        setPolicy(data);
      } catch (err) {
        setError('Failed to load policy. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (policyType) {
      fetchPolicy();
    }
  }, [policyType]);

  const IconComponent = policyIcons[policyType] || DocumentTextIcon;
  const gradientColor = policyColors[policyType] || 'from-gray-600 to-gray-700';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-400 to-gray-500 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-48 mb-4"></div>
              <div className="h-12 bg-white/20 rounded w-96 mb-4"></div>
              <div className="h-6 bg-white/20 rounded w-64"></div>
            </div>
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-8 animate-pulse">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Policy Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!policy) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientColor} text-white py-16`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold">{policy.title}</h1>
          </div>
          
          <p className="text-white/80">
            Last updated: {new Date(policy.last_updated).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Render HTML content safely */}
          <div 
            className="policy-content text-gray-900 text-lg md:text-xl leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-black [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-black [&>h2]:mt-8 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-black [&>h3]:mt-6 [&>h3]:mb-3 [&>p]:text-gray-900 [&>p]:mb-4 [&>p]:text-lg [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ul]:text-gray-900 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>ol]:text-gray-900 [&>li]:mb-2 [&>li]:text-gray-900 [&>section]:mb-6 [&>section>h1]:text-3xl [&>section>h1]:font-bold [&>section>h1]:text-black [&>section>h1]:mb-6 [&>section>p]:text-gray-900 [&>section>p]:mb-4 [&>section>p]:text-lg [&>section>p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link 
            href="/policies/privacy"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              policyType === 'privacy' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Privacy Policy
          </Link>
          <Link 
            href="/policies/terms"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              policyType === 'terms' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Terms of Service
          </Link>
          <Link 
            href="/policies/cookies"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              policyType === 'cookies' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cookie Policy
          </Link>
          <Link 
            href="/policies/returns"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              policyType === 'returns' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Return Policy
          </Link>
          <Link 
            href="/policies/shipping"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              policyType === 'shipping' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Shipping Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
