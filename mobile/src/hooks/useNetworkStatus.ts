import { useCallback, useEffect, useState } from "react";
import { AppState, Platform } from "react-native";

/**
 * Device connectivity only. Backend being down ≠ offline.
 * Web: navigator.onLine. Native: assume online until NetInfo/expo-network is added.
 */
function readDeviceOnline(): boolean {
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return false;
    }
  }
  return true;
}

export function useNetworkStatus() {
  const [online, setOnline] = useState(readDeviceOnline);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    setChecking(true);
    const ok = readDeviceOnline();
    setOnline(ok);
    setChecking(false);
    return ok;
  }, []);

  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onOnline = () => setOnline(true);
      const onOffline = () => setOnline(false);
      window.addEventListener("online", onOnline);
      window.addEventListener("offline", onOffline);
      return () => {
        sub.remove();
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
      };
    }

    return () => sub.remove();
  }, [refresh]);

  return { online, checking, refresh };
}
