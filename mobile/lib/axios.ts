import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import * as Sentry from "@sentry/react-native";
const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const useApi = () => {
  const { getToken } = useAuth();
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API error:", error);
        if (error.response) {
          Sentry.logger.error(
            Sentry.logger
              .fmt`API request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`,
            {
              status: error.response.status,
              method: error.config?.method,
              url: error.config?.url,
            },
          );
        } else if (error.request) {
          Sentry.logger.error("API request made but no response received", {
            method: error.config?.method,
            url: error.config?.url,
          });
        }
        return Promise.reject(error);
      },
    );
    // Cleanup interceptor on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [getToken]);
  return api;
};
