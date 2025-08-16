import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { camelizeKeys, decamelizeKeys } from "xcase";

// Create the base configuration
const baseConfig: AxiosRequestConfig = {
  baseURL: "http://82.25.101.56:1212/api/dashboard/v1/",
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
  // convert camelCase to snake_case
  if (config.data) config.data = decamelizeKeys(config.data);
  if (config.params) config.params = decamelizeKeys(config.params);

  // Add authorization token if available
  if (typeof window !== "undefined") {
    try {
      const authStorage = localStorage.getItem("auth-storage");
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
