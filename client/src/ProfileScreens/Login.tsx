import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { IoPersonOutline } from "react-icons/io5";
import { AiOutlineLock } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !password) {
      toast({
        title: "Input Error",
        description: "Both email and password are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/login",
        { email: email.toLowerCase(), password }
      );

      const { token, refreshToken, user } = response.data; // Ensure backend returns refreshToken
      const userId = user?._id;

      if (token && refreshToken && userId) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);

        dispatch(
          setUser({
            userId,
            name: user.name || "",
            email: user.email || "",
          })
        );

        navigate("/profile");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "Invalid email or password. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/request-password-reset",
        { email: resetEmail }
      );
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for password reset instructions.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsForgotPasswordOpen(false);
      setResetEmail("");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: "Failed to send reset email. Try again later.",
        status: "error",
        duration: 3000,
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

        {/* Forgot Password Modal */}
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
