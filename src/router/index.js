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

export default router;
