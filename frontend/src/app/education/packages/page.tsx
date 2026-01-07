'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { educationAPI, ClassroomPackage, School } from '@/lib/api';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  AcademicCapIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function ClassroomPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<ClassroomPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Financing modal state
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ClassroomPackage | null>(null);
  const [applicationType, setApplicationType] = useState<'school' | 'alumni'>('school');
  const [applicationStep, setApplicationStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    // Contact info
    full_name: '',
    phone: '',
    email: '',
    // KYC
    id_number: '',
    kra_pin: '',
    // School/Organization info
    organization_name: '',
    registration_number: '',
    organization_address: '',
    // Payment plan
    months: 12,
  });
  
  // School search state
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [searchingSchools, setSearchingSchools] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target as Node)) {
        setShowSchoolDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search schools when input changes
  useEffect(() => {
    const searchSchools = async () => {
      if (schoolSearch.length < 2) {
        setSchools([]);
        return;
      }
      setSearchingSchools(true);
      try {
        const results = await educationAPI.getSchools(schoolSearch);
        setSchools(results);
      } catch (error) {
        console.error('Error searching schools:', error);
      } finally {
        setSearchingSchools(false);
      }
    };
    
    const debounce = setTimeout(searchSchools, 300);
    return () => clearTimeout(debounce);
  }, [schoolSearch]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await educationAPI.getPackages();
        setPackages(response.results || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();

    // Check if user is logged in
    const checkAuth = () => {
      // TODO: Replace with actual auth check
      const token = localStorage.getItem('auth_token');
      setIsLoggedIn(!!token);
    };
    checkAuth();
  }, []);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  const getMonthlyPayment = () => {
    if (!selectedPackage) return 0;
    const total = parseFloat(selectedPackage.price);
    const interestRate = applicationData.months === 3 ? 0 : applicationData.months === 6 ? 5 : applicationData.months === 12 ? 10 : 15;
    const totalWithInterest = total * (1 + interestRate / 100);
    return totalWithInterest / applicationData.months;
  };

  const handleApplyForFinancing = (pkg: ClassroomPackage) => {
    setSelectedPackage(pkg);
    setShowFinancingModal(true);
    setApplicationStep(1);
    setApplicationType('school');
    setSelectedSchool(null);
    setSchoolSearch('');
    setApplicationData({
      full_name: '',
      phone: '',
      email: '',
      id_number: '',
      kra_pin: '',
      organization_name: '',
      registration_number: '',
      organization_address: '',
      months: 12,
    });
  };

  const handleSubmitApplication = async () => {
    if (!selectedPackage) return;
    
    setSubmitting(true);
    try {
      // Store the order data
      const orderData = {
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        boards_included: selectedPackage.boards_included,
        application_type: applicationType,
        ...applicationData,
        total_amount: parseFloat(selectedPackage.price) * (1 + (applicationData.months === 12 ? 0.1 : 0.05)),
        monthly_payment: getMonthlyPayment(),
      };
      
      localStorage.setItem('package_order', JSON.stringify(orderData));
      
      // Move to approval step
      setApplicationStep(2);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = () => {
    setApplicationStep(3); // Success step
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/education" className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 mb-8">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Education
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Classroom Packages</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Complete classroom solutions with multiple smart boards and professional installation. 
            Perfect for schools looking to upgrade multiple classrooms at once.
          </p>
        </div>

        {!isLoggedIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">School Account Required</h3>
            <p className="text-sm text-blue-800 mb-4">
              Please create a school account to add tablets and packages to your cart. You'll be able to select software options during checkout.
            </p>
            <div className="flex gap-3">
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all text-sm"
              >
                Create School Account
              </Link>
              <Link
                href="/auth/login"
                className="px-4 py-2 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-all text-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : packages.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {pkg.boards_included}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Smart Boards</div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-6 min-h-[60px]">{pkg.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{pkg.boards_included} Smart Boards</span>
                    </div>
                    {pkg.installation_included && (
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Professional Installation</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>1 Year Warranty</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>Training & Support</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm text-gray-600">Total Package</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(pkg.price)}
                      </span>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                      {formatPrice((parseFloat(pkg.price) / pkg.boards_included).toString())} per board
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyForFinancing(pkg)}
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    Apply for Financing
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500 text-lg">No packages available at the moment</p>
            <p className="text-gray-400 mt-2">Please contact us for custom quotes</p>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Bulk Discounts Available</h3>
            <p className="text-gray-600 text-sm mb-4">
              Planning to equip multiple classrooms? Contact us for custom packages and special pricing for large school deployments.
            </p>
            <a
              href="mailto:schools@tepstore.com?subject=Bulk%20Discount%20Inquiry"
              className="text-red-600 font-medium text-sm hover:text-red-700"
            >
              Request Bulk Quote →
            </a>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Flexible Payment Options</h3>
            <p className="text-gray-600 text-sm mb-4">
              We offer flexible payment plans for schools. Pay in installments or arrange special financing terms for your institution.
            </p>
            <a
              href="mailto:schools@tepstore.com?subject=Payment%20Options%20Inquiry"
              className="text-red-600 font-medium text-sm hover:text-red-700"
            >
              Learn About Payment Plans →
            </a>
          </div>
        </div>
      </div>

      {/* Financing Modal */}
      {showFinancingModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFinancingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Step 1: Application form */}
              {applicationStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for Financing</h2>
                  <p className="text-gray-600 mb-6">
                    {selectedPackage.name} ({selectedPackage.boards_included} Smart Boards) = {formatPrice(selectedPackage.price)}
                  </p>

                  {/* Application Type */}
                  <div className="space-y-3 mb-6">
                    <label className="font-medium text-gray-700">Applicant Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setApplicationType('school')}
                        className={`p-4 rounded-xl border-2 ${
                          applicationType === 'school' ? 'border-red-600 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <BuildingLibraryIcon className="w-8 h-8 mx-auto mb-2 text-red-600" />
                        <p className="font-semibold text-gray-900">School</p>
                        <p className="text-xs text-gray-600">Educational institution</p>
                      </button>
                      <button
                        onClick={() => setApplicationType('alumni')}
                        className={`p-4 rounded-xl border-2 ${
                          applicationType === 'alumni' ? 'border-red-600 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-red-600" />
                        <p className="font-semibold text-gray-900">Alumni</p>
                        <p className="text-xs text-gray-600">Former student donation</p>
                      </button>
                    </div>
                  </div>

                  {/* Financing Plan Selection */}
                  <div className="space-y-3 mb-6">
                    <label className="font-medium text-gray-700">Payment Plan</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 6, 12, 24].map((months) => (
                        <button
                          key={months}
                          onClick={() => setApplicationData({ ...applicationData, months })}
                          className={`p-3 rounded-xl border-2 ${
                            applicationData.months === months ? 'border-red-600 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <p className="font-bold text-gray-900">{months}</p>
                          <p className="text-xs text-gray-600">months</p>
                        </button>
                      ))}
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 mt-4">
                      <p className="text-sm text-red-800">Monthly Payment:</p>
                      <p className="text-2xl font-bold text-red-600">
                        KSH {getMonthlyPayment().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>

                  {/* Contact Form Fields */}
                  <div className="space-y-4 mb-6">
                    <h3 className="font-medium text-gray-700">Contact Information</h3>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={applicationData.full_name}
                      onChange={(e) => setApplicationData({ ...applicationData, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={applicationData.phone}
                        onChange={(e) => setApplicationData({ ...applicationData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                      />
                      <input
                        type="email"
                        placeholder="Email *"
                        value={applicationData.email}
                        onChange={(e) => setApplicationData({ ...applicationData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                      />
                    </div>
                    
                    {/* KYC fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="ID Number *"
                        value={applicationData.id_number}
                        onChange={(e) => setApplicationData({ ...applicationData, id_number: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        placeholder="KRA PIN *"
                        value={applicationData.kra_pin}
                        onChange={(e) => setApplicationData({ ...applicationData, kra_pin: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                      />
                    </div>

                    {/* Organization fields for school */}
                    {applicationType === 'school' && (
                      <>
                        {/* Searchable School Dropdown */}
                        <div ref={schoolDropdownRef} className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            School Name *
                          </label>
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={selectedSchool ? selectedSchool.name : schoolSearch}
                              onChange={(e) => {
                                setSchoolSearch(e.target.value);
                                setSelectedSchool(null);
                                setShowSchoolDropdown(true);
                              }}
                              onFocus={() => setShowSchoolDropdown(true)}
                              placeholder="Search for your school..."
                              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          
                          {/* School Dropdown */}
                          {showSchoolDropdown && (schoolSearch.length >= 2 || schools.length > 0) && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                              {searchingSchools ? (
                                <div className="p-4 text-center text-gray-500">Searching...</div>
                              ) : schools.length > 0 ? (
                                schools.map((school) => (
                                  <button
                                    key={school.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedSchool(school);
                                      setSchoolSearch(school.name);
                                      setApplicationData({
                                        ...applicationData,
                                        organization_name: school.name,
                                      });
                                      setShowSchoolDropdown(false);
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-900">{school.name}</div>
                                    {(school.location || school.county) && (
                                      <div className="text-sm text-gray-500">
                                        {school.location}{school.location && school.county ? ', ' : ''}{school.county}
                                      </div>
                                    )}
                                  </button>
                                ))
                              ) : schoolSearch.length >= 2 ? (
                                <div className="p-4 text-center text-gray-500">
                                  No schools found. Please contact support if your school is not listed.
                                </div>
                              ) : null}
                            </div>
                          )}
                          {selectedSchool && (
                            <p className="mt-1 text-sm text-green-600">✓ School selected</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Alumni fields */}
                    {applicationType === 'alumni' && (
                      <>
                        <input
                          type="text"
                          placeholder="School Name (you attended) *"
                          value={applicationData.organization_name}
                          onChange={(e) => setApplicationData({ ...applicationData, organization_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        />
                        <input
                          type="text"
                          placeholder="Year of Graduation"
                          value={applicationData.registration_number}
                          onChange={(e) => setApplicationData({ ...applicationData, registration_number: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900"
                        />
                      </>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowFinancingModal(false)}
                      className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitApplication}
                      disabled={submitting || !applicationData.full_name || !applicationData.phone}
                      className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Submit Application'}
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Financing approval */}
              {applicationStep === 2 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre-Approved!</h2>
                  <p className="text-gray-600 mb-6">
                    Your financing application has been pre-approved.
                  </p>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-medium text-gray-900">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Smart Boards:</span>
                      <span className="font-medium text-gray-900">{selectedPackage.boards_included}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-gray-900">{formatPrice(selectedPackage.price)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Term:</span>
                      <span className="font-medium text-gray-900">{applicationData.months} months</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-900 font-medium">Monthly Payment:</span>
                      <span className="font-bold text-red-600">
                        KSH {getMonthlyPayment().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700"
                  >
                    Confirm Order
                  </button>
                </div>
              )}

              {/* Step 3: Success */}
              {applicationStep === 3 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
                  <p className="text-gray-600 mb-6">
                    Your financing application has been submitted. We will contact you shortly with next steps.
                  </p>
                  
                  <button
                    onClick={() => router.push('/education')}
                    className="w-full py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700"
                  >
                    Back to Education
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
