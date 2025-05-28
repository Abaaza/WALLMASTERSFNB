import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Image,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../src/store";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
} from "../src/redux/cartReducer";
import { getUserId } from "../src/ProfileScreens/authUtils";

const SHIPPING_COST = 70;
const FREE_SHIPPING_THRESHOLD = 2000;

const convertToArabicNumerals = (input: number): string => {
  return input
    .toString()
    .replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[parseInt(digit, 10)]);
};

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const CartPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [userId, setUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    const uid = getUserId();
    setUserId(uid);
    setIsGuest(!uid);
    if (!uid) {
      onOpen();
    } else {
      onClose();
    }
  }, [onOpen, onClose]);

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shippingCost =
    totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const grandTotal = totalPrice + shippingCost;

  const formatAndConvertNumber = (number: number) => {
    return i18n.language === "ar"
      ? convertToArabicNumerals(number)
      : number.toLocaleString();
  };

  // Page-level background
  const pageBg = "#f2f2f2"; // Off-white background

  return (
    <Box minH="100vh" bg={pageBg} p={8} w="100%">
      <AnimatePresence>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          p={5}
          borderRadius="md"
          boxShadow="lg"
          bg="white"
          // Use full width on large screens; small padding on mobile
          w="100%"
        >
          <Heading as="h1" mb={4}>
            {t("title")}
          </Heading>
          {cart.length === 0 ? (
            <Text fontSize="lg" mb={4}>
              {t("emptyMessage")}
            </Text>
          ) : (
            <MotionVStack
              spacing={4}
              align="stretch"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    when: "beforeChildren",
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {cart.map((item) => (
                <MotionBox
                  key={`${item.id}-${item.size}`}
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  boxShadow="md"
                  bg="white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <HStack spacing={4} align="center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="start" spacing={2} flex="1">
                      <Heading size="md">
                        {t(`products.${item.name}`, item.name)}
                      </Heading>
                      <Text>
                        {t("sizeLabel")}: {t(`sizes.${item.size}`, item.size)}
                      </Text>
                      <Text fontWeight="500" color="#ff6347">
                        {t("priceLabel")}: {formatAndConvertNumber(item.price)}{" "}
                        {t("currency")}
                      </Text>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          onClick={() =>
                            dispatch(
                              decrementQuantity({
                                id: item.id,
                                size: item.size,
                              })
                            )
                          }
                        >
                          -
                        </Button>
                        <Text>
                          {t("qtyLabel")}:{" "}
                          {formatAndConvertNumber(item.quantity)}
                        </Text>
                        <Button
                          size="sm"
                          onClick={() =>
                            dispatch(
                              incrementQuantity({
                                id: item.id,
                                size: item.size,
                              })
                            )
                          }
                        >
                          +
                        </Button>
                        <IconButton
                          aria-label={t("removeItem")}
                          icon={<FaTrash />}
                          colorScheme="red"
                          size="sm"
                          onClick={() =>
                            dispatch(
                              removeFromCart({ id: item.id, size: item.size })
                            )
                          }
                        />
                      </HStack>
                    </VStack>
                  </HStack>
                </MotionBox>
              ))}

              <Box
                w="full"
                pt={4}
                borderTopWidth="1px"
                mt={4}
                textAlign="right"
              >
                <Text fontSize="lg" fontWeight="600">
                  {t("subtotal")}: {formatAndConvertNumber(totalPrice)}{" "}
                  {t("currency")}
                </Text>
                <Text fontSize="lg" fontWeight="500">
                  {t("shipping")}:{" "}
                  {shippingCost === 0
                    ? t("eligibleForFreeShipping")
                    : `${formatAndConvertNumber(shippingCost)} ${t("currency")}`}
                </Text>
                <Text fontSize="lg" fontWeight="700" color="#ff6347">
                  {t("total")}: {formatAndConvertNumber(grandTotal)}{" "}
                  {t("currency")}
                </Text>
              </Box>
              <Button
                bg="#ff6347"
                color="white"
                w={{ base: "100%", md: "50%" }}
                _hover={{ bg: "#ff745c" }}
                onClick={() => navigate("/checkout")}
                size="md"
                alignSelf="center"
              >
                {t("proceedToCheckout")}
              </Button>
            </MotionVStack>
          )}
        </MotionBox>
      </AnimatePresence>

      {/* Modal for guest users */}
      <Modal isOpen={isOpen && isGuest} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("betterExperienceTitle")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{t("betterExperienceMessage")}</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              bg="orange.400"
              color="white"
              _hover={{ bg: "orange.500" }}
              mr={3}
              onClick={() => navigate("/register")}
            >
              {t("register")}
            </Button>
            <Button colorScheme="gray" onClick={onClose}>
              {t("continueAsGuest")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CartPage;
