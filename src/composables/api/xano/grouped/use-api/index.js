import useGroupApi from "@/composables/api/use-group-api";

// Xano group ID used by the application API adapter.
const applicationGroupId = import.meta.env.VITE_API_APP_GROUP;

/**
 * Add an adapter for the Xano application group.
 *
 * @returns  {object}
 *     The API adapter for the configured application group.
 */
export default function useApi() {
	return useGroupApi(applicationGroupId);
}
