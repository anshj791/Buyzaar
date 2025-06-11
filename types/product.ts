export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  image?: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  images: string[];
  variants: {
    [key: string]: ProductVariant[];
  };
  options: ProductOption[];
  rating: number;
  reviewCount: number;
  tags: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  selectedVariants: { [key: string]: string };
  quantity: number;
  price: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}