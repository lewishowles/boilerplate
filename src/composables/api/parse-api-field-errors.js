import { isNonEmptyString } from "@lewishowles/helpers/string";

/**
 * Parse an API error into field-level errors for form-wrapper's
 * `submitErrorsCallback`, or a general `_error` when no field can be
 * identified. Returns `null` when the error has no usable message, so a missing
 * or malformed error body never produces a false field error.
 *
 * @param  {object}  error
 *     The error to parse.
 *
 * @returns  {object|null}
 *     Field errors, a general error, or null when no message is available.
 */
export function parseApiFieldErrors(error) {
	// Message used for the field or general error.
	const message = error?.message;

	if (!isNonEmptyString(message)) {
		return null;
	}

	// Field name returned for a recognised input error.
	const fieldName = error?.code === "ERROR_CODE_INPUT_ERROR" ? error?.payload?.param : null;

	if (isNonEmptyString(fieldName)) {
		return { [fieldName]: message };
	}

	return { _error: message };
}
