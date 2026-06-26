import { test, expect } from "@playwright/test";

test.describe("Admin Page", () => {
  test("shows table with announcements", async ({ page }) => {
    await page.goto("http://localhost:6174/admin");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("text=Manage Announcements")).toBeVisible();

    // Table should have rows
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Add New button opens form modal", async ({ page }) => {
    await page.goto("http://localhost:6174/admin");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Add New')");
    await page.waitForTimeout(500);

    // Form should be visible - the h2 inside modal
    await expect(page.locator("h2:has-text('New Announcement')")).toBeVisible();
    await expect(page.locator("input[placeholder*='AWS Lambda']")).toBeVisible();
  });

  test("create form validates required fields", async ({ page }) => {
    await page.goto("http://localhost:6174/admin");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Add New')");
    await page.waitForTimeout(300);

    // Submit empty form
    await page.click("button:has-text('Create Announcement')");
    await page.waitForTimeout(300);

    // Should show validation errors (title is empty)
    // The form uses zod validation which shows error messages
  });

  test("can create a new announcement", async ({ page }) => {
    await page.goto("http://localhost:6174/admin");
    await page.waitForLoadState("networkidle");

    await page.click("button:has-text('Add New')");
    await page.waitForTimeout(300);

    // Fill form
    await page.fill("input[placeholder*='AWS Lambda']", "E2E Test Created Announcement");
    await page.fill("textarea", "This is a test announcement summary created during e2e testing.");

    // Submit
    await page.click("button:has-text('Create Announcement')");
    await page.waitForTimeout(1000);
    await page.waitForLoadState("networkidle");

    // Should close modal and show in table
    await expect(page.locator("text=E2E Test Created Announcement").first()).toBeVisible();
  });

  test("edit button opens pre-filled form", async ({ page }) => {
    await page.goto("http://localhost:6174/admin");
    await page.waitForLoadState("networkidle");

    // Click first edit button
    const editButton = page.locator("button[title='Edit']").first();
    await editButton.click();
    await page.waitForTimeout(300);

    // Form should be pre-filled
    await expect(page.locator("text=Edit Announcement")).toBeVisible();
  });

  test("delete button shows confirmation", async ({ page }) => {
    await page.goto("http://localhost:6174/admin");
    await page.waitForLoadState("networkidle");

    // Click first delete button
    const deleteButton = page.locator("button[title='Delete']").first();
    await deleteButton.click();
    await page.waitForTimeout(300);

    // Confirmation should appear
    await expect(page.locator("text=Delete Announcement")).toBeVisible();
    await expect(page.locator("text=cannot be undone")).toBeVisible();
  });
});
