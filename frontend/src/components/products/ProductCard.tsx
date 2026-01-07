'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  type: 'msme' | 'enterprise' | 'shop';
  href?: string;
}

export default function ProductCard({ product, type, href }: ProductCardProps) {
  const productLink = href || `/${type}/${product.slug}`;
  
  const buttonText = {
    msme: 'Apply for Financing',
    enterprise: 'View Product',
    shop: 'View Details',
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'Ksh',
    }).format(parseFloat(price));
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.sale_price && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              Sale
            </span>
          )}
          {product.is_featured && (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              Featured
            </span>
          )}
          {product.is_unique_variant && type === 'shop' && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-medium rounded-full">
              Online Exclusive
            </span>
          )}
        </div>

        {/* Stock Status */}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-4 py-2 bg-white/90 text-gray-900 text-sm font-medium rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(product.current_price)}
          </span>
          {product.sale_price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* MSME specific - Monthly payment preview */}
        {type === 'msme' && (
          <p className="text-sm text-gray-600 mb-4">
            From <span className="font-semibold text-blue-600">{formatPrice((parseFloat(product.current_price) / 12).toFixed(2))}</span>/month
          </p>
        )}

        {/* Action Button */}
        <Link
          href={productLink}
          className={`block w-full py-3 text-center font-medium rounded-xl transition-all duration-200 bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-md hover:shadow-lg ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {buttonText[type]}
        </Link>
      </div>
    </div>
  );
}
