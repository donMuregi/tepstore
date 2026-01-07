'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store-context';
import { 
  ShoppingCartIcon, 
  UserIcon, 
  Bars3Icon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'Financing', 
    href: '/financing',
    hasDropdown: true,
    children: [
      { name: 'Financing', href: '/financing' },
      { name: 'BNPL', href: '/bnpl' },
      { name: 'Education', href: '/education' },
    ]
  },
  { name: 'Telco Contracts', href: '/telco-contracts' },
  { name: 'Online Exclusive', href: '/shop' },
];

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const prevCartCount = useRef<number>(0);
  const { cart, user, isAuthenticated, logout } = useStore();

  // Show popup when cart count increases
  useEffect(() => {
    if (cart && cart.item_count > prevCartCount.current && prevCartCount.current >= 0) {
      setShowCartPopup(true);
      const timer = setTimeout(() => {
        setShowCartPopup(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cart?.item_count || 0;
  }, [cart?.item_count]);

  // Also listen for custom cartUpdated event
  useEffect(() => {
    const handleCartUpdated = () => {
      setShowCartPopup(true);
      setTimeout(() => setShowCartPopup(false), 4000);
    };
    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/tepstore logo.png" 
                alt="TepStore" 
                width={150} 
                height={50}
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-x-6">
            {navigation.map((item) => (
              item.hasDropdown ? (
                <div key={item.name} className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">
                    {item.name}
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border border-gray-100 z-50">
                    {item.children?.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex max-w-xs mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for phones, tablets..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            {/* Cart */}
            <div className="relative">
              <Link
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors block"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                {cart && cart.item_count > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-blue-600 text-white text-xs font-medium rounded-full">
                    {cart.item_count}
                  </span>
                )}
              </Link>

              {/* Cart Added Popup */}
              {showCartPopup && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Added to cart!</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {cart?.item_count} {cart?.item_count === 1 ? 'item' : 'items'} in your cart
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCartPopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setShowCartPopup(false)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <Link
                      href="/cart"
                      onClick={() => setShowCartPopup(false)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-center"
                    >
                      View Cart
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                My Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
              >
                Sign in
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for phones, tablets..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                autoFocus
              />
            </form>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold">TepStore</span>
              </Link>
              <button
                type="button"
                className="p-2 text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b">
              <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </form>
            </div>

            <div className="py-4">
              {navigation.map((item) => (
                item.hasDropdown ? (
                  <div key={item.name} className="border-b border-gray-100">
                    <div className="px-6 py-3 text-base font-medium text-gray-500">
                      {item.name}
                    </div>
                    {item.children?.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-8 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
            </div>

            <div className="border-t px-6 py-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <Link
                    href="/account"
                    className="block py-2 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    className="block py-2 text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="block py-2 text-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full py-3 bg-blue-600 text-white text-center rounded-full font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
