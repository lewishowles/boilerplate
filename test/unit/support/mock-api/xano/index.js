import { mockApiModule } from "@lewishowles/testing/vue";
import { vi } from "vite-plus/test";

// Replace the app's API composable with the testing library's shared spies.
// The factory imports the library itself because Vitest moves this call above
// the file's imports.
vi.mock("@/composables/api", async () => (await import("@lewishowles/testing/vue")).mockApiModule);

// The spies the mocked composable returns, so a test can queue responses with
// `mockApi.get.mockResolvedValue()` and check the calls made. The testing
// library resets them after each test.
export default mockApiModule.default();
