import { View, Text, ScrollView, Pressable } from "react-native";
import React from "react";
import { useAuth } from "@clerk/clerk-expo";

const ProfileTab = () => {
  const { signOut } = useAuth();
  return (
    <ScrollView
      className="bg-surface"
      contentInsetAdjustmentBehavior="automatic">
      <Text className="text-white">ProfileTab</Text>
      <View className="flex-1 items-center justify-center">
        <Pressable
          className="bg-red-500 p-4 rounded-lg " 
          onPress={() => signOut()}>
          <Text className="text-white">Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default ProfileTab;
