import { useRef } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useInit } from "./utils";

export function useForeground(callback: () => void) {
  const wasForeground = useRef(true);

  useInit(() => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        const isForeground = status === "active";

        if (!wasForeground.current && isForeground) {
          callback();
        }

        wasForeground.current = isForeground;
      },
    );

    return () => {
      subscription.remove();
    };
  });
}
