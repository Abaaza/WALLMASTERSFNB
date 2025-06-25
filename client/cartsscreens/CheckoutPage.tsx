import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Image,
  HStack,
  Spinner,
  Center,
  useToast,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RootState } from "../src/store";
import { getUserId, getAuthToken } from "../src/ProfileScreens/authUtils";
import { API_BASE_URL } from "../src/api";

const SHIPPING_COST = 70;
const FREE_SHIPPING_THRESHOLD = 2000;

type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
};

interface Address {
  _id: string;
  name: string;
  email?: string;
  mobileNo: string;
  houseNo: string;
  street: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
}

const MotionBox = motion(Box);

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const cart = useSelector(
    (state: RootState) => state.cart.cart ?? []
  ) as CartItem[];

  const [userId, setUserId] = useState<string | null>(null);
  const token = getAuthToken();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = total + shippingCost;

  const [loading, setLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const country = "Egypt";

  useEffect(() => {
    const uid = getUserId();
    setUserId(uid);

    const loadUserData = async () => {
      if (!uid || uid === "guest") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/addresses?userId=${uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const addresses = response.data;
        let defaultAddress = addresses.find((addr: Address) => addr.isDefault);

        if (!defaultAddress && addresses.length > 0) {
          defaultAddress = addresses[0];
        }

        if (defaultAddress) {
          setName(defaultAddress.name || "");
          setEmail(defaultAddress.email || "");
          setPhone(defaultAddress.mobileNo || "");
          setAddress1(defaultAddress.houseNo || "");
          setAddress2(defaultAddress.street || "");
          setCity(defaultAddress.city || "");
          setPostalCode(defaultAddress.postalCode || "");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          alert("Session expired. Please log in again.");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [navigate, token]);

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    if (cart.length === 0) {
      toast({
        title: t("cartEmptyError"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsPlacingOrder(true);
    const orderData = {
      userId: userId || "guest",
      totalPrice: grandTotal,
      shippingAddress: {
        houseNo: address1,
        street: address2,
        city,
        postalCode,
        mobileNo: phone,
        name,
        email,
      },
      products: cart.map((item) => ({
        productId: item.id,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { orderId } = response.data.order;

      if (userId && userId !== "guest") {
        const addressData = {
          name,
          email,
          mobileNo: phone,
          houseNo: address1,
          street: address2,
          city,
          postalCode,
          country: "Egypt",
        };

        try {
          await axios.post(
            `${API_BASE_URL}/addresses?userId=${userId}`,
            { address: addressData },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error("Error saving address:", error.response?.data);
            if (error.response?.status !== 409) {
              toast({
                title: "Error",
                description: "Failed to save the address. Please try again.",
                status: "warning",
                duration: 3000,
                isClosable: true,
              });
            }
          }
        }
      }

      navigate("/thank-you", {
        state: {
          orderId,
          shippingCost,
          total: grandTotal,
          subtotal: total,
          cart,
        },
      });
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to place the order:", error.response?.data);
        alert(
          error.response?.data?.message ||
            "Failed to place order. Please try again."
        );
      } else {
        console.error("Non-axios error occurred:", error);
        alert("Failed to place order. Please try again.");
      }
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" />
        <Text mt={4}>{t("loadingAddresses")}</Text>
      </Center>
    );
  }

  const pageBg = "#f2f2f2"; // Slightly off-white background

  return (
    <Box minH="100vh" bg={pageBg} p={8} w="100%">
      <AnimatePresence>
        <MotionBox
          key="checkout-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          p={5}
          borderRadius="md"
          boxShadow="lg"
          bg="white"
          w="100%"
        >
          <Heading as="h1" mb={4}>
            {t("checkout")}
          </Heading>

          <VStack spacing={4} align="stretch">
            {cart.length > 0 ? (
              <>
                {cart.map((item) => (
                  <Box
                    key={item.id}
                    borderWidth="1px"
                    borderRadius="md"
                    p={4}
                    boxShadow="md"
                    bg="white"
                    mb={2}
                  >
                    <HStack spacing={4}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        boxSize="80px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="600" fontSize="lg">
                          {item.name}
                        </Text>
                        <Text>
                          {t("sizeLabel")}: {item.size}
                        </Text>
                        <Text color="#ff6347" fontWeight="500">
                          {t("priceLabel")}: {item.price} {t("currency")}
                        </Text>
                        <Text>
                          {t("qtyLabel")}: {item.quantity}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}

                <Box mt={4}>
                  <Heading size="sm" fontWeight="600">
                    {t("subtotal")}: {total} {t("currency")}
                  </Heading>
                  <Text fontSize="sm" fontWeight="500">
                    {t("shipping")}:{" "}
                    {shippingCost === 0
                      ? t("eligibleForFreeShipping")
                      : `${shippingCost} ${t("currency")}`}
                  </Text>
                  <Heading size="sm" fontWeight="700" color="##ff6347">
                    {t("total")}: {grandTotal} {t("currency")}
                  </Heading>
                </Box>
              </>
            ) : (
              <Text>{t("cart_empty")}</Text>
            )}

            <FormControl isRequired>
              <FormLabel>{t("name")}</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("phone")}</FormLabel>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("email")}</FormLabel>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("address1")}</FormLabel>
              <Input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t("address2")}</FormLabel>
              <Input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>{t("city")}</FormLabel>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </FormControl>

            <FormControl>
              <FormLabel>{t("postalCode")}</FormLabel>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t("country")}</FormLabel>
              <Input value={t("egypt")} isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>{t("paymentMethod")}</FormLabel>
              <Input value={t("cashOnDelivery")} isReadOnly />
            </FormControl>

            <FormControl>
              <FormLabel>{t("shippingDuration")}</FormLabel>
              <Input value={t("businessDays2")} isReadOnly />
            </FormControl>

            <Button
              bg="#ff6347"
              color="white"
              w={{ base: "100%", md: "50%" }}
              _hover={{ bg: "#ff745c" }}
              size="md"
              alignSelf="center"
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || isPlacingOrder}
            >
              {isPlacingOrder ? (
                <Spinner size="sm" color="white" />
              ) : (
                t("placeOrder")
              )}
            </Button>
          </VStack>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};

export default CheckoutPage;
