'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { enterpriseAPI, EnterpriseBundle } from '@/lib/api';
import { 
  WifiIcon, 
  PhoneIcon, 
  ShieldCheckIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Props {
  params: Promise<{ id: string }>;
}

// Network options
const networks = [
  { id: 'safaricom', name: 'Safaricom', color: 'bg-green-500' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
  { id: 'faiba', name: 'Faiba', color: 'bg-purple-500' },
];

// Bundle options per network (demo data)
const bundleOptions = [
  { id: 'bundle1', name: '400 Minutes + 20GB', minutes: 400, data: '20GB' },
  { id: 'bundle2', name: '200 Minutes + 10GB', minutes: 200, data: '10GB' },
  { id: 'bundle3', name: '600 Minutes + 30GB', minutes: 600, data: '30GB' },
];

interface PhoneSlot {
  id: number;
  phoneNumber: string;
  network: string | null;
  bundle: string | null;
  isCollapsed: boolean;
}

export default function TelcoBundlePage({ params }: Props) {
  const { id } = use(params);
  const [bundle, setBundle] = useState<EnterpriseBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [phoneSlots, setPhoneSlots] = useState<PhoneSlot[]>([
    { id: 1, phoneNumber: '', network: null, bundle: null, isCollapsed: true },
    { id: 2, phoneNumber: '', network: null, bundle: null, isCollapsed: true },
    { id: 3, phoneNumber: '', network: null, bundle: null, isCollapsed: true },
    { id: 4, phoneNumber: '', network: null, bundle: null, isCollapsed: true },
    { id: 5, phoneNumber: '', network: null, bundle: null, isCollapsed: true },
  ]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        const response = await enterpriseAPI.getBundles();
        const foundBundle = response.results.find((b: EnterpriseBundle) => b.id === parseInt(id));
        if (foundBundle) {
          setBundle(foundBundle);
        }
      } catch (error) {
        console.error('Error fetching bundle:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBundle();
  }, [id]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'Ksh',
    }).format(parseFloat(price));
  };

  const updatePhoneSlot = (slotId: number, field: keyof PhoneSlot, value: string | null | boolean) => {
    setPhoneSlots(slots => 
      slots.map(slot => {
        if (slot.id === slotId) {
          // Reset bundle when network changes
          if (field === 'network') {
            return { ...slot, [field]: value, bundle: null };
          }
          return { ...slot, [field]: value };
        }
        return slot;
      })
    );
  };

  const toggleSlotCollapse = (slotId: number) => {
    setPhoneSlots(slots =>
      slots.map(slot =>
        slot.id === slotId ? { ...slot, isCollapsed: !slot.isCollapsed } : slot
      )
    );
  };

  const addPhoneSlot = () => {
    const newId = phoneSlots.length > 0 ? Math.max(...phoneSlots.map(s => s.id)) + 1 : 1;
    setPhoneSlots([...phoneSlots, { id: newId, phoneNumber: '', network: null, bundle: null, isCollapsed: false }]);
  };

  const removePhoneSlot = (slotId: number) => {
    if (phoneSlots.length > 5) {
      setPhoneSlots(slots => slots.filter(slot => slot.id !== slotId));
    }
  };

  const isSlotComplete = (slot: PhoneSlot) => {
    return slot.phoneNumber && slot.network && slot.bundle;
  };

  const getNetworkName = (networkId: string | null) => {
    return networks.find(n => n.id === networkId)?.name || '';
  };

  const getBundleName = (bundleId: string | null) => {
    return bundleOptions.find(b => b.id === bundleId)?.name || '';
  };

  const getFilledSlots = () => {
    return phoneSlots.filter(slot => slot.phoneNumber && slot.network && slot.bundle);
  };

  const handleSubmit = async () => {
    const filledSlots = getFilledSlots();
    if (filledSlots.length === 0) {
      alert('Please fill in at least one phone number with network and bundle selection.');
      return;
    }

    setFormSubmitting(true);
    try {
      // TODO: Send to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (error) {
      console.error('Contact submission error:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-14 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-xl mb-4">Bundle not found</p>
          <Link href="/telco-contracts" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Back to Telco Contracts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link 
          href="/telco-contracts" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Telco Contracts</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center p-8">
              {bundle.product.image ? (
                <Image
                  src={bundle.product.image}
                  alt={bundle.product.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-contain"
                />
              ) : (
                <BuildingOffice2Icon className="w-48 h-48 text-emerald-200" />
              )}
            </div>
          </div>

          {/* Bundle Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{bundle.name}</h1>
              <p className="text-xl text-gray-600">{bundle.product.name}</p>
            </div>

            {/* Phone Number Slots Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PhoneIcon className="w-5 h-5 text-emerald-600" />
                Enter Phone Numbers for Data & Minutes
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Add phone numbers where you want us to load your data and minutes bundles.
              </p>

              <div className="space-y-3">
                {phoneSlots.map((slot, index) => (
                  <div key={slot.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Collapsible Header */}
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        isSlotComplete(slot) ? 'bg-emerald-50' : 'bg-gray-50'
                      }`}
                      onClick={() => toggleSlotCollapse(slot.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          isSlotComplete(slot) ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isSlotComplete(slot) ? <CheckCircleIcon className="w-4 h-4" /> : index + 1}
                        </span>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            {slot.phoneNumber || `Phone Number ${index + 1}`}
                          </span>
                          {isSlotComplete(slot) && slot.isCollapsed && (
                            <p className="text-xs text-gray-500">
                              {getNetworkName(slot.network)} • {getBundleName(slot.bundle)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {phoneSlots.length > 5 && index >= 5 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); removePhoneSlot(slot.id); }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleSlotCollapse(slot.id); }}
                          className="p-1 text-gray-400"
                        >
                          {slot.isCollapsed ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {!slot.isCollapsed && (
                      <div className="p-4 border-t border-gray-200">
                        {/* Phone Number Input */}
                        <input
                          type="tel"
                          value={slot.phoneNumber}
                          onChange={(e) => updatePhoneSlot(slot.id, 'phoneNumber', e.target.value)}
                          placeholder="e.g. 0712 345 678"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 mb-3"
                        />

                        {/* Network Selection */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">Select Network</p>
                          <div className="flex gap-2">
                            {networks.map((network) => (
                              <button
                                key={network.id}
                                onClick={() => updatePhoneSlot(slot.id, 'network', network.id)}
                                className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                  slot.network === network.id
                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                }`}
                              >
                                <span className={`inline-block w-2 h-2 rounded-full ${network.color} mr-2`}></span>
                                {network.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bundle Selection - Only show if network is selected */}
                        {slot.network && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Select Bundle</p>
                            <div className="grid grid-cols-1 gap-2">
                              {bundleOptions.map((bundleOption) => (
                                <button
                                  key={bundleOption.id}
                                  onClick={() => updatePhoneSlot(slot.id, 'bundle', bundleOption.id)}
                                  className={`py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                                    slot.bundle === bundleOption.id
                                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{bundleOption.name}</span>
                                    {slot.bundle === bundleOption.id && (
                                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Phone Number Button */}
              <button
                onClick={addPhoneSlot}
                className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Another Phone Number
              </button>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Numbers configured:</span>
                  <span className="font-semibold text-emerald-700">{getFilledSlots().length} of {phoneSlots.length}</span>
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">About This Bundle</h3>
              <p className="text-gray-600">
                Get the {bundle.product.name} with {bundle.data_gb}GB data and {bundle.minutes} minutes included. 
                Perfect for businesses looking for reliable connectivity with flexible network options.
              </p>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="space-y-3">
                {[
                  'Latest enterprise-grade devices',
                  'Flexible data bundles per device',
                  'Voice minutes per device',
                  'Choice of Safaricom, Airtel, or Faiba network',
                  'Data & minutes loaded to your numbers',
                  '24/7 technical support',
                  'Free device replacement',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            {formSuccess ? (
              <div className="bg-emerald-100 text-emerald-800 py-4 rounded-xl text-center font-semibold">
                <CheckCircleIcon className="w-6 h-6 inline-block mr-2" />
                Request submitted successfully! We'll contact you soon.
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={formSubmitting || getFilledSlots().length === 0}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheckIcon className="w-5 h-5" />
              <span>Minimum order: {bundle.minimum_quantity} devices • Choose your preferred network</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Networks</h3>
            <p className="text-gray-600 text-sm">
              Choose between Safaricom, Airtel, or Faiba for each phone number. Mix and match as needed.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Bundles</h3>
            <p className="text-gray-600 text-sm">
              Select from various data and minutes bundles to match your usage patterns.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
            <p className="text-gray-600 text-sm">
              24/7 technical support with dedicated account manager for all customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
