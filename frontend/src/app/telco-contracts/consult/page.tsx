'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Job role options
const jobRoles = [
  { id: 'business-owner', label: 'Business Owner / Entrepreneur' },
  { id: 'fleet-manager', label: 'Fleet / Operations Manager' },
  { id: 'hotel-manager', label: 'Hotel / Hospitality Manager' },
  { id: 'restaurant-owner', label: 'Restaurant / F&B Owner' },
  { id: 'school-admin', label: 'School Administrator' },
  { id: 'sales-manager', label: 'Sales / Field Team Manager' },
  { id: 'it-manager', label: 'IT / Tech Manager' },
  { id: 'other', label: 'Other' },
];

// Budget ranges
const budgetRanges = [
  { id: 'under-50k', label: 'Under Ksh 50,000/month', description: 'Small team (5-10 devices)' },
  { id: '50k-100k', label: 'Ksh 50,000 - 100,000/month', description: 'Medium team (10-25 devices)' },
  { id: '100k-250k', label: 'Ksh 100,000 - 250,000/month', description: 'Large team (25-50 devices)' },
  { id: '250k-500k', label: 'Ksh 250,000 - 500,000/month', description: 'Enterprise (50-100 devices)' },
  { id: 'over-500k', label: 'Over Ksh 500,000/month', description: 'Large Enterprise (100+ devices)' },
  { id: 'not-sure', label: 'Not sure yet', description: 'Help me figure it out' },
];

// Device count options
const deviceCounts = [
  { id: '5-10', label: '5-10 devices' },
  { id: '11-25', label: '11-25 devices' },
  { id: '26-50', label: '26-50 devices' },
  { id: '51-100', label: '51-100 devices' },
  { id: '100+', label: '100+ devices' },
];

interface FormData {
  // Use case
  useCase: string;
  jobRole: string;
  otherJobRole: string;
  
  // Budget & Scale
  budgetRange: string;
  deviceCount: string;
  
  // KYC
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  kra_pin: string;
  id_number: string;
}

export default function ConsultPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    useCase: '',
    jobRole: '',
    otherJobRole: '',
    budgetRange: '',
    deviceCount: '',
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    kra_pin: '',
    id_number: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedStep1 = formData.useCase.length >= 10 && formData.jobRole;
  const canProceedStep2 = formData.budgetRange && formData.deviceCount;
  const canSubmit = formData.fullName && formData.email && formData.phone && formData.companyName;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h1>
            <p className="text-gray-600 mb-8">
              We've received your information and our team will reach out within 24 hours 
              with a personalized recommendation based on your needs.
            </p>
            <Link
              href="/telco-contracts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Telco Contracts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/telco-contracts"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Telco Contracts
          </Link>
          
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Let's Find the Perfect Solution for You
          </h1>
          <p className="text-lg text-orange-100">
            Tell us about your business needs and we'll recommend the best telco package.
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Your Use Case' },
              { num: 2, label: 'Budget & Scale' },
              { num: 3, label: 'Your Details' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step > s.num 
                      ? 'bg-orange-600 text-white' 
                      : step === s.num 
                        ? 'bg-orange-100 text-orange-600 border-2 border-orange-600' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.num ? <CheckCircleIcon className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{s.label}</span>
                </div>
                {index < 2 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${step > s.num ? 'bg-orange-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          
          {/* Step 1: Use Case */}
          {step === 1 && (
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  How will you use these devices?
                </h2>
                <p className="text-gray-600">
                  Describe your business scenario so we can recommend the right solution.
                </p>
              </div>

              {/* Use Case Text Area */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <DocumentTextIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-700">Describe your use case</span>
                </div>
                <textarea
                  value={formData.useCase}
                  onChange={(e) => updateFormData('useCase', e.target.value)}
                  placeholder="E.g., I run a hotel with 50 staff members. I need phones for my front desk, housekeeping, and maintenance teams to communicate efficiently. We also need data for mobile check-in/check-out systems..."
                  className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-700"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {formData.useCase.length}/500 characters (minimum 10)
                </p>
              </div>

              {/* Job Role Selection */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <BriefcaseIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-700">What's your role?</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {jobRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => updateFormData('jobRole', role.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.jobRole === role.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-700">{role.label}</span>
                    </button>
                  ))}
                </div>
                
                {formData.jobRole === 'other' && (
                  <input
                    type="text"
                    value={formData.otherJobRole}
                    onChange={(e) => updateFormData('otherJobRole', e.target.value)}
                    placeholder="Please specify your role"
                    className="mt-3 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                    canProceedStep1
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Scale */}
          {step === 2 && (
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  What's your budget and scale?
                </h2>
                <p className="text-gray-600">
                  This helps us recommend packages that fit your needs.
                </p>
              </div>

              {/* Budget Range */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <CurrencyDollarIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-700">Monthly budget range</span>
                </div>
                <div className="grid gap-3">
                  {budgetRanges.map((budget) => (
                    <button
                      key={budget.id}
                      onClick={() => updateFormData('budgetRange', budget.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.budgetRange === budget.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{budget.label}</span>
                      <span className="text-sm text-gray-500 ml-2">{budget.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Device Count */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <PhoneIcon className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-gray-700">How many devices do you need?</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {deviceCounts.map((count) => (
                    <button
                      key={count.id}
                      onClick={() => updateFormData('deviceCount', count.id)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                        formData.deviceCount === count.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 text-gray-700 hover:border-orange-300'
                      }`}
                    >
                      {count.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep2}
                  className={`inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all ${
                    canProceedStep2
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: KYC Details */}
          {step === 3 && (
            <div className="p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Details
                </h2>
                <p className="text-gray-600">
                  We'll use this information to prepare your personalized recommendation.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Full Name *</span>
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <EnvelopeIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Email Address *</span>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="john@company.com"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <PhoneIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Phone Number *</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">Company Name *</span>
                  </div>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    placeholder="Acme Ltd"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* KRA PIN */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <IdentificationIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">KRA PIN (Optional)</span>
                  </div>
                  <input
                    type="text"
                    value={formData.kra_pin}
                    onChange={(e) => updateFormData('kra_pin', e.target.value.toUpperCase())}
                    placeholder="A123456789B"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent uppercase"
                  />
                </div>

                {/* ID Number */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <IdentificationIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">ID Number (Optional)</span>
                  </div>
                  <input
                    type="text"
                    value={formData.id_number}
                    onChange={(e) => updateFormData('id_number', e.target.value)}
                    placeholder="12345678"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">
                  By submitting, you agree to our Terms of Service and Privacy Policy. 
                  We'll only use your information to provide you with a personalized recommendation.
                </p>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className={`inline-flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all ${
                    canSubmit && !isSubmitting
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Get My Recommendation
                      <CheckCircleIcon className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
