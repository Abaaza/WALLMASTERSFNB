import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Image,
  Heading,
  Select,
  Text,
  Button,
  SimpleGrid,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  Center,
  Flex,
  Spinner,
  useToast,
  InputRightElement,
  InputGroup,
  Container,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { API_BASE_URL } from "../api";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/cartReducer";
import DesktopProductSlider from "./DesktopProductSlider";
import MobileProductSlider from "./MobileProductSlider";
import { useTranslation } from "react-i18next";
import useTranslatedProducts from "./product";
import { Variant } from "./types";

// Framer Motion import
import { motion } from "framer-motion";

// Reusable Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionImage = motion(Image);

const ProductPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { translatedProducts, loading } = useTranslatedProducts();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>();
  const [isSaved, setIsSaved] = useState(false);
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const product = translatedProducts.find((prod) => prod.id === id);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const descriptionBg = useColorModeValue("gray.50", "gray.700");

  const selectBg = useColorModeValue("gray.100", "gray.800");
  const selectTextColor = useColorModeValue("gray.800", "gray.200");
  const selectBorderColor = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0] || "");
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const fetchSavedItems = async () => {
    const userId = localStorage.getItem("userId")?.replace(/"/g, "");
    if (!userId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/saved-items/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const items = response.data.map(
        (item: { productId: string }) => item.productId
      );
      setSavedItems(items);
    } catch (error) {
      console.error("Error fetching saved items:", error);
    }
  };

  useEffect(() => {
    setIsSaved(false);
    fetchSavedItems();
  }, [id]);

  useEffect(() => {
    if (savedItems.includes(id || "")) {
      setIsSaved(true);
    }
  }, [savedItems, id]);

  const handleVariantChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const variant = product?.variants.find((v) => v.id === event.target.value);
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast({
        title: t("variantSelectError"),
        description: t("pleaseSelectVariant"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    dispatch(
      addToCart({
        id: `${product.id}-${selectedVariant.id}`,
        name: product.name,
        size: selectedVariant.size,
        price: selectedVariant.price,
        image: selectedImage,
        quantity: 1,
      })
    );

    toast({
      title: t("addedToCart"),
      description: t("itemAdded"),
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSaveForLater = async () => {
    const userId = localStorage.getItem("userId")?.replace(/"/g, "");
    if (!userId) {
      toast({
        title: t("loginRequired"),
        description: t("pleaseLogInToSave"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const productData = {
      productId: id,
      name: product?.name || "",
      price: selectedVariant?.price || 0,
      images: [selectedImage || product?.images[0] || ""],
    };

    try {
      await axios.post(
        `${API_BASE_URL}/save-for-later/${userId}`,
        { product: productData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      setIsSaved(true);
      setSavedItems([...savedItems, id || ""]);
      toast({
        title: t("savedForLater"),
        description: t("itemSaved"),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: t("saveFailed"),
        description: t("itemNotSaved"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center h="100vh" flexDirection="column">
        <Spinner color="#ff6347" thickness="4px" size="xl" />
      </Center>
    );
  }

  if (!product) {
    return (
      <Center h="100vh" flexDirection="column">
        <Text fontSize="2xl" fontWeight="600" mb={2}>
          {t("productNotFound")}
        </Text>
        <MotionButton
          onClick={() => navigate("/")}
          bg="#ff6347"
          color="white"
          _hover={{ bg: "#ff7b61" }}
          mt={4}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {t("goToHome")}
        </MotionButton>
      </Center>
    );
  }

  return (
    <Box p={4}>
      {/* Back Button */}
      <MotionButton
        onClick={() => navigate(-1)}
        mb={4}
        mt={2}
        size="sm"
        maxW="120px"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {t("backButton")}
      </MotionButton>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 10 }}>
        {/* Left Column - Product Images */}
        <VStack align="stretch" spacing={4}>
          <Box position="relative" maxW={{ base: "100%", md: "100%" }}>
            <MotionButton
              aria-label={t("saveForLater")}
              leftIcon={<FaHeart />}
              bg={isSaved ? "#ff6347" : "rgba(128, 128, 128, 0.7)"}
              color="white"
              position="absolute"
              top={3}
              right={3}
              size="xs"
              fontSize="xs"
              h="28px"
              maxW="110px"
              onClick={handleSaveForLater}
              disabled={isSaved}
              _hover={{
                bg: isSaved ? "#ff6347" : "rgba(128, 128, 128, 0.8)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              zIndex="1"
            >
              {isSaved ? t("saved") : t("saveForLater")}
            </MotionButton>

            <MotionImage
              src={selectedImage}
              alt={product.name}
              maxW="100%"
              height="auto"
              objectFit="contain"
              mb={4}
              loading="lazy"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              // Image fade-in
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          </Box>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <Flex wrap="wrap" gap="10px">
              {product.images.map((image, index) => (
                <MotionBox
                  key={index}
                  role="button"
                  aria-label={`Select image ${index + 1}`}
                  position="relative"
                  width="80px"
                  height="80px"
                  overflow="hidden"
                  borderRadius="md"
                  border={
                    selectedImage === image ? "2px solid #ff6347" : "none"
                  }
                  boxShadow={
                    selectedImage === image
                      ? "0 0 10px rgba(255, 99, 71, 0.5)"
                      : "none"
                  }
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedImage(image)}
                  cursor="pointer"
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    boxSize="100%"
                    objectFit="cover"
                  />
                </MotionBox>
              ))}
            </Flex>
          )}
        </VStack>

        {/* Right Column - Product Info */}
        <MotionBox
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading as="h1" fontSize={{ base: "xl", md: "2xl" }} mb={3}>
            {product.name}
          </Heading>

          <Box position="relative" mb={4} w="100%">
            <InputGroup>
              <Select
                placeholder={t("selectSize")}
                onChange={handleVariantChange}
                value={selectedVariant?.id || ""}
                bg={selectBg}
                color={selectTextColor}
                borderColor={selectBorderColor}
                iconSize="0"
                fontWeight="500"
                fontSize="m"
                textAlign={isRTL ? "right" : "left"}
                sx={{
                  direction: isRTL ? "rtl" : "ltr",
                  paddingRight: isRTL ? "1rem" : "2rem",
                  paddingLeft: isRTL ? "2rem" : "1rem",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                {product.variants.map((variant) => (
                  <option
                    key={variant.id}
                    value={variant.id}
                    style={{ fontWeight: "500", fontSize: "14px" }}
                  >
                    {variant.size} - {variant.displayPrice} {t("currency")}
                  </option>
                ))}
              </Select>
              <InputRightElement
                pointerEvents="none"
                children={<ChevronDownIcon color="gray.400" />}
                style={{
                  position: "absolute",
                  right: isRTL ? "auto" : "1rem",
                  left: isRTL ? "1rem" : "auto",
                }}
              />
            </InputGroup>
          </Box>

          {selectedVariant && (
            <>
              <Text fontWeight="600" color="#ff7b61" mb={1}>
                {t("freeShipping2000")}
              </Text>
              <Text fontWeight="600" mb={1}>
                {t("selectedSize", { size: selectedVariant.size })}
              </Text>
              <Text fontWeight="600" mb={1}>
                {t("price")} {selectedVariant.displayPrice} {t("currency")}
              </Text>
              <Text fontWeight="600" mb={4}>
                {t("material")}
              </Text>

              <MotionButton
                bg="#ff6347"
                color="white"
                w="full"
                _hover={{ bg: "#ff7b61" }}
                onClick={handleAddToCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {t("addToCart")}
              </MotionButton>
            </>
          )}

          {/* Description */}
          <Container
            p={4}
            borderWidth="1px"
            borderRadius="md"
            boxShadow="md"
            bg={descriptionBg}
            maxW="100%"
            mt={6}
          >
            <Text fontSize={{ base: "md", md: "lg" }}>
              <Text as="h2" textAlign="center" fontWeight="600" mb={3}>
                {t("productDescription")}
              </Text>
              <ul
                style={{
                  paddingLeft: "20px",
                  paddingRight: "10px",
                  listStyleType: "disc",
                }}
              >
                <li>{t("highDefinition")}</li>
                <li>{t("forRooms")}</li>
                <li>{t("professionalStretching")}</li>
                <li>{t("bestQuality")}</li>
                <li>{t("frameThickness")}</li>
                <li>{t("packaging")}</li>
              </ul>
              <Text as="h2" textAlign="center" fontWeight="600" mb={3} mt={5}>
                {t("warmAttention")}
              </Text>
              <ul
                style={{
                  paddingLeft: "20px",
                  paddingRight: "10px",
                  listStyleType: "disc",
                }}
              >
                <li>{t("colorDifference")}</li>
                <li>{t("measureWall")}</li>
              </ul>
            </Text>
          </Container>
        </MotionBox>
      </SimpleGrid>

      {/* Related Products Section */}
      <MotionBox
        textAlign="center"
        mt={10}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Heading as="h2" size="lg" mb={4}>
          {t("topSellers")}
        </Heading>
        <Flex mt={6} position="relative">
          {isMobile ? <MobileProductSlider /> : <DesktopProductSlider />}
        </Flex>
      </MotionBox>
    </Box>
  );
};

export default ProductPage;
