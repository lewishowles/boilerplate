import "@/assets/css/main.css";

import { PiniaColada } from "@pinia/colada";
import { createApp, h, shallowRef } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { createPinia } from "pinia";
import { isNonEmptyString } from "@lewishowles/helpers/string";
import componentLibrary from "@lewishowles/components";

// Element the gallery app mounts into.
const root = document.getElementById("root");

if (!root) {
	throw new Error("The component gallery needs a #root element.");
}

// Every story in the source tree, keyed by the id a spec passes to mount(),
// for example "layout/app-title-bar/app-title-bar". Each value loads that
// story's module on demand.
const stories = Object.fromEntries(
	Object.entries(import.meta.glob("/src/**/*.story.vue")).map(([path, load]) => [
		getStoryId(path),
		load,
	]),
);

// Story currently on screen. A ref, so mount() can swap it and the gallery
// re-renders in place.
const currentStory = shallowRef();
// Props the current story was mounted with, swapped the same way.
const currentStoryProps = shallowRef({});

// The gallery app. Created on the first mount() and destroyed by unmount().
let app;

// The root component of the gallery app: renders the current story, or nothing
// before the first mount.
const gallery = {
	/**
	 * Render the current story with its current props.
	 *
	 * @returns  {object|null}
	 *     The story's vnode, or null when no story is mounted.
	 */
	render() {
		return currentStory.value ? h(currentStory.value, currentStoryProps.value) : null;
	},
};

// The page component given to every route. The components under test read route
// names, paths and meta to build navigation and search; none of them shows a
// page, so the pages have no content.
const emptyPage = {
	/**
	 * Render nothing.
	 *
	 * @returns  {null}
	 *     Always null.
	 */
	render: () => null,
};

/**
 * Show a story. Playwright's mount fixture calls this once per test, and again
 * with new props when a test calls locator.update(). The routes prop builds the
 * router on the first call and is never passed to the story. Later calls only
 * change the props of the story.
 *
 * @param  {object}  options
 *     What Playwright passes from the spec.
 * @param  {string}  options.story
 *     The story id to show.
 * @param  {object}  [options.props={}]
 *     Serialisable props for the story, plus an optional routes array.
 *
 * @returns  {Promise<void>}
 *     Resolves once the story is rendered.
 */
async function mount({ story: storyId, props: { routes = [], ...storyProps } = {} } = {}) {
	currentStory.value = await loadStory(storyId);
	currentStoryProps.value = storyProps;

	if (app) {
		return;
	}

	app = createApp(gallery);
	app.use(createPinia());
	app.use(PiniaColada);
	app.use(componentLibrary);
	app.use(createGalleryRouter(routes));
	app.mount(root);
}

/**
 * Load the story component for an id.
 *
 * @param  {string}  storyId
 *     The id a spec passed to mount().
 *
 * @throws  {Error}
 *     When the id is empty or no story has that id.
 *
 * @returns  {Promise<object>}
 *     The story component.
 */
async function loadStory(storyId) {
	if (!isNonEmptyString(storyId)) {
		throw new TypeError("The component gallery requires a non-empty story id.");
	}

	if (!stories[storyId]) {
		throw new Error(`Unknown component story: ${storyId}`);
	}

	const storyModule = await stories[storyId]();

	return storyModule.default;
}

/**
 * Turn a story file path into the id specs use to mount it, by dropping the
 * source folder and the story file extension.
 *
 * @param  {string}  path
 *     A story's path, as listed by import.meta.glob.
 *
 * @returns  {string}
 *     The story id, for example "layout/app-title-bar/app-title-bar".
 */
function getStoryId(path) {
	return path.replace(/^\/src\//, "").replace(/\.story\.vue$/, "");
}

/**
 * Build the router the components in a story see. In the app the routes come
 * from the file-based router. Here each spec passes the few it needs, and they
 * only have to be resolvable, not rendered.
 *
 * @param  {object[]}  routes
 *     Route records with a name, path and any meta the story reads.
 *
 * @returns  {object}
 *     A memory-history router serving those routes and a catch-all.
 */
function createGalleryRouter(routes) {
	const pages = routes.map((route) => ({ ...route, component: emptyPage }));

	return createRouter({
		history: createMemoryHistory(),
		routes: [...pages, { component: emptyPage, path: "/:pathMatch(.*)*" }],
	});
}

/**
 * Destroy the gallery app so the next mount() starts with fresh Pinia,
 * router and component state.
 */
function unmount() {
	app?.unmount();
	app = undefined;
	currentStory.value = undefined;
	currentStoryProps.value = {};
}

window.mount = mount;
window.unmount = unmount;
