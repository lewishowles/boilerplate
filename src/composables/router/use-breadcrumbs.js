import { computed, reactive, toValue, watchEffect } from "vue";
import { useRoute } from "vue-router";

// The active dynamic breadcrumb registrations, keyed by breadcrumb key.
const breadcrumbRegistrations = reactive({});

/**
 * Register a breadcrumb label for the current route or a specific breadcrumb
 * key.
 *
 * @param  {string|object|Function}  label
 *     The label, ref, computed, or getter to display.
 * @param  {object}  options
 *     Options for the breadcrumb label.
 * @param  {string|object|Function}  [options.key]
 *     The breadcrumb key to register against. Defaults to the current route
 *     name.
 * @param  {string}  [options.fallback]
 *     The label to display when the registered label is not yet available.
 */
export function useBreadcrumb(label, options = {}) {
	// Current route used when no breadcrumb key is supplied.
	const route = useRoute();
	// Registered breadcrumb key resolved from options or the route.
	const breadcrumbKey = computed(() => toValue(options.key) ?? route.name);
	// Registration owner used to avoid removing a newer value on cleanup.
	const owner = Symbol();

	// Keep the shared breadcrumb registry entry in sync with the resolved
	// label.
	watchEffect((onCleanup) => {
		// Key used for this breadcrumb registration.
		const key = breadcrumbKey.value;

		if (!key) {
			return;
		}

		// Label value resolved from the caller input.
		const value = toValue(label);

		breadcrumbRegistrations[key] = {
			label: value ?? options.fallback ?? null,
			loading: value === null || value === undefined,
			owner,
		};

		onCleanup(() => {
			if (breadcrumbRegistrations[key]?.owner === owner) {
				delete breadcrumbRegistrations[key];
			}
		});
	});
}

/**
 * Build breadcrumbs for the current matched route chain.
 *
 * @returns  {object}
 *     Reactive breadcrumbs for the current route.
 */
export function useBreadcrumbs() {
	// Current route used to build breadcrumb records.
	const route = useRoute();

	return computed(() => {
		// Breadcrumbs built from the matched route chain.
		const breadcrumbs = route.matched
			.map((matchedRecord, index) => {
				// Route record that supplies this breadcrumb.
				const record = getBreadcrumbRecord(matchedRecord, route.matched);

				if (!record) {
					return null;
				}

				// Key used to look up the record label and registration.
				const key = getRecordKey(record);

				return {
					current: false,
					id: key,
					label: getRecordLabel(record, key),
					loading: breadcrumbRegistrations[key]?.loading ?? false,
					to: getRecordLocation(record, route.matched.slice(0, index + 1), route.params),
				};
			})
			.filter(Boolean);

		// Last displayed breadcrumb, which represents the current page.
		const currentBreadcrumb = breadcrumbs.at(-1);

		if (currentBreadcrumb) {
			currentBreadcrumb.current = true;
		}

		return breadcrumbs;
	});
}

/**
 * Get the page record that should represent a matched route in breadcrumbs.
 *
 * @param  {object}  record
 *     The matched route record.
 * @param  {object[]}  matchedRecords
 *     The current matched route records.
 *
 * @returns  {object|null}
 *     The route record to display, or null when it is not a breadcrumb.
 */
function getBreadcrumbRecord(record, matchedRecords) {
	if (hasBreadcrumb(record)) {
		return record;
	}

	// Index child that can represent the parent route.
	const indexRecord = record.children?.find((child) => child.path === "");

	if (!indexRecord || !hasBreadcrumb(indexRecord)) {
		return null;
	}

	// Key used to check whether the index child is already matched.
	const indexKey = getRecordKey(indexRecord);

	// Whether the index child already appears in the matched route chain.
	const indexIsMatched = matchedRecords.some(
		(matchedRecord) => getRecordKey(matchedRecord) === indexKey,
	);

	return indexIsMatched ? null : indexRecord;
}

/**
 * Check whether the route record should appear in breadcrumbs.
 *
 * @param  {object}  record
 *     The route record.
 *
 * @returns  {boolean}
 *     Whether the route record should appear in breadcrumbs.
 */
function hasBreadcrumb(record) {
	// Key used to locate a dynamic breadcrumb registration.
	const key = getRecordKey(record);
	// Static breadcrumb settings defined by the route.
	const breadcrumb = record.meta?.breadcrumb;

	return Boolean(
		key &&
		(breadcrumbRegistrations[key] !== undefined || breadcrumb?.label || record.meta?.page_title),
	);
}

/**
 * Get the display label for a route record.
 *
 * @param  {object}  record
 *     The route record.
 * @param  {string}  key
 *     The breadcrumb key for the route record.
 *
 * @returns  {string}
 *     The label to display for the breadcrumb.
 */
function getRecordLabel(record, key) {
	return (
		breadcrumbRegistrations[key]?.label ??
		record.meta?.breadcrumb?.label ??
		record.meta?.page_title ??
		key
	);
}

/**
 * Get the key used to match route records to dynamic labels.
 *
 * @param  {object}  record
 *     The route record.
 *
 * @returns  {string}
 *     The key used to identify the route record.
 */
function getRecordKey(record) {
	return record.meta?.breadcrumbKey ?? record.name ?? record.path;
}

/**
 * Get a router location for a breadcrumb record.
 *
 * @param  {object}  record
 *     The route record.
 * @param  {object[]}  records
 *     The matched route records.
 * @param  {object}  currentParams
 *     The current route parameters.
 *
 * @returns  {object}
 *     Router location for the breadcrumb destination.
 */
function getRecordLocation(record, records, currentParams) {
	// Parameters used by the breadcrumb route chain.
	const params = getRecordParameters(records, currentParams);
	// Explicit breadcrumb destination defined by the route.
	const breadcrumbLink = record.meta?.breadcrumb?.to;

	if (breadcrumbLink) {
		return breadcrumbLink;
	}

	if (record.name) {
		return {
			name: record.name,
			params,
		};
	}

	return {
		path: getRecordPath(record, params),
	};
}

/**
 * Get the relevant parameters for a matched route chain.
 *
 * @param  {object[]}  records
 *     The matched route records.
 * @param  {object}  currentParams
 *     The current route parameters.
 *
 * @returns  {object}
 *     Parameters used by the matched route chain.
 */
function getRecordParameters(records, currentParams) {
	// Dynamic parameter names used by the matched route records.
	const paramNames = records.flatMap((record) =>
		[...record.path.matchAll(/:([A-Za-z0-9_]+)/g)].map((match) => match[1]),
	);

	return Object.fromEntries(
		paramNames
			.filter((name) => currentParams[name] !== undefined)
			.map((name) => [name, currentParams[name]]),
	);
}

/**
 * Build a path for an unnamed route record.
 *
 * @param  {object}  record
 *     The route record.
 * @param  {object}  params
 *     The route parameters for the record.
 *
 * @returns  {string}
 *     Path with dynamic parameters substituted.
 */
function getRecordPath(record, params) {
	return Object.entries(params).reduce(
		(path, [key, value]) => path.replace(`:${key}`, value),
		record.path,
	);
}
