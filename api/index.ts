import * as Application from "expo-application";
import { Api } from "fetch-run";
import { createLogger, errorMetro } from "fetch-run/use";
import _merge from "lodash.merge";
import { Platform } from "react-native";

const appVersion = Application.nativeApplicationVersion;

const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  "X-Platform": Platform.OS,
  "X-AppVersion": appVersion ?? "0.0.0",
};

export function createApi(url: string, options?: RequestInit, verbose = false) {
  const api = new Api(url, _merge({}, { headers: defaultHeaders }, options));

  if (__DEV__) {
    api.use(createLogger({ verbose }));
  }

  api.use(errorMetro);

  return api;
}
