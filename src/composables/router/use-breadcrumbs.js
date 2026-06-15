import { computed, onScopeDispose, reactive, toValue, watchEffect } from "vue";
import { useRoute } from "vue-router";

// The active dynamic breadcrumb labels, keyed by route name.
const breadcrumbLabels = reactive({});

/**
 * Register a breadcrumb label for the current route or a named route record.
 *
 * @param  {string|object|Function}  label
 *     The label, ref, computed, or getter to display.
 * @param  {object}  options
 *     Options for the breadcrumb label.
 */
export function useBreadcrumb(label, options = {}) {
	const route = useRoute();
	const routeName = computed(() => options.name ?? route.name);

	watchEffect(() => {
		const currentName = routeName.value;

		if (!currentName) {
			return;
		}

		breadcrumbLabels[currentName] = toValue(label) || options.fallback || null;
	});

	onScopeDispose(() => {
		delete breadcrumbLabels[routeName.value];
	});
}

/**
 * Build breadcrumbs for the current matched route chain.
 */
export function useBreadcrumbs() {
	const route = useRoute();

	return computed(() => {
		const breadcrumbs = route.matched
			.filter((record) => haveBreadcrumb(record))
			.map((record) => {
				const matchedRecords = route.matched.slice(0, route.matched.indexOf(record) + 1);
				const key = keyForRecord(record);

				return {
					current: false,
					id: key,
					label: labelForRecord(record, key),
					loading: breadcrumbLabels[key] === null,
					to: locationForRecord(record, matchedRecords, route.params),
				};
			});

		const currentBreadcrumb = breadcrumbs.at(-1);

		if (currentBreadcrumb) {
			currentBreadcrumb.current = true;
		}

		return breadcrumbs;
	});
}

/**
 * Check whether the route record should appear in breadcrumbs.
 *
 * @param  {object}  record
 *     The matched route record.
 */
function haveBreadcrumb(record) {
	const key = keyForRecord(record);
	const label = breadcrumbLabels[key];

	return Boolean(key && (label !== undefined || record.meta?.breadcrumb));
}

/**
 * Get the display label for a matched route record.
 *
 * @param  {object}  record
 *     The matched route record.
 * @param  {string}  key
 *     The breadcrumb key for the route record.
 */
function labelForRecord(record, key) {
	if (breadcrumbLabels[key] !== null && breadcrumbLabels[key] !== undefined) {
		return breadcrumbLabels[key];
	}

	return record.meta.breadcrumb ?? key;
}

/**
 * Get the key used to match route records to dynamic labels.
 *
 * @param  {object}  record
 *     The matched route record.
 */
function keyForRecord(record) {
	return record.meta?.breadcrumbKey ?? record.name ?? record.path;
}

/**
 * Get a router location for a breadcrumb record.
 *
 * @param  {object}  record
 *     The matched route record.
 * @param  {object[]}  records
 *     The matched route records.
 * @param  {object}  currentParams
 *     The current route parameters.
 */
function locationForRecord(record, records, currentParams) {
	const params = parametersForRecords(records, currentParams);

	if (record.name) {
		return {
			name: record.name,
			params,
		};
	}

	return {
		path: pathForRecord(record, params),
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
function parametersForRecords(records, currentParams) {
	const paramNames = records.flatMap((record) =>
		[...record.path.matchAll(/:([A-Za-z0-9_]+)/g)].map((match) => match[1]),
	);

	return Object.fromEntries(
		paramNames.filter((name) => currentParams[name]).map((name) => [name, currentParams[name]]),
	);
}

/**
 * Build a path for an unnamed route record.
 *
 * @param  {object}  record
 *     The matched route record.
 * @param  {object}  params
 *     The route parameters for the record.
 */
function pathForRecord(record, params) {
	return Object.entries(params).reduce(
		(path, [key, value]) => path.replace(`:${key}`, value),
		record.path,
	);
}
