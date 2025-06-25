// authContext.tsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    
    if (authToken && userId) {
      setIsAuthenticated(true);
      // Optionally fetch user details here
      const userName = localStorage.getItem("userName") || "";
      const userEmail = localStorage.getItem("userEmail") || "";
      setUser({
        _id: userId,
        name: userName,
        email: userEmail,
      });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email: email.toLowerCase(),
        password,
      });

      const { token, refreshToken, user: userData } = response.data;
      const userId = userData?._id;

      if (token && refreshToken && userId) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userData.name || "");
        localStorage.setItem("userEmail", userData.email || "");

        setUser({
          _id: userId,
          name: userData.name || "",
          email: userData.email || "",
        });
        setIsAuthenticated(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // Function to refresh auth state (useful after external login)
  const refreshAuth = () => {
    checkAuthStatus();
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
