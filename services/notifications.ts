import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const isAndroid = Platform.OS === "android";

// https://docs.expo.dev/versions/latest/sdk/notifications/#android-1
if (isAndroid) {
  Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

export async function getPushToken() {
  // https://github.com/expo/expo/issues/23225#issuecomment-1624028839
  const projectId = Constants?.expoConfig?.extra?.eas.projectId;

  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  // https://docs.expo.dev/versions/latest/sdk/notifications/#expopushtoken
  return token.data;
}
