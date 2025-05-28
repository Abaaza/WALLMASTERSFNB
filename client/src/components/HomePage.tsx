import React from "react";
import {
  Box,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useBreakpointValue,
  Text,
  Container,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Framer Motion import
import { motion } from "framer-motion";

import DesktopProductSlider from "./DesktopProductSlider";
import MobileProductSlider from "./MobileProductSlider";
import AutoSlideShow from "./AutoSlideShow";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);
const MotionButton = motion(Button);

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mobileImages = Array.from(
    { length: 21 },
    (_, i) =>
      `https://d1yp2xq08uy96k.cloudfront.net/images/videomobile${i + 1}.webp`
  );

  const pcImages = Array.from(
    { length: 22 },
    (_, i) =>
      `https://d1yp2xq08uy96k.cloudfront.net/images/videopc${i + 1}.webp`
  );

  const imagesToShow = useBreakpointValue({
    base: mobileImages,
    md: pcImages,
  });

  const ProductSliderToShow = useBreakpointValue({
    base: MobileProductSlider,
    md: DesktopProductSlider,
  });

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [comment, setComment] = React.useState("");

  const handleSubmit = async () => {
    if (!name || !email || !comment) {
      alert(t("formAlert"));
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/send-email`,
        {
          name,
          email,
          comment,
        }
      );
      alert(t("successMessage"));
      // Reset the form
      setName("");
      setEmail("");
      setComment("");
    } catch (error) {
      console.error("Failed to send email:", error);
      alert(t("errorMessage"));
    }
  };

  const goToProductGrid = () => {
    navigate("/product-grid");
  };

  const bg = useColorModeValue("#f2f2f2", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");

  return (
    <Box minH="100vh" bg={bg} p={5}>
      {/* Hero / Slideshow Section */}
      <MotionBox
        onClick={goToProductGrid}
        cursor="pointer"
        overflow="hidden"
        // Animate the slideshow container
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        mb={10}
        boxShadow="xl"
      >
        {imagesToShow && <AutoSlideShow images={imagesToShow} />}
      </MotionBox>

      {/* Top Sellers Section */}
      <MotionHeading
        textAlign="center"
        mb={4}
        size="lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {t("topSellers")}
      </MotionHeading>

      <Box textAlign="center" mt={10}>
        {ProductSliderToShow && <ProductSliderToShow />}
      </Box>

      {/* Contact Us Form Section */}
      <Container maxW=" " mt={10} bg={cardBg} p={8} rounded="md" boxShadow="xl">
        <MotionHeading
          as="h2"
          size="lg"
          mb={4}
          textAlign="center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t("contactUs")}
        </MotionHeading>

        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <VStack spacing={4} align="stretch">
            <FormControl id="name">
              <FormLabel>{t("nameLabel")}</FormLabel>
              <Input
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl id="email">
              <FormLabel>{t("emailLabel")}</FormLabel>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl id="comment">
              <FormLabel>{t("commentLabel")}</FormLabel>
              <Textarea
                placeholder={t("commentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormControl>

            <Flex justify="center" w="100%">
              <MotionButton
                bg="#ff6347"
                color="white"
                w="full"
                _hover={{ bg: "#ff7b61" }}
                size="lg"
                onClick={handleSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {t("submitButton")}
              </MotionButton>
            </Flex>
          </VStack>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default HomePage;
