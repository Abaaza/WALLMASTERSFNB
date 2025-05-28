import i18n from "../assets/i18n";
import { useEffect, useState } from "react";
import { Product } from "./types";

// Helper function to convert numbers to Arabic numerals
const convertToArabicNumbers = (input: string | number): string => {
  const arabicNumbersMap: { [key: string]: string } = {
    "0": "٠",
    "1": "١",
    "2": "٢",
    "3": "٣",
    "4": "٤",
    "5": "٥",
    "6": "٦",
    "7": "٧",
    "8": "٨",
    "9": "٩",
  };

  return input
    .toString()
    .split("")
    .map((char) => arabicNumbersMap[char] || char)
    .join("");
};

// Function to translate product sizes and prices
const translateProduct = (product: Product): Product => {
  const translatedName = i18n.t(`products.${product.name}`);
  const translatedVariants = product.variants.map((variant) => {
    let translatedSize = variant.size
      .replace("pieces", i18n.t("pieces"))
      .replace("each", i18n.t("each"));

    let displayPrice = variant.price.toString();
    if (i18n.language === "ar") {
      translatedSize = convertToArabicNumbers(translatedSize);
      displayPrice = convertToArabicNumbers(displayPrice);
    }

    return { ...variant, size: translatedSize, displayPrice };
  });

  return { ...product, name: translatedName, variants: translatedVariants };
};

// Hook to fetch and translate products
const useTranslatedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [translatedProducts, setTranslatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch products only once on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/products"
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
          setTranslatedProducts(data.map(translateProduct)); // Translate immediately on fetch
        } else {
          console.error("Fetched data is not an array:", data);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array to fetch only on mount

  // Re-translate products when the language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setTranslatedProducts(products.map(translateProduct));
    };

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [products]); // Only depend on `products` so it only translates on language change

  return { translatedProducts, loading };
};

export default useTranslatedProducts;
