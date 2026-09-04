import useGroupApi from "@/composables/api/use-group-api";

// Xano group ID used by the authentication API adapter.
const authenticationGroupId = import.meta.env.VITE_API_AUTH_GROUP;

/**
 * Add an adapter for the Xano authentication group.
 *
 * @returns  {object}
 *     The API adapter for the configured authentication group.
 */
export default function useAuthApi() {
	return useGroupApi(authenticationGroupId);
}
