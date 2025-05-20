import {
  InternalNgxWebstorageFeatureKind,
  LOCAL_STORAGE,
  LocalStorageService,
  LocalStorageStrategy,
  makeNgxWebstorageFeature,
  STORAGE_STRATEGIES,
  StorageStrategies,
  StorageStrategy,
  StrategyIndex,
  SyncStorage,
  withLocalStorage,
} from "ngx-webstorage";

export function withNgxLocalStorageFallback() {
  try {
    localStorage.setItem("pws:localStorage", "true");

    if (localStorage.getItem("pws:localStorage") === "true") {
      localStorage.removeItem("pws:localStorage");
      return withLocalStorage();
    }
  } catch (error) {
    console.warn("Failed to initialize localStorage", error);
  }

  return makeNgxWebstorageFeature(InternalNgxWebstorageFeatureKind.LocalStorage, [
    {
      provide: LOCAL_STORAGE,
      useFactory: () => {
        const memory = new Map<string, any>();
        const obj: Storage = {
          getItem(key: string): any {
            if (key === null || key === undefined || !memory.has(key)) {
              return null;
            }

            return memory.get(key);
          },

          setItem(key: string, value: any) {
            if (key === null || key === undefined) {
              return;
            }

            memory.set(key, value);
          },

          removeItem(key: string) {
            if (key === null || key === undefined || !memory.has(key)) {
              return;
            }

            memory.delete(key);
          },

          clear() {
            memory.clear();
          },

          key(index: number): string | null {
            const keys = Array.from(memory.keys());
            return keys[index] || null;
          },

          get length() {
            return memory.size;
          },
        };

        return obj;
      },
    },
    {
      provide: LocalStorageService,
      useFactory: (index: StrategyIndex) => {
        const strategy: StorageStrategy<any> = index.indexStrategy(StorageStrategies.Local);
        return new SyncStorage(strategy);
      },
      deps: [StrategyIndex],
    },
    { provide: STORAGE_STRATEGIES, useClass: LocalStorageStrategy, multi: true },
  ]);
}
