import { useApi } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
export const useAuthCallback = () => {
  const api = useApi();
  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api.post("/auth/callback");
        return data;
      } catch (error) {
        Alert.alert(
          "Authentication Error",
          "Failed to authenticate. Please try again.",
        );
        throw error;
      }
    },
  });
};
