import { Product } from '@/types/product';
import ProductDetailClient from './ProductDetailClient';

// This function generates static params for all products
export async function generateStaticParams() {
  try {
    // In production, you might want to fetch this from an API
    // For now, we'll read the JSON file during build time
    const fs = require('fs');
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'public', 'data', 'products.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const products: Product[] = JSON.parse(fileContents);
    
    return products.map((product) => ({
      id: product.id,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    // Return empty array to allow dynamic generation
    return [];
  }
}

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailClient />;
}