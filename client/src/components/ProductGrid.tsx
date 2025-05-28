import React, { useState, useMemo, useEffect } from "react";
import { Button, Box, Spacer, Spinner, Center } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

import ProductCard from "./ProductCard";
import { getPriceRange, getSizes, getDisplayPriceRange } from "./productUtils";
import SortSelector from "./SortSelector"; // your custom component
import { useNavigate } from "react-router-dom";
import { Container, StyledSimpleGrid } from "./StyledComponents"; // your custom styled comps
import { useTranslation } from "react-i18next";
import useTranslatedProducts from "./product";
import { useColorMode } from "@chakra-ui/react";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

const ProductGrid: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colorMode } = useColorMode();
  const { translatedProducts, loading } = useTranslatedProducts();
  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = useState(() => {
    const savedCount = sessionStorage.getItem("visibleCount");
    return savedCount ? parseInt(savedCount, 10) : 20;
  });

  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    return sessionStorage.getItem("selectedTheme") || "";
  });

  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    const savedColors = sessionStorage.getItem("selectedColors");
    return savedColors ? JSON.parse(savedColors) : [];
  });

  const [selectedThreeP, setSelectedThreeP] = useState<string>(() => {
    return sessionStorage.getItem("selectedThreeP") || "";
  });

  const filteredProducts = useMemo(() => {
    return translatedProducts.filter((product) => {
      const matchesTheme = selectedTheme
        ? product.theme === selectedTheme
        : true;
      const matchesColor =
        selectedColors.length > 0
          ? selectedColors.every((color) => product.color.includes(color))
          : true;
      const matchesThreeP =
        selectedThreeP !== "" ? product.threePiece === selectedThreeP : true;

      return matchesTheme && matchesColor && matchesThreeP;
    });
  }, [translatedProducts, selectedTheme, selectedColors, selectedThreeP]);

  const showMoreItems = () => {
    setVisibleCount((prevCount) => {
      const newCount = prevCount + 20;
      sessionStorage.setItem("visibleCount", newCount.toString());
      return newCount;
    });
  };

  const handleCardClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleResetFilters = () => {
    setSelectedTheme("");
    setSelectedColors([]);
    setSelectedThreeP("");
  };

  // Save filter states in sessionStorage
  useEffect(() => {
    sessionStorage.setItem("selectedTheme", selectedTheme);
    sessionStorage.setItem("selectedColors", JSON.stringify(selectedColors));
    sessionStorage.setItem("selectedThreeP", selectedThreeP);
  }, [selectedTheme, selectedColors, selectedThreeP]);

  // Update products on language change
  useEffect(() => {
    const handleLanguageChange = () => {
      setVisibleCount(20);
    };
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Main container animation
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <Container>
      <Box mt={7} mb={5}>
        <SortSelector
          themes={Array.from(new Set(translatedProducts.map((p) => p.theme)))}
          colors={Array.from(
            new Set(translatedProducts.flatMap((p) => p.color))
          )}
          threePOptions={[
            { value: "No", label: t("onePiece") },
            { value: "Yes", label: t("threePieces") },
          ]}
          onThemeSelect={setSelectedTheme}
          onColorSelect={setSelectedColors}
          onThreePSelect={setSelectedThreeP}
          onResetFilters={handleResetFilters}
        />
      </Box>

      <Spacer />

      {loading ? (
        <Center minH="60vh">
          <Spinner color="#ff6347" thickness="4px" width="80px" height="80px" />
        </Center>
      ) : (
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StyledSimpleGrid
            columns={{ base: 2, sm: 2, md: 3, lg: 4 }}
            spacing={5}
          >
            <AnimatePresence>
              {filteredProducts.slice(0, visibleCount).map((product) => {
                const priceRange = getPriceRange(product.variants);
                const displayPriceRange = getDisplayPriceRange(
                  product.variants
                );
                const sizes = getSizes(product.variants);

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ProductCard
                      name={product.name}
                      image={product.images[0] ?? ""}
                      priceRange={priceRange}
                      displayPriceRange={displayPriceRange}
                      sizes={sizes}
                      sizeCount={sizes.length}
                      onClick={() => handleCardClick(product.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </StyledSimpleGrid>
        </MotionBox>
      )}

      {visibleCount < filteredProducts.length && (
        <Box textAlign="center" mt={5}>
          <MotionButton
            bgGradient="linear(to-r, #ff6347, #ff8961)"
            color="white"
            w="60%"
            _hover={{ bgGradient: "linear(to-r, #ff8161, #ff9b76)" }}
            size="lg"
            onClick={showMoreItems}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {t("showMore")}
          </MotionButton>
        </Box>
      )}
    </Container>
  );
};

export default ProductGrid;
