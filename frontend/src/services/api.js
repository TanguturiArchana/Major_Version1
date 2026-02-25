import axios from "axios";
import { API_BASE_URL } from "../config/environment";
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from "./authToken";

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isAuthEndpoint = (originalRequest.url || "").includes("/auth/");
    if (error.response?.status !== 401 || originalRequest.__retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    originalRequest.__retry = true;
    try {
      const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh`, { refreshToken });
      const newAccessToken = refreshResponse?.data?.accessToken;
      if (!newAccessToken) throw new Error("No access token in refresh response");
      saveAuthTokens({ accessToken: newAccessToken });
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return API(originalRequest);
    } catch (refreshErr) {
      clearAuthTokens();
      return Promise.reject(refreshErr);
    }
  }
);

export default API;
