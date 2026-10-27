import { Platform } from "react-native";

const ACCESS_KEY = "cc_access_token";
const REFRESH_KEY = "cc_refresh_token";

function secureStore() {
  // expo-secure-store не поддерживается на web; используем localStorage.
  if (Platform.OS === "web") return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("expo-secure-store") as typeof import("expo-secure-store");
}

export async function getAccessToken(): Promise<string | null> {
  const ss = secureStore();
  if (!ss) return (typeof localStorage !== "undefined" ? localStorage.getItem(ACCESS_KEY) : null);
  return ss.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  const ss = secureStore();
  if (!ss) return (typeof localStorage !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null);
  return ss.getItemAsync(REFRESH_KEY);
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  const ss = secureStore();
  if (!ss) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ACCESS_KEY, access);
      localStorage.setItem(REFRESH_KEY, refresh);
    }
    return;
  }
  await ss.setItemAsync(ACCESS_KEY, access);
  await ss.setItemAsync(REFRESH_KEY, refresh);
}

export async function clearTokens(): Promise<void> {
  const ss = secureStore();
  if (!ss) {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    return;
  }
  await ss.deleteItemAsync(ACCESS_KEY);
  await ss.deleteItemAsync(REFRESH_KEY);
}