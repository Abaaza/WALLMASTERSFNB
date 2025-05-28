import axios from "axios";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRrefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  const response = await axios.post(
    "https://nhts6foy5k.execute-api.me-south-1.amazonaws.com/dev/refresh-token",
    { refreshToken }
  );

  const { token: newAccessToken, refreshToken: newRefreshToken, user } =
    response.data;

  localStorage.setItem("authToken", newAccessToken);
  localStorage.setItem("refreshToken", newRefreshToken);
  localStorage.setItem("userId", user._id);

  return newAccessToken;
}

// Set up a request interceptor to add the Auth token to headers
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Set up a response interceptor to handle 401 errors and refresh tokens
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          onRrefreshed(newToken);

          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          // If refresh fails, redirect to login
          localStorage.removeItem("authToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        addRefreshSubscriber((token: string) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          resolve(axios(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);
