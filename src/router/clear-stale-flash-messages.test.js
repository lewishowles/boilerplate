import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import clearStaleFlashMessages from "./clear-stale-flash-messages.js";

// Stands in for the flash message store, so a test can watch which ids the hook
// clears. clearMessage mirrors the released composable, which filters on id
// alone and does nothing at all when no message matches.
const mockFlashMessages = vi.hoisted(() => {
	// Messages shared by the mock store methods and each test.
	const messages = [];

	return {
		clearMessage: vi.fn((id) => {
			// Locate the message to remove, if it has not already been dismissed.
			const messageIndex = messages.findIndex(({ id: messageId }) => messageId === id);

			if (messageIndex >= 0) {
				messages.splice(messageIndex, 1);
			}
		}),
		getMessages: vi.fn(() => messages),
		messages,
	};
});

// Track when the hook accesses the mock store.
const mockUseFlashMessages = vi.hoisted(() => vi.fn(() => mockFlashMessages));

vi.mock("@lewishowles/components/composables", () => ({
	useFlashMessages: mockUseFlashMessages,
}));

/**
 * Build a stored flash message, so the hook is exercised against a whole
 * message rather than a bare id.
 *
 * @param  {string}  id
 *     The id the test uses to identify the message.
 *
 * @returns  {object}
 *     A stored flash message carrying the given id.
 */
function storedMessage(id) {
	return {
		id,
		type: "success",
		title: "Flight added",
		message: "The flight has been added.",
	};
}

describe("clearStaleFlashMessages", () => {
	beforeEach(() => {
		mockFlashMessages.messages.length = 0;
		// Navigate with an empty store so the hook forgets any held message ids.
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-a" });

		mockFlashMessages.clearMessage.mockClear();
		mockFlashMessages.getMessages.mockClear();
		mockUseFlashMessages.mockClear();
	});

	test("Clears the previous message and holds the current navigation message", () => {
		// Sent on the navigation into page B, so it should survive that navigation
		// and be cleared on the next one.
		const firstMessage = storedMessage("message-1");
		// Sent on the navigation into page C, while the first message is still
		// held. It must not be cleared alongside it.
		const secondMessage = storedMessage("message-2");

		mockFlashMessages.messages.push(firstMessage);
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-a" });
		mockFlashMessages.messages.push(secondMessage);
		clearStaleFlashMessages({ path: "/page-c" }, { path: "/page-b" });
		clearStaleFlashMessages({ path: "/page-d" }, { path: "/page-c" });

		expect(mockFlashMessages.clearMessage.mock.calls).toEqual([["message-1"], ["message-2"]]);
		expect(mockFlashMessages.getMessages).toHaveBeenCalledTimes(3);
	});

	test("Still clears a message that was dismissed before the next navigation", () => {
		// Get a message to test with.
		const message = storedMessage("message-1");

		mockFlashMessages.messages.push(message);
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-a" });
		// The user dismisses the message themselves, so the hook is left holding
		// an id that no longer matches anything in the store.
		mockFlashMessages.messages.splice(0, 1);

		clearStaleFlashMessages({ path: "/page-c" }, { path: "/page-b" });

		expect(mockFlashMessages.clearMessage).toHaveBeenCalledWith("message-1");
	});

	test("Leaves held messages and the store untouched for an aborted navigation", () => {
		// Held after the first navigation, and must still be held after the
		// navigation that does not move the user.
		const message = storedMessage("message-1");

		mockFlashMessages.messages.push(message);
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-a" });
		clearStaleFlashMessages({ path: "/page-c" }, { path: "/page-b" }, new Error("cancelled"));

		expect(mockFlashMessages.clearMessage).not.toHaveBeenCalled();
		expect(mockFlashMessages.getMessages).toHaveBeenCalledTimes(1);

		clearStaleFlashMessages({ path: "/page-d" }, { path: "/page-b" });

		expect(mockFlashMessages.clearMessage).toHaveBeenCalledWith("message-1");
	});

	test("Leaves held messages and the store untouched for a same-path navigation", () => {
		// Held after the first navigation, and must still be held after the
		// navigation that does not move the user.
		const message = storedMessage("message-1");

		mockFlashMessages.messages.push(message);
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-a" });
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-b" });

		expect(mockFlashMessages.clearMessage).not.toHaveBeenCalled();
		expect(mockFlashMessages.getMessages).toHaveBeenCalledTimes(1);

		clearStaleFlashMessages({ path: "/page-c" }, { path: "/page-b" });

		expect(mockFlashMessages.clearMessage).toHaveBeenCalledWith("message-1");
	});

	test("Does not clear anything when a navigation carries no message", () => {
		clearStaleFlashMessages({ path: "/page-b" }, { path: "/page-a" });

		expect(mockFlashMessages.clearMessage).not.toHaveBeenCalled();
		expect(mockFlashMessages.getMessages).toHaveBeenCalledTimes(1);
	});
});
