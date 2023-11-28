import { EffectCallback, useEffect } from "react";

// Credits: https://usehooks-ts.com/react-hook/use-effect-once
export function useInit(effect: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
