import useGroupApi from "@/composables/api/use-group-api";

const applicationGroupId = import.meta.env.VITE_API_APP_GROUP;

/**
 * Add an adapter for the Xano application group.
 */
export default function useApi() {
	return useGroupApi(applicationGroupId);
}
