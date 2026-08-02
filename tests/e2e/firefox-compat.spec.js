const { test, expect } = require('@playwright/test');

/**
 * Firefox-specific compatibility tests.
 *
 * These tests target interactions that have historically been unreliable in
 * Firefox: slider (range input) events, select-driven state changes,
 * enable/disable cycles via set_scenario(), and button state transitions.
 */

test.describe('Slider interaction (range inputs)', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => { throw err; });
    await page.goto('/dyngraph.html');
  });

  test('slider oninput fires and updates span value', async ({ page }) => {
    const slider = page.locator('#slider_link_max_length');
    const span = page.locator('#span_link_max_length');
    await expect(slider).toBeVisible();

    // Read initial value
    const initialValue = await span.textContent();

    // Set a new value via fill (simulates user input)
    await slider.fill('150');

    // The span should reflect the new value
    await expect(span).toHaveText('150');
  });

  test('multiple sliders can be changed independently', async ({ page }) => {
    const sliderMax = page.locator('#slider_link_max_length');
    const spanMax = page.locator('#span_link_max_length');
    const sliderMin = page.locator('#slider_link_min_length');
    const spanMin = page.locator('#span_link_min_length');

    await sliderMax.fill('180');
    await sliderMin.fill('30');

    await expect(spanMax).toHaveText('180');
    await expect(spanMin).toHaveText('30');
  });

  test('slider value persists in node_params after change', async ({ page }) => {
    const slider = page.locator('#slider_dist_modifier');
    await slider.fill('200');

    // Verify the JS-side node_params was updated
    const paramValue = await page.evaluate(() => node_params.dist_modifier);
    expect(paramValue).toBe(200);
  });

  test('animation timeout slider works at boundary values', async ({ page }) => {
    const slider = page.locator('#slider_anim_timeout');
    const span = page.locator('#span_anim_timeout');

    // Set to minimum
    await slider.fill('0');
    await expect(span).toHaveText('0');

    // Set to maximum
    await slider.fill('100');
    await expect(span).toHaveText('100');
  });
});

test.describe('Select option changes and side effects', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => { throw err; });
    await page.goto('/dyngraph.html');
  });

  test('graph algorithm select changes value and fires change event', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('circ');
    expect(await sel.inputValue()).toBe('circ');
  });

  test('graph algorithm change updates graph_algorithm variable', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('tree');
    const alg = await page.evaluate(() => graph_algorithm);
    expect(alg).toBe('tree');
  });

  test('node placement select changes value', async ({ page }) => {
    const sel = page.locator('#sel_nodeplace');
    await sel.selectOption('hline');
    expect(await sel.inputValue()).toBe('hline');
  });

  test('label align select updates canvas context textAlign', async ({ page }) => {
    const sel = page.locator('#sel_label_align');
    await sel.selectOption('center');

    const textAlign = await page.evaluate(() => c2d.textAlign);
    expect(textAlign).toBe('center');
  });

  test('label baseline select updates canvas context textBaseline', async ({ page }) => {
    const sel = page.locator('#sel_label_baseline');
    await sel.selectOption('middle');

    const textBaseline = await page.evaluate(() => c2d.textBaseline);
    expect(textBaseline).toBe('middle');
  });

  test('shape select changes node_shape', async ({ page }) => {
    const sel = page.locator('#sel_shape');
    await sel.selectOption('s');

    const shape = await page.evaluate(() => node_shape);
    expect(shape).toBe('s');
  });
});

test.describe('set_scenario() disable/enable cycles', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => { throw err; });
    await page.goto('/dyngraph.html');
  });

  test('scenario 0 (r2r): nodes enabled, edges enabled, nodes2 disabled, branches disabled', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('r2r');

    await expect(page.locator('#nu_nodes')).toBeEnabled();
    await expect(page.locator('#nu_nodes2')).toBeDisabled();
    await expect(page.locator('#nu_edges')).toBeEnabled();
    await expect(page.locator('#nu_branches')).toBeDisabled();
  });

  test('scenario 1 (tree): nodes enabled, branches enabled, edges disabled, nodes2 disabled', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('tree');

    await expect(page.locator('#nu_nodes')).toBeEnabled();
    await expect(page.locator('#nu_nodes2')).toBeDisabled();
    await expect(page.locator('#nu_edges')).toBeDisabled();
    await expect(page.locator('#nu_branches')).toBeEnabled();
  });

  test('scenario 2 (circ): only nodes enabled', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('circ');

    await expect(page.locator('#nu_nodes')).toBeEnabled();
    await expect(page.locator('#nu_nodes2')).toBeDisabled();
    await expect(page.locator('#nu_edges')).toBeDisabled();
    await expect(page.locator('#nu_branches')).toBeDisabled();
  });

  test('scenario 3 (same): all inputs disabled', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('same');

    await expect(page.locator('#nu_nodes')).toBeDisabled();
    await expect(page.locator('#nu_nodes2')).toBeDisabled();
    await expect(page.locator('#nu_edges')).toBeDisabled();
    await expect(page.locator('#nu_branches')).toBeDisabled();
  });

  test('scenario 4 (matr): nodes and nodes2 enabled, edges and branches disabled', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('matr');

    await expect(page.locator('#nu_nodes')).toBeEnabled();
    await expect(page.locator('#nu_nodes2')).toBeEnabled();
    await expect(page.locator('#nu_edges')).toBeDisabled();
    await expect(page.locator('#nu_branches')).toBeDisabled();
  });

  test('cycling through scenarios toggles disabled state correctly', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');

    // Start with same (all disabled)
    await sel.selectOption('same');
    await expect(page.locator('#nu_nodes')).toBeDisabled();
    await expect(page.locator('#nu_edges')).toBeDisabled();

    // Switch to r2r (nodes + edges enabled)
    await sel.selectOption('r2r');
    await expect(page.locator('#nu_nodes')).toBeEnabled();
    await expect(page.locator('#nu_edges')).toBeEnabled();

    // Switch to tree (nodes + branches enabled)
    await sel.selectOption('tree');
    await expect(page.locator('#nu_nodes')).toBeEnabled();
    await expect(page.locator('#nu_edges')).toBeDisabled();
    await expect(page.locator('#nu_branches')).toBeEnabled();

    // Back to same (all disabled again)
    await sel.selectOption('same');
    await expect(page.locator('#nu_nodes')).toBeDisabled();
    await expect(page.locator('#nu_branches')).toBeDisabled();
  });

  test('disabled inputs have reduced opacity', async ({ page }) => {
    const sel = page.locator('#sel_graphalg');
    await sel.selectOption('same');

    const opacity = await page.evaluate(() => {
      return getComputedStyle(document.getElementById('nu_nodes')).opacity;
    });
    expect(Number(opacity)).toBeLessThanOrEqual(0.7);
  });
});

test.describe('Pause/Continue/Step button state transitions', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', err => { throw err; });
    await page.goto('/dyngraph.html');
  });

  test('initial state: Pause button visible, Restart button visible', async ({ page }) => {
    const pauseBtn = page.locator('#btn_pause_conti');
    const startBtn = page.locator('#btn_start');

    await expect(pauseBtn).toBeVisible();
    await expect(startBtn).toBeVisible();
    await expect(pauseBtn).toHaveValue('Pause');
    await expect(startBtn).toHaveValue('Restart');
  });

  test('clicking Pause changes to Continue and Restart becomes Step', async ({ page }) => {
    const pauseBtn = page.locator('#btn_pause_conti');
    const startBtn = page.locator('#btn_start');

    await pauseBtn.click();

    await expect(pauseBtn).toHaveValue('Continue');
    await expect(startBtn).toHaveValue('Step');
  });

  test('clicking Continue restores Pause and Restart', async ({ page }) => {
    const pauseBtn = page.locator('#btn_pause_conti');
    const startBtn = page.locator('#btn_start');

    // Pause
    await pauseBtn.click();
    await expect(pauseBtn).toHaveValue('Continue');

    // Continue
    await pauseBtn.click();
    await expect(pauseBtn).toHaveValue('Pause');
    await expect(startBtn).toHaveValue('Restart');
  });

  test('Step button works when paused', async ({ page }) => {
    const pauseBtn = page.locator('#btn_pause_conti');
    const startBtn = page.locator('#btn_start');

    // Pause first
    await pauseBtn.click();
    await expect(startBtn).toHaveValue('Step');

    // Click Step — should not throw and button stays as Step
    await startBtn.click();
    await expect(startBtn).toHaveValue('Step');
    await expect(pauseBtn).toHaveValue('Continue');
  });

  test('rapid Pause/Continue toggling does not break state', async ({ page }) => {
    const pauseBtn = page.locator('#btn_pause_conti');
    const startBtn = page.locator('#btn_start');

    for (let i = 0; i < 5; i++) {
      await pauseBtn.click();
      await pauseBtn.click();
    }

    // Should end in running state
    await expect(pauseBtn).toHaveValue('Pause');
    await expect(startBtn).toHaveValue('Restart');
  });
});
