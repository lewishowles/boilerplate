import createXanoApi from "@/composables/api/xano/xano-api";
import { xano } from "@/composables/api/xano/grouped/xano-client";

/**
 * Create a dedicated API adapter for each group in the shared Xano instance.
 *
 * @param  {string}  groupId
 *     The fixed Xano API group ID.
 *
 * @returns  {object}
 *     The API adapter for the fixed Xano group.
 */
export default function useGroupApi(groupId) {
	return createXanoApi({ client: xano, groupId, requireGroupId: true });
}
