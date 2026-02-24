import axios from "axios";
import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect } from "react";
import * as Sentry from "@sentry/react-native";
const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// response intercepter registered once to log all API errors to Sentry
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API error:", error.message);
//     if (error.response) {
//       Sentry.logger.error(
//         Sentry.logger
//           .fmt`API request failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`,
//         {
//           status: error.response.status,
//           method: error.config?.method,
//           url: error.config?.url,
//         },
//       );
//     } else if (error.request) {
//       Sentry.logger.error("API request made but no response received", {
//         method: error.config?.method,
//         url: error.config?.url,
//       });
//     }
//     return Promise.reject(error);
//   },
// );
export const useApi = () => {
  const { getToken } = useAuth();

  const apiWithAuth = useCallback(
    async <T>(config: Parameters<typeof api.request>[0]) => {
      const token = await getToken();
      return api.request<T>({
        ...config,
        headers: {
          ...config.headers,
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    [getToken],
  );

  return { api, apiWithAuth };
};
