import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

const AboutUs: React.FC = () => {
  return (
    <Box p={5}>
      <Heading as="h1" mb={4}>
        About Us
      </Heading>
      <Text>
        Welcome to Wall Masters! We are a company dedicated to providing the
        best wall decor and art to enhance your living spaces.
      </Text>
    </Box>
  );
};

export default AboutUs;
