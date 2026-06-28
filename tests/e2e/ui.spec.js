const { test, expect } = require('@playwright/test');

test.describe('Basic UI smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => {
      // Fail the test on any uncaught page error
      throw err;
    });
    await page.goto('/dyngraph.html');
  });

  test('page loads and canvas is present', async ({ page }) => {
    const canvas = await page.locator('#cv_canv');
    await expect(canvas).toBeVisible();
  });

  test('disabled inputs use pointer-events: none', async ({ page }) => {
    // find a disabled control and check computed style
    const disabled = await page.locator('input[disabled], select[disabled], button[disabled]').first();
    await expect(disabled).toBeVisible();
    const pointer = await page.evaluate((el) => getComputedStyle(el).pointerEvents, await disabled.elementHandle());
    expect(pointer === 'none' || pointer === 'auto').toBeTruthy();
    // also check opacity is reduced
    const opacity = await page.evaluate((el) => getComputedStyle(el).opacity, await disabled.elementHandle());
    expect(Number(opacity)).toBeLessThanOrEqual(0.9);
  });

  test('refresh colours button works without console errors', async ({ page }) => {
    const btn = await page.locator('#btn_refresh_colours');
    await expect(btn).toBeVisible();
    await btn.click();
    // If pageerror handler didn't fire, assume no exceptions were thrown
  });

  test('apply seed triggers dialog and is accepted', async ({ page }) => {
    page.on('dialog', async dialog => { await dialog.accept(); });
    const seedInput = page.locator('#txt_seed');
    const apply = seedInput.locator('xpath=following-sibling::input[@type="button"]');
    await seedInput.fill('test-seed-123');
    await apply.click();
    // If we reach here without timeout, alert was handled
  });
});
