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
import styles from "./MobileProductSlider.module.css";

const convertToArabicNumerals = (input: number): string => {
  return input
    .toString()
    .replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[parseInt(digit, 10)]);
};

const MobileProductSlider: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { translatedProducts: products, loading } = useTranslatedProducts();
  const [limitedProducts, setLimitedProducts] = useState<Product[] | null>(
    null
  );
  const [slideWidth, setSlideWidth] = useState<number>(window.innerWidth - 40);
  const navigate = useNavigate();

  const getRandomProducts = useCallback(
    (products: Product[], count: number): Product[] => {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
    []
  );

  useEffect(() => {
    if (!limitedProducts && Array.isArray(products) && products.length > 0) {
      const featuredProducts = products.filter((product) => product.featured || product.bestSeller);
      const randomProducts = getRandomProducts(featuredProducts, 15);
      setLimitedProducts(randomProducts);
    }
  }, [products, limitedProducts, getRandomProducts]);

  useEffect(() => {
    const handleResize = () => setSlideWidth(window.innerWidth - 40);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSlideClick = useCallback(
    (productId: string) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const getPriceRange = useCallback(
    (variants: Variant[]): { min: number; max: number } => {
      const prices = variants.map((variant) => variant.price);
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
      };
    },
    []
  );

  const getSizeCount = useCallback((variants: Variant[]): number => {
    const sizes = variants.map((variant) => variant.size);
    return new Set(sizes).size;
  }, []);

  const formatSizeCount = useCallback(
    (count: number): string => {
      return i18n.language === "ar"
        ? convertToArabicNumerals(count)
        : count.toString();
    },
    [i18n.language]
  );

  const slidesData = limitedProducts ?? Array.from({ length: 5 }, () => null);

  return (
    <div className={styles.sliderWrapper}>
      <CarouselProvider
        naturalSlideWidth={slideWidth}
        naturalSlideHeight={450}
        totalSlides={slidesData.length}
        visibleSlides={2}
        infinite
        isIntrinsicHeight
      >
        <Slider>
          {slidesData.map((product, index) => {
            const isPlaceholder = product === null;

            const { min, max } = isPlaceholder
              ? { min: 0, max: 0 }
              : getPriceRange(product.variants);

            const sizeCount = isPlaceholder
              ? 0
              : getSizeCount(product.variants);

            return (
              <Slide
                index={index}
                key={product?.id || index}
                className={styles.slide}
              >
                <div
                  onClick={() => product && handleSlideClick(product.id)}
                  className={styles.details}
                >
                  {isPlaceholder ? (
                    <Skeleton className={styles.imagePlaceholder} />
                  ) : (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className={styles.image}
                      loading="lazy"
                    />
                  )}

                  <div className={styles.infoContainer}>
                    {isPlaceholder ? (
                      <SkeletonText mt="4" noOfLines={3} spacing="4" />
                    ) : (
                      <>
                        <h2 className={styles.productName}>{product.name}</h2>
                        <div className={styles.metaInfo}>
                          <p className={styles.metaText}>
                            {min} - {max} {t("currency")}
                          </p>
                          <p className={styles.metaText}>
                            {formatSizeCount(sizeCount)} {t("sizesAvailable")}
                          </p>
                        </div>
                      </>
                    )}
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

export default React.memo(MobileProductSlider);
