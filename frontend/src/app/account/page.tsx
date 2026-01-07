'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store-context';
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
  DevicePhoneMobileIcon,
  HeartIcon,
  MapPinIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, authLoading, logout } = useStore();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      title: 'My Orders',
      description: 'Track and manage your orders',
      icon: ShoppingBagIcon,
      href: '/orders',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Saved Addresses',
      description: 'Manage delivery addresses',
      icon: MapPinIcon,
      href: '/account/addresses',
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Payment Methods',
      description: 'Manage your payment options',
      icon: CreditCardIcon,
      href: '/account/payments',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Wishlist',
      description: 'Products you\'ve saved',
      icon: HeartIcon,
      href: '/account/wishlist',
      color: 'bg-red-100 text-red-600',
    },
    {
      title: 'Account Settings',
      description: 'Update your profile and preferences',
      icon: CogIcon,
      href: '/account/settings',
      color: 'bg-gray-100 text-gray-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </h1>
              <p className="text-blue-100 flex items-center gap-2 mt-1">
                <EnvelopeIcon className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Orders</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Wishlist</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Reviews</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                index < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Log Out
        </button>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/help" className="hover:text-gray-700">Help Center</Link>
          <span className="mx-2">•</span>
          <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          <span className="mx-2">•</span>
          <Link href="/terms" className="hover:text-gray-700">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
