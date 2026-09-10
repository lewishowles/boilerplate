import { useFlashMessages } from "@lewishowles/components/composables";

// The messages that have now had their page, held by id so that a message sent
// for the navigation in progress is never mistaken for one of them.
let messageIdsToClear = [];

/**
 * Clear the flash messages belonging to the page the user has just left.
 *
 * Messages are rendered in the page title so that every page shows them without
 * wiring, which leaves no single page able to own clearing them. The router is
 * the only place that can see a message survive a whole navigation.
 *
 * A message is sent just before the navigation that displays it, so clearing on
 * that same navigation would remove it before the user saw it. Instead, each
 * message is held until the navigation after, giving it exactly one page to be
 * read on.
 *
 * @param  {object}  to
 *     The route being navigated to.
 * @param  {object}  from
 *     The route being navigated from.
 * @param  {Error|undefined}  failure
 *     The navigation failure, when the navigation did not complete.
 */
export default function clearStaleFlashMessages(to, from, failure) {
	// An aborted navigation leaves the user where they are, still reading the
	// message. The unsaved changes guard aborts one every time the user cancels
	// its confirm. A navigation that doesn't change path, such as a filter or
	// pagination change, also means the user hasn't moved yet.
	if (failure || to.path === from.path) {
		return;
	}

	// Access flash messages.
	const { clearMessage, getMessages } = useFlashMessages();

	for (const id of messageIdsToClear) {
		clearMessage(id);
	}

	// Read the store only after clearing, so anything sent for this navigation
	// is held for the next one rather than cleared alongside the old messages.
	messageIdsToClear = getMessages().map(({ id }) => id);
}
