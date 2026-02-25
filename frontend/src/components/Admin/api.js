import axios from "axios";
import { API_BASE_URL } from "../../config/environment";
import { getAccessToken } from "../../services/authToken";

const API = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
});

API.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
