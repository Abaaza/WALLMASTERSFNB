import React from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Image,
  VStack,
  Badge,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  useColorModeValue,
  Text,
  Button,
  useBreakpointValue,
  useDisclosure,
  Spacer,
  Select,
  Fade,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart, FaBars, FaTimes, FaUser } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../store"; // Adjust if needed
import logo from "../assets/logo.png";
import ColorModeSwitch from "./ColorModeSwitch";
import { ChevronDownIcon } from "@chakra-ui/icons";

// Helper function to convert numbers to Arabic numerals based on language
const toArabicNumerals = (number: number, isArabic: boolean): string => {
  if (!isArabic) return number.toString();

  const arabicNumerals = "٠١٢٣٤٥٦٧٨٩";
  return number
    .toString()
    .split("")
    .map((digit) => arabicNumerals[parseInt(digit, 10)])
    .join("");
};

// Define a type for items in the cart
type CartItem = {
  image: string;
  name: string;
  price: number;
  quantity: number;
};

const MotionBox = motion(Box);
const MotionPopoverContent = motion(PopoverContent);

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure(); // For mobile menu
  const desktopCartPopover = useDisclosure(); // For desktop cart popover
  const mobileCartPopover = useDisclosure(); // For mobile cart popover
  const { t, i18n } = useTranslation();

  // Track the cart state directly with useSelector, ensuring it watches for updates
  const cart = useSelector((state: RootState) => state.cart.cart) as CartItem[];

  const isMobile = useBreakpointValue({ base: true, md: false });
  const isArabic = i18n.language === "ar"; // Check if the current language is Arabic

  // Calculate total items and price from Redux cart items
  const totalItems = cart.reduce(
    (acc: number, item: CartItem) => acc + item.quantity,
    0
  );
  const totalPrice = cart.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.quantity,
    0
  );

  const handleLogoClick = () => {
    navigate("/");
    if (isOpen) onClose();
  };

  const handleCartClick = () => {
    navigate("/cart");
    if (isOpen) onClose();
    desktopCartPopover.onClose();
    mobileCartPopover.onClose();
  };

  const handleProfileClick = () => {
    navigate("/profile");
    if (isOpen) onClose();
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
    if (isOpen) onClose();
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    i18n.changeLanguage(event.target.value);
  };

  const bgGradient = useColorModeValue(
    "linear(to-r, rgb(26, 23, 22), rgb(32, 27, 27))",
    "linear(to-r, rgb(18, 16, 15), rgb(24, 20, 20))"
  );
  const badgeTextColor = useColorModeValue("white", "gray.800");

  const renderCartContent = (popoverOnClose: () => void) => (
    <MotionPopoverContent
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.800", "white")}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <PopoverArrow />
      <PopoverCloseButton onClick={popoverOnClose} />
      <PopoverBody>
        {cart.length === 0 ? (
          <Text fontWeight="600">{t("cart_empty")}</Text>
        ) : (
          <VStack spacing={2}>
            {cart.map((item: CartItem, index: number) => (
              <Flex key={index} alignItems="center" w="full">
                <Image
                  src={item.image}
                  alt={item.name}
                  boxSize="50px"
                  objectFit="cover"
                  borderRadius="md"
                  mr={2}
                />
                <Box flex="1">
                  <Text isTruncated fontWeight="500">
                    {item.name}
                  </Text>
                  <Text fontSize="sm">
                    {t("qty")}: {toArabicNumerals(item.quantity, isArabic)}
                  </Text>
                  <Text fontSize="sm">
                    {t("price")}: {toArabicNumerals(item.price, isArabic)}{" "}
                    {t("currency")}
                  </Text>
                </Box>
              </Flex>
            ))}
            <Box textAlign="right" w="full" pt={2}>
              <Text fontWeight="600" fontSize="md">
                {t("total_price")}: {toArabicNumerals(totalPrice, isArabic)}{" "}
                {t("currency")}
              </Text>
            </Box>
            <Button
              bg="#ff6347"
              color="white"
              w="full"
              _hover={{ bg: "#ff7b61" }}
              size="sm"
              onClick={handleCartClick}
            >
              {t("view_cart")}
            </Button>
          </VStack>
        )}
      </PopoverBody>
    </MotionPopoverContent>
  );

  return (
    <Box
      p={4}
      bgGradient={bgGradient}
      color="white"
      position="fixed"
      top={0}
      width="100%"
      zIndex={1000}
      boxShadow="md"
    >
      <Flex alignItems="center" position="relative">
        {isMobile ? (
          <>
            {/* Mobile Nav */}
            <IconButton
              icon={
                isOpen ? <FaTimes color="white" /> : <FaBars color="white" />
              }
              aria-label="Menu"
              onClick={isOpen ? onClose : onOpen}
              variant="ghost"
              colorScheme="transparent"
              mr={2}
            />

            {/* Logo (center) */}
            <VStack spacing={2} align="center" w="full">
              <Image
                src={logo}
                w="200px"
                h="auto"
                cursor="pointer"
                onClick={handleLogoClick}
              />
            </VStack>

            {/* Mobile cart popover */}
            <Popover
              isOpen={mobileCartPopover.isOpen}
              onOpen={mobileCartPopover.onOpen}
              onClose={mobileCartPopover.onClose}
              placement="bottom-end"
            >
              <PopoverTrigger>
                <Link position="relative" ml="auto" mr={2}>
                  <Icon
                    mt={1.5}
                    as={FaShoppingCart}
                    w={5}
                    h={5}
                    cursor="pointer"
                  />
                  {totalItems > 0 && (
                    <Badge
                      color={badgeTextColor}
                      borderRadius="full"
                      position="absolute"
                      top="47%"
                      right="-25%"
                      transform="translate(50%, -50%)"
                      fontSize="0.7rem"
                      fontWeight="900"
                      bg="white"
                    >
                      {toArabicNumerals(totalItems, isArabic)}
                    </Badge>
                  )}
                </Link>
              </PopoverTrigger>
              <AnimatePresence>
                {mobileCartPopover.isOpen &&
                  renderCartContent(mobileCartPopover.onClose)}
              </AnimatePresence>
            </Popover>
          </>
        ) : (
          <Flex w="full" alignItems="center">
            {/* Desktop Logo */}
            <Image
              src={logo}
              w="250px"
              h="auto"
              cursor="pointer"
              onClick={handleLogoClick}
            />
            <Spacer />

            {/* Desktop nav links */}
            <HStack spacing={6} align="center" mr={8}>
              <Link fontWeight="500" onClick={() => handleLinkClick("/")}>
                {t("home")}
              </Link>
              <Link
                fontWeight="500"
                onClick={() => handleLinkClick("/product-grid")}
              >
                {t("shop")}
              </Link>
              <Select
                w="100px"
                onChange={handleLanguageChange}
                defaultValue={i18n.language}
                variant="filled"
                bg="transparent"
                icon={<ChevronDownIcon color="white" />}
                color="white"
                _focus={{ bg: "white", color: "black" }}
                _hover={{ bg: "white", color: "black" }}
              >
                <option value="en" style={{ color: "black" }}>
                  English
                </option>
                <option value="ar" style={{ color: "black" }}>
                  العربية
                </option>
              </Select>
              <ColorModeSwitch />
              <IconButton
                icon={<FaUser />}
                aria-label="Profile"
                onClick={handleProfileClick}
                variant="ghost"
                colorScheme="white"
                fontSize="lg"
              />

              {/* Desktop cart popover */}
              <Popover
                isOpen={desktopCartPopover.isOpen}
                onOpen={desktopCartPopover.onOpen}
                onClose={desktopCartPopover.onClose}
                placement="bottom-end"
              >
                <PopoverTrigger>
                  <Link position="relative">
                    <Icon mt={1.5} ml={1} as={FaShoppingCart} w={5} h={5} />
                    {totalItems > 0 && (
                      <Badge
                        borderRadius="full"
                        position="absolute"
                        top="47%"
                        right="-30%"
                        transform="translate(50%, -50%)"
                        fontSize="0.7rem"
                        fontWeight="900"
                        bg="white"
                        color="red.500"
                      >
                        {toArabicNumerals(totalItems, isArabic)}
                      </Badge>
                    )}
                  </Link>
                </PopoverTrigger>
                <AnimatePresence>
                  {desktopCartPopover.isOpen &&
                    renderCartContent(desktopCartPopover.onClose)}
                </AnimatePresence>
              </Popover>
            </HStack>
          </Flex>
        )}
      </Flex>

      {/* Mobile menu items displayed when isMobile and isOpen */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            mt={4}
            p={4}
            borderRadius="md"
            boxShadow="md"
          >
            <VStack spacing={4} align="start">
              <Link fontWeight="500" onClick={() => handleLinkClick("/")}>
                {t("home")}
              </Link>
              <Link
                fontWeight="500"
                onClick={() => handleLinkClick("/product-grid")}
              >
                {t("shop")}
              </Link>
              <Link fontWeight="500" onClick={() => handleProfileClick()}>
                {t("profile")}
              </Link>
              <Select
                w="100px"
                onChange={handleLanguageChange}
                defaultValue={i18n.language}
                variant="filled"
                bg="white"
                color="black"
                _focus={{ bg: "white", color: "black" }}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </Select>
              <ColorModeSwitch />
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default NavBar;
