import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Spinner,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Center,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { getAuthToken, clearUserData } from "./authUtils";

type FocusableElement = HTMLButtonElement | null;

const AccountOption: React.FC<{
  title: string;
  onClick?: () => void;
  fontWeight?: string | number;
}> = ({ title, onClick, fontWeight = "normal" }) => {
  const optionBg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("black", "gray.200");

  return (
    <Button
      onClick={onClick}
      width="100%"
      backgroundColor={optionBg}
      borderRadius="8px"
      padding="15px 10px"
      justifyContent="start"
      textAlign="left"
      _hover={{ bg: hoverBg }}
      transition="background 0.2s ease"
    >
      <Text fontSize="18px" color={textColor} fontWeight={fontWeight}>
        {title}
      </Text>
    </Button>
  );
};

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ userId: "", name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<FocusableElement>(null);
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const spinnerColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = getAuthToken();
      if (!token) {
        toast({
          title: t("authenticationError"),
          description: t("sessionExpiredRedirect"),
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/user-details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          toast({
            title: t("sessionExpiredTitle"),
            description: t("sessionExpiredRedirect"),
            status: "warning",
            duration: 3000,
            isClosable: true,
          });
          navigate("/login");
        } else {
          toast({
            title: t("errorOccurred"),
            description: t("unableFetchData"),
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, t, toast]);

  const handlePress = (screen?: string, action?: string) => {
    if (action === "logout") {
      onOpen();
    } else if (screen) {
      navigate(screen);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      clearUserData();
      onClose();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      toast({
        title: t("logoutErrorMessage"),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Spinner size="xl" color={spinnerColor} />
      </Center>
    );
  }

  return (
    <Box p={5} bg={bgColor} color={textColor} minH="60vh">
      <Text fontSize="2xl" fontWeight="400" mt={4}>
        {t("welcome2", { userName: userInfo.name || t("user") })}
      </Text>

      <VStack spacing={4} mt={6}>
        {/* Personal Info Section */}
        <Box width="100%">
          <Text fontSize="lg" fontWeight="400" mb={4}>
            {t("personalInfo")}
          </Text>
          <Box mb={2}>
            <AccountOption
              title={`${t("name")}: ${userInfo.name || t("noNameProvided")}`}
              fontWeight="400"
            />
          </Box>
          <Box mb={2}>
            <AccountOption
              title={`${t("email")}: ${userInfo.email || t("noEmailProvided")}`}
              fontWeight="400"
            />
          </Box>
        </Box>

        {/* Your Orders */}
        <AccountOption
          title={t("yourOrders")}
          onClick={() => handlePress("/myorders")}
          fontWeight="400"
        />

        {/* Saved Items */}
        <AccountOption
          title={t("savedItems")}
          onClick={() => handlePress("/saveditems")}
          fontWeight="400"
        />

        {/* Saved Addresses */}
        <AccountOption
          title={t("manageAddresses")}
          onClick={() => handlePress("/savedaddresses")}
          fontWeight="400"
        />

        {/* Security Section */}
        <AccountOption
          title={t("changePassword")}
          onClick={() => handlePress("/changepassword")}
          fontWeight="400"
        />

        {/* Logout Option */}
        <AccountOption
          title={t("logout")}
          onClick={() => handlePress(undefined, "logout")}
          fontWeight="400"
        />
      </VStack>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg={bgColor} color={textColor}>
            <AlertDialogHeader fontSize="lg" fontWeight="500">
              {t("logoutConfirmation")}
            </AlertDialogHeader>
            <AlertDialogBody>{t("logoutPrompt")}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                {t("cancel")}
              </Button>
              <Button colorScheme="red" onClick={handleLogout} ml={3}>
                {t("logout")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ProfilePage;
