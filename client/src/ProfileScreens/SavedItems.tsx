import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Spinner,
  SimpleGrid,
  Center,
  useToast,
  useColorModeValue,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import SavedProductCard from "../components/SavedProductCard";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  getPriceRange,
  getSizes,
  getDisplayPriceRange,
} from "../components/productUtils";
import useTranslatedProducts from "../components/product";
import { SavedItem, Product } from "../components/types";

interface EnrichedProduct extends Product {
  priceRange: { min: number; max: number };
  displayPriceRange: { min: string; max: string };
  sizes: string[];
  sizeCount: number;
}

const SavedItems: React.FC = () => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<EnrichedProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const { translatedProducts } = useTranslatedProducts();

  const userId =
    useSelector((state: RootState) => state.user.userId) ||
    localStorage.getItem("userId") ||
    "";
  const cleanedUserId = userId.replace(/["\\]/g, "");
  const token = localStorage.getItem("authToken");

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const loadingColor = useColorModeValue("blue.500", "blue.200");

  useEffect(() => {
    if (!cleanedUserId || !token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to view saved items.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get<Product[]>(
          `${API_BASE_URL}/products`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAllProducts(response.data);
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Error",
          description: "Failed to load products.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const fetchSavedItems = async () => {
      try {
        const response = await axios.get<SavedItem[]>(
          `${API_BASE_URL}/saved-items/${cleanedUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedItems(response.data);
      } catch (error) {
        console.error("Error loading saved items:", error);
        toast({
          title: "Error",
          description: "Failed to load saved items.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchSavedItems()]);
      setLoading(false);
    };

    initializeData();
  }, [toast, navigate, cleanedUserId, token]);

  useEffect(() => {
    if (allProducts.length > 0 && savedItems.length > 0) {
      const savedProductIds = new Set(savedItems.map((item) => item.productId));
      const enrichedProducts = allProducts
        .filter((product) => savedProductIds.has(product.id))
        .map((product) => {
          const translatedProduct = translatedProducts.find(
            (tp) => tp.id === product.id
          );
          const name = translatedProduct
            ? translatedProduct.name
            : product.name;

          // Get values and assert their types
          const productWithPrices = {
            ...product,
            name,
            priceRange: getPriceRange(product.variants),
            displayPriceRange: getDisplayPriceRange(product.variants),
            sizes: getSizes(product.variants),
            sizeCount: getSizes(product.variants).length,
          } as EnrichedProduct;

          return productWithPrices;
        });

      setFilteredProducts(enrichedProducts);
    }
  }, [allProducts, savedItems, translatedProducts]);

  const handleRemove = async (productId: string) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/saved-items/${cleanedUserId}/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedItems((prevItems) =>
        prevItems.filter((item) => item.productId !== productId)
      );
      toast({
        title: "Item Removed",
        description: "The item was removed from your saved items.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting saved item:", error);
      toast({
        title: "Error",
        description: "Failed to remove the item from saved items.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center bg={bgColor} color={textColor} minH="80vh" flexDirection="column">
        <Spinner size="xl" color={loadingColor} />
        <Text mt={4} fontSize="lg">
          Loading saved items...
        </Text>
      </Center>
    );
  }

  return (
    <Box p={5} bg={bgColor} minH="80vh">
      <Heading as="h1" size="lg" mb={4} color={textColor}>
        My Saved Items
      </Heading>
      {filteredProducts.length === 0 ? (
        <Center>
          <Text fontSize="lg" color="gray.500">
            No saved items found.
          </Text>
        </Center>
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4 }} spacing={5}>
          {filteredProducts.map((item) => (
            <SavedProductCard
              key={item.id}
              name={item.name}
              image={item.images[0] || "https://via.placeholder.com/150"}
              priceRange={item.priceRange}
              displayPriceRange={item.displayPriceRange}
              sizes={item.sizes}
              sizeCount={item.sizeCount}
              onClick={() => navigate(`/product/${item.id}`)}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default SavedItems;
