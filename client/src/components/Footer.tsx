import { Box, Flex, Text, Link, Stack, Icon } from "@chakra-ui/react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box
      as="footer"
      bgGradient="linear(to-r, rgb(26, 23, 22), rgb(32, 27, 27))"
      color="white"
      py={10}
      mt={10}
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align="center"
        maxW="1200px"
        mx="auto"
        px={6}
      >
        {/* Left Side - Company Information */}
        <Stack spacing={3} textAlign={{ base: "center", md: "left" }}>
          <Text fontSize="lg" fontWeight="700">
            {t("companyName")}
          </Text>
          <Text fontSize="sm">
            {t("copyright", { year: new Date().getFullYear() })}
          </Text>
          <Text fontSize="sm">{t("contactInfo")}</Text>
        </Stack>

        {/* Right Side - Navigation Links */}
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: 3, md: 6 }}
          mt={{ base: 4, md: 0 }}
          align={{ base: "center", md: "flex-start" }}
        >
          <Link href="/" _hover={{ textDecoration: "underline" }}>
            {t("home")}
          </Link>
          <Link href="/product-grid" _hover={{ textDecoration: "underline" }}>
            {t("shop")}
          </Link>

          {/* Social Media Links */}
          <Stack direction="row" spacing={4}>
            <Link href="https://www.facebook.com/people/Poopatrol/61575697444609/" isExternal>
              <Icon as={FaFacebook} w={6} h={6} />
            </Link>
            <Link href="https://www.instagram.com/poopatrols/?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr#" isExternal>
              <Icon as={FaInstagram} w={6} h={6} />
            </Link>
          </Stack>
        </Stack>
      </Flex>
    </Box>
  );
};

export default Footer;
