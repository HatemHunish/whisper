import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
export default function useSocialAuth() {
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();
  console.log("useSocialAuth initialized, startSSOFlow available:", !!startSSOFlow);
  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      console.log("SSO flow completed, session ID:", createdSessionId);
      if (createdSessionId && setActive) {
        console.log("Social auth successful, session ID:", createdSessionId);
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.error("Social auth error:", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert(
        "Authentication Error",
        `Failed to sign in with ${provider}. Please try again.`,
      );
    } finally {
      setLoadingStrategy(null);
    }
  };

  return {
    loadingStrategy,
    handleSocialAuth,
  };
}
