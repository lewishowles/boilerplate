import useGroupApi from "@/composables/api/use-group-api";

const authenticationGroupId = import.meta.env.VITE_API_AUTH_GROUP;

/**
 * Add an adapter for the Xano authentication group.
 */
export default function useAuthApi() {
	return useGroupApi(authenticationGroupId);
}
