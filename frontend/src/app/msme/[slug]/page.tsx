'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { productsAPI, financingAPI, Product, ProductVariant, FinancingPlan } from '@/lib/api';
import { CheckIcon, TruckIcon, ShieldCheckIcon, CreditCardIcon } from '@heroicons/react/24/outline';

interface Employer {
  id: number;
  name: string;
  code: string;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  logo?: string;
  branch?: string;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default function MSMEProductPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [plans, setPlans] = useState<FinancingPlan[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<FinancingPlan | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationType, setApplicationType] = useState<'individual' | 'chama' | 'corporate'>('individual');
  const [applicationStep, setApplicationStep] = useState(1);
  const [employerNotListed, setEmployerNotListed] = useState(false);
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    id_number: '',
    kra_pin: '',
    // Employer / Bank selection
    employer_id: '',
    bank_id: '',
    employer_name: '', // For "Other" employer
    // For Chama/Corporate
    organization_name: '',
    registration_number: '',
    certificate_file: null as File | null,
    // Delivery info
    phone: '',
    email: '',
    town: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState<{
    approved: boolean;
    monthly_payment?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const [productData, plansData, employersRes, banksRes] = await Promise.all([
          productsAPI.getBySlug(slug),
          financingAPI.getPlans(),
          fetch(`${API_URL}/employers/`).then(r => r.json()),
          fetch(`${API_URL}/banks/`).then(r => r.json()),
        ]);
        setProduct(productData);
        // Handle both array and paginated response
        const plansArray = Array.isArray(plansData) ? plansData : (plansData as { results?: FinancingPlan[] }).results || [];
        setPlans(plansArray);
        setEmployers(employersRes);
        setBanks(banksRes);
        if (productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
        if (plansArray.length > 0) {
          setSelectedPlan(plansArray[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'Ksh',
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  const getMonthlyPayment = () => {
    if (!product || !selectedPlan) return 0;
    const price = selectedVariant ? parseFloat(selectedVariant.final_price) : parseFloat(product.current_price);
    const total = price * (1 + parseFloat(selectedPlan.interest_rate) / 100);
    return total / selectedPlan.months;
  };

  const handleApplyForFinancing = () => {
    if (!selectedPlan) {
      alert('Please select a payment plan');
      return;
    }
    setShowApplicationModal(true);
    setApplicationStep(1);
  };

  const handleSubmitApplication = async () => {
    if (!product || !selectedPlan) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('application_type', applicationType);
      formData.append('product_id', product.id.toString());
      if (selectedVariant) formData.append('variant_id', selectedVariant.id.toString());
      formData.append('financing_plan_id', selectedPlan.id.toString());
      formData.append('full_name', applicationData.full_name);
      formData.append('id_number', applicationData.id_number);
      formData.append('kra_pin', applicationData.kra_pin);
      
      // Handle employer/bank selection for individual
      if (applicationType === 'individual') {
        if (applicationData.employer_id && !employerNotListed) {
          formData.append('employer_id', applicationData.employer_id);
        } else if (employerNotListed && applicationData.bank_id) {
          formData.append('bank_id', applicationData.bank_id);
          if (applicationData.employer_name) {
            formData.append('employer_name', applicationData.employer_name);
          }
        }
      }
      
      // Handle Chama/Corporate - they select a bank
      if (applicationType === 'chama' || applicationType === 'corporate') {
        formData.append('organization_name', applicationData.organization_name);
        formData.append('registration_number', applicationData.registration_number);
        if (applicationData.bank_id) {
          formData.append('bank_id', applicationData.bank_id);
        }
        if (applicationData.certificate_file) {
          formData.append('certificate', applicationData.certificate_file);
        }
      }

      const application = await financingAPI.createApplication(formData);
      
      // Submit to bank
      const bankResponse = await financingAPI.submitToBank(application.application_id);
      
      if (bankResponse.status === 'approved') {
        setApplicationResult({
          approved: true,
          monthly_payment: bankResponse.monthly_payment || undefined,
        });
        setApplicationStep(2);
      } else {
        setApplicationResult({
          approved: false,
          message: 'Unfortunately, your application was not approved at this time.',
        });
        setApplicationStep(2);
      }
    } catch (error) {
      console.error('Application error:', error);
      setApplicationResult({
        approved: false,
        message: 'An error occurred while processing your application.',
      });
      setApplicationStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    setApplicationStep(3);
  };

  const handleCompleteOrder = async () => {
    // For now, just show success
    router.push('/msme/success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            {product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img) => (
                  <div key={img.id} className="aspect-square bg-white rounded-lg overflow-hidden">
                    <Image
                      src={img.image}
                      alt={img.alt_text || product.name}
                      width={150}
                      height={150}
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <p className="text-blue-600 font-medium">{product.brand.name}</p>
            )}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(selectedVariant?.final_price || product.current_price)}
              </span>
              {product.sale_price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Select Variant</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{variant.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatPrice(variant.final_price)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Plans */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Select Payment Plan</h3>
              <div className="grid grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-gray-900">{plan.months} Months</p>
                    <p className="text-sm text-gray-600">
                      {parseFloat(plan.interest_rate) === 0 ? 'Interest free' : `${plan.interest_rate}% interest`}
                    </p>
                    {selectedPlan?.id === plan.id && (
                      <CheckIcon className="w-5 h-5 text-blue-600 absolute top-2 right-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Payment Preview */}
            {selectedPlan && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
                <p className="text-blue-100 mb-1">Your monthly payment</p>
                <p className="text-3xl font-bold">{formatPrice(getMonthlyPayment())}</p>
                <p className="text-blue-100 mt-2">
                  for {selectedPlan.months} months
                </p>
              </div>
            )}

            {/* Apply Button */}
            <button
              onClick={handleApplyForFinancing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Apply for Financing
            </button>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="text-center">
                <ShieldCheckIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Warranty Included</p>
              </div>
              <div className="text-center">
                <CreditCardIcon className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Secure Payment</p>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.trim().length > 0 && (
              <div className="pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Specifications</h3>
                <div 
                  className="text-gray-700 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: product.specifications }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowApplicationModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {applicationStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for Financing</h2>
                  
                  {/* Application Type */}
                  <div className="space-y-3 mb-6">
                    <label className="font-medium text-gray-700">Application Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setApplicationType('individual')}
                        className={`p-3 rounded-xl border-2 ${
                          applicationType === 'individual' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="font-medium text-gray-900 text-sm">Individual</p>
                        <p className="text-xs text-gray-600">Self / Business</p>
                      </button>
                      <button
                        onClick={() => setApplicationType('chama')}
                        className={`p-3 rounded-xl border-2 ${
                          applicationType === 'chama' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="font-medium text-gray-900 text-sm">Chama</p>
                        <p className="text-xs text-gray-600">Group / Sacco</p>
                      </button>
                      <button
                        onClick={() => setApplicationType('corporate')}
                        className={`p-3 rounded-xl border-2 ${
                          applicationType === 'corporate' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <p className="font-medium text-gray-900 text-sm">Corporate</p>
                        <p className="text-xs text-gray-600">Company / NGO</p>
                      </button>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {applicationType === 'individual' ? 'Full Name' : 'Contact Person Name'}
                      </label>
                      <input
                        type="text"
                        value={applicationData.full_name}
                        onChange={(e) => setApplicationData({ ...applicationData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder={applicationType === 'individual' ? 'Enter your full name' : 'Enter contact person name'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        value={applicationData.id_number}
                        onChange={(e) => setApplicationData({ ...applicationData, id_number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter ID number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">KRA PIN</label>
                      <input
                        type="text"
                        value={applicationData.kra_pin}
                        onChange={(e) => setApplicationData({ ...applicationData, kra_pin: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter KRA PIN"
                      />
                    </div>

                    {/* Employer Selection for Individual */}
                    {applicationType === 'individual' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Your Employer
                          </label>
                          <select
                            value={applicationData.employer_id}
                            onChange={(e) => {
                              setApplicationData({ ...applicationData, employer_id: e.target.value, bank_id: '' });
                              setEmployerNotListed(false);
                            }}
                            disabled={employerNotListed}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 disabled:opacity-50"
                          >
                            <option value="">-- Select Employer --</option>
                            {employers.map((emp) => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="employerNotListed"
                            checked={employerNotListed}
                            onChange={(e) => {
                              setEmployerNotListed(e.target.checked);
                              if (e.target.checked) {
                                setApplicationData({ ...applicationData, employer_id: '' });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="employerNotListed" className="text-sm text-gray-700">
                            My employer is not listed
                          </label>
                        </div>

                        {employerNotListed && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employer Name (Optional)
                              </label>
                              <input
                                type="text"
                                value={applicationData.employer_name}
                                onChange={(e) => setApplicationData({ ...applicationData, employer_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                                placeholder="Enter your employer name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Your Bank
                              </label>
                              <select
                                value={applicationData.bank_id}
                                onChange={(e) => setApplicationData({ ...applicationData, bank_id: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                              >
                                <option value="">-- Select Bank --</option>
                                {banks.map((bank) => (
                                  <option key={bank.id} value={bank.id}>{bank.name}</option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                We&apos;ll work with this bank for your credit check
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {(applicationType === 'chama' || applicationType === 'corporate') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {applicationType === 'chama' ? 'Chama / Group Name' : 'Organization Name'}
                          </label>
                          <input
                            type="text"
                            value={applicationData.organization_name}
                            onChange={(e) => setApplicationData({ ...applicationData, organization_name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            placeholder={applicationType === 'chama' ? 'Enter chama/group name' : 'Enter company/organization name'}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                          <input
                            type="text"
                            value={applicationData.registration_number}
                            onChange={(e) => setApplicationData({ ...applicationData, registration_number: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                            placeholder="Enter registration number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Your Bank <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={applicationData.bank_id}
                            onChange={(e) => setApplicationData({ ...applicationData, bank_id: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                          >
                            <option value="">-- Select Bank --</option>
                            {banks.map((bank) => (
                              <option key={bank.id} value={bank.id}>{bank.name}</option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            The bank will perform a credit check on your {applicationType === 'chama' ? 'chama/group' : 'organization'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Certificate of Registration <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => setApplicationData({ 
                                ...applicationData, 
                                certificate_file: e.target.files?.[0] || null 
                              })}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                            />
                          </div>
                          {applicationData.certificate_file && (
                            <p className="text-sm text-green-600 mt-1">
                              ✓ {applicationData.certificate_file.name}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Upload PDF, JPG, or PNG (max 5MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setShowApplicationModal(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitApplication}
                      disabled={
                        submitting || 
                        ((applicationType === 'chama' || applicationType === 'corporate') && (!applicationData.certificate_file || !applicationData.bank_id)) ||
                        (applicationType === 'individual' && !employerNotListed && !applicationData.employer_id) ||
                        (applicationType === 'individual' && employerNotListed && !applicationData.bank_id)
                      }
                      className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Submit Application'}
                    </button>
                  </div>
                </>
              )}

              {applicationStep === 2 && applicationResult && (
                <>
                  {applicationResult.approved ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                      <p className="text-gray-600 mb-6">Your financing application has been approved.</p>
                      
                      <div className="bg-gray-50 rounded-xl p-6 mb-6">
                        <p className="text-gray-600 mb-1">Your monthly payment</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {applicationResult.monthly_payment ? formatPrice(applicationResult.monthly_payment) : formatPrice(getMonthlyPayment())}
                        </p>
                        <p className="text-gray-500 mt-1">for {selectedPlan?.months} months</p>
                      </div>

                      <button
                        onClick={handleConfirmOrder}
                        className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
                      >
                        Confirm & Continue
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 text-2xl">✕</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
                      <p className="text-gray-600 mb-6">{applicationResult.message}</p>
                      <button
                        onClick={() => setShowApplicationModal(false)}
                        className="w-full py-3 bg-gray-600 text-white font-medium rounded-xl hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </>
              )}

              {applicationStep === 3 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={applicationData.email}
                        onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Town/City</label>
                      <input
                        type="text"
                        value={applicationData.town}
                        onChange={(e) => setApplicationData({ ...applicationData, town: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter town or city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                      <textarea
                        value={applicationData.address}
                        onChange={(e) => setApplicationData({ ...applicationData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        rows={3}
                        placeholder="Enter detailed address"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteOrder}
                    className="w-full mt-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700"
                  >
                    Complete Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
