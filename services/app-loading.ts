import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useInit } from "./utils";

SplashScreen.preventAutoHideAsync();

type FontType = string | Record<string, Font.FontSource>;

function loadFonts(fonts: FontType[]) {
  return Promise.all(fonts.map((font) => Font.loadAsync(font)));
}

export function useAppLoading(fonts: FontType[] = []) {
  // State
  const [isLoading, setLoading] = useState(true);

  // Vars
  const isForeground = useRef(true);
  const isSplashVisible = useRef(true);
  const isAppReady = useRef(false);

  // Handlers
  const hideSplashScreen = useCallback(async () => {
    isSplashVisible.current = false;

    await SplashScreen.hideAsync();
  }, []);

  const maybeHideSplashScreen = useCallback(async () => {
    isAppReady.current = true;

    if (isForeground.current) {
      await hideSplashScreen();
    }
  }, [hideSplashScreen]);

  // Effects
  useInit(() => {
    async function load() {
      try {
        await loadFonts(fonts);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  });

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (status: AppStateStatus) => {
        isForeground.current = status === "active";

        if (
          isForeground.current &&
          isAppReady.current &&
          isSplashVisible.current
        ) {
          await hideSplashScreen();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [hideSplashScreen]);

  return {
    isLoading,
    hideSplashScreen: maybeHideSplashScreen,
  };
}
