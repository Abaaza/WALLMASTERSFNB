import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useColorModeValue,
  Box,
  Heading,
  Input,
  Button,
  useToast,
  Center,
  Text,
} from "@chakra-ui/react";

// Import only the utilities you need
import { getItemFromLocalStorage } from "../ProfileScreens/authUtils";

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState("");
  const toast = useToast();

  useEffect(() => {
    loadUserEmail();
  }, []);

  // Retrieve the user's email from localStorage
  const loadUserEmail = () => {
    const storedEmail = getItemFromLocalStorage("userEmail", "");
    setEmail(storedEmail);
  };

  const handleChangePassword = async () => {
    // Basic field validation
    if (!oldPassword || !newPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      // Send a POST request to your API with email, oldPassword, and newPassword
      const response = await axios.post(
        "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/change-password",
        {
          email,
          oldPassword,
          newPassword,
        }
      );

      // On success, show a success toast and clear the input fields
      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      console.error("Password change failed:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Color mode values for consistent light/dark theming
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const inputBgColor = useColorModeValue("gray.50", "gray.800");
  const buttonBgColor = useColorModeValue("#ff6347", "#ff6347");
  const buttonHoverBgColor = useColorModeValue("orange.500", "orange.600");

  return (
    <Center bg={bgColor} minH="100vh" p={4}>
      <Box
        bg={cardBg}
        color={textColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="8px"
        boxShadow="md"
        p={8}
        w="100%"
        maxW="400px"
        textAlign="center"
      >
        <Heading mb={6}>Change Password</Heading>

        {email ? (
          <Text mb={2} fontSize="sm" color="gray.500">
            Email: {email}
          </Text>
        ) : (
          <Text mb={2} fontSize="sm" color="gray.500">
            (No email found in local storage)
          </Text>
        )}

        <Input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          mb={4}
          bg={inputBgColor}
        />

        <Input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          mb={4}
          bg={inputBgColor}
        />

        <Button
          onClick={handleChangePassword}
          bg={buttonBgColor}
          color="white"
          _hover={{ bg: buttonHoverBgColor }}
          width="full"
          mt={4}
        >
          Change Password
        </Button>
      </Box>
    </Center>
  );
};

export default ChangePassword;
