import React, { useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  Text,
  useColorModeValue,
  useToast,
  Center,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.700");
  const cardTextColor = useColorModeValue("gray.800", "gray.100");
  const buttonBg = useColorModeValue("#ff6347", "#ff7b61");
  const buttonHoverBg = useColorModeValue("#ff7b61", "#ff8a7f");

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    try {
      const response = await fetch(
        "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Password has been reset successfully.");
      } else {
        setMessage(data.message || "Error resetting password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Center bg={useColorModeValue("gray.50", "gray.800")} minH="100vh" p={4}>
      <Box
        bg={cardBg}
        color={cardTextColor}
        p={6}
        rounded="md"
        boxShadow="lg"
        w="100%"
        maxW="400px"
      >
        <Heading mb={4} size="md">
          Reset Password
        </Heading>
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb={3}
        />
        <Input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          mb={3}
        />
        {error && (
          <Text color="red.500" mb={3} fontSize="sm">
            {error}
          </Text>
        )}
        <Button
          onClick={handleResetPassword}
          isDisabled={!password || !confirmPassword}
          bg={buttonBg}
          color="white"
          width="full"
          _hover={{ bg: buttonHoverBg }}
        >
          Submit
        </Button>
        {message && (
          <Text color="green.500" mt={3} fontSize="sm">
            {message}
          </Text>
        )}
      </Box>
    </Center>
  );
};

export default ResetPassword;
