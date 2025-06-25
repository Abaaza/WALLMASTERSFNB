import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Image,
  VStack,
  HStack,
  Spinner,
  Center,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import { useAuth } from "../components/authContext";

type Product = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
};

type Order = {
  _id: string;
  orderId: string;
  createdAt: string;
  totalPrice: number;
  products: Product[];
};

const OrderItemDetails: React.FC<{ product: Product }> = ({ product }) => {
  const itemBg = useColorModeValue("white", "gray.700");
  const itemTextColor = useColorModeValue("gray.800", "gray.200");
  const itemPriceColor = useColorModeValue("#ff6347", "#ff867f");

  return (
    <HStack
      align="center"
      bg={itemBg}
      p={3}
      borderRadius="md"
      boxShadow="md"
      mb={2}
      width="full"
      _hover={{ boxShadow: "lg", transform: "scale(1.01)" }}
      transition="all 0.2s ease"
    >
      <Image
        src={product.image}
        alt={product.name}
        boxSize="80px"
        borderRadius="md"
        objectFit="contain"
      />
      <VStack align="start" spacing={1} ml={4} color={itemTextColor}>
        <Text fontSize="md" fontWeight="600" noOfLines={1}>
          {product.name}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Size: {product.size}
        </Text>
        <Text fontSize="sm" fontWeight="600" color={itemPriceColor}>
          Price: {product.price} EGP
        </Text>
        <Text fontSize="sm" color="gray.600">
          Qty: {product.quantity}
        </Text>
      </VStack>
    </HStack>
  );
};

const OrderItem: React.FC<{ order: Order }> = ({ order }) => {
  const orderBg = useColorModeValue("gray.100", "gray.600");
  const orderTextColor = useColorModeValue("gray.600", "gray.300");
  const totalColor = useColorModeValue("#ff6347", "#ff867f");

  return (
    <Box
      p={4}
      bg={orderBg}
      borderRadius="md"
      mb={3}
      boxShadow="lg"
      width="100%"
      transition="all 0.2s ease"
      _hover={{ boxShadow: "xl", transform: "scale(1.01)" }}
    >
      <Text fontSize="lg" fontWeight="700" mb={1} color={orderTextColor}>
        Order ID: {order.orderId}
      </Text>
      <Text fontSize="sm" color={orderTextColor} mb={2}>
        Date: {new Date(order.createdAt).toLocaleDateString()}
      </Text>
      <Text fontSize="md" fontWeight="700" color={totalColor} mb={3}>
        Total: {order.totalPrice} EGP
      </Text>

      <VStack spacing={3} align="stretch">
        {order.products.map((product, index) => (
          <OrderItemDetails
            key={`${product.productId}-${index}`}
            product={product}
          />
        ))}
      </VStack>
    </Box>
  );
};

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textColor = useColorModeValue("gray.700", "gray.300");
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: "User Not Authenticated",
          description: "Please log in to view orders.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const userId = localStorage.getItem("userId")?.replace(/["\\]/g, "");
      const authToken = localStorage.getItem("authToken");
      
      if (!userId || !authToken) {
        toast({
          title: "User Not Found",
          description: "No user ID or token found. Please log in.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
        return;
      }

      const response = await axios.get<Order[]>(
        `${API_BASE_URL}/orders-get?userId=${userId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      setOrders(response.data);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="#ff6347" />
        <Text mt={4} color={textColor}>
          Loading orders...
        </Text>
      </Center>
    );
  }

  if (orders.length === 0) {
    return (
      <Center h="60vh">
        <Text fontSize="lg" color={textColor}>
          No orders found.
        </Text>
      </Center>
    );
  }

  return (
    <Box
      mt={2}
      p={7}
      width="100%"
      mx="auto"
      minHeight="100vh"
      color={textColor}
    >
      <Text fontSize="2xl" fontWeight="600" mb={4}>
        My Orders
      </Text>
      <VStack spacing={5} align="stretch">
        {orders.map((order) => (
          <OrderItem key={order._id} order={order} />
        ))}
      </VStack>
    </Box>
  );
};

export default MyOrders;
