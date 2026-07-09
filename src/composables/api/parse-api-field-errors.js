import { isNonEmptyString } from "@lewishowles/helpers/string";

/**
 * Parse an API error into field-level errors for form-wrapper's
 * `submitErrorsCallback`, or a general `_error` when no field can be
 * identified. Adjust the shape below to match the project's own API error
 * responses.
 *
 * @param  {object}  error
 *     The error to parse.
 */
export function parseApiFieldErrors(error) {
	const message = error?.message;

	if (!isNonEmptyString(message)) {
		return null;
	}

	// TODO: replace with the field name path used by this project's API, for
	// example error?.payload?.param.
	const fieldName = null;

	if (isNonEmptyString(fieldName)) {
		return { [fieldName]: message };
	}

	return { _error: message };
}
