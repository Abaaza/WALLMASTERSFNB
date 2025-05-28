import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { IoPersonOutline } from "react-icons/io5";
import { AiOutlineLock } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast({
        title: "Input Error",
        description: "Please fill all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await axios.post(
        "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/register",
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
          duration: 3000,
          isClosable: true,
        });

        navigate("/profile");
      } else {
        throw new Error("Missing token or user data in response");
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? error.response.data.message
          : "An unexpected error occurred.";

      console.error("Registration Error:", errorMessage);

      toast({
        title: "Registration Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
            placeholder="Enter your Password"
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
