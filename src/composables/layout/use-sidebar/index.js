import { ref } from "vue";

// Whether the sidebar should currently be showing.
const showSidebar = ref(true);

/**
 * Manage the state of the app sidebar.
 */
export function useSidebar() {
	/**
	 * Toggle the current sidebar state.
	 */
	function toggleSidebar() {
		showSidebar.value = !showSidebar.value;
	}

	return {
		showSidebar,
		toggleSidebar,
	};
}
