import React, { useEffect } from "react";
import Lottie from "react-lottie";
import { motion, AnimatePresence } from "framer-motion";
import thumbsAnimation from "../src/assets/thumbs.json";
import sparkleAnimation from "../src/assets/sparkle.json";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Box, Heading, Text, VStack, Image } from "@chakra-ui/react";
import { cleanCart } from "../src/redux/cartReducer";

interface CartItem {
  id: string;
  name: string;
  image: string;
  size: string;
  quantity: number;
  price: number;
}

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const {
    orderId = "N/A",
    shippingCost = 0,
    total = 0,
    subtotal = 0,
    cart = [],
  } = location.state || {};

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      dispatch(cleanCart());
      navigate("/");
    }, 10000);

    return () => {
      clearTimeout(timer);
      dispatch(cleanCart());
    };
  }, [dispatch, navigate]);

  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: thumbsAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const sparkleOptions = {
    loop: false,
    autoplay: true,
    animationData: sparkleAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const pageBg = "#f2f2f2";

  return (
    <Box
      minH="100vh"
      bg={pageBg}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={8}
      w="100%"
    >
      <AnimatePresence>
        <MotionBox
          key="thank-you-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          bg="white"
          borderRadius="lg"
          boxShadow="lg"
          p={6}
          textAlign="center"
          w="100%"
          // You can limit width on large screens if desired:
          // maxW="800px"
        >
          <Lottie options={defaultOptions} height={150} width={150} />
          <Heading
            fontSize="2xl"
            fontWeight="600"
            color="green.600"
            mt={2}
            mb={4}
          >
            Your Order Has Been Received!
          </Heading>

          <Box
            bg="#fafafa"
            p={4}
            borderRadius="md"
            boxShadow="md"
            mb={4}
            textAlign="center"
          >
            <Text fontWeight="700" fontSize="lg" mb={2}>
              Order Number: {orderId}
            </Text>
            <Text color="#ff6347" fontWeight="600">
              Subtotal: {subtotal} EGP
            </Text>
            <Text color="#ff6347" fontWeight="600">
              Shipping: {subtotal > 2000 ? "Free" : `${shippingCost} EGP`}
            </Text>
            <Text color="black" fontWeight="700" mt={2}>
              Total: {total} EGP
            </Text>
            <Text fontSize="sm" mt={1}>
              Items: {cart.length}
            </Text>
          </Box>

          <MotionVStack
            spacing={4}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {cart.map((item: CartItem, index: number) => (
              <Box
                key={`${item.id}-${index}`}
                w="full"
                bg="white"
                boxShadow="sm"
                borderRadius="md"
                p={3}
                display="flex"
                alignItems="center"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  boxSize="70px"
                  objectFit="contain"
                  borderRadius="md"
                  mr={3}
                />
                <Box textAlign="left" flex="1">
                  <Text fontWeight="600" fontSize="md">
                    {item.name}
                  </Text>
                  <Text fontSize="sm">Size: {item.size}</Text>
                  <Text fontSize="sm">Qty: {item.quantity}</Text>
                  <Text color="orange.500" fontWeight="500" mt={1}>
                    Price: {item.price} EGP
                  </Text>
                </Box>
              </Box>
            ))}
          </MotionVStack>

          <Box mt={6}>
            <Lottie options={sparkleOptions} height={120} width={200} />
          </Box>
          <Text fontSize="sm" color="gray.600" mt={4}>
            (Redirecting you to the home page in 10 seconds...)
          </Text>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};

export default ThankYouPage;
