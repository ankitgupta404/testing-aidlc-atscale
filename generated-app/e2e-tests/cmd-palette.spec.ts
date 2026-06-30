import { test, expect } from '@playwright/test';

test('command palette opens on search click', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Click search button
  await page.click('button:has-text("Search issues")');
  await page.waitForTimeout(300);

  // Verify palette is visible
  const paletteInput = page.locator('input[placeholder*="Search issues, projects, or navigate"]');
  await expect(paletteInput).toBeVisible();

  // Type a query
  await paletteInput.fill('Kanban');
  await page.waitForTimeout(200);

  // Verify results appear
  const result = page.locator('button:has-text("Build Kanban board")');
  await expect(result).toBeVisible();
});

test('command palette opens with Ctrl+K', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Press Ctrl+K
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);

  // Verify palette is visible
  const paletteInput = page.locator('input[placeholder*="Search issues, projects, or navigate"]');
  await expect(paletteInput).toBeVisible();
});

test('command palette keyboard navigation', async ({ page }) => {
  await page.goto('http://localhost:6174');
  await page.waitForLoadState('networkidle');

  // Open palette
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(300);

  // Navigate shows by default
  const dashboardItem = page.locator('button:has-text("Dashboard")');
  await expect(dashboardItem).toBeVisible();

  // Press Escape to close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  const paletteInput = page.locator('input[placeholder*="Search issues, projects, or navigate"]');
  await expect(paletteInput).not.toBeVisible();
});
