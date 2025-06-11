'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Heart, Truck, Shield, RotateCcw, ChevronLeft, Minus, Plus } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { Separator } from '@/components/ui/separator';

export default function ProductDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch('/data/products.json');
        const products: Product[] = await response.json();
        const foundProduct = products.find(p => p.id === params.id);
        
        if (foundProduct) {
          setProduct(foundProduct);
          
          // Set default variants
          const defaultVariants: { [key: string]: string } = {};
          foundProduct.options.forEach(option => {
            const firstAvailableVariant = foundProduct.variants[option.name]?.find(v => v.inStock);
            if (firstAvailableVariant) {
              defaultVariants[option.name] = firstAvailableVariant.id;
            }
          });
          setSelectedVariants(defaultVariants);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-xl h-96"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Button onClick={() => router.push('/')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleVariantChange = (optionName: string, variantId: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [optionName]: variantId
    }));
  };

  const handleAddToCart = () => {
    addToCart(product, selectedVariants, quantity);
  };

  const getCurrentPrice = () => {
    let price = product.basePrice;
    Object.entries(selectedVariants).forEach(([optionName, variantId]) => {
      const variant = product.variants[optionName]?.find(v => v.id === variantId);
      if (variant) {
        price = variant.price;
      }
    });
    return price;
  };

  const getCurrentOriginalPrice = () => {
    let originalPrice = null;
    Object.entries(selectedVariants).forEach(([optionName, variantId]) => {
      const variant = product.variants[optionName]?.find(v => v.id === variantId);
      if (variant && variant.originalPrice) {
        originalPrice = variant.originalPrice;
      }
    });
    return originalPrice;
  };

  const isCurrentVariantInStock = () => {
    return Object.entries(selectedVariants).every(([optionName, variantId]) => {
      const variant = product.variants[optionName]?.find(v => v.id === variantId);
      return variant && variant.inStock;
    });
  };

  const currentPrice = getCurrentPrice();
  const originalPrice = getCurrentOriginalPrice();
  const hasDiscount = originalPrice && originalPrice > currentPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8 text-sm text-gray-600">
        <button onClick={() => router.push('/')} className="hover:text-blue-600">
          Products
        </button>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              fill
              className="object-cover"
            />
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                Sale
              </Badge>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm font-medium ml-1">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-600">
                {product.reviewCount} reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">${currentPrice}</span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">${originalPrice}</span>
              )}
              {hasDiscount && (
                <Badge className="bg-red-500 text-white">
                  Save ${originalPrice! - currentPrice}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            {product.options.map(option => (
              <div key={option.name}>
                <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                  {option.name}: {product.variants[option.name]?.find(v => v.id === selectedVariants[option.name])?.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants[option.name]?.map(variant => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(option.name, variant.id)}
                      disabled={!variant.inStock}
                      className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                        selectedVariants[option.name] === variant.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : variant.inStock
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {variant.name}
                      {!variant.inStock && (
                        <span className="text-xs block">Out of Stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-10 w-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-10 w-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={!isCurrentVariantInStock()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {isCurrentVariantInStock() ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button variant="outline" size="lg" className="p-3">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {/* Features */}
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Free Shipping</p>
                <p className="text-xs text-gray-600">Orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Warranty</p>
                <p className="text-xs text-gray-600">1 year coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-sm">Returns</p>
                <p className="text-xs text-gray-600">30 day policy</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}