import { isNonEmptyString } from "@lewishowles/helpers/string";

// Shown when the API refuses a request without telling us anything the user
// could act on. It names no error code, because the codes the API sends mean
// nothing outside our own logs.
const fallbackMessage =
	"Sorry, we couldn't complete that. Please try again later, or contact support if it keeps happening.";

/**
 * Parse an API error into field-level errors for form-wrapper's
 * `submitErrorsCallback`, or a general `_error` when no field can be
 * identified.
 *
 * A result is always returned, even for an error carrying no message at all.
 * `use-form` treats anything other than an object as an error it cannot handle,
 * and rethrows it into a promise that its own submit handler never catches, so
 * returning nothing here would leave the user with a generic message and an
 * uncaught rejection.
 *
 * @param  {*}  error
 *     The rejected value, whatever the API threw.
 *
 * @returns  {object}
 *     The field errors to show, keyed by field name, or `_error` for a message
 *     that belongs to the form as a whole.
 */
export function parseApiFieldErrors(error) {
	// Message used for the field or general error.
	const message = error?.message;

	if (!isNonEmptyString(message)) {
		return { _error: fallbackMessage };
	}

	// Field name returned for a recognised input error.
	const fieldName = error?.code === "ERROR_CODE_INPUT_ERROR" ? error?.payload?.param : null;

	if (isNonEmptyString(fieldName)) {
		return { [fieldName]: message };
	}

	return { _error: message };
}
