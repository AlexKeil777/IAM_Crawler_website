import type { BrowserContext, Page } from "@playwright/test";

/** Keep baseline/native-form checks on the retained FormSubmit fallback. */
export async function useContactFallback(target: Page | BrowserContext): Promise<void> {
  await target.route("http://127.0.0.1:*/**", async (route) => {
    const request = route.request();
    if (request.method() !== "GET" || request.resourceType() !== "document") {
      return route.fallback();
    }
    const response = await route.fetch();
    const html = await response.text();
    return route.fulfill({
      response,
      body: html.replace(/(name="access_key"\s+value=")[^"]*(")/, "$1$2"),
    });
  });
}
