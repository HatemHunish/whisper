import { useApi } from "@/lib/axios";
import { User } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
export const useAuthCallback = () => {
  const api = useApi();
  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api.apiWithAuth<User>({
          method: "POST",
          url: "/auth/callback",
        });
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

export const useCurrentUser = () => {
  const { apiWithAuth } = useApi();
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data } = await apiWithAuth<User>({
        method: "GET",
        url: "/auth/current",
      });
      console.log("Fetched current user:", data);
      return data;
    },
  });
};
