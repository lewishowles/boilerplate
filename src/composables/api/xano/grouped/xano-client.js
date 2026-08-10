import { XanoClient, XanoLocalStorage } from "@xano/js-sdk";

// Shared Xano instance client for all grouped API adapters.
export const xano = new XanoClient({
	instanceBaseUrl: import.meta.env.VITE_XANO_INSTANCE_BASE_URL,
	storage: new XanoLocalStorage(),
});
