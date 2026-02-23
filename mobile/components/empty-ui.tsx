import { View, Text, Pressable } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/build/Ionicons";
type EmptyUIProps = {
  title: string;
  subtitle: string;
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  iconSize?: number;
  buttonLabel?: string;
  onButtonPress?: () => void;
};
const EmptyUI = ({
  title,
  subtitle,
  iconName = "chatbubbles-outline",
  iconColor = "#6B6B70",
  iconSize = 64,
  buttonLabel,
  onButtonPress,
}: EmptyUIProps) => {
  return (
    <View className="flex-1 items-center justify-center py-20">
      {iconName && (
        <Ionicons name={iconName} size={iconSize} color={iconColor} />
      )}
      <Text className="text-muted-foreground text-lg mt-4">{title}</Text>
      {subtitle && (
        <Text className="text-muted-foreground text-sm mt-1">{subtitle}</Text>
      )}
      {buttonLabel && onButtonPress ? (
        <Pressable
          className="mt-6 bg-primary px-6 py-3 rounded-full"
          onPress={onButtonPress}>
          <Text className="text-surface-dark font-semibold">{buttonLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default EmptyUI;
