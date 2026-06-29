import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:6174';

test.describe('Navigation', () => {
  test('dashboard loads with stats cards', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expect(page.locator('text=Total Issues')).toBeVisible();
    await expect(page.locator('text=Sprint Burndown')).toBeVisible();
  });

  test('can navigate to board page', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/11111111-1111-1111-1111-111111111111/board`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('To Do', { exact: true })).toBeVisible();
    await expect(page.getByText('Done', { exact: true })).toBeVisible();
  });

  test('can navigate to backlog page', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/11111111-1111-1111-1111-111111111111/backlog`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Backlog' })).toBeVisible();
  });

  test('can navigate to sprints page', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/11111111-1111-1111-1111-111111111111/sprints`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await expect(page.locator('h1:has-text("Sprints")')).toBeVisible();
    await expect(page.locator('text=Sprint 2')).toBeVisible();
  });

  test('can navigate to projects page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.getByRole('link', { name: 'Projects' }).click();
    await expect(page.getByRole('heading', { name: 'Canopy Platform' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Mobile App' })).toBeVisible();
  });

  test('can navigate to announcements page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    await page.click('text=Announcements');
    await expect(page.locator('text=Sprint 2 Kickoff')).toBeVisible();
  });
});

test.describe('Interactions', () => {
  test('clicking issue on board navigates to detail', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects/11111111-1111-1111-1111-111111111111/board`);
    await page.waitForLoadState('networkidle');

    // Click on an issue card
    await page.click('text=Build Kanban board');
    await expect(page.locator('text=Issue Detail')).toBeVisible();
  });

  test('projects page has New Project button', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=New Project')).toBeVisible();
  });
});
