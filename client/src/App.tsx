// App.tsx
import React, { useEffect, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Box, Flex, Spinner, Center } from "@chakra-ui/react";
import { Provider } from "react-redux";
import store from "./store";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import MobileAppBanner from "./components/MobileAppBanner";
import { DirectionProvider } from "./assets/DirectionContext";
import ReactGA from "react-ga4";
import { AuthProvider } from "./components/authContext";
import axios from "axios";
import "../src/ProfileScreens/axiosSetup";
import { API_BASE_URL } from "./api";


ReactGA.initialize("G-98H33R3ELB");

const HomePage = lazy(() => import("./components/HomePage"));
const ProductGrid = lazy(() => import("./components/ProductGrid"));
const ProductPage = lazy(() => import("./components/ProductPage"));
const CartPage = lazy(() => import("../cartsscreens/CartPage"));
const CheckoutPage = lazy(() => import("../cartsscreens/CheckoutPage"));
const AboutUs = lazy(() => import("./components/AboutUs"));
const Profile = lazy(() => import("./ProfileScreens/Profile"));
const LoginScreen = lazy(() => import("./ProfileScreens/Login"));
const ThankYouPage = lazy(() => import("../cartsscreens/ThankYouPage"));
const Register = lazy(() => import("./ProfileScreens/Register"));
const SavedItems = lazy(() => import("./ProfileScreens/SavedItems"));
const SavedAddresses = lazy(() => import("./ProfileScreens/SavedAddresses"));
const MyOrders = lazy(() => import("./ProfileScreens/MyOrders"));
const ChangePassword = lazy(() => import("./ProfileScreens/ChangePassword"));
const ResetPassword = lazy(() => import("./ProfileScreens/ResetPassword"));

const NotFoundPage = () => <p>Page not found</p>;

function AppContent() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [bannerClosed, setBannerClosed] = useState(
    localStorage.getItem("bannerClosed") === "true"
  );
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  useEffect(() => {
    document.title = "Wall Masters";
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseBanner = () => {
    setBannerClosed(true);
    localStorage.setItem("bannerClosed", "true");
  };

  // Token Initialization Logic
  useEffect(() => {
    const init = async () => {
      console.log("App: Checking tokens on app load...");
      const authToken = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!authToken && refreshToken) {
        console.log(
          "No authToken found, but refreshToken exists. Attempting to refresh..."
        );
        try {
          const response = await axios.post(
            `${API_BASE_URL}/refresh-token`,
            { refreshToken }
          );
          const {
            token: newAccessToken,
            refreshToken: newRefreshToken,
            user,
          } = response.data;
          localStorage.setItem("authToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("userId", user._id);
          console.log("Token refreshed successfully, user stays logged in.");
        } catch (error) {
          console.error("Auto refresh token failed:", error);
          console.log("Clearing tokens and continuing as guest...");
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
        }
      } else {
        if (!authToken && !refreshToken) {
          console.log("No tokens found, continuing as a guest user.");
        } else {
          console.log("Auth token found, user considered logged in.");
        }
      }

      // Initialization complete, now we can render the rest of the app
      setIsInitialized(true);
    };

    init();
  }, []);

  if (!isInitialized) {
    // Show a spinner until token logic completes
    return (
      <Center flex="1" minHeight="100vh">
        <Spinner size="xl" color="#ff6347" />
      </Center>
    );
  }

  return (
    <Flex direction="column" minHeight="100vh">
      <NavBar />
      {isMobile && !bannerClosed && (
        <MobileAppBanner onClose={handleCloseBanner} />
      )}

      <Box flex="1" display="flex" flexDirection="column" pt="60px">
        <Suspense
          fallback={
            <Center flex="1">
              <Spinner size="xl" color="#ff6347" />
            </Center>
          }
        >
          <Routes>
            {/* No AppInitializer route now, homepage is accessible to guests */}
            <Route path="/" element={<HomePage />} />
            <Route path="/product-grid" element={<ProductGrid />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<Register />} />
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/myorders" element={<MyOrders />} />
            <Route path="/savedaddresses" element={<SavedAddresses />} />
            <Route path="/saveditems" element={<SavedItems />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Box>
      <Footer />
    </Flex>
  );
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <DirectionProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </DirectionProvider>
    </Provider>
  );
};

export default App;
