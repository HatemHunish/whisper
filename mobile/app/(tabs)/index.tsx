import {
  Text,
  ScrollView,
  Button,
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import React from "react";
import { useApi } from "@/lib/axios";
import { useRouter } from "expo-router";
import { useChats } from "@/hooks/use-chat";
import { Ionicons } from "@expo/vector-icons";
import { Chat, MockChats } from "@/types";
import ChatItem from "@/components/chat-item";
import EmptyUI from "@/components/empty-ui";
const ChatsTab = () => {
  const router = useRouter();
  const { data: chats, isLoading, error, refetch } = useChats();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator size="large" color="#f4A261" />
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-surface gap-4">
        <Ionicons name="alert-circle-outline" size={32} color="red" />
        <Text className="text-red-500 ">
          Failed to load chats. Please try again later.
        </Text>
        <Pressable
          className="px-6 py-2 bg-primary rounded-full"
          onPress={() => refetch()}>
          <Text className="text-white font-medium">Retry</Text>
        </Pressable>
      </View>
    );
  }
  const handleChatPress = (chat: Chat) => {
    router.push({
      pathname: `/chat/[id]`,
      params: {
        id: chat._id,
        name: chat.participant.name,
        avatar: chat.participant.avatar,
        participantId: chat.participant._id,
      },
    });
  };
  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={MockChats}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatItem chat={item} onPress={() => handleChatPress(item)} />
        )}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        ListHeaderComponent={<Header />}
        ListEmptyComponent={
          <EmptyUI
            title="No chats yet"
            subtitle="Start a new conversation!"
            iconColor="#6B6B70"
            iconSize={64}
            buttonLabel="New Chat"
            onButtonPress={() => router.push("/(tabs)")}
          />
        }
      />
    </View>
  );
};

export default ChatsTab;

function Header() {
  const router = useRouter();
  return (
    <View className="px-5 pt-2 pb-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Chats</Text>
        <Pressable className="size-10 bg-primary rounded-full items-center justify-center">
          <Ionicons name="create-outline" size={20} color="#0D0D0F" />
        </Pressable>
      </View>
    </View>
  );
}
