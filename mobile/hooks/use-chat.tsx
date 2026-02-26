import { useApi } from "@/lib/axios";
import { Chat } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useChats = () => {
  const { apiWithAuth } = useApi();
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const { data } = await apiWithAuth<Chat[]>({
        method: "GET",
        url: "/chats",
      });
      console.log("Fetched chats:", data);
      return data;
    },
  });
};

export const useGetOrCreateChat = () => {
  const { apiWithAuth } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data } = await apiWithAuth<Chat>({
        method: "POST",
        url: `/chats/with/${participantId}`,
      });
      console.log("Chat created or fetched:", data);
      return data;
    },
    onSuccess: () => {
      // Invalidate the chats query to refetch the list of chats      // This ensures that the newly created chat appears in the list
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};

export const useDeleteChat = () => {
  const { apiWithAuth } = useApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chatId: string) => {
      await apiWithAuth({
        method: "DELETE",
        url: `/chats/${chatId}`,
      });
    },
    onSuccess: () => {
      // Invalidate the chats query to refetch the list of chats after deletion
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });
};
