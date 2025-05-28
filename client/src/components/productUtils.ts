import { Variant, Product } from "./types"; // Import the Variant and Product types
import { useMemo } from "react";
import useTranslatedProducts from "./product"; // Hook to get translated products
import i18n from "../assets/i18n"; // Import your i18n instance

// Function to get the display price range with fallback to numeric price if displayPrice is missing
export function getDisplayPriceRange(variants: Variant[]): { min: string; max: string } {
  if (variants.length === 0) {
    return { min: "0", max: "0" }; // Return zero range if no variants
  }

  // Check if the current language is Arabic
  const isArabic = i18n.language === "ar";

  // Convert display prices to numbers for comparison, fallback to numeric price if displayPrice is missing
  const displayPrices = variants.map(variant => {
    const priceStr = variant.displayPrice || variant.price.toString(); // Use numeric price as fallback
    return parseFloat(
      priceStr.replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))) // Convert Arabic numerals if necessary
    );
  });

  // Calculate minimum and maximum prices
  const min = Math.min(...displayPrices);
  const max = Math.max(...displayPrices);

  // Format prices back to Arabic or English numerals based on locale
  const minFormatted = isArabic
    ? min.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)])
    : min.toString();
  const maxFormatted = isArabic
    ? max.toString().replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)])
    : max.toString();

  return { min: minFormatted, max: maxFormatted };
}

// Function to get the price range using numerical prices
export function getPriceRange(variants: Variant[]): { min: number; max: number } {
  if (variants.length === 0) {
    return { min: 0, max: 0 }; // Return zero range if no variants
  }

  const prices = variants.map((variant) => variant.price); // Use the numeric price for calculations

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

// Function to get unique sizes from the product variants
export function getSizes(variants: Variant[]): string[] {
  const sizes = variants.map((variant) => variant.size);
  return Array.from(new Set(sizes));
}

// Function to get the count of unique sizes from product variants
export function getUniqueSizeCount(variants: Variant[]): number {
  const sizes = variants.map((variant) => variant.size);
  return new Set(sizes).size;
}

// Function to get unique themes from the product list
export const getUniqueThemes = (products: Product[]): string[] => {
  const themes = products.map((product) => product.theme);
  return Array.from(new Set(themes));
};

// Custom hook to get color filters and three-piece options for product filtering
export const useProductFilters = () => {
  const { translatedProducts, loading } = useTranslatedProducts(); // Destructure the result

  const colors = useMemo(() => {
    if (loading) return []; // Return an empty array if still loading
    const allColors = translatedProducts.flatMap((product: Product) => product.color); // Explicitly type product
    return Array.from(new Set(allColors));
  }, [translatedProducts, loading]);

  const threePOptions = useMemo(
    () => [
      { value: "Yes", label: "3 pieces" },
      { value: "No", label: "1 Piece" },
    ],
    []
  );

  return { colors, threePOptions };
};