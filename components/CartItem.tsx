'use client';

import React from 'react';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.productId, item.selectedVariants);
    } else {
      updateQuantity(item.productId, item.selectedVariants, newQuantity);
    }
  };

  const formatVariants = () => {
    return Object.entries(item.selectedVariants).map(([key, value]) => {
      const variant = item.product.variants[key]?.find(v => v.id === value);
      return variant ? `${key}: ${variant.name}` : '';
    }).filter(Boolean).join(', ');
  };

  const subtotal = item.price * item.quantity;

  return (
    <div className="flex items-center gap-4 py-6 border-b border-gray-200 last:border-b-0">
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{item.product.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{formatVariants()}</p>
        <p className="text-lg font-bold text-gray-900 mt-2">${item.price}</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <span className="w-12 text-center font-medium">{item.quantity}</span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="font-bold text-gray-900">${subtotal.toFixed(2)}</p>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => removeFromCart(item.productId, item.selectedVariants)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}