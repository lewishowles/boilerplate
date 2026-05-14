import { createRouter, createWebHistory } from "vue-router";
// import AdminWrapper from "@/layouts/admin-wrapper.vue";

const routes = [
	{
		path: "/",
		// component: AdminWrapper,
		// children: [
		// 	{
		// 		path: "dashboard",
		// 		name: "dashboard",
		// 		component: () => import("@/pages/dashboard.vue"),
		// 	},
		// ],
	},
];

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

export default router;
