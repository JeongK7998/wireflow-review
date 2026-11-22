'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');

const root = path.resolve(__dirname, '..');
const skill = path.join(root, '.agents/skills/wireflow-review');
const {chromium} = require(require.resolve('playwright', {paths: [path.join(skill, 'verification')]}));
const example = path.join(root, 'release/example/pottery-booking.en.html');
const media = path.join(root, 'release/media');

async function capture() {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: {width: 1170, height: 1210}, deviceScaleFactor: 1.5,
      locale: 'en-US', reducedMotion: 'reduce'
    });
    await page.goto(pathToFileURL(example).href);
    await page.evaluate(() => document.fonts.ready);
    const device = page.locator('.artboard.is-active .device');
    const click = id => device.locator('[data-action="' + id + '"]:visible').last().click();

    async function save(name, width, height, expectedCount) {
      assert.deepEqual(await device.evaluate(el => [el.offsetWidth, el.offsetHeight]), [width, height]);
      assert.doesNotMatch(await page.locator('body').innerText(), /\p{Script=Hangul}/u);
      await page.mouse.move(0, 0);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const isOverview = await page.locator('#canvas').evaluate(el => el.hasAttribute('data-overview'));
      const boards = page.locator(isOverview ? '.artboard' : '.artboard.verification-path');
      const visible = await boards.evaluateAll(nodes => {
        const canvas = document.querySelector('#canvas').getBoundingClientRect();
        const panel = document.querySelector('.review-sidebar').getBoundingClientRect();
        const reviewOpen = !document.querySelector('#review').hidden;
        return nodes.filter(node => {
          const box = node.getBoundingClientRect();
          return box.left >= (reviewOpen ? panel.right : canvas.left) - 1 &&
            box.right <= canvas.right + 1 && box.top >= canvas.top - 1 && box.bottom <= canvas.bottom + 1;
        }).length;
      });
      assert.equal(visible, expectedCount, 'Every screen in the captured route must fit in the visible canvas');
      await page.screenshot({path: path.join(media, name + '.png')});
    }

    async function options() {
      const menu = page.locator('#canvas-more');
      if (!await menu.evaluate(el=>el.open)) await menu.locator('summary').click();
    }

    async function repair(action, proposal) {
      const before = await page.locator('.artboard.is-active').getAttribute('data-screen');
      await click(action);
      assert.equal(await page.locator('.artboard.is-active').getAttribute('data-screen'), before);
      await page.locator('#route-proposals-open').click();
      await page.locator('#route-proposals [data-proposal="' + proposal + '"]').click();
      await click(action);
    }

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const screen = () => page.locator('.artboard.is-active').getAttribute('data-screen');
    await options();
    await page.locator('#route-picker').selectOption('repeat');
    await page.locator('#center').click();
    await click('skip');
    await device.locator('[data-control="query"]').fill('woodwork');
    await click('empty');
    await repair('clear','reset-search');
    await click('filters');
    await device.locator('.paper-modal [data-control="area"]').selectOption('Seongsu');
    await device.locator('.paper-modal input[value="Wheel"]').check();
    await click('apply');
    assert.equal(await device.locator('.course-card').count(), 1);
    await click('open-wheel');
    await click('choose');
    await device.locator('[data-control="date"][value="28"]').click();
    await device.locator('[data-control="time"]').selectOption('16:00');
    await device.locator('[data-control="guests"]').selectOption('2 guests');
    await click('continue');
    await click('confirm');
    assert.equal(await screen(), 'checkout');
    await device.locator('[data-control="name"]').fill('Alex Kim');
    await device.locator('[data-control="email"]').fill('alex@example.com');
    await device.locator('[data-control="agreed"]').check();
    await click('confirm');
    assert.match(await device.locator('.paper-modal').innerText(), /KRW 96,000/);
    await click('close');
    await click('confirm');
    await page.locator('#simulation [data-action="fail"]').click();
    assert.equal(await screen(), 'payment-error');
    await repair('retry','resume-payment');
    const summary = await device.locator('.paper-modal').innerText();
    for (const value of ['Wheel throwing', 'Nov 28', '16:00', '2 guests', 'KRW 96,000', 'alex@example.com']) {
      assert.ok(summary.includes(value), value);
    }
    await click('pay');
    await page.locator('#overview').click();
    await save('booking-mobile-en', 390, 844, 16);

    await page.setViewportSize({width: 1430, height: 880});
    await options();
    await page.locator('#device-picker').selectOption('tablet-landscape');
    await page.locator('[data-screen="success"] .overview-hit').click();
    await click('bookings');
    await click('detail');
    await click('cancel');
    await repair('close','keep-booking');
    assert.equal(await screen(), 'booking');
    await click('cancel');
    await options();
    await page.locator('#route-picker').selectOption('cancel');
    await page.locator('#review-open').click();
    await page.locator('#review-scope > summary').click();
    await page.locator('#scenario-results > summary').click();
    await page.locator('[data-route="cancel"]').getByRole('button', {name: 'View flow'}).click();
    await page.locator('#review-scope > summary').click();
    await page.locator('#flow-steps button').nth(6).click();
    assert.match(await page.locator('#flow-step-detail').innerText(), /Confirm cancellation/);
    await page.locator('#flow-fit').click();
    await save('booking-tablet-en', 1024, 768, 5);
    await page.locator('#flow-close').click();
    await page.locator('#review-open').click();
    await options();
    await page.locator('#screen-picker').selectOption('cancel');
    await page.locator('#center').click();
    await click('cancel');
    await click('bookings');
    assert.match(await device.innerText(), /Cancelled/);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
}

capture().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
