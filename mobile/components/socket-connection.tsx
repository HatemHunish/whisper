import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";
import { useSocketStore } from "@/lib/socket";

const SocketConnection = () => {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const connect = useSocketStore((state) => state.connect);
  const disconnect = useSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (isSignedIn) {
      console.log("User is signed in, attempting to connect to socket...");
      getToken().then((token) => {
        if (token) connect(token, queryClient);
      });
    } else disconnect();
    return () => {
      console.log("Cleaning up socket connection...");
      disconnect();
    };
  }, [isSignedIn, getToken, connect, disconnect, queryClient]);
  return null;
};

export default SocketConnection;
