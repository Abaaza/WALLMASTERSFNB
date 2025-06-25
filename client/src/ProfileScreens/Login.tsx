import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  VStack,
  Link,
  useToast,
  Center,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { IoPersonOutline } from "react-icons/io5";
import { AiOutlineLock } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { useAuth } from "../components/authContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { login } = useAuth();

  // Clear error after 30 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear any previous errors

    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      
      // Update Redux state as well
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const userEmail = localStorage.getItem("userEmail");
      
      if (userId) {
        dispatch(
          setUser({
            userId,
            name: userName || "",
            email: userEmail || "",
          })
        );
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate("/profile");
    } catch (error: unknown) {
      console.error("Login error:", error);
      
      let errorMessage = "Invalid email or password. Please try again.";
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.response?.status === 404) {
          errorMessage = "User not found. Please check your email or register for a new account.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.code === 'NETWORK_ERROR') {
          errorMessage = "Network error. Please check your internet connection.";
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Input Error",
        description: "Please enter your email address.",
        status: "error",
        duration: 30000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/request-password-reset`, {
        email: resetEmail,
      });

      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for password reset instructions.",
        status: "success",
        duration: 30000,
        isClosable: true,
      });
      setIsForgotPasswordOpen(false);
      setResetEmail("");
    } catch (error: unknown) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "Failed to send reset email. Try again later.",
        status: "error",
        duration: 30000,
        isClosable: true,
      });
    }
  };

  return (
    <Center h="50vh" bg="#fff">
      <VStack
        as="form"
        onSubmit={handleLogin}
        spacing={5}
        w="full"
        maxW="400px"
        px={4}
        textAlign="center"
      >
        <Text fontSize="2xl" fontWeight="600">
          Login to your Account
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
            <Icon as={IoPersonOutline} color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            bg="#F0F0F0"
            borderRadius="md"
            p={3}
            fontSize="md"
            paddingLeft="2.5rem"
            autoComplete="username"
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Icon as={AiOutlineLock} color="gray.500" />
          </InputLeftElement>
          <Input
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            bg="#F0F0F0"
            borderRadius="md"
            p={3}
            fontSize="md"
            type={passwordVisible ? "text" : "password"}
            paddingLeft="2.5rem"
            autoComplete="current-password"
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
          bg="#ff6347"
          color="white"
          w="full"
          type="submit"
          isLoading={isLoading}
          borderRadius="md"
          p={3}
          fontSize="md"
          _hover={{ bg: "#ff7b61" }}
        >
          Login
        </Button>

        <Text fontSize="sm" color="gray.500">
          Don't have an account?{" "}
          <Link color="blue.500" onClick={() => navigate("/register")}>
            Sign Up
          </Link>
        </Text>

        <Text fontSize="sm" color="gray.500">
          <Link onClick={() => setIsForgotPasswordOpen(true)} color="blue.500">
            Forgot Password?
          </Link>
        </Text>

        <Modal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Reset Password</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>
                Enter your email to receive password reset instructions.
              </Text>
              <Input
                placeholder="Enter your Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                bg="#F0F0F0"
                borderRadius="md"
                p={3}
                fontSize="md"
                type="email"
                autoComplete="email"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                bg="#ff6347"
                color="white"
                onClick={handleForgotPassword}
                _hover={{ bg: "#ff7b61" }}
                w="full"
              >
                Send Reset Email
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Center>
  );
};

export default Login;
