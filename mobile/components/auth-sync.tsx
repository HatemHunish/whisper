import { useAuthCallback } from "@/hooks/useAuth";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect, useRef } from "react";

const AuthSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { mutate: syncUser } = useAuthCallback();
  const hasSynced = useRef(false); // To prevent use effect from running multiple times
  useEffect(() => {
    if (isSignedIn && user && !hasSynced.current) { 
      hasSynced.current = true;

      syncUser(undefined, {
        onSuccess(data) {
          console.log("User synced successfully:", data.name);
        },
        onError(error) {
          console.error("Failed to sync user:", error);
        },
      });
    }
    if (!isSignedIn) {
      hasSynced.current = false; // reset sync status on sign out
    }
  }, [isSignedIn, user, syncUser]);
  return null;
};

export default AuthSync;
