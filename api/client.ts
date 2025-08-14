import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { camelizeKeys, decamelizeKeys } from "xcase";

// Create the base configuration
const baseConfig: AxiosRequestConfig = {
  baseURL: "http://localhost:3002",
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
};

// gloable the Axios instance
const api: AxiosInstance = axios.create(baseConfig);

api.interceptors.response.use((response) => {
  response.data = camelizeKeys(response.data);
  return response;
});

api.interceptors.request.use((config) => {
  // if (config.data) config.data = decamelizeKeys(config.data);
  // if (config.params) config.params = decamelizeKeys(config.params);
  return config;
});

export { api };
