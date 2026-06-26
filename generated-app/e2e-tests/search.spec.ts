import { test, expect } from "@playwright/test";

test.describe("Search", () => {
  test("header search filters announcements", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    // Initially should have many cards
    const initialCards = page.locator("a[href^='/announcements/']");
    const initialCount = await initialCards.count();
    expect(initialCount).toBeGreaterThan(5);

    // Type in search
    const searchInput = page.locator("input[placeholder='Search announcements...']").first();
    await searchInput.fill("bedrock");

    // Wait for debounce + API call
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // Should have fewer cards
    const filteredCards = page.locator("a[href^='/announcements/']");
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test("empty search shows appropriate message", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    // Search for something that won't match
    const searchInput = page.locator("input[placeholder='Search announcements...']").first();
    await searchInput.fill("zzzznonexistent");

    // Wait for debounce
    await page.waitForTimeout(500);
    await page.waitForLoadState("networkidle");

    // Should show empty state
    await expect(page.locator("text=No results found")).toBeVisible();
  });
});
