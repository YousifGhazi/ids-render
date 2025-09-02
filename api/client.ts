import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { camelizeKeys, decamelizeKeys } from "xcase";

// Create the base configuration
const baseConfig: AxiosRequestConfig = {
  baseURL: "https://identities.g4t.io/api/dashboard/v1/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// gloable the Axios instance
const api: AxiosInstance = axios.create(baseConfig);

api.interceptors.response.use((response) => {
  // Skip transformation for binary data (blob, arraybuffer)
  const isBinaryResponse =
    response.config.responseType === "blob" ||
    response.config.responseType === "arraybuffer";

  if (!isBinaryResponse) {
    // convert snake_case to camelCase only for non-binary responses
    response.data = camelizeKeys(response.data);
  }

  return response;
});

api.interceptors.request.use((config) => {
  // convert camelCase to snake_case conversion for form-data too
  if (config.data) {
    // Handle FormData separately
    if (config.data instanceof FormData) {
      const newFormData = new FormData();
      for (const [key, value] of config.data.entries()) {
        const snakeKey = decamelizeKeys({ [key]: value });
        newFormData.append(Object.keys(snakeKey)[0], value);
      }
      config.data = newFormData;
    } else {
      config.data = decamelizeKeys(config.data);
    }
  }
  if (config.params) config.params = decamelizeKeys(config.params);

  // Add authorization token if available
  if (typeof window !== "undefined") {
    try {
      const authStorage = localStorage.getItem("auth");

      if (authStorage) {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return config;
});

export { api };
