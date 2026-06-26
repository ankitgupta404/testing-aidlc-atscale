import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("displays announcement feed with items", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    // Should have the hero section
    await expect(page.locator("text=Latest AWS Service Releases")).toBeVisible();

    // Should have at least one announcement card
    const cards = page.locator("a[href^='/announcements/']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("shows service filter sidebar", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Filter by Service")).toBeVisible();
    // Check filter sidebar has service buttons
    const filterSection = page.locator("aside");
    await expect(filterSection.locator("button:has-text('Lambda')")).toBeVisible();
    await expect(filterSection.locator("button:has-text('DynamoDB')")).toBeVisible();
  });

  test("clicking service filter updates URL", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    // Click on Lambda filter
    await page.click("button:has-text('Lambda')");
    await page.waitForTimeout(500);

    // URL should reflect filter
    expect(page.url()).toContain("service=Lambda");
  });

  test("navigates to detail page when clicking announcement", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    // Click first announcement
    const firstCard = page.locator("a[href^='/announcements/']").first();
    await firstCard.click();
    await page.waitForLoadState("networkidle");

    // Should be on detail page
    expect(page.url()).toContain("/announcements/");
    await expect(page.locator("text=Back to Feed")).toBeVisible();
  });

  test("navigates between Feed and Admin", async ({ page }) => {
    await page.goto("http://localhost:6174");
    await page.waitForLoadState("networkidle");

    // Click Admin
    await page.click("a:has-text('Admin')");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Manage Announcements")).toBeVisible();

    // Click Feed
    await page.click("a:has-text('Feed')");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=Latest AWS Service Releases")).toBeVisible();
  });
});
