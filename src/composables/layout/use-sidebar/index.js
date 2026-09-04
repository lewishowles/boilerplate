import { ref } from "vue";

// Whether the sidebar should currently be showing.
const showSidebar = ref(true);

/**
 * Manages the state of the app sidebar.
 *
 * @returns  {object}
 *     The shared sidebar state and its toggle action.
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
