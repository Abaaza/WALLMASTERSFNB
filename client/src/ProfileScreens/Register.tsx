import React, { useState, useEffect } from "react";
import {
  Center,
  VStack,
  Text,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  Button,
  Link,
  useToast,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Box,
} from "@chakra-ui/react";
import { IoPersonOutline } from "react-icons/io5";
import { AiOutlineLock } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";


const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Clear error after 30 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleRegister = async () => {
    setError(null); // Clear any previous errors
    
    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/register`,
        { name, email: email.toLowerCase(), password }
      );

      const { token, refreshToken, user } = response.data;

      if (token && refreshToken && user) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userName", user.name);

        toast({
          title: "Registration Successful",
          description: "You have registered successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        navigate("/profile");
      } else {
        throw new Error("Missing token or user data in response");
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || "Invalid input data.";
        } else if (error.response.status === 409) {
          errorMessage = "Email already exists. Please use a different email or try logging in.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      console.error("Registration Error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Define color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const inputBgColor = useColorModeValue("gray.50", "gray.700");
  const placeholderColor = useColorModeValue("gray.500", "gray.400");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const buttonBgColor = useColorModeValue("#ff6347", "#e57373");
  const buttonHoverBgColor = useColorModeValue("#ff7b61", "#ef9a9a");

  return (
    <Center h="50vh" bg={bgColor} color={textColor}>
      <VStack spacing={5} w="full" maxW="400px" px={4} textAlign="center">
        <Text fontSize="2xl" fontWeight="800">
          Register to your Account
        </Text>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <AlertDescription>{error}</AlertDescription>
            </Box>
            <CloseButton
              alignSelf="flex-start"
              position="relative"
              right={-1}
              top={-1}
              onClick={() => setError(null)}
            />
          </Alert>
        )}

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={IoPersonOutline} color={placeholderColor} />
          </InputLeftElement>
          <Input
            placeholder="Enter your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            bg={inputBgColor}
            borderRadius="md"
            p={3}
            fontSize="md"
            paddingLeft="2.5rem"
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={MdEmail} color={placeholderColor} />
          </InputLeftElement>
          <Input
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            bg={inputBgColor}
            borderRadius="md"
            p={3}
            fontSize="md"
            paddingLeft="2.5rem"
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={AiOutlineLock} color={placeholderColor} />
          </InputLeftElement>
          <Input
            placeholder="Enter your Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={passwordVisible ? "text" : "password"}
            bg={inputBgColor}
            borderRadius="md"
            p={3}
            fontSize="md"
            paddingLeft="2.5rem"
          />
          <InputRightElement>
            <Button
              onClick={() => setPasswordVisible(!passwordVisible)}
              variant="ghost"
              size="sm"
            >
              {passwordVisible ? <ViewOffIcon /> : <ViewIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>

        <Button
          bg={buttonBgColor}
          color="white"
          w="full"
          _hover={{ bg: buttonHoverBgColor }}
          onClick={handleRegister}
          isLoading={isLoading}
          borderRadius="md"
          p={3}
          fontSize="md"
        >
          Register
        </Button>

        <Text fontSize="sm" color={placeholderColor}>
          Already have an account?{" "}
          <Link color="blue.500" onClick={() => navigate("/login")}>
            Sign In
          </Link>
        </Text>
      </VStack>
    </Center>
  );
};

export default Register;
