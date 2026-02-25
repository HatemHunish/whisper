import { View, Text, Pressable } from "react-native";
import React from "react";
import { Chat } from "@/types";
import { Image } from "expo-image";
import { formatDistanceToNow } from "date-fns";
import { useSocketStore } from "@/lib/socket";
type ChatItemProps = {
  chat: Chat;
  onPress: () => void;
};
const ChatItem = ({ chat, onPress }: ChatItemProps) => {
  const particapant = chat.participant;
  const { onlineUsers, typingUsers, unreadChats } = useSocketStore();
  const isOnline = onlineUsers.has(particapant._id);
  console.log(`Online users`, onlineUsers);
  const isTyping = typingUsers.get(chat._id) === particapant._id;
  const hasUnread = unreadChats.has(chat._id);
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-3 active:opacity-70">
      <View className="relative">
        <Image
          source={
            particapant.avatar
              ? { uri: particapant.avatar }
              : require("../assets/images/logo.png")
          }
          style={{ width: 56, height: 56, borderRadius: 999 }}
        />
        {isOnline && (
          <View className="absolute bottom-0 right-0 size-4 bg-green-500 rounded-full border-[3px] border-surface" />
        )}
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base font-medium ${hasUnread ? "text-primary" : "text-foreground"}`}>
            {particapant.name}
          </Text>
          <View className="flex-row items-center gap-2">
            {hasUnread && (
              <Text className="w-2.5 h-2.5 bg-primary rounded-full" />
            )}
            <Text className="text-xs text-subtle-foreground">
              {chat.lastMessageAt
                ? formatDistanceToNow(new Date(chat.lastMessageAt), {
                    addSuffix: false,
                  })
                : ""}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          {isTyping ? (
            <Text className="text-sm italic text-primary">Typing...</Text>
          ) : (
            <Text
              className={`text-sm flex-1 mr-3 ${hasUnread ? "text-foreground font-medium" : "text-subtle-foreground"}`}
              numberOfLines={1}>
              {chat.lastMessage?.text || "No messages yet"}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ChatItem;
