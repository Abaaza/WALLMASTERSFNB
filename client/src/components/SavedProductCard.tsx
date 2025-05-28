import React from "react";
import {
  Box,
  Text,
  Image,
  VStack,
  Button,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

interface SavedProductCardProps {
  name: string;
  image: string;
  priceRange: { min: number; max: number };
  displayPriceRange: { min: string; max: string };
  sizes: string[];
  sizeCount: number;
  onClick: () => void;
  onRemove: () => void;
}

const SavedProductCard: React.FC<SavedProductCardProps> = ({
  name,
  image,
  priceRange,
  displayPriceRange,
  sizes,
  sizeCount,
  onClick,
  onRemove,
}) => {
  const { t } = useTranslation();

  // Define color values based on the color mode
  const cardBg = useColorModeValue("white", "gray.700");
  const cardBorderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const priceTextColor = useColorModeValue("gray.600", "gray.300");
  const buttonBgColor = useColorModeValue("#ff6347", "red.400");
  const buttonHoverColor = useColorModeValue("#ff7b61", "red.500");

  return (
    <Box
      onClick={onClick}
      p={4}
      shadow="md"
      borderWidth="1px"
      borderColor={cardBorderColor}
      borderRadius="md"
      cursor="pointer"
      bg={cardBg}
      transition="transform 0.2s"
      _hover={{ transform: "scale(1.05)" }}
    >
      <Image
        src={image}
        alt={name}
        width="100%"
        borderRadius="8px"
        mb={3}
        fallbackSrc="https://via.placeholder.com/150"
      />
      <VStack align="start" spacing={1} width="100%">
        <Text fontWeight="600" fontSize="lg" color={textColor}>
          {name}
        </Text>
        <Text color={priceTextColor} fontWeight={500}>
          {t("priceLabel")}: {displayPriceRange.min} - {displayPriceRange.max}{" "}
          {t("currency")}
        </Text>
        <Text fontSize="sm" color={priceTextColor} fontWeight={500}>
          {sizeCount} {t("sizesAvailable")}
        </Text>
        <HStack justifyContent="center" width="100%" mt={2}>
          <Button
            bg={buttonBgColor}
            color="white"
            w="full"
            _hover={{ bg: buttonHoverColor }}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            width="80%"
            borderRadius="full"
            boxShadow="md"
          >
            {t("remove")}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default SavedProductCard;
