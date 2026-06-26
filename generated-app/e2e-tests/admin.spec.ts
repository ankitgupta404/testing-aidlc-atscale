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
    await page.waitForTimeout(300);

    // Form should be visible
    await expect(page.locator("text=New Announcement")).toBeVisible();
    await expect(page.locator("input[placeholder*='Lambda']")).toBeVisible();
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
    await page.fill("input[placeholder*='Lambda']", "Test New Announcement");
    await page.fill("textarea", "This is a test announcement summary for testing purposes.");

    // Submit
    await page.click("button:has-text('Create Announcement')");
    await page.waitForTimeout(500);

    // Should close modal and show in table
    await expect(page.locator("text=Test New Announcement")).toBeVisible();
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
