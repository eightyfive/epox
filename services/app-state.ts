import { AppState } from "react-native";

type Listener = () => void;

const background: Set<Listener> = new Set();

const foreground: Set<Listener> = new Set();

export function addBackgroundListener(listener: Listener) {
  background.add(listener);
}

export function removeBackgroundListener(listener: Listener) {
  background.delete(listener);
}

export function addForegroundListener(listener: Listener) {
  foreground.add(listener);
}

export function removeForegroundListener(listener: Listener) {
  foreground.delete(listener);
}

// INIT
let wasForeground = true;

AppState.addEventListener("change", (status) => {
  const isBackground = status !== "active";

  if (isBackground) {
    background.forEach((listener) => {
      listener();
    });
  } else if (!wasForeground) {
    foreground.forEach((listener) => {
      listener();
    });
  }

  wasForeground = !isBackground;
});
