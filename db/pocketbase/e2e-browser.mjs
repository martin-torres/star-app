/**
 * star-app end-to-end browser test (spec 006).
 *
 * Proves, against the real dev server + a real PocketBase instance:
 *   1. the app loads settings/menu from PocketBase (the backend is actually wired)
 *   2. the customer dine-in flow reaches table selection
 *   3. the table picker renders the SAME geometry the database holds
 *      (the one-formation requirement) - positions compared numerically
 *   4. no uncaught console/page errors during the flow
 *
 * Run:  node star-e2e-browser.mjs
 */
import { chromium } from 'playwright-core';

const CHROME =
  process.env.CHROME_PATH ||
  '/Users/lomalinda007yahoo.com/Library/Caches/ms-playwright/chromium-1234/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const BASE = process.env.APP_URL || 'http://127.0.0.1:5174';
const SLUG = 'azucar-y-nuez';
// Seeded in star-e2e.py: x = 20 + ((i-1) % 3) * 150, y = 20 + floor((i-1)/3) * 140
const EXPECTED = [
  { n: 1, x: 20, y: 20 },
  { n: 2, x: 170, y: 20 },
  { n: 3, x: 320, y: 20 },
  { n: 4, x: 20, y: 160 },
  { n: 5, x: 170, y: 160 },
  { n: 6, x: 320, y: 160 },
];

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? '  :: ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: CHROME });
const page = await browser.newPage({ viewport: { width: 480, height: 900 } });

const consoleErrors = [];
const pageErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => pageErrors.push(String(err)));
const failedRequests = [];
let menuItemCount = null;
page.on('response', async (res) => {
  if (res.status() >= 400) failedRequests.push(`${res.status()} ${res.url().replace('http://127.0.0.1:8096','')}`);
  if (res.url().includes('/menu_items/records') && res.status() === 200) {
    try {
      const body = await res.json();
      menuItemCount = Array.isArray(body.items) ? body.items.length : (body.totalItems ?? 0);
    } catch { /* ignore */ }
  }
});

try {
  // ---- 1. app boots and reads PocketBase -----------------------------------
  await page.goto(`${BASE}/?restaurant_id=${SLUG}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1500);

  const bodyText = await page.locator('body').innerText();
  check(
    'app loads restaurant settings from PocketBase (name rendered)',
    /azucar y nuez/i.test(bodyText),
    bodyText.slice(0, 120).replace(/\n/g, ' | '),
  );
  check(
    'no "Error al cargar el menú" (menu fetched, not failed)',
    !/Error al cargar el menú/i.test(bodyText),
  );
  check(
    'menu_items query returns rows (slug resolved to the canonical id)',
    menuItemCount !== null && menuItemCount > 0,
    `items=${menuItemCount}`,
  );

  // ---- 2. reach table selection -------------------------------------------
  // appMode is 'dine-in' for mode='both', so the customer starts at the QR step.
  const slugInput = page.locator('input').first();
  if (await slugInput.count()) {
    await slugInput.fill(SLUG);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
  }

  // restaurant-info -> continue
  const continueBtn = page.getByRole('button', { name: /ver men|seleccionar mesa|continuar|comenzar|empezar/i }).first();
  if (await continueBtn.count()) {
    await continueBtn.click();
    await page.waitForTimeout(2000);
  }

  const stageText = (await page.locator('body').innerText()).replace(/\n+/g, ' | ').slice(0, 200);
  console.log('   [stage] ' + stageText);

  const tableButtons = page.locator('[data-floorplan-canvas] button[aria-label^="Mesa"]');
  const tableCount = await tableButtons.count();
  check('table selection renders the shared floor-plan canvas', tableCount > 0, `buttons=${tableCount}`);

  // ---- 3. geometry parity: DOM positions === database rows ----------------
  const domGeom = await page.evaluate(() => {
    const canvas = document.querySelector('[data-floorplan-canvas]');
    if (!canvas) return null;
    const nodes = Array.from(canvas.querySelectorAll('button[aria-label^="Mesa"]'));
    return nodes.map((el) => {
      const s = el.style;
      return {
        label: el.getAttribute('aria-label'),
        x: parseFloat(s.left),
        y: parseFloat(s.top),
        w: parseFloat(s.width),
        h: parseFloat(s.height),
      };
    });
  });

  if (domGeom) {
    const byLabel = new Map(domGeom.map((g) => [g.label, g]));
    let mismatches = [];
    for (const exp of EXPECTED) {
      const got = byLabel.get(`Mesa ${exp.n}`);
      if (!got) {
        mismatches.push(`Mesa ${exp.n}: missing`);
        continue;
      }
      if (got.x !== exp.x || got.y !== exp.y) {
        mismatches.push(`Mesa ${exp.n}: got (${got.x},${got.y}) want (${exp.x},${exp.y})`);
      }
    }
    check(
      'customer table geometry matches the database rows exactly',
      mismatches.length === 0,
      mismatches.join('; ') || `${domGeom.length} tables at expected coordinates`,
    );

    // Shapes/rotation must survive too: seeded table 3 is circular (88x88).
    const t3 = byLabel.get('Mesa 3');
    check(
      'non-square shape preserved (Mesa 3 circular 88x88)',
      !!t3 && t3.w === 88 && t3.h === 88,
      t3 ? `${t3.w}x${t3.h}` : 'missing',
    );
  } else {
    check('customer table geometry matches the database rows exactly', false, 'no canvas found');
  }

  // ---- 4. selection works -------------------------------------------------
  if (tableCount > 0) {
    await tableButtons.first().click();
    await page.waitForTimeout(600);
    const confirm = page.getByRole('button', { name: /confirmar mesa/i }).first();
    const confirmEnabled = (await confirm.count()) > 0 && (await confirm.isEnabled());
    check('selecting a table enables Confirmar Mesa', confirmEnabled);
  }

  await page.screenshot({ path: '/Users/lomalinda007yahoo.com/jcode-scratch/star-e2e-table-selection.png', fullPage: false });

  // ---- 5. no runtime errors ----------------------------------------------
  const ignorable = (t) =>
    /favicon|manifest|Download the React DevTools|\[vite\]|websocket|realtime|ServiceWorker|sw\.js/i.test(t);
  const realConsole = consoleErrors.filter((t) => !ignorable(t));
  const uniqFailures = [...new Set(failedRequests)];
  console.log('   [http >=400] ' + (uniqFailures.join('  ') || 'none'));
  check('no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300));
  check('no console errors', realConsole.length === 0, realConsole.join(' | ').slice(0, 300));
} catch (error) {
  check('E2E run completed', false, String(error).slice(0, 400));
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n=== ${passed}/${results.length} browser checks passed ===`);
for (const r of results.filter((r) => !r.ok)) console.log(`  FAILED: ${r.name} :: ${r.detail}`);
process.exit(passed === results.length ? 0 : 1);
