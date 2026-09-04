import { isNonEmptyString } from "@lewishowles/helpers/string";
import { computed, inject, onScopeDispose, provide, reactive, toValue, useId } from "vue";
import { useRoute, useRouter } from "vue-router";

// Injection key shared by the sidebar menu provider and its descendants.
const MENU_KEY = "menu";

/**
 * Provides menu registrations for one sidebar. It matches `route.path` because
 * sample-page list and detail routes are flat siblings. Link classes must be
 * mutually exclusive so active and in-section styles cannot appear together.
 */
export function provideMenu() {
	// Current route used to update shared sidebar menu state.
	const route = useRoute();
	// Registered sidebar links keyed by their local IDs.
	const items = reactive(new Map());

	// Registered links that match the current route and their path lengths.
	const matchingItems = computed(() =>
		Array.from(items, ([id, item]) => ({
			id,
			pathLength: isMatchingPath(item.path, route.path) ? item.path.length : null,
		})).filter((item) => item.pathLength !== null),
	);

	// Longest matching sidebar link, or null when no link matches.
	const activeItem = computed(
		() =>
			[...matchingItems.value]
				.sort((firstItem, secondItem) => secondItem.pathLength - firstItem.pathLength)
				.at(0) ?? null,
	);

	// ID of the one sidebar link that is fully active.
	const activeId = computed(() => activeItem.value?.id ?? null);

	// IDs of shorter matching sidebar links in the active section.
	const sectionIds = computed(
		() =>
			new Set(
				matchingItems.value
					.filter((item) => item.pathLength < activeItem.value?.pathLength)
					.map((item) => item.id),
			),
	);

	/**
	 * Register one sidebar link in the current menu.
	 *
	 * @param  {string}  id
	 *     Unique ID for the sidebar link.
	 * @param  {object}  item
	 *     Resolved path and containing group for the sidebar link.
	 */
	function registerItem(id, item) {
		items.set(id, item);
	}

	/**
	 * Remove one sidebar link from the current menu.
	 *
	 * @param  {string}  id
	 *     Unique ID for the sidebar link.
	 */
	function unregisterItem(id) {
		items.delete(id);
	}

	provide(MENU_KEY, {
		activeId,
		groupId: null,
		items,
		registerItem,
		sectionIds,
		unregisterItem,
	});
}

/**
 * Provide a group ID for its descendant sidebar links.
 *
 * @returns  {object}
 *     Whether any link in the group matches the current route.
 */
export function useMenuGroup() {
	// Menu context supplied by the containing sidebar.
	const menu = getMenu();
	// Unique ID assigned to links in this sidebar group.
	const groupId = useId();

	provide(MENU_KEY, {
		...menu,
		groupId,
	});

	// Whether the active sidebar link belongs to this group.
	const isActive = computed(() => menu.items.get(menu.activeId.value)?.groupId === groupId);

	return { isActive };
}

/**
 * Register a sidebar link and expose its current menu state.
 *
 * @param  {string|object|Function}  to
 *     The router destination for the sidebar link.
 *
 * @returns  {object}
 *     Reactive active, in-section, or null state for the link.
 */
export function useMenuItem(to) {
	// Resolved destination for this sidebar link.
	const destination = toValue(to);

	if (isExternalUrl(destination)) {
		// External links do not participate in sidebar menu state.
		return { state: computed(() => null) };
	}

	// Menu context supplied by the containing sidebar group.
	const menu = getMenu();
	// Router used to resolve named and object destinations to paths.
	const router = useRouter();
	// Resolved path for this sidebar link.
	const path = getMenuItemPath(router, destination);
	// Unique ID for this sidebar link registration.
	const id = useId();

	menu.registerItem(id, {
		groupId: menu.groupId,
		path,
	});

	onScopeDispose(() => {
		menu.unregisterItem(id);
	});

	// Active, in-section, or neutral state for this link.
	const state = computed(() => {
		if (menu.activeId.value === id) {
			return "active";
		}

		return menu.sectionIds.value.has(id) ? "in-section" : null;
	});

	return { state };
}

/**
 * Resolve a sidebar destination to a path when the router recognises it.
 *
 * @param  {object}  router
 *     Router used to resolve the destination.
 * @param  {string|object}  destination
 *     Internal sidebar destination to resolve.
 *
 * @returns  {string|null}
 *     Resolved path, or null when the router cannot resolve it.
 */
function getMenuItemPath(router, destination) {
	try {
		return router.resolve(destination).path;
	} catch {
		return null;
	}
}

/**
 * Check whether a sidebar path matches the current route or its descendants.
 *
 * @param  {string|null}  itemPath
 *     Sidebar link path to check.
 * @param  {string}  routePath
 *     Current route path to match.
 *
 * @returns  {boolean}
 *     Whether the sidebar link represents the current route section.
 */
function isMatchingPath(itemPath, routePath) {
	if (!isNonEmptyString(itemPath)) {
		return false;
	}

	return itemPath === routePath || (itemPath !== "/" && routePath.startsWith(`${itemPath}/`));
}

/**
 * Check whether a destination is an external HTTP URL.
 *
 * @param  {unknown}  destination
 *     Router destination supplied by a sidebar link.
 *
 * @returns  {boolean}
 *     Whether the destination should not join the sidebar menu.
 */
function isExternalUrl(destination) {
	return isNonEmptyString(destination) && destination.startsWith("http");
}

/**
 * Read the nearest menu context.
 *
 * @throws  {Error}
 *     When called without a containing menu provider.
 *
 * @returns  {object}
 *     Menu context supplied by the containing sidebar.
 */
function getMenu() {
	// Menu context supplied by the sidebar provider.
	const menu = inject(MENU_KEY, null);

	if (!menu) {
		throw new Error("Menu links must be used inside a menu provider.");
	}

	return menu;
}
