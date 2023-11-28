import { ComponentType } from "react";
import { ViewProps } from "react-native";
import { createRow, flexStyles as $ } from "react-native-col";

export function createRow1<P extends ViewProps>(Component: ComponentType<any>) {
  return createRow<P>(({ style, ...rest }) => (
    <Component {...rest} style={[$.f1, style]} />
  ));
}
