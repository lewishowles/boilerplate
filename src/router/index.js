import { installUnsavedChangesGuard, useModalDialog } from "@lewishowles/components/composables";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import clearStaleFlashMessages from "./clear-stale-flash-messages.js";
import authMiddleware from "./middleware/auth.js";
import composeMiddleware from "./middleware/index.js";

// Application router with generated routes and navigation behaviour.
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
	/**
	 * Restores hash, saved, or top-of-page scroll positions after navigation.
	 *
	 * @param  {object}  to
	 *     The destination route.
	 * @param  {object}  from
	 *     The route being left.
	 * @param  {object|null}  savedPosition
	 *     The browser's saved position, when one exists.
	 *
	 * @returns  {object}
	 *     The scroll position to use for the destination route.
	 */
	scrollBehavior(to, from, savedPosition) {
		if (to.hash) {
			return { el: to.hash };
		}

		if (savedPosition) {
			return savedPosition;
		}

		return { top: 0 };
	},
});

router.beforeEach(composeMiddleware(authMiddleware));

// Close any open modal on navigation, regardless of how the navigation
// happened, so a modal never lingers over the wrong page.
router.afterEach(() => {
	useModalDialog()._clearModals();
});

router.afterEach(clearStaleFlashMessages);

// Safe to wire unconditionally — a no-op until a form opts into useForm's
// unsavedChangesGuard option.
installUnsavedChangesGuard(router);

export default router;
