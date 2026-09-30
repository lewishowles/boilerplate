import { getPathValue } from "@lewishowles/helpers/object";
import { isNonEmptyString } from "@lewishowles/helpers/string";

/**
 * The error the API adapters throw when the server responds with a failure.
 * It keeps the HTTP status and the body the server sent, and copies the body's
 * code and message to the top level so the auth check and form error handling
 * can read them.
 */
export default class ApiError extends Error {
	/**
	 * Create an error from a failed API response.
	 *
	 * @param  {number|undefined}  status
	 *     The HTTP status, or undefined when the client cannot read one.
	 * @param  {*}  body
	 *     The body the server sent. It is stored as it is, even when it is not
	 *     an object.
	 */
	constructor(status, body) {
		// The error code from the server's body, if it has one.
		const code = getPathValue(body, "code");
		// The server's message, used as the error message when it is a
		// non-empty string.
		const message = getPathValue(body, "message");

		// An empty message lets form error handling show its own fallback text.
		super(isNonEmptyString(message) ? message : "");

		// The name shown when this error is logged.
		this.name = "ApiError";
		// The HTTP status returned by the server, when available.
		this.status = status;
		// The body the server sent, never changed.
		this.body = body;

		if (code !== undefined) {
			// The server's error code, copied from the body so callers can
			// check it without reading the body.
			this.code = code;
		}
	}
}
