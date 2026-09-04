import packageJson from "../../../../package.json" with { type: "json" };
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";

// Matches the application key used by the composable.
const colourModeStorageKey = `${packageJson.name}:colour-mode`;
// Captures values written to the mocked localStorage implementation.
const storedValues = new Map();
// Preserve the browser implementation so tests restore global media-query
// behaviour.
const originalMatchMedia = window.matchMedia;

describe("use-colour-mode", () => {
	beforeEach(() => {
		vi.resetModules();
		storedValues.clear();

		localStorage.getItem.mockImplementation((key) => storedValues.get(key) ?? null);
		localStorage.removeItem.mockImplementation((key) => storedValues.delete(key));
		localStorage.setItem.mockImplementation((key, value) => storedValues.set(key, value));

		document.documentElement.className = "";
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
	});

	describe("Initialisation", () => {
		test("Follows a light system preference without storing an override", async () => {
			// Resolved colour mode for the loaded composable.
			const { colourMode } = await loadColourMode();

			expect(colourMode.value).toBe("light");
			expect(storedValues.has(colourModeStorageKey)).toBe(false);
			expect(document.documentElement.classList.contains("dark")).toBe(false);
		});

		test("Follows a dark system preference and applies the dark class", async () => {
			// Resolved colour mode for the loaded composable.
			const { colourMode } = await loadColourMode({ darkSystem: true });

			expect(colourMode.value).toBe("dark");
			expect(storedValues.has(colourModeStorageKey)).toBe(false);
			expect(document.documentElement.classList.contains("dark")).toBe(true);
		});

		test("Uses a stored override instead of the system preference", async () => {
			// Resolved colour mode for the loaded composable.
			const { colourMode } = await loadColourMode({ darkSystem: false, storedMode: "dark" });

			expect(colourMode.value).toBe("dark");
			expect(storedValues.get(colourModeStorageKey)).toBe("dark");
			expect(document.documentElement.classList.contains("dark")).toBe(true);
		});
	});

	describe("Interactions", () => {
		test("Stores the opposite mode when it differs from the system", async () => {
			// Colour mode and toggle action for the loaded composable.
			const { colourMode, toggleColourMode } = await loadColourMode();

			toggleColourMode();

			await nextTick();

			expect(colourMode.value).toBe("dark");
			expect(storedValues.get(colourModeStorageKey)).toBe("dark");
		});

		test("Removes an override when the target matches the system", async () => {
			// Colour mode and toggle action for the loaded composable.
			const { colourMode, toggleColourMode } = await loadColourMode({
				storedMode: "dark",
			});

			toggleColourMode();

			await nextTick();

			expect(colourMode.value).toBe("light");
			expect(storedValues.has(colourModeStorageKey)).toBe(false);
		});

		test("Shares state across separate useColourMode calls", async () => {
			// First composable instance used to change the shared mode.
			const first = await loadColourMode();
			// Composable export used to create another instance.
			const { useColourMode } = await import(".");
			// Second composable instance used to read the shared mode.
			const second = useColourMode();

			first.toggleColourMode();

			await nextTick();

			expect(second.colourMode.value).toBe("dark");
		});
	});

	describe("System changes", () => {
		test("Updates the resolved mode when no override is stored", async () => {
			// Resolved colour mode for the loaded composable.
			const { colourMode } = await loadColourMode();

			systemPreference.setMatches(true);

			await nextTick();

			expect(colourMode.value).toBe("dark");
			expect(document.documentElement.classList.contains("dark")).toBe(true);
		});

		test("Keeps an explicit override when the system preference changes", async () => {
			// Resolved colour mode for the loaded composable.
			const { colourMode } = await loadColourMode({ storedMode: "dark" });

			systemPreference.setMatches(true);

			await nextTick();

			expect(colourMode.value).toBe("dark");
			expect(storedValues.get(colourModeStorageKey)).toBe("dark");
		});
	});
});

// Tracks the controllable system preference used by system-change tests.
let systemPreference;

/**
 * Creates a controllable system preference for simulating operating system
 * changes.
 *
 * @param  {boolean}  matches
 *     Whether the simulated system preference currently matches dark mode.
 *
 * @returns  {object}
 *     The controllable media-query mock.
 */
function createSystemPreference(matches) {
	// Change listeners registered by the composable.
	const listeners = new Set();

	// Media query object returned by the browser mock.
	const mediaQueryList = {
		matches,
		media: "(prefers-color-scheme: dark)",
		/**
		 * Add a system-preference change listener.
		 *
		 * @param  {string}  eventName
		 *     The browser event to listen for.
		 * @param  {Function}  listener
		 *     The handler to call when the preference changes.
		 */
		addEventListener(eventName, listener) {
			if (eventName === "change") {
				listeners.add(listener);
			}
		},
		/**
		 * Remove a system-preference change listener.
		 *
		 * @param  {string}  eventName
		 *     The browser event to stop listening for.
		 * @param  {Function}  listener
		 *     The handler to remove.
		 */
		removeEventListener(eventName, listener) {
			if (eventName === "change") {
				listeners.delete(listener);
			}
		},
	};

	return {
		mediaQueryList,
		/**
		 * Set the simulated system colour preference.
		 *
		 * @param  {boolean}  nextMatches
		 *     Whether the simulated preference should be dark.
		 */
		setMatches(nextMatches) {
			mediaQueryList.matches = nextMatches;

			for (const listener of listeners) {
				listener({ matches: nextMatches, media: mediaQueryList.media });
			}
		},
	};
}

/**
 * Loads a fresh colour-mode module with the requested system and stored
 * preference.
 *
 * @param  {object}  [options]
 *     Values used to simulate the system and stored preferences.
 * @param  {boolean}  [options.darkSystem=false]
 *     Whether the simulated system preference is dark.
 * @param  {string}  [options.storedMode]
 *     The stored colour-mode override to load.
 *
 * @returns  {Promise<object>}
 *     The shared colour mode and its toggle action.
 */
async function loadColourMode({ darkSystem = false, storedMode } = {}) {
	systemPreference = createSystemPreference(darkSystem);
	window.matchMedia = vi.fn(() => systemPreference.mediaQueryList);

	if (storedMode) {
		storedValues.set(colourModeStorageKey, storedMode);
	}

	// Fresh colour-mode module loaded for this test.
	const module = await import(".");

	await nextTick();

	return {
		...module.useColourMode(),
	};
}
