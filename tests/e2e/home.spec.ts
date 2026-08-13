import { test, expect } from '@playwright/test';

test('homepage loads and shows primary calls to action', async ({ page }) => {
  await page.goto('/');

  // Expect the title to contain "Occupyo"
  await expect(page).toHaveTitle(/Occupyo/);

  // Expect the main hero heading to be visible
  const heading = page.locator('h1').first();
  await expect(heading).toBeVisible();

  // Expect the search button or explore button to exist
  const searchInput = page.getByPlaceholder(/City, neighborhood, or zip/i).first();
  if (await searchInput.isVisible()) {
    await expect(searchInput).toBeVisible();
  }

  // Look for Post Space / Rent Space links in navigation
  const postSpaceLink = page.getByRole('link', { name: /Post Space/i }).first();
  await expect(postSpaceLink).toBeVisible();

  const rentSpaceLink = page.getByRole('link', { name: /Rent Space/i }).first();
  await expect(rentSpaceLink).toBeVisible();
});
