import { get, set, del } from "idb-keyval";
import { Persister } from "@tanstack/react-query-persist-client";

export function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
  return {
    persistClient: async (client: any) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}
