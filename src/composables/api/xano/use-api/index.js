import createXanoApi from "@/composables/api/xano/xano-api";
import { xano } from "@/composables/api/xano/xano-client";

/**
 * Composable for making API calls with one configured Xano API group.
 *
 * @returns  {object}
 *     The API adapter for the configured Xano client.
 */
export default function useApi() {
	return createXanoApi({ client: xano });
}
