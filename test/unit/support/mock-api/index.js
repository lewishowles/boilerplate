import { mockApiModule } from "@lewishowles/testing/vue";

/**
 * The spies the mocked API composable returns, so a test can queue responses
 * with `mockApi.get.mockResolvedValue()` and check the calls made. The testing
 * library resets them after each test.
 *
 * Importing this file does not mock the composable. Each test declares the mock
 * itself, because Vitest only runs a `vi.mock` call before the imports of the
 * file it is written in.
 *
 * @example
 * vi.mock("@/composables/api", async () => (await import("@lewishowles/testing/vue")).mockApiModule);
 */
export default mockApiModule.default();
