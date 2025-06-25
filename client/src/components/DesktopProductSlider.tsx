import React, { useState, useEffect, useCallback } from "react";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { useNavigate } from "react-router-dom";
import { Product, Variant } from "./types";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Box, Skeleton, SkeletonText } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import useTranslatedProducts from "./product";
import styles from "./DesktopProductSlider.module.css";

interface PriceRange {
  min: number;
  max: number;
}

const getPriceRange = (variants: Variant[]): PriceRange => {
  if (variants.length === 0) return { min: 0, max: 0 };
  const prices = variants.map((variant) => variant.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

const getSizeCount = (variants: Variant[]): number => {
  const sizes = variants.map((variant) => variant.size);
  return new Set(sizes).size;
};

const getRandomProducts = (products: Product[], count: number): Product[] => {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const convertToArabicNumerals = (input: number): string => {
  return input
    .toString()
    .replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[parseInt(digit, 10)]);
};

const DesktopProductSlider: React.FC = () => {
  const { translatedProducts, loading } = useTranslatedProducts();
  const [limitedProducts, setLimitedProducts] = useState<Product[]>([]);
  const [visibleSlides, setVisibleSlides] = useState<number>(4);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const updateVisibleSlides = useCallback(() => {
    if (window.innerWidth < 768) {
      setVisibleSlides(2); // For smaller screens
    } else if (window.innerWidth < 1200) {
      setVisibleSlides(3); // Medium screens
    } else {
      setVisibleSlides(4); // Larger screens
    }
  }, []);

  useEffect(() => {
    if (
      !loading &&
      limitedProducts.length === 0 &&
      translatedProducts.length > 0
    ) {
      // Show products that are either featured OR bestSeller
      const featuredProducts = translatedProducts.filter((p) => p.featured || p.bestSeller);
      const randomProducts = getRandomProducts(featuredProducts, 15);
      setLimitedProducts(randomProducts);
    }
  }, [translatedProducts, loading, limitedProducts.length]);

  useEffect(() => {
    updateVisibleSlides();
    window.addEventListener("resize", updateVisibleSlides);
    return () => window.removeEventListener("resize", updateVisibleSlides);
  }, [updateVisibleSlides]);

  const handleSlideClick = useCallback(
    (productId: string) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const formatSizeCount = useCallback(
    (count: number): string => {
      return i18n.language === "ar"
        ? convertToArabicNumerals(count)
        : count.toString();
    },
    [i18n.language]
  );

  // 1) Make slidesData explicitly (Product | null)[]
  const slidesData: Array<Product | null> = loading
    ? Array.from({ length: visibleSlides }, () => null)
    : limitedProducts.map((p) => p || null);

  return (
    <div className={styles.sliderWrapper}>
      <CarouselProvider
        naturalSlideWidth={100}
        naturalSlideHeight={120}
        totalSlides={slidesData.length}
        visibleSlides={visibleSlides}
        infinite
        isIntrinsicHeight
      >
        <Slider>
          {slidesData.map((product, index) => {
            if (loading || !product) {
              return (
                <Slide index={index} key={index} className={styles.slide}>
                  <Box className={styles.skeletonWrapper}>
                    <Skeleton className={styles.imageSkeleton} mb="4" />
                    <SkeletonText mt="4" noOfLines={2} spacing="4" />
                    <SkeletonText mt="2" noOfLines={1} width="50%" />
                  </Box>
                </Slide>
              );
            }

            const { min, max } = getPriceRange(product.variants);
            const sizeCount = getSizeCount(product.variants);

            const displayMinPrice =
              i18n.language === "ar"
                ? convertToArabicNumerals(min)
                : min.toString();
            const displayMaxPrice =
              i18n.language === "ar"
                ? convertToArabicNumerals(max)
                : max.toString();

            return (
              <Slide index={index} key={product.id} className={styles.slide}>
                <div
                  onClick={() => handleSlideClick(product.id)}
                  className={styles.details}
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className={styles.image}
                  />
                  <div className={styles.infoContainer}>
                    <h2 className={styles.productName}>{product.name}</h2>
                    <p className={styles.metaText}>
                      {displayMinPrice} - {displayMaxPrice} {t("currency")}
                    </p>
                    <p className={styles.metaText}>
                      {formatSizeCount(sizeCount)} {t("sizesAvailable")}
                    </p>
                  </div>
                </div>
              </Slide>
            );
          })}
        </Slider>

        <ButtonBack className={styles.buttonBack}>
          <FaChevronLeft />
        </ButtonBack>
        <ButtonNext className={styles.buttonNext}>
          <FaChevronRight />
        </ButtonNext>
      </CarouselProvider>
    </div>
  );
};

export default React.memo(DesktopProductSlider);
