import axios from "axios";
import { API_BASE_URL } from "../config/environment";
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from "./authToken";

let isRefreshing = false;
let pendingRequests = [];

const processQueue = (token) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

axios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isAuthEndpoint = (originalRequest.url || "").includes("/api/auth/");

    if (error.response?.status !== 401 || originalRequest.__retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(axios(originalRequest));
        });
      });
    }

    isRefreshing = true;
    originalRequest.__retry = true;
    try {
      const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh`, { refreshToken });
      const newAccessToken = refreshResponse?.data?.accessToken;
      if (!newAccessToken) throw new Error("No access token in refresh response");

      saveAuthTokens({ accessToken: newAccessToken });
      processQueue(newAccessToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axios(originalRequest);
    } catch (refreshErr) {
      clearAuthTokens();
      processQueue(null);
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);
