import useGroupApi from "../use-group-api";

const applicationGroupId = import.meta.env.VITE_XANO_APP_GROUP;

/**
 * Add an adapter for the Xano application group.
 */
export default function useApi() {
	return useGroupApi(applicationGroupId);
}
