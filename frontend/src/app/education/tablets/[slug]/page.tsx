'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { educationAPI, EducationTablet, TabletSoftware, cartAPI, School } from '@/lib/api';
import { 
  ShoppingCartIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon, 
  CheckCircleIcon,
  CpuChipIcon,
  DeviceTabletIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CheckIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function TabletDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [tablet, setTablet] = useState<EducationTablet | null>(null);
  const [softwareOptions, setSoftwareOptions] = useState<TabletSoftware[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Financing flow
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'cash' | 'financing'>('cash');
  const [applicationType, setApplicationType] = useState<'school' | 'individual'>('school');
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

  // Set default software selection when softwareOptions loads
  useEffect(() => {
    if (softwareOptions.length > 0 && selectedSoftware.length === 0) {
      // Find default software from API
      const defaultSoftware = softwareOptions.filter(s => s.is_default).map(s => s.slug);
      setSelectedSoftware(defaultSoftware);
    }
  }, [softwareOptions, selectedSoftware.length]);

  useEffect(() => {
    const fetchTabletData = async () => {
      try {
        const [tabletsRes, softwareRes] = await Promise.all([
          educationAPI.getTablets(),
          educationAPI.getSoftware()
        ]);
        
        const foundTablet = tabletsRes.results?.find((t: EducationTablet) => t.slug === slug);
        setTablet(foundTablet || null);
        setSoftwareOptions(softwareRes || []);
      } catch (error) {
        console.error('Error fetching tablet:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTabletData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tablet details...</p>
        </div>
      </div>
    );
  }

  if (!tablet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tablet Not Found</h1>
          <Link href="/education/tablets" className="text-orange-600 hover:text-orange-700">
            ← Back to Tablets
          </Link>
        </div>
      </div>
    );
  }

  const addToCart = async () => {
    if (!tablet || addingToCart) return;
    
    setAddingToCart(true);
    
    try {
      // Use the cartAPI to add education tablet
      const token = localStorage.getItem('token');
      await cartAPI.addEducationTablet(tablet.id, quantity, token || undefined);
      
      // Store software selection separately
      const selectedPlatforms = softwareOptions
        .filter(s => selectedSoftware.includes(s.slug))
        .map(s => s.name);
      
      const softwareSelections = JSON.parse(localStorage.getItem('tablet_software_selections') || '{}');
      softwareSelections[tablet.id] = selectedPlatforms;
      localStorage.setItem('tablet_software_selections', JSON.stringify(softwareSelections));
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirect to cart
      window.location.href = '/cart';
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handlePurchase = () => {
    setShowFinancingModal(true);
    setApplicationStep(1);
  };

  const getMonthlyPayment = () => {
    if (!tablet) return 0;
    const total = parseFloat(tablet.price) * quantity;
    const interestRate = applicationData.months === 3 ? 0 : applicationData.months === 6 ? 5 : applicationData.months === 12 ? 10 : 15;
    const totalWithInterest = total * (1 + interestRate / 100);
    return totalWithInterest / applicationData.months;
  };

  const getTotalPrice = () => {
    if (!tablet) return 0;
    const baseTotal = parseFloat(tablet.price) * quantity;
    // Apply bulk discounts
    if (quantity >= 100) return baseTotal * 0.85;
    if (quantity >= 50) return baseTotal * 0.90;
    if (quantity >= 10) return baseTotal * 0.95;
    return baseTotal;
  };

  const handleSubmitApplication = async () => {
    if (!tablet) return;
    
    setSubmitting(true);
    try {
      // Store the order data
      const orderData = {
        tablet_id: tablet.id,
        quantity,
        application_type: applicationType,
        software: selectedSoftware,
        ...applicationData,
        total_amount: getTotalPrice() * (1 + (applicationData.months === 12 ? 0.1 : 0.05)),
        monthly_payment: getMonthlyPayment(),
      };
      
      localStorage.setItem('tablet_order', JSON.stringify(orderData));
      
      // Move to approval step
      setApplicationStep(2);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = () => {
    // In a real app, this would submit to the backend
    setApplicationStep(4); // Success step
  };

  const toggleSoftware = (softwareId: string) => {
    setSelectedSoftware(prev => 
      prev.includes(softwareId)
        ? prev.filter(id => id !== softwareId)
        : [...prev, softwareId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/education" className="hover:text-orange-600">Education</Link>
            <span>/</span>
            <Link href="/education/tablets" className="hover:text-orange-600">Tablets</Link>
            <span>/</span>
            <span className="text-gray-900">{tablet.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div>
            <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-lg aspect-square flex items-center justify-center sticky top-8">
              {tablet.image ? (
                <Image
                  src={tablet.image}
                  alt={tablet.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <DeviceTabletIcon className="h-64 w-64 text-orange-400" />
              )}
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{tablet.name}</h1>
            <p className="text-gray-600 mb-6">{tablet.description}</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-orange-600">KSH {parseFloat(tablet.price).toLocaleString()}</span>
              <span className="text-gray-600 ml-2">per unit</span>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 text-gray-900 w-10 h-10 rounded-lg font-bold hover:bg-gray-300"
                >
                  −
                </button>
                <span className="text-xl font-semibold text-gray-900 w-16 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 text-gray-900 w-10 h-10 rounded-lg font-bold hover:bg-gray-300"
                >
                  +
                </button>
                {quantity >= 10 && (
                  <span className="text-sm text-green-600 font-semibold">
                    Bulk discount applies! 🎉
                  </span>
                )}
              </div>
            </div>

            {/* Software Selection - First */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="h-6 w-6 text-orange-600" />
                Choose Learning Platforms
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Select one or more learning platforms to be pre-installed on your tablet
              </p>
              <div className="space-y-3">
                {softwareOptions.map((software) => (
                  <label
                    key={software.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all block ${
                      selectedSoftware.includes(software.slug)
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedSoftware.includes(software.slug)}
                        onChange={() => toggleSoftware(software.slug)}
                        className="w-5 h-5 text-orange-600 rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900">{software.name}</h3>
                          {software.is_default && (
                            <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{software.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                ℹ️ All platforms include Knox Guard security for school control
              </p>
            </div>

            {/* Technical Specs - Second */}
            {tablet.specifications && tablet.specifications.trim().length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-md mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CpuChipIcon className="h-6 w-6 text-orange-600" />
                  Technical Specifications
                </h2>
                <div 
                  className="text-gray-700 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: tablet.specifications }}
                />
              </div>
            )}

            {/* Apply for Financing Button - Last */}
            <button
              onClick={handlePurchase}
              disabled={tablet.stock === 0}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-700 hover:to-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <CreditCardIcon className="h-6 w-6" />
              {tablet.stock === 0 ? 'Out of Stock' : 'Apply for Financing'}
            </button>

            <Link
              href="/education/tablets"
              className="block text-center text-orange-600 hover:text-orange-700 font-semibold mb-8"
            >
              ← Continue Shopping
            </Link>

            {/* Educational Features Note */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border-2 border-orange-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AcademicCapIcon className="h-6 w-6 text-orange-600" />
                Educational Features
              </h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Pre-installed with educational software and content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>School-controlled security with Knox Guard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Parental controls and screen time management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Durable design for classroom use</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bulk Purchase Info */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-8 border-2 border-orange-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">School Bulk Purchase Discounts</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-orange-600 mb-2">10-49 Tablets</p>
              <p className="text-gray-700">5% Discount</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-2">50-99 Tablets</p>
              <p className="text-gray-700">10% Discount</p>
            </div>
            <div>
              <p className="font-semibold text-orange-600 mb-2">100+ Tablets</p>
              <p className="text-gray-700">15% Discount + Free Setup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financing/Purchase Modal */}
      {showFinancingModal && tablet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFinancingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Step 1: Choose purchase type and application type */}
              {applicationStep === 1 && (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for Financing</h2>
                  <p className="text-gray-600 mb-6">
                    {tablet.name} × {quantity} = KSH {getTotalPrice().toLocaleString()}
                  </p>

                  {/* Application Type */}
                  <div className="space-y-3 mb-6">
                    <label className="font-medium text-gray-700">Applicant Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setApplicationType('school')}
                        className={`p-4 rounded-xl border-2 ${
                          applicationType === 'school' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                        }`}
                      >
                        <BuildingLibraryIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="font-semibold text-gray-900">School</p>
                        <p className="text-xs text-gray-600">Educational institution</p>
                      </button>
                      <button
                        onClick={() => setApplicationType('individual')}
                        className={`p-4 rounded-xl border-2 ${
                          applicationType === 'individual' ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                        }`}
                      >
                        <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                        <p className="font-semibold text-gray-900">Parent</p>
                        <p className="text-xs text-gray-600">Individual purchase</p>
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
                            applicationData.months === months ? 'border-orange-600 bg-orange-50' : 'border-gray-200'
                          }`}
                        >
                          <p className="font-bold text-gray-900">{months}</p>
                          <p className="text-xs text-gray-600">months</p>
                        </button>
                      ))}
                    </div>
                    <div className="bg-orange-50 rounded-xl p-4 mt-4">
                      <p className="text-sm text-orange-800">Monthly Payment:</p>
                      <p className="text-2xl font-bold text-orange-600">
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

                    {/* Organization fields for school only */}
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
                      className="flex-1 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 disabled:opacity-50"
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
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium text-gray-900">{tablet.name} × {quantity}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-gray-900">KSH {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Term:</span>
                      <span className="font-medium text-gray-900">{applicationData.months} months</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-900 font-medium">Monthly Payment:</span>
                      <span className="font-bold text-orange-600">
                        KSH {getMonthlyPayment().toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700"
                  >
                    Confirm Order
                  </button>
                </div>
              )}

              {/* Step 4: Success */}
              {applicationStep === 4 && (
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
                    className="w-full py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700"
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
