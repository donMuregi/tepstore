'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/lib/api';
import { 
  DevicePhoneMobileIcon, 
  BuildingOffice2Icon, 
  AcademicCapIcon, 
  ShoppingBagIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Icon mapping for dynamic rendering
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  phone: DevicePhoneMobileIcon,
  building: BuildingOffice2Icon,
  computer: ComputerDesktopIcon,
  shopping: ShoppingBagIcon,
};

// Color themes for each slide - keyed by background_color value
const slideThemes: { [key: string]: { bg: string; decorLight: string; decorDark: string; badge: string; badgeBorder: string; badgeText: string; highlight: string; button: string; buttonHover: string; cardDecor: string; cardDecorBars: string; iconBg: string; iconColor: string } } = {
  green: {
    bg: 'from-green-50/80 via-emerald-50/50 to-teal-50/60',
    decorLight: 'from-green-100/50 to-emerald-100/50',
    decorDark: 'from-emerald-100/40 to-teal-100/40',
    badge: 'bg-green-50',
    badgeBorder: 'border-green-200',
    badgeText: 'text-green-700',
    highlight: 'from-green-600 to-emerald-600',
    button: 'from-green-600 to-emerald-600',
    buttonHover: 'hover:shadow-green-500/25',
    cardDecor: 'from-green-500 to-emerald-600',
    cardDecorBars: 'from-emerald-500 to-green-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  blue: {
    bg: 'from-blue-50/80 via-indigo-50/50 to-violet-50/60',
    decorLight: 'from-blue-100/50 to-indigo-100/50',
    decorDark: 'from-indigo-100/40 to-violet-100/40',
    badge: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    highlight: 'from-blue-600 to-indigo-600',
    button: 'from-blue-600 to-indigo-600',
    buttonHover: 'hover:shadow-blue-500/25',
    cardDecor: 'from-blue-500 to-indigo-600',
    cardDecorBars: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  orange: {
    bg: 'from-orange-50/80 via-amber-50/50 to-yellow-50/60',
    decorLight: 'from-orange-100/50 to-amber-100/50',
    decorDark: 'from-amber-100/40 to-yellow-100/40',
    badge: 'bg-orange-50',
    badgeBorder: 'border-orange-200',
    badgeText: 'text-orange-700',
    highlight: 'from-orange-600 to-amber-600',
    button: 'from-orange-600 to-amber-600',
    buttonHover: 'hover:shadow-orange-500/25',
    cardDecor: 'from-orange-500 to-amber-600',
    cardDecorBars: 'from-amber-500 to-orange-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  pink: {
    bg: 'from-pink-50/80 via-rose-50/50 to-red-50/60',
    decorLight: 'from-pink-100/50 to-rose-100/50',
    decorDark: 'from-rose-100/40 to-red-100/40',
    badge: 'bg-pink-50',
    badgeBorder: 'border-pink-200',
    badgeText: 'text-pink-700',
    highlight: 'from-pink-600 to-rose-600',
    button: 'from-pink-600 to-rose-600',
    buttonHover: 'hover:shadow-pink-500/25',
    cardDecor: 'from-pink-500 to-rose-600',
    cardDecorBars: 'from-rose-500 to-pink-500',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
  },
  purple: {
    bg: 'from-purple-50/80 via-violet-50/50 to-fuchsia-50/60',
    decorLight: 'from-purple-100/50 to-violet-100/50',
    decorDark: 'from-violet-100/40 to-fuchsia-100/40',
    badge: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    highlight: 'from-purple-600 to-violet-600',
    button: 'from-purple-600 to-violet-600',
    buttonHover: 'hover:shadow-purple-500/25',
    cardDecor: 'from-purple-500 to-violet-600',
    cardDecorBars: 'from-violet-500 to-purple-500',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  teal: {
    bg: 'from-teal-50/80 via-cyan-50/50 to-sky-50/60',
    decorLight: 'from-teal-100/50 to-cyan-100/50',
    decorDark: 'from-cyan-100/40 to-sky-100/40',
    badge: 'bg-teal-50',
    badgeBorder: 'border-teal-200',
    badgeText: 'text-teal-700',
    highlight: 'from-teal-600 to-cyan-600',
    button: 'from-teal-600 to-cyan-600',
    buttonHover: 'hover:shadow-teal-500/25',
    cardDecor: 'from-teal-500 to-cyan-600',
    cardDecorBars: 'from-cyan-500 to-teal-500',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  red: {
    bg: 'from-red-50/80 via-rose-50/50 to-orange-50/60',
    decorLight: 'from-red-100/50 to-rose-100/50',
    decorDark: 'from-rose-100/40 to-orange-100/40',
    badge: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    highlight: 'from-red-600 to-rose-600',
    button: 'from-red-600 to-rose-600',
    buttonHover: 'hover:shadow-red-500/25',
    cardDecor: 'from-red-500 to-rose-600',
    cardDecorBars: 'from-rose-500 to-red-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  indigo: {
    bg: 'from-indigo-50/80 via-blue-50/50 to-violet-50/60',
    decorLight: 'from-indigo-100/50 to-blue-100/50',
    decorDark: 'from-blue-100/40 to-violet-100/40',
    badge: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200',
    badgeText: 'text-indigo-700',
    highlight: 'from-indigo-600 to-blue-600',
    button: 'from-indigo-600 to-blue-600',
    buttonHover: 'hover:shadow-indigo-500/25',
    cardDecor: 'from-indigo-500 to-blue-600',
    cardDecorBars: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  amber: {
    bg: 'from-amber-50/80 via-yellow-50/50 to-orange-50/60',
    decorLight: 'from-amber-100/50 to-yellow-100/50',
    decorDark: 'from-yellow-100/40 to-orange-100/40',
    badge: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    highlight: 'from-amber-600 to-yellow-600',
    button: 'from-amber-600 to-yellow-600',
    buttonHover: 'hover:shadow-amber-500/25',
    cardDecor: 'from-amber-500 to-yellow-600',
    cardDecorBars: 'from-yellow-500 to-amber-500',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  cyan: {
    bg: 'from-cyan-50/80 via-sky-50/50 to-blue-50/60',
    decorLight: 'from-cyan-100/50 to-sky-100/50',
    decorDark: 'from-sky-100/40 to-blue-100/40',
    badge: 'bg-cyan-50',
    badgeBorder: 'border-cyan-200',
    badgeText: 'text-cyan-700',
    highlight: 'from-cyan-600 to-sky-600',
    button: 'from-cyan-600 to-sky-600',
    buttonHover: 'hover:shadow-cyan-500/25',
    cardDecor: 'from-cyan-500 to-sky-600',
    cardDecorBars: 'from-sky-500 to-cyan-500',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
};

// Fallback slides when API is unavailable
const fallbackSlides = [
  {
    id: 1,
    badge_text: 'Trusted by 10,000+ customers',
    title: 'Your Gateway to',
    highlight: 'Smart Technology',
    description: 'From personal device financing to enterprise solutions and educational technology. We make technology accessible for everyone.',
    primary_button_text: 'Get Financing',
    primary_button_link: '/msme',
    secondary_button_text: 'Enterprise Solutions',
    secondary_button_link: '/enterprise',
    image: null,
    card_icon: 'phone',
    card_label: 'Starting from',
    card_price: 'Ksh 2,999',
    card_subtext: '/month with financing',
    background_color: 'green',
  },
  {
    id: 2,
    badge_text: 'For Businesses & Corporates',
    title: 'Device as a',
    highlight: 'Service (DaaS)',
    description: 'Complete device bundles with 60GB data, 400 minutes, and 100 SMS. Minimum 5 devices for corporate teams.',
    primary_button_text: 'Get a Quote',
    primary_button_link: '/enterprise',
    secondary_button_text: 'View Bundles',
    secondary_button_link: '/enterprise',
    image: null,
    card_icon: 'building',
    card_label: 'Starting from',
    card_price: 'Ksh 4,500',
    card_subtext: '/device/month all-inclusive',
    background_color: 'blue',
  },
  {
    id: 3,
    badge_text: 'Empowering Education',
    title: 'Smart Boards &',
    highlight: 'Tablets for Schools',
    description: 'Interactive displays, tablets with management software, and alumni fundraising for schools across Kenya.',
    primary_button_text: 'Explore Education',
    primary_button_link: '/education',
    secondary_button_text: 'Start Fundraiser',
    secondary_button_link: '/education',
    image: null,
    card_icon: 'computer',
    card_label: 'Smart Boards from',
    card_price: 'Ksh 249,900',
    card_subtext: 'with installation included',
    background_color: 'orange',
  },
  {
    id: 4,
    badge_text: 'Exclusive Collection',
    title: 'Online Exclusive',
    highlight: 'Variants & Colors',
    description: 'Discover rare color variants and exclusive models you won\'t find anywhere else. Trade-in your old device.',
    primary_button_text: 'Shop Now',
    primary_button_link: '/shop',
    secondary_button_text: 'Trade-In Value',
    secondary_button_link: '/shop',
    image: null,
    card_icon: 'shopping',
    card_label: 'Flagships from',
    card_price: 'Ksh 129,900',
    card_subtext: 'or trade-in and save',
    background_color: 'pink',
  },
];

interface HeroSlide {
  id: number;
  title: string;
  highlight: string;
  badge_text: string;
  description: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  image: string | null;
  card_icon: string;
  card_label: string;
  card_price: string;
  card_subtext: string;
  background_color?: string;
}

const solutions = [
  {
    title: 'MSMEs Financing',
    description: 'Get your dream phone with flexible payment plans. Pay in 3, 6, 9, or 12 months.',
    icon: DevicePhoneMobileIcon,
    href: '/msme',
    gradient: 'from-red-600 to-red-500',
    features: ['Flexible payment plans', 'Quick approval', 'No collateral required'],
  },
  {
    title: 'Enterprise Solutions',
    description: 'Device as a Service (DaaS) bundles for corporates. Minimum 5 devices with data & minutes.',
    icon: BuildingOffice2Icon,
    href: '/enterprise',
    gradient: 'from-red-600 to-red-500',
    features: ['60GB data included', '400 minutes included', 'Bulk discounts available'],
  },
  {
    title: 'Educational Solutions',
    description: 'Smart boards and tablets for schools. Start a fundraiser or buy directly.',
    icon: AcademicCapIcon,
    href: '/education',
    gradient: 'from-red-600 to-red-500',
    features: ['Smart board fundraising', 'Tablets for schools', 'Educational software'],
  },
  {
    title: 'Shop Direct',
    description: 'Online exclusive phone variants you won\'t find elsewhere. Limited stock, exclusive models.',
    icon: ShoppingBagIcon,
    href: '/shop',
    gradient: 'from-red-600 to-red-500',
    features: ['Online exclusives', 'Exclusive models', 'Fast delivery'],
  },
];

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '50+', label: 'Partner Banks' },
  { value: '500+', label: 'Schools Served' },
  { value: '98%', label: 'Approval Rate' },
];

// Featured products for each category
const featuredProducts = {
  shop: [
    { name: 'Galaxy S25 Ultra', variant: '256GB • Phantom Black', price: 1299, tradeIn: 800 },
    { name: 'Galaxy S25+', variant: '256GB • Cream', price: 999, tradeIn: 600 },
    { name: 'Galaxy Tab S11 Ultra', variant: '512GB • Graphite', price: 1199, tradeIn: 400 },
    { name: 'Galaxy Watch 7', variant: '44mm • Silver', price: 399, tradeIn: 150 },
  ],
  education: [
    { name: 'Mwalimu Masomo Platform', type: 'Platform Service', price: 15, unit: '/device/mo', desc: 'Centralized tablet & content management' },
    { name: 'Knox Guard Protection', type: 'Security Service', price: 8, unit: '/device/mo', desc: 'Device protection & remote management' },
    { name: 'School Flat Panel Boards', type: 'Hardware', price: 2499, unit: '', desc: '65" Interactive Display' },
  ],
  enterprise: [
    { name: 'S25 Ultra Business Bundle', data: '60GB', minutes: '400', price: 89, total: 3204, moq: 5 },
  ],
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [isLoading, setIsLoading] = useState(true);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [msmeProducts, setMsmeProducts] = useState<Product[]>([]);
  const [enterpriseBundles, setEnterpriseBundles] = useState<Array<{
    id: number;
    name: string;
    price_per_device: string;
    data_gb: number;
    minutes: number;
    minimum_quantity: number;
    product: {
      name: string;
      image: string | null;
    };
  }>>([]);

  // Fetch hero slides from API
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hero-slides/`);
        if (res.ok) {
          const data = await res.json();
          // Handle paginated response (data.results) or direct array
          const slides = data.results || data;
          if (slides && slides.length > 0) {
            setHeroSlides(slides);
          }
        }
      } catch (error) {
        console.log('Using fallback slides');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Fetch shop products
  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/?type=shop`);
        if (res.ok) {
          const data = await res.json();
          const products = data.results || data;
          if (products && products.length > 0) {
            setShopProducts(products.slice(0, 4)); // Show first 4 products
          }
        }
      } catch (error) {
        console.log('Error fetching shop products');
      }
    };
    fetchShopProducts();
  }, []);

  // Fetch MSME products
  useEffect(() => {
    const fetchMsmeProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/?type=msme`);
        if (res.ok) {
          const data = await res.json();
          const products = data.results || data;
          if (products && products.length > 0) {
            setMsmeProducts(products.slice(0, 4)); // Show first 4 products
          }
        }
      } catch (error) {
        console.log('Error fetching MSME products');
      }
    };
    fetchMsmeProducts();
  }, []);

  // Fetch enterprise bundles
  useEffect(() => {
    const fetchEnterpriseBundles = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/enterprise/bundles/`);
        if (res.ok) {
          const data = await res.json();
          const bundles = data.results || data;
          if (bundles && bundles.length > 0) {
            setEnterpriseBundles(bundles); // Show all bundles
          }
        }
      } catch (error) {
        console.log('Error fetching enterprise bundles');
      }
    };
    fetchEnterpriseBundles();
  }, []);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 16000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || DevicePhoneMobileIcon;
  };

  const getTheme = (colorName: string | undefined) => {
    return slideThemes[colorName || 'green'] || slideThemes.green;
  };

  // Get current slide theme
  const currentTheme = heroSlides.length > 0 ? getTheme(heroSlides[currentSlide].background_color) : slideThemes.green;

  return (
    <div className="bg-white">
      {/* Hero Slider Section */}
      <section className={`relative overflow-hidden min-h-[600px] lg:min-h-[700px] transition-colors duration-1000 bg-gradient-to-br ${currentTheme.bg}`}>
        {/* Background decorative elements - dynamic colors */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${currentTheme.decorDark} rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 transition-colors duration-1000`} />
          <div className={`absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr ${currentTheme.decorLight} rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 transition-colors duration-1000`} />
        </div>

        {heroSlides.map((slide, index) => {
          const IconComponent = getIcon(slide.card_icon);
          const theme = getTheme(slide.background_color);
          return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1200 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0 z-10' 
                : index < currentSlide 
                  ? 'opacity-0 -translate-x-full z-0' 
                  : 'opacity-0 translate-x-full z-0'
            }`}
          >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-16 lg:py-24">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
                {/* Left Content */}
                <div className="space-y-6">
                  <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight transition-all duration-700 delay-200 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}>
                    {slide.title}<br />
                    <span className={`bg-gradient-to-r ${theme.highlight} bg-clip-text text-transparent`}>
                      {slide.highlight}
                    </span>
                  </h1>
                  
                  <p className={`text-lg text-gray-600 max-w-lg leading-relaxed transition-all duration-700 delay-300 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}>
                    {slide.description}
                  </p>

                  <div className={`flex flex-wrap gap-4 pt-2 transition-all duration-700 delay-[400ms] ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}>
                    <Link
                      href={slide.primary_button_link}
                      className={`inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r ${theme.button} text-white font-semibold rounded-xl hover:shadow-lg ${theme.buttonHover} transition-all`}
                    >
                      {slide.primary_button_text}
                      <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                    <Link
                      href={slide.secondary_button_link}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      {slide.secondary_button_text}
                    </Link>
                  </div>
                </div>

                {/* Right Side - Image or Card */}
                <div className={`hidden lg:flex justify-center lg:justify-end transition-all duration-700 delay-200 ${
                    index === currentSlide ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-8'
                  }`}>
                  <div className="relative">
                    {/* Decorative border */}
                    <div className={`absolute -inset-4 bg-gradient-to-br ${theme.cardDecor} rounded-3xl opacity-20 blur-sm`} />
                    <div className={`absolute top-0 right-0 w-5 h-48 bg-gradient-to-b ${theme.cardDecorBars} rounded-full translate-x-8`} />
                    <div className={`absolute bottom-0 right-0 w-48 h-5 bg-gradient-to-r ${theme.cardDecorBars} rounded-full translate-y-8`} />
                    
                    {/* Main Card with Image or Icon */}
                    <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                      {slide.image ? (
                        <div className="relative w-[580px] h-[520px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay with price info */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-10">
                            <p className="text-white/90 text-base font-medium">{slide.card_label}</p>
                            <p className="text-6xl font-bold text-white my-3">{slide.card_price}</p>
                            <p className="text-white/80 text-lg">{slide.card_subtext}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-14 min-w-[450px]">
                          <div className="flex flex-col items-center text-center space-y-6">
                            <div className={`w-28 h-28 ${theme.iconBg} rounded-2xl flex items-center justify-center`}>
                              <IconComponent className={`w-14 h-14 ${theme.iconColor}`} />
                            </div>
                            <p className="text-gray-500 text-lg">{slide.card_label}</p>
                            <p className="text-6xl font-bold text-gray-900">{slide.card_price}</p>
                            <p className="text-gray-500 text-lg">{slide.card_subtext}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })}

        {/* Slider Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
          <button
            onClick={prevSlide}
            className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors border border-gray-100"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-red-600 to-red-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400 w-2'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors border border-gray-100"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-red-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MSME Financing Products */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-red-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-rose-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-orange-200 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              MSME Device <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">Financing</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Empower your business with the latest devices through affordable financing options. 
              No upfront payment, flexible terms, and quick approval.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: 'Quick Approval', desc: '24-48 hours' },
              { label: 'Flexible Terms', desc: '6-24 months' },
              { label: 'No Collateral', desc: 'Required' },
            ].map((feature, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center border border-white shadow-sm">
                <p className="text-lg font-bold text-red-600">{feature.label}</p>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {msmeProducts.length > 0 ? (
              msmeProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200 hover:-translate-y-1">
                  <div className="relative aspect-square bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <DevicePhoneMobileIcon className="w-20 h-20 text-red-200" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">{typeof product.brand === 'object' && product.brand ? product.brand.name : product.brand}</p>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-bold text-gray-900">Ksh {Number(product.price).toLocaleString()}</span>
                      <span className="text-sm text-gray-500">or</span>
                      <span className="text-sm font-medium text-red-600">Ksh {Math.round(Number(product.price) / 12).toLocaleString()}/mo</span>
                    </div>
                    <Link 
                      href={`/msme/${product.slug}`}
                      className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 rounded-xl font-medium hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      Apply for Financing
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Loading skeleton
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                    <DevicePhoneMobileIcon className="w-20 h-20 text-gray-200" />
                  </div>
                  <div className="p-4">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-10 bg-emerald-100 rounded-xl"></div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link 
              href="/msme" 
              className="inline-flex items-center gap-2 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-full border-2 border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md hover:shadow-lg"
            >
              Explore All MSME Products
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Shop Products */}
      <section className="py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop Direct</h2>
              <p className="text-gray-600">Online exclusives with trade-in options</p>
            </div>
            <Link href="/shop" className="text-pink-600 font-medium hover:text-pink-700 flex items-center gap-1">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {shopProducts.length > 0 ? (
              shopProducts.map((product) => (
                <ProductCard key={product.id} product={product} type="shop" />
              ))
            ) : (
              // Loading skeleton or placeholder
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                    <DevicePhoneMobileIcon className="w-20 h-20 text-gray-300" />
                  </div>
                  <div className="p-4">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Education Services - Two Path Journey */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Educational Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Empower classrooms with smart technology. Choose your path to digital transformation.
            </p>
          </div>

          {/* Two Path Cards */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Path 1: Smart Board Fundraising */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-amber-900/20" />
              <div className="relative p-8">
                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                  Smart Board <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">Pro</span>
                </h3>
                <p className="text-orange-400 font-medium mb-4">Community-funded classroom upgrade</p>

                {/* Description */}
                <p className="text-gray-300 mb-6">
                  Start a fundraiser for your school. Parents and community members contribute together to bring interactive smart boards to your classrooms.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span>65&quot; 4K Interactive Display</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span>Easy fundraiser setup & tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span>Share with parents & community</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span>Installation & training included</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-gray-400 text-sm">Starting from</p>
                    <p className="text-2xl font-bold text-white">Ksh 249,900</p>
                  </div>
                  <Link
                    href="/education"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all"
                  >
                    Start Fundraiser
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Path 2: Tablets & Device Management */}
            <div className="relative bg-white rounded-3xl border-2 border-gray-100 overflow-hidden shadow-lg">
              <div className="p-8">
                {/* Title */}
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                  School <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">Tablets</span>
                </h3>
                <p className="text-blue-600 font-medium mb-4">Managed learning devices</p>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                  Equip students with tablets managed through our Mwalimu Masomo platform. Full control, content filtering, and Knox security included.
                </p>

                {/* Platform Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-900 text-sm">Mwalimu Masomo</p>
                    <p className="text-xs text-gray-500">Content management</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-900 text-sm">Knox Guard</p>
                    <p className="text-xs text-gray-500">Device protection</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Remote device management</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Content filtering & app control</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Usage analytics & reporting</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-gray-500 text-sm">Platform subscription</p>
                    <p className="text-2xl font-bold text-gray-900">Ksh 15<span className="text-base font-normal text-gray-500">/device/mo</span></p>
                  </div>
                  <Link
                    href="/education"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Learn More
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise DaaS */}
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Enterprise Solutions</h2>
              <p className="text-gray-600">Device as a Service bundles for corporates</p>
            </div>
            <Link href="/enterprise" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseBundles.length > 0 ? (
              enterpriseBundles.map((bundle) => (
                <div key={bundle.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  {/* Product Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    {bundle.product?.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={bundle.product.image}
                        alt={bundle.product.name}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <BuildingOffice2Icon className="w-24 h-24 text-gray-300" />
                    )}
                  </div>

                  {/* Bundle Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                    <p className="text-gray-600 mb-4">{bundle.product?.name || 'Enterprise Device'}</p>

                    {/* Perks */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">{bundle.data_gb}GB</p>
                        <p className="text-xs text-red-600">Data</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">{bundle.minutes}</p>
                        <p className="text-xs text-red-600">Minutes</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">{bundle.minimum_quantity}+</p>
                        <p className="text-xs text-red-600">Min Qty</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        Ksh {parseFloat(bundle.price_per_device).toLocaleString()}
                      </span>
                      <span className="text-gray-500">/device/month</span>
                    </div>

                    {/* Action */}
                    <Link
                      href={`/telco-contracts/${bundle.id}`}
                      className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-center font-medium rounded-xl hover:from-red-700 hover:to-red-600 transition-all"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Fallback to static data
              featuredProducts.enterprise.map((bundle) => (
                <div key={bundle.name} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <BuildingOffice2Icon className="w-24 h-24 text-gray-300" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{bundle.name}</h3>
                    <p className="text-gray-600 mb-4">Galaxy S25 Ultra Enterprise</p>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">{bundle.data}</p>
                        <p className="text-xs text-red-600">Data</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">{bundle.minutes}</p>
                        <p className="text-xs text-red-600">Minutes</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">{bundle.moq}+</p>
                        <p className="text-xs text-red-600">Min Qty</p>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        Ksh {bundle.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500">/device/month</span>
                    </div>
                    <Link
                      href="/telco-contracts"
                      className="block w-full py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-center font-medium rounded-xl hover:from-red-700 hover:to-red-600 transition-all"
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solutions for Everyone
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re an individual, business, or educational institution, 
              we have the right solution for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution) => (
              <Link
                key={solution.title}
                href={solution.href}
                className="group relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:border-transparent transition-all duration-300"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {solution.title}
                </h3>

                <p className="text-gray-600 mb-6">
                  {solution.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="inline-flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                  Learn more
                  <ArrowRightIcon className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-500" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have transformed their technology experience with TepStore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/msme"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all"
            >
              Apply for Financing
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              href="/enterprise"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 mb-8">Trusted partners</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50">
            <div className="h-8 w-24 bg-gray-400 rounded" />
            <div className="h-8 w-28 bg-gray-400 rounded" />
            <div className="h-8 w-20 bg-gray-400 rounded" />
            <div className="h-8 w-32 bg-gray-400 rounded" />
            <div className="h-8 w-24 bg-gray-400 rounded" />
          </div>
        </div>
      </section>
    </div>
  );
}
