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
  // convert snake_case to camelCase
  response.data = camelizeKeys(response.data);
  return response;
});

api.interceptors.request.use((config) => {
  // Skip transformation for FormData
  const isFormData = config.headers["Content-Type"] === "multipart/form-data";

  // convert camelCase to snake_case
  if (config.data && !isFormData) config.data = decamelizeKeys(config.data);
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
