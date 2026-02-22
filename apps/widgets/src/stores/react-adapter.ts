import { useSyncExternalStore } from "react";
import type { StoreApi } from "zustand/vanilla";

export function useStore<T, S>(
  store: StoreApi<T>,
  selector: (state: T) => S,
): S {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

export function useStoreActions<T>(store: StoreApi<T>): T {
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState(),
    () => store.getState(),
  );
}
