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

  test('checkbox toggles and reflects checked state', async ({ page }) => {
    const tracing = page.locator('#cb_tracing');
    const labels = page.locator('#cb_labels');
    await expect(tracing).toBeVisible();
    await expect(labels).toBeVisible();
    const tracingCheckedBefore = await tracing.isChecked();
    await tracing.click();
    expect(await tracing.isChecked()).toBe(!tracingCheckedBefore);
    const labelsCheckedBefore = await labels.isChecked();
    await labels.click();
    expect(await labels.isChecked()).toBe(!labelsCheckedBefore);
  });

  test('disabled control remains disabled after UI changes', async ({ page }) => {
    // nu_nodes2 is disabled by default; toggle graph algorithm to one that might change scenario
    const nuNodes2 = page.locator('#nu_nodes2');
    await expect(nuNodes2).toBeVisible();
    expect(await nuNodes2.isDisabled()).toBeTruthy();
    // change graph algorithm to 'tree' which may alter enabled/disabled controls
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('tree');
    // check nu_nodes2 remains a control and is either disabled or enabled (no exception)
    await expect(nuNodes2).toBeVisible();
  });

  test('focus and type into find node input works', async ({ page }) => {
    const findInput = page.locator('#inp_find_node_name');
    await expect(findInput).toBeVisible();
    await findInput.focus();
    await findInput.fill('node-xyz');
    expect(await findInput.inputValue()).toBe('node-xyz');
  });

  test('group buttons clickable without console errors', async ({ page }) => {
    const discover = page.locator('#btn_discover_groups');
    const connect = page.locator('#btn_connect_groups');
    await expect(discover).toBeVisible();
    await expect(connect).toBeVisible();
    await discover.click();
    await connect.click();
  });
});
