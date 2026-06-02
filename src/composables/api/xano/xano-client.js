import { XanoClient, XanoLocalStorage } from "@xano/js-sdk";

// Shared Xano client used by the Xano API helper.
export const xano = new XanoClient({
	apiGroupBaseUrl: "{{ API_BASE_URL }}",
	storage: new XanoLocalStorage(),
});
