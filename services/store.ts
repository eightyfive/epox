import * as Notifications from "expo-notifications";
import _pick from "lodash.pick";
import { create as createStore } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";

import * as SecureStorage from "./secure-storage";

//
// State
//
export interface GlobalState {
  accessToken: string;
  isHydrating: boolean;
  maintenance: boolean;
  permissions: {
    notifications: Notifications.PermissionStatus;
  };
  updateAvailable: boolean;
  upgradeAvailable: boolean;
}

export interface GlobalActions {
  requestPushPermission: () => Promise<Notifications.PermissionStatus>;
  setMaintenance: (value: boolean) => void;
  setUpdateAvailable: (value: boolean) => void;
  setUpgradeAvailable: (value: boolean) => void;
  startSession: (accessToken: string) => void;
  stopSession: () => void;
}

type GlobalStateOptions = {
  persist?: string[];
};

export function createGlobalState<T extends object>(
  name: string,
  initialState: T,
  options: GlobalStateOptions = {},
) {
  const whiteList = ["accessToken", ...(options.persist ?? [])];

  const store = createStore<T & GlobalState>()(
    persist(
      subscribeWithSelector((set) => ({
        ...initialState,
        accessToken: "",
        isHydrating: true,
        maintenance: false,
        permissions: {
          notifications: "undetermined" as Notifications.PermissionStatus,
        },
        updateAvailable: false,
        upgradeAvailable: false,
      })),
      {
        name,
        storage: createJSONStorage(() => SecureStorage),
        onRehydrateStorage: () => {
          return (_state, error) => {
            if (error) {
              console.log("[Store.onRehydrateStorage]", error);
            }

            init();
          };
        },
        partialize: (state) => _pick(state, whiteList),
      },
    ),
  );

  async function init() {
    const res = await Notifications.getPermissionsAsync();

    store.setState((state) => {
      return {
        ...state,
        isHydrating: false,
        permissions: {
          notifications: res.status,
        },
      };
    });
  }

  const actions: GlobalActions = {
    async requestPushPermission() {
      const res = await Notifications.requestPermissionsAsync();

      store.setState((state) => {
        return {
          ...state,
          permissions: {
            notifications: res.status,
          },
        };
      });

      return res.status;
    },

    setMaintenance(value: boolean) {
      store.setState((state) => {
        return {
          ...state,
          maintenance: value,
        };
      });
    },

    setUpdateAvailable(value: boolean) {
      store.setState((state) => {
        return {
          ...state,
          updateAvailable: value,
        };
      });
    },

    setUpgradeAvailable(value: boolean) {
      store.setState((state) => {
        return {
          ...state,
          upgradeAvailable: value,
        };
      });
    },

    startSession(accessToken: string) {
      store.setState((state) => {
        return {
          ...state,
          accessToken,
        };
      });
    },

    stopSession() {
      store.setState((state) => {
        return {
          ...state,
          accessToken: "",
        };
      });
    },
  };

  return [store, actions] as [typeof store, GlobalActions];
}
