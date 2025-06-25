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

// Fixed: Remove deprecated motion(Component) syntax - will use motion.div with Box styling

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
      <motion.div
        onClick={goToProductGrid}
        style={{
          cursor: "pointer",
          overflow: "hidden",
          marginBottom: "2.5rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {imagesToShow && <AutoSlideShow images={imagesToShow} />}
      </motion.div>

      {/* Top Sellers Section */}
      <motion.div
        style={{ textAlign: "center", marginBottom: "1rem" }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Heading size="lg">{t("topSellers")}</Heading>
      </motion.div>

      <Box textAlign="center" mt={10}>
        {ProductSliderToShow && <ProductSliderToShow />}
      </Box>

      {/* Contact Us Form Section */}
      <Container maxW=" " mt={10} bg={cardBg} p={8} rounded="md" boxShadow="xl">
        <motion.div
          style={{ textAlign: "center", marginBottom: "1rem" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Heading as="h2" size="lg">{t("contactUs")}</Heading>
        </motion.div>

        <motion.div
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
              <Button
                bg="#ff6347"
                color="white"
                w="full"
                _hover={{ bg: "#ff7b61" }}
                size="lg"
                onClick={handleSubmit}
              >
                {t("submitButton")}
              </Button>
            </Flex>
          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
};

export default HomePage;
