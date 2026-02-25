import { create } from "zustand";
import { Socket, io } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import { Chat, Message, MessageSender } from "@/types";
import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
const SOCKET_URL ='https://whisper-kcnm.onrender.com'
//   process.env.EXPO_PUBLIC_SOCKET_URL || Platform.OS === "android"
//     ? "http://10.0.2.2:3000"
//     : "http://localhost:3000";
interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string>;
  unreadChats: Set<string>;
  currentChatId: string | null;
  queryClient: QueryClient | null;

  connect: (token: string, queryClient: QueryClient) => void;
  disconnect: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (
    chatId: string,
    text: string,
    currentUser: MessageSender,
  ) => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
  unreadChats: new Set(),
  currentChatId: null,
  queryClient: null,
  connect: (token: string, queryClient: QueryClient) => {
    const existingSocket = get().socket;
    if (existingSocket?.connected) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("connect", () => {
      console.log("Connected to socket server", socket.id);
      set({ isConnected: true });
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from socket server", socket.id);
      set({ isConnected: false });
    });
    socket.on("online-users", ({ userIds }: { userIds: string[] }) => {
      console.log("Online users updated:", userIds);
      set({ onlineUsers: new Set(userIds) });
    });
    socket.on("user-online", ({ userId }: { userId: string }) => {
      console.log("User online:", userId);
      set((state) => ({
        onlineUsers: new Set([...state.onlineUsers, userId]),
      }));
      socket.on("user-offline", ({ userId }: { userId: string }) => {
        console.log("User offline:", userId);
        set((state) => {
          const onlineUsers = new Set(state.onlineUsers);
          onlineUsers.delete(userId);
          return { onlineUsers };
        });
      });
      socket.on("socket-error", (error: { message: string }) => {
        console.error("Socket error:", error.message);
        Sentry.logger.error("Socket error: " + error.message, {
          message: error.message,
        });
      });
      set({ socket, queryClient });
    });
    socket.on("new-message", (message: Message) => {
      const senderId = (message.sender as MessageSender)._id;
      const { currentChatId } = get();

      queryClient.setQueryData<Message[]>(
        ["messages", message.chat],
        (oldData: any) => {
          if (!oldData) return [message];
          // remove optimisitc message if exists
          const filtered = oldData.filter(
            (m: Message) => !m._id.toString().startsWith("temp-"),
          );
          // avoid duplicate message if optimisitc message exists
          if (filtered.some((m: Message) => m._id === message._id))
            return filtered;
          return [...filtered, message];
        },
      );
      // update last message in chat list
      queryClient.setQueryData<Chat[]>(["chats"], (oldChats) => {
        return oldChats?.map((chat) => {
          if (chat._id === message.chat) {
            return {
              ...chat,
              lastMessage: {
                _id: message._id,
                text: message.text,
                sender: senderId,
                createdAt: message.createdAt,
              },
              lastMessageAt: message.createdAt,
            };
          }
          return chat;
        });
      });
      // mark as unread if currenly viewing this chat and message is from other user
      if (currentChatId !== message.chat) {
        const chats = queryClient.getQueryData<Chat[]>(["chats"]);
        const chat = chats?.find((c) => c._id === message.chat);
        if (chat?.participant && senderId === chat.participant._id) {
          set((state) => ({
            unreadChats: new Set([...state.unreadChats, message.chat]),
          }));
        }
      }
      // clear typring indicator when new message arrives
      set((state) => {
        const typingUsers = new Map(state.typingUsers);
        typingUsers.delete(message.chat);
        return { typingUsers: typingUsers };
      });
    });

    socket.on(
      "typing",
      ({
        userId,
        chatId,
        isTyping,
      }: {
        userId: string;
        chatId: string;
        isTyping: boolean;
      }) => {
        set((state) => {
          const typingUsers = new Map(state.typingUsers);
          if (isTyping) typingUsers.set(chatId, userId);
          else typingUsers.delete(chatId);
          return { typingUsers };
        });
      },
    );
  },
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({
        socket: null,
        isConnected: false,
        onlineUsers: new Set(),
        typingUsers: new Map(),
        unreadChats: new Set(),
        currentChatId: null,
        queryClient: null,
      });
    }
  },
  joinChat: (chatId: string) => {
    const socket = get().socket;
    set((state) => {
      const unreadChats = new Set(state.unreadChats);
      unreadChats.delete(chatId);
      return { currentChatId: chatId, unreadChats };
    });
    if (socket?.connected) {
      socket.emit("join-chat", chatId);
    }
  },
  leaveChat: (chatId) => {
    const socket = get().socket;
    set({ currentChatId: null });
    if (socket?.connected) {
      socket.emit("leave-chat", chatId);
    }
  },
  sendMessage: (chatId, text, currentUser) => {
    const { socket, queryClient } = get();
    if (!socket?.connected || !queryClient) return;
    // optimisitc update
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      _id: tempId,
      chat: chatId,
      sender: currentUser,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // add optimisitc message to cache
    queryClient.setQueryData<Message[]>(
      ["messages", chatId],
      (oldData: any) => {
        return oldData ? [...oldData, optimisticMessage] : [optimisticMessage];
      },
    );
    socket.emit("send-message", { chatId, text });
    Sentry.logger.info("Message Sent Successfully", {
      chatId,
      messageLength: text.length,
    });
    const errorHandler = (error: { message: string }) => {
      console.error("Error sending message:", error.message);
      Sentry.logger.error("Error sending message: " + error.message, {
        message: error.message,
      });
      // remove optimisitc message from cache
      queryClient.setQueryData<Message[]>(
        ["messages", chatId],
        (oldData: any) => {
          return oldData
            ? oldData.filter((msg: Message) => msg._id !== tempId)
            : [];
        },
      );
      socket.off("socket-error", errorHandler);
    };
    socket.once("socket-error", errorHandler);
  },
  sendTyping: (chatId, isTyping) => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.emit("typing", { chatId, isTyping });
    }
  },
}));
