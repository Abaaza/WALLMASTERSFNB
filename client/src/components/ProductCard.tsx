import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Image,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

interface ProductCardProps {
  name: string;
  image: string;
  priceRange: { min: number; max: number };
  displayPriceRange: { min: string; max: string };
  sizes: string[];
  onClick: () => void;
  sizeCount: number;
}

const MotionBox = motion(Box);

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  displayPriceRange,
  onClick,
  sizeCount,
}) => {
  const { t, i18n } = useTranslation();
  const { toggleColorMode } = useColorMode();

  // Setting color values based on light or dark mode
  const bgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("black", "gray.100");
  const shadowColor = useColorModeValue(
    "0px 4px 12px rgba(0, 0, 0, 0.1)",
    "0px 4px 12px rgba(0, 0, 0, 0.3)"
  );

  const formatNumber = (number: number): string => {
    if (i18n.language === "ar") {
      return number
        .toString()
        .replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[parseInt(digit, 10)]);
    }
    return number.toString();
  };

  // Card animation variants
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    enter: { opacity: 1, y: 0 },
    hover: { scale: 1.05 },
    tap: { scale: 0.97 },
  };

  return (
    <MotionBox
      onClick={onClick}
      cursor="pointer"
      p="0"
      borderRadius="12px"
      boxShadow={shadowColor}
      bg={bgColor}
      color={textColor}
      overflow="hidden"
      initial="initial"
      animate="enter"
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      transition={{ duration: 0.4 }}
    >
      <Image
        src={image}
        alt={name}
        borderRadius="12px 12px 0 0"
        objectFit="contain"
        transition="transform 0.4s ease"
      />
      <Box p="12px">
        <Text as="h3" fontWeight="700" fontSize="1.1rem" mb={1} noOfLines={1}>
          {name}
        </Text>
        <Text fontWeight="500" fontSize="1rem" mb={1}>
          {displayPriceRange.min} - {displayPriceRange.max} {t("currency")}
        </Text>
        <Text fontWeight="500" fontSize="0.95rem" color="gray.400">
          {formatNumber(sizeCount)} {t("sizesAvailable")}
        </Text>
      </Box>
    </MotionBox>
  );
};

export default ProductCard;
