'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { educationAPI, EducationBoard, ClassroomPackage, School } from '@/lib/api';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function StartFundraiserPage() {
  const [boards, setBoards] = useState<EducationBoard[]>([]);
  const [packages, setPackages] = useState<ClassroomPackage[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EducationBoard | ClassroomPackage | null>(null);
  const [fundraiserType, setFundraiserType] = useState<'single_board' | 'classroom'>('single_board');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [searchingSchools, setSearchingSchools] = useState(false);
  const schoolDropdownRef = useRef<HTMLDivElement>(null);
  const [schoolForm, setSchoolForm] = useState({
    schoolName: '',
    schoolLocation: '',
    schoolDescription: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
    const fetchData = async () => {
      try {
        const [boardsRes, packagesRes] = await Promise.all([
          educationAPI.getBoards(),
          educationAPI.getPackages()
        ]);
        setBoards(boardsRes.results || []);
        setPackages(packagesRes.results || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Check if user is logged in
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkAuth();
  }, []);

  // Clear selection when fundraiser type changes
  useEffect(() => {
    setSelectedItem(null);
  }, [fundraiserType]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  const handleSubmitFundraiser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: Implement actual API call to create fundraiser
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock fundraiser creation - generate a share link
      const mockShareLink = 'demo-' + Date.now().toString(36);
      
      // Store mock fundraiser data in localStorage
      const mockFundraiser = {
        id: Date.now(),
        fundraiser_id: mockShareLink,
        fundraiser_type: fundraiserType,
        school_name: schoolForm.schoolName,
        school_location: schoolForm.schoolLocation,
        school_description: schoolForm.schoolDescription,
        target_amount: selectedItem?.price || '2500',
        current_amount: '0',
        progress_percentage: 0,
        share_link: mockShareLink,
        status: 'active',
        creator: localStorage.getItem('user_name') || 'Alumni',
        donations: [],
        leaderboard: [],
        created_at: new Date().toISOString(),
        end_date: schoolForm.endDate || null,
      };
      
      // Store in localStorage
      localStorage.setItem(`fundraiser_${mockShareLink}`, JSON.stringify(mockFundraiser));
      
      setSuccess(true);
      
      // Show success message then redirect to the fundraiser page
      alert('Fundraiser created successfully! Redirecting to your fundraiser page...');
      
      // Redirect to the created fundraiser page
      window.location.href = `/education/fundraisers/${mockShareLink}`;
    } catch (error) {
      alert('Failed to create fundraiser. Please try again.');
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link href="/education" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8">
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Education
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCircleIcon className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Required</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Please create an account or sign in to start a fundraiser for your school.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-3 bg-orange-600 text-white font-medium rounded-xl hover:bg-orange-700 transition-all"
              >
                Create Account
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/education" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8">
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Education
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Start a Fundraiser</h1>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-orange-900 mb-3">How it works:</h3>
            <ol className="space-y-3 text-sm text-orange-800">
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">1.</span>
                <span>Select a smart board model or classroom package and set your fundraising goal</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">2.</span>
                <span>Share your unique fundraiser link with alumni and supporters</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">3.</span>
                <span>Contributors donate in preset amounts: $20, $30, $50, $100, $200, $300, $500, or $1000</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">4.</span>
                <span>Track progress with a live leaderboard showing top contributors</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold flex-shrink-0">5.</span>
                <span>Once the goal is reached, the smart board will be delivered and installed at your school</span>
              </li>
            </ol>
          </div>

          {/* Fundraiser Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Fundraiser Type</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setFundraiserType('single_board')}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  fundraiserType === 'single_board'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Single Board Sponsorship</h3>
                <p className="text-sm text-gray-600">
                  Fundraise for one smart board for a single classroom
                </p>
              </button>
              
              <button
                onClick={() => setFundraiserType('classroom')}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  fundraiserType === 'classroom'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Classroom Package</h3>
                <p className="text-sm text-gray-600">
                  Fundraise for 2 smart boards with professional installation
                </p>
              </button>
            </div>
          </div>

          {/* Board Selection */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              <p className="text-gray-500 mt-4">Loading options...</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {fundraiserType === 'single_board' ? 'Choose a Smart Board' : 'Choose a Package'}
              </h2>
              <div className="grid gap-4">
                {fundraiserType === 'single_board' ? (
                  // Show individual boards
                  boards.map((board) => (
                    <div
                      key={board.id}
                      onClick={() => setSelectedItem(board)}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        selectedItem?.id === board.id && fundraiserType === 'single_board'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{board.name}</h3>
                          <p className="text-gray-600 mb-3">{board.description}</p>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatPrice(board.price)}
                          </div>
                          <div className="text-sm text-gray-500">Target amount</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Show classroom packages
                  packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedItem(pkg)}
                      className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                        selectedItem?.id === pkg.id && fundraiserType === 'classroom'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{pkg.name}</h3>
                          <p className="text-gray-600 mb-2">{pkg.description}</p>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatPrice(pkg.price)}
                          </div>
                          <div className="text-sm text-gray-500">Target amount</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedItem && (
                <div className="mt-8 bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">School Information</h3>
                  <form onSubmit={handleSubmitFundraiser} className="space-y-4">
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
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                          required
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
                                  setSchoolForm({
                                    ...schoolForm,
                                    schoolName: school.name,
                                    schoolLocation: school.location || school.county || ''
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Location *
                      </label>
                      <input
                        type="text"
                        value={schoolForm.schoolLocation}
                        onChange={(e) => setSchoolForm({...schoolForm, schoolLocation: e.target.value})}
                        placeholder="City, County"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Description (Optional)
                      </label>
                      <textarea
                        rows={4}
                        value={schoolForm.schoolDescription}
                        onChange={(e) => setSchoolForm({...schoolForm, schoolDescription: e.target.value})}
                        placeholder="Tell potential donors about your school..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fundraiser End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={schoolForm.endDate}
                        onChange={(e) => setSchoolForm({...schoolForm, endDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Creating Fundraiser...' : 'Create Fundraiser'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
