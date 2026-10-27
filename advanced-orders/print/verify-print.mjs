#!/usr/bin/env node

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const BASE_URL = process.env.PRINT_VIEWER_URL || 'http://127.0.0.1:4173/advanced-orders/print/';
const manifest = JSON.parse(await readFile('advanced-orders/source/manifest.json', 'utf8'));
const expectedHash = manifest.generatedMaster?.generatedSha256;
assert.ok(expectedHash, 'manifest.generatedMaster.generatedSha256 is required');
assert.ok(Array.isArray(manifest.entries) && manifest.entries.length > 0, 'manifest.entries must be non-empty');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
const browserErrors = [];
page.on('pageerror', error => browserErrors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`);
});

try {
  const response = await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert.ok(response?.ok(), `print viewer HTTP status was ${response?.status()}`);
  assert.equal(await page.title(), 'Advanced Order Mastery — Print Viewer');

  await page.click('#loadManifest');
  await page.waitForFunction(() => {
    const status = document.querySelector('#status')?.textContent || '';
    return status.includes('sha256=') && !status.includes('failed');
  }, { timeout: 30000 });

  const status = await page.locator('#status').textContent();
  assert.match(status, new RegExp(`sources=${manifest.entries.length}(?:\\s|\\|)`));
  assert.ok(status.includes(`sha256=${expectedHash}`), `viewer hash did not match generated master hash: ${status}`);

  const courseText = await page.locator('#course').innerText();
  assert.ok(courseText.includes('Advanced Order Mastery'), 'rendered course title is missing');
  assert.ok(courseText.length > 100000, `rendered course is unexpectedly short: ${courseText.length} chars`);
  assert.equal(await page.locator('#course').evaluate(el => el.classList.contains('empty')), false);
  assert.ok(await page.locator('#course h1').count() >= 1, 'rendered course has no H1');
  assert.ok(await page.locator('#course h2').count() >= 10, 'rendered course has too few H2 sections');
  assert.equal(await page.locator('#downloadMd').isDisabled(), false, 'download button should be enabled after load');

  await page.selectOption('#paperSize', 'A5');
  await page.fill('#marginMm', '9');
  await page.fill('#fontSize', '11');
  await page.fill('#lineHeight', '1.5');
  await page.selectOption('#density', 'normal');
  await page.selectOption('#columns', '2');

  const settings = await page.evaluate(() => ({
    pageRule: document.querySelector('#pageStyle')?.textContent || '',
    fontSize: getComputedStyle(document.documentElement).getPropertyValue('--font-size').trim(),
    lineHeight: getComputedStyle(document.documentElement).getPropertyValue('--line-height').trim(),
    density: document.body.dataset.density,
    columns2: document.querySelector('#course')?.classList.contains('columns-2') || false,
  }));
  assert.ok(settings.pageRule.includes('size: A5 portrait'), settings.pageRule);
  assert.ok(settings.pageRule.includes('margin: 9mm'), settings.pageRule);
  assert.equal(settings.fontSize, '11pt');
  assert.equal(settings.lineHeight, '1.5');
  assert.equal(settings.density, 'normal');
  assert.equal(settings.columns2, true);

  await page.emulateMedia({ media: 'print' });
  const printStyles = await page.evaluate(() => {
    const toolbar = document.querySelector('.toolbar');
    const help = document.querySelector('.screen-help');
    const paper = document.querySelector('.paper');
    return {
      toolbarDisplay: toolbar ? getComputedStyle(toolbar).display : null,
      helpDisplay: help ? getComputedStyle(help).display : null,
      paperMargin: paper ? getComputedStyle(paper).margin : null,
      paperPadding: paper ? getComputedStyle(paper).padding : null,
      paperShadow: paper ? getComputedStyle(paper).boxShadow : null,
    };
  });
  assert.equal(printStyles.toolbarDisplay, 'none');
  assert.equal(printStyles.helpDisplay, 'none');
  assert.equal(printStyles.paperMargin, '0px');
  assert.equal(printStyles.paperPadding, '0px');
  assert.equal(printStyles.paperShadow, 'none');

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });
  assert.ok(pdf.subarray(0, 5).toString('ascii') === '%PDF-', 'headless print output is not a PDF');
  assert.ok(pdf.length > 100000, `headless PDF is unexpectedly small: ${pdf.length} bytes`);

  assert.deepEqual(browserErrors, [], `browser errors detected:\n${browserErrors.join('\n')}`);

  console.log(`PRINT_VIEWER_HASH_OK=${expectedHash}`);
  console.log(`PRINT_VIEWER_SOURCES_OK=${manifest.entries.length}`);
  console.log(`PRINT_VIEWER_RENDER_CHARS=${courseText.length}`);
  console.log(`PRINT_PDF_BYTES=${pdf.length}`);
  console.log('PRINT_VERIFICATION_OK');
} finally {
  await browser.close();
}
