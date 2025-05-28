// src/types.ts
export interface Variant {
  
  id: string;
  size: string;
  price: number;
  displayPrice?: string; // Add this property to match your usage
}

export interface Product {
  id: string;
  name: string;
  description: string;
  color: string[];
  theme: string;
  threePiece: string;

  bestSeller: boolean;
  featured: boolean; // Add this line




  images: string[];
  variants: Variant[];
  priceRange?: PriceRange;             // Allow priceRange to be an object or undefined
  displayPriceRange?: DisplayPriceRange; // Adjust type to match { min: string; max: string }
  sizes?: string[];                    // Optional array for sizes
  sizeCount?: number;        
}

export interface SavedItem {
  productId: string;
  userId: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface DisplayPriceRange {
  min: string;
  max: string;}
