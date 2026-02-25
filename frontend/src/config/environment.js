const normalizeBaseUrl = (url, fallback) => {
  const value = (url || fallback || "").trim();
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export const APP_BASE_URL = normalizeBaseUrl(
  process.env.REACT_APP_BASE_URL,
  "http://localhost:10000"
);

export const API_BASE_URL = `${APP_BASE_URL}/api`;
export const WS_BASE_URL = APP_BASE_URL;
