// authUtils.ts

// Save user data as plain strings without JSON
export const saveUserData = (userId: string, name: string, email: string) => {
  localStorage.setItem("userId", userId);
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
  console.log("Saved User ID:", userId); // Debug
};

export const getUserId = (): string | null => {
  const userId = localStorage.getItem("userId");
  console.log("Retrieved User ID:", userId); // Debug
  return userId;
};

export const getAuthToken = (): string | null =>
  localStorage.getItem("authToken");

export const clearUserData = () => {
  try {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("authToken");
  } catch (error) {
    console.error(
      "An error occurred while clearing user data from localStorage:",
      error
    );
  }
};

// Optional utility for retrieving a stored key with fallback
export const getItemFromLocalStorage = (
  key: string,
  defaultValue: string
): string => {
  const value = localStorage.getItem(key);
  return value ?? defaultValue;
};
