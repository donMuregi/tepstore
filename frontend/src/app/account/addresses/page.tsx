'use client';

import Link from 'next/link';
import { ArrowLeftIcon, MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Account
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Saved Addresses</h1>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            Add Address
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No addresses saved</h2>
          <p className="text-gray-500">Add a delivery address for faster checkout.</p>
        </div>
      </div>
    </div>
  );
}
