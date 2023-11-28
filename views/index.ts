import { useCallback, useState } from "react";

export { createTheme } from "react-native-themesheet";
export { createCol, createRow } from "react-native-col";

export * from "./col";
export * from "./row";

export function useInput(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const [isTouched, setTouched] = useState(false);

  function set(val: string) {
    setTouched(true);
    setValue(val);
  }

  return {
    isTouched,
    set,
    value,
  };
}

type Input = [string, (value: string) => void, boolean];

export function useInputs(initialValues: string[]) {
  const [values, setValues] = useState(initialValues);
  const [areTouched, setTouched] = useState(initialValues.map(() => false));

  // function set(val: string) {
  //   setTouched(true);
  //   setValue(val);
  // }

  const createSet = useCallback(
    (index: number) => {
      return (newValue: string) => {
        const newAreTouched = Array.from(areTouched);
        const newValues = Array.from(values);

        newValues[index] = newValue;
        newAreTouched[index] = true;

        setValues(newValues);
        setTouched(newAreTouched);
      };
    },
    [areTouched, values],
  );

  return values.map((value, index) => [
    value,
    createSet(index),
    areTouched[index],
  ]) as Input[];
}
