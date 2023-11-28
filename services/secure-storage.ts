import * as SecureStore from "expo-secure-store";

export function getItem(key: string) {
  return SecureStore.getItemAsync(key);
}

export function setItem(key: string, value: string) {
  return SecureStore.setItemAsync(key, value);
}

export function removeItem(key: string) {
  return SecureStore.deleteItemAsync(key);
}
