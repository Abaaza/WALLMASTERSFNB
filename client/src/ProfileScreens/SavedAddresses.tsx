import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Button,
  VStack,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useNavigate } from "react-router-dom";
import { getUserId, getAuthToken, clearUserData } from "./authUtils";

interface Address {
  _id: string;
  name: string;
  email: string;
  mobileNo: string;
  houseNo: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault?: boolean;
}

const SavedAddresses: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const userId = getUserId();
  const token = getAuthToken();

  const containerBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("gray.100", "gray.700");
  const cardTextColor = useColorModeValue("black", "gray.200");
  const buttonBgDefault = useColorModeValue("green.500", "green.400");
  const buttonBgNormal = useColorModeValue("blue.500", "blue.400");
  const buttonBgDelete = useColorModeValue("red.500", "red.600");

  useEffect(() => {
    if (!userId || !token) {
      toast({
        title: "Authentication Error",
        description: "No user ID or token found. Redirecting to login.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      clearUserData();
      navigate("/login");
      return;
    }

    const loadSavedAddresses = async () => {
      try {
        const response = await axios.get<Address[]>(
          `${API_BASE_URL}/addresses?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let sortedAddresses = response.data.sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );

        // If there are addresses but none is default, set the first as default
        if (
          sortedAddresses.length > 0 &&
          !sortedAddresses.some((addr) => addr.isDefault)
        ) {
          await setDefaultAddress(sortedAddresses[0]._id, false);
          const refresh = await axios.get<Address[]>(
            `${API_BASE_URL}/addresses?userId=${userId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          sortedAddresses = refresh.data.sort((a, b) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
          );
        }

        setAddresses(sortedAddresses);
      } catch (error) {
        console.error("Error loading addresses:", error);
        setError("Failed to load addresses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedAddresses();
  }, [userId, token, navigate, toast]);

  const deleteAddress = async (id: string) => {
    if (!userId || !token) {
      toast({
        title: "Authentication Error",
        description: "Login required to delete address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      clearUserData();
      navigate("/login");
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/addresses?userId=${userId}&addressId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = addresses
        .filter((address) => address._id !== id)
        .sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );

      // If addresses remain but no default is set, set the first one as default
      if (updated.length > 0 && !updated.some((addr) => addr.isDefault)) {
        await setDefaultAddress(updated[0]._id, false);
        const refresh = await axios.get<Address[]>(
          `${API_BASE_URL}/addresses?userId=${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sorted = refresh.data.sort((a, b) =>
          a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
        );
        setAddresses(sorted);
      } else {
        setAddresses(updated);
      }

      toast({
        title: "Address Deleted",
        description: "Address has been deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Deletion Error",
        description: "Failed to delete address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const setDefaultAddress = async (addressId: string, showToast = true) => {
    if (!userId || !token) {
      toast({
        title: "Authentication Error",
        description: "Login required to set default address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      clearUserData();
      navigate("/login");
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/address-set-default?userId=${userId}&addressId=${addressId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses((prevAddresses) =>
        prevAddresses
          .map((address) =>
            address._id === addressId
              ? { ...address, isDefault: true }
              : { ...address, isDefault: false }
          )
          .sort((a, b) =>
            a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1
          )
      );
      if (showToast) {
        toast({
          title: "Default Address Set",
          description: "This address is now your default address.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast({
        title: "Default Address Error",
        description: "Failed to set default address.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh" bg={containerBg}>
        <Spinner size="xl" color="blue.400" />
      </Center>
    );
  }

  return (
    <Box p={5} bg={containerBg} minH="100vh" transition="all 0.2s ease">
      <Text fontSize="2xl" fontWeight="600" mb={5} textAlign="center">
        Saved Addresses
      </Text>
      {error ? (
        <Text color="red.500" textAlign="center">
          {error}
        </Text>
      ) : addresses.length > 0 ? (
        <VStack spacing={4} align="stretch" maxW="1200px" mx="auto">
          {addresses.map((address) => (
            <Box
              key={address._id}
              p={5}
              bg={cardBg}
              borderRadius="md"
              color={cardTextColor}
              boxShadow="md"
              transition="transform 0.2s ease, box-shadow 0.2s ease"
              _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
            >
              <Text fontSize="md" mb={1}>
                <b>Name:</b> {address.name}
              </Text>
              <Text fontSize="md" mb={1}>
                <b>Email:</b> {address.email || "N/A"}
              </Text>
              <Text fontSize="md" mb={1}>
                <b>Mobile:</b> {address.mobileNo}
              </Text>
              <Text fontSize="md" mb={1}>
                <b>Address 1:</b> {address.houseNo}
              </Text>
              <Text fontSize="md" mb={1}>
                <b>Address 2:</b> {address.street}
              </Text>
              <Text fontSize="md" mb={1}>
                <b>City:</b> {address.city}
              </Text>
              <Text fontSize="md" mb={1}>
                <b>Postal Code:</b> {address.postalCode}
              </Text>
              <Button
                onClick={() => setDefaultAddress(address._id)}
                bg={address.isDefault ? buttonBgDefault : buttonBgNormal}
                color="white"
                mt={3}
                _hover={{ opacity: 0.9 }}
                width="100%"
              >
                {address.isDefault ? "Default Address" : "Set as Default"}
              </Button>
              <Button
                onClick={() => deleteAddress(address._id)}
                bg={buttonBgDelete}
                color="white"
                mt={2}
                _hover={{ opacity: 0.9 }}
                width="100%"
              >
                Delete Address
              </Button>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text fontSize="lg" color="gray.500" textAlign="center">
          No saved addresses found.
        </Text>
      )}
    </Box>
  );
};

export default SavedAddresses;
