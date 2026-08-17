import { computed, reactive, toValue, watchEffect } from "vue";
import { useRoute } from "vue-router";

// The active dynamic breadcrumb registrations, keyed by breadcrumb key.
const breadcrumbRegistrations = reactive({});

/**
 * Register a breadcrumb label for the current route or a specific breadcrumb key.
 *
 * @param  {string|object|Function}  label
 *     The label, ref, computed, or getter to display.
 * @param  {object}  options
 *     Options for the breadcrumb label.
 * @param  {string|object|Function}  [options.key]
 *     The breadcrumb key to register against. Defaults to the current route name.
 * @param  {string}  [options.fallback]
 *     The label to display when the registered label is not yet available.
 */
export function useBreadcrumb(label, options = {}) {
	const route = useRoute();
	const breadcrumbKey = computed(() => toValue(options.key) ?? route.name);
	const owner = Symbol();

	watchEffect((onCleanup) => {
		const key = breadcrumbKey.value;

		if (!key) {
			return;
		}

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
 */
export function useBreadcrumbs() {
	const route = useRoute();

	return computed(() => {
		const breadcrumbs = route.matched
			.map((matchedRecord, index) => {
				const record = getBreadcrumbRecord(matchedRecord, route.matched);

				if (!record) {
					return null;
				}

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
 */
function getBreadcrumbRecord(record, matchedRecords) {
	if (hasBreadcrumb(record)) {
		return record;
	}

	const indexRecord = record.children?.find((child) => child.path === "");

	if (!indexRecord || !hasBreadcrumb(indexRecord)) {
		return null;
	}

	const indexKey = getRecordKey(indexRecord);

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
 */
function hasBreadcrumb(record) {
	const key = getRecordKey(record);
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
 */
function getRecordLocation(record, records, currentParams) {
	const params = getRecordParameters(records, currentParams);
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
 */
function getRecordParameters(records, currentParams) {
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
 */
function getRecordPath(record, params) {
	return Object.entries(params).reduce(
		(path, [key, value]) => path.replace(`:${key}`, value),
		record.path,
	);
}
