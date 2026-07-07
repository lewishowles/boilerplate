import { installUnsavedChangesGuard, useModalDialog } from "@lewishowles/components/composables";
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import authMiddleware from "./middleware/auth.js";
import composeMiddleware from "./middleware/index.js";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
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

// Safe to wire unconditionally — a no-op until a form opts into useForm's
// unsavedChangesGuard option.
installUnsavedChangesGuard(router);

export default router;
