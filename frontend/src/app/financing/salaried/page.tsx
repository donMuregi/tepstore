'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { productsAPI, employersAPI, financingAPI, Product, Employer, FinancingPlan } from '@/lib/api';
import { useStore } from '@/lib/store-context';
import ProductCard from '@/components/products/ProductCard';
import { 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
  CheckIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function SalariedProductsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [plans, setPlans] = useState<FinancingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedEmployer, setSelectedEmployer] = useState<number | null>(null);
  const [staffNumber, setStaffNumber] = useState('');
  const [employerVerified, setEmployerVerified] = useState(false);
  
  // Product selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<FinancingPlan | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationStep, setApplicationStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Application data
  const [applicationData, setApplicationData] = useState({
    full_name: '',
    id_number: '',
    kra_pin: '',
    phone: '',
    email: '',
    town: '',
    address: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employersData, productsData, plansData] = await Promise.all([
          employersAPI.getAll(),
          productsAPI.getByType('msme'),
          financingAPI.getPlans(),
        ]);
        setEmployers(employersData);
        setProducts(productsData.results);
        const plansArray = Array.isArray(plansData) ? plansData : (plansData as { results?: FinancingPlan[] }).results || [];
        setPlans(plansArray);
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
  }, []);

  const handleVerifyEmployer = () => {
    if (selectedEmployer && staffNumber) {
      setEmployerVerified(true);
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'Ksh',
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  const getMonthlyPayment = (product: Product) => {
    if (!selectedPlan) return 0;
    const price = parseFloat(product.current_price);
    // Salaried employees get lower interest - simulate 50% lower rate
    const adjustedRate = parseFloat(selectedPlan.interest_rate) * 0.5;
    const total = price * (1 + adjustedRate / 100);
    return total / selectedPlan.months;
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowApplicationModal(true);
    setApplicationStep(1);
  };

  const handleSubmitApplication = async () => {
    if (!selectedProduct || !selectedPlan || !selectedEmployer) return;
    
    setSubmitting(true);
    try {
      const selectedEmployerData = employers.find(e => e.id === selectedEmployer);
      
      const applicationPayload = {
        application_type: 'salaried',
        product_id: selectedProduct.id,
        financing_plan_id: selectedPlan.id,
        full_name: applicationData.full_name,
        id_number: applicationData.id_number,
        kra_pin: applicationData.kra_pin,
        employer_id: selectedEmployer,
        employer_name: selectedEmployerData?.name || '',
        staff_number: staffNumber,
      };

      await financingAPI.createApplication(applicationPayload);
      setApplicationStep(2);
    } catch (error) {
      console.error('Application error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect non-salaried users
  if (!loading && isAuthenticated && !user?.profile?.is_salaried_employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Salaried Employees Only</h2>
          <p className="text-gray-600 mb-6">
            This page is exclusively for salaried employees. Update your profile to access salary deduction financing.
          </p>
          <div className="space-y-3">
            <Link
              href="/account/settings"
              className="block w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
            >
              Update Profile
            </Link>
            <Link
              href="/msme"
              className="block w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
            >
              Browse Regular Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access salary deduction financing options.
          </p>
          <Link
            href="/login?redirect=/msme/salaried"
            className="block w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/msme" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to MSME Products
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <BriefcaseIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Salary Deduction Financing</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl">
            Enjoy lower interest rates and convenient salary deductions. Select your employer and browse exclusive products.
          </p>
        </div>
      </section>

      {/* Employer Selection */}
      {!employerVerified && (
        <section className="py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Employer</h2>
              </div>
              
              <p className="text-gray-600 mb-6">
                Select your employer and enter your staff number to access exclusive salary deduction financing.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Your Employer
                  </label>
                  <select
                    value={selectedEmployer || ''}
                    onChange={(e) => setSelectedEmployer(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  >
                    <option value="">Choose employer...</option>
                    {employers.map((employer) => (
                      <option key={employer.id} value={employer.id}>
                        {employer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff/Employee Number
                  </label>
                  <input
                    type="text"
                    value={staffNumber}
                    onChange={(e) => setStaffNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    placeholder="Enter your staff number"
                  />
                </div>

                <button
                  onClick={handleVerifyEmployer}
                  disabled={!selectedEmployer || !staffNumber}
                  className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Verify & Continue
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center">
                Can&apos;t find your employer?{' '}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  Contact us
                </Link>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      {employerVerified && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Employer Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckIcon className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Employer Verified: {employers.find(e => e.id === selectedEmployer)?.name}
                  </p>
                  <p className="text-sm text-green-600">Staff Number: {staffNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setEmployerVerified(false)}
                className="text-sm text-green-700 hover:underline"
              >
                Change
              </button>
            </div>

            {/* Payment Plan Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Plan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-gray-900">{plan.months} Months</p>
                    <p className="text-sm text-gray-600">
                      {parseFloat(plan.interest_rate) === 0 ? 'Interest free' : `${(parseFloat(plan.interest_rate) * 0.5).toFixed(1)}% interest`}
                    </p>
                    <p className="text-xs text-green-600 mt-1">50% off rate!</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Products</h3>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-50 p-4">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {product.brand && (
                        <p className="text-sm text-gray-500 mb-1">{product.brand.name}</p>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-lg font-bold text-gray-900 mb-1">
                        {formatPrice(product.current_price)}
                      </p>
                      {selectedPlan && (
                        <div className="bg-blue-50 rounded-lg p-2 mb-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">{formatPrice(getMonthlyPayment(product))}</span>
                            <span className="text-blue-600"> /month × {selectedPlan.months}</span>
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => handleSelectProduct(product)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-md transition-all"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowApplicationModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {applicationStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Salary Deduction Application</h2>
                  <p className="text-gray-600 mb-6">
                    {selectedProduct.name} - {formatPrice(getMonthlyPayment(selectedProduct))}/month
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={applicationData.full_name}
                        onChange={(e) => setApplicationData({ ...applicationData, full_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                      <input
                        type="text"
                        value={applicationData.id_number}
                        onChange={(e) => setApplicationData({ ...applicationData, id_number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter your ID number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">KRA PIN</label>
                      <input
                        type="text"
                        value={applicationData.kra_pin}
                        onChange={(e) => setApplicationData({ ...applicationData, kra_pin: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                        placeholder="Enter your KRA PIN"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Employer:</span> {employers.find(e => e.id === selectedEmployer)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Staff Number:</span> {staffNumber}
                      </p>
                    </div>
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
                      disabled={submitting}
                      className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Submit Application'}
                    </button>
                  </div>
                </>
              )}

              {applicationStep === 2 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                  <p className="text-gray-600 mb-6">
                    Your salary deduction financing application has been submitted. 
                    We&apos;ll contact your employer for verification and notify you within 24 hours.
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <p className="text-gray-600 mb-1">Estimated monthly deduction</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {formatPrice(getMonthlyPayment(selectedProduct))}
                    </p>
                    <p className="text-gray-500 mt-1">for {selectedPlan?.months} months</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowApplicationModal(false);
                      router.push('/account/orders');
                    }}
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
                  >
                    View My Applications
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
