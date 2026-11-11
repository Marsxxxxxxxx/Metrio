/* DOM integration tests only. No real browser, layout engine or screenshots. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Window } = require('happy-dom');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'src/engine.js'), 'utf8');
const application = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
function setup(t, saved, desktop = false, controlledFrames = false, enterConverter = true) {
  const messages = [];
  const window = new Window({ url: desktop ? 'https://vert.example/index.html?desktop=1' : 'https://metrio.test/', settings: {
    enableJavaScriptEvaluation: true,
    disableJavaScriptFileLoading: true,
    enableCSSFileLoading: false,
    // Only trusted, checked-in application code is evaluated in this test process.
    suppressInsecureJavaScriptEnvironmentWarning: true
  } });
  t.after(() => window.happyDOM.close());
  const frames = new Map();
  let frameId = 0;
  let frameTime = 0;
  if (controlledFrames) {
    window.requestAnimationFrame = callback => { frames.set(++frameId, callback); return frameId; };
    window.cancelAnimationFrame = id => frames.delete(id);
  }
  const stepFrame = (elapsed = 16) => {
    frameTime += elapsed;
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach(callback => callback(frameTime));
  };
  const flushFrames = () => {
    let passes = 0;
    while (frames.size) {
      assert.ok(++passes < 80, 'Animation frames should settle');
      stepFrame();
    }
  };
  if (saved) window.localStorage.setItem('vert.local.v1', saved);
  window.document.write(html);
  if (desktop) window.chrome = { webview: { postMessage: message => messages.push(message) } };
  window.eval(engine);
  window.eval(application);
  const $ = selector => window.document.querySelector(selector);
  // Calculator regressions explicitly enter from the new landing menu.
  if (enterConverter) ($('#resume-conversion').hidden ? $('[data-home-category]') : $('#resume-conversion')).click();
  const click = selector => { assert.ok($(selector), `Missing ${selector}`); $(selector).click(); };
  const input = (value, selector = '#expression') => {
    $(selector).value = value;
    $(selector).dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  const key = (value, options = {}) => window.document.body.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options }));
  const output = () => $('#to-wheel .selected .unit-number').textContent;
  return { window, $, click, input, key, output, messages, flushFrames, stepFrame };
}

test('Application starts and numbers from both keypad and physical keyboard convert immediately', t => {
  const { $, click, key, output } = setup(t);
  assert.equal($('#category-title').textContent, '长度');
  assert.equal(output(), '3.2808399');
  click('[data-key="2"]');
  key('5');
  assert.equal($('#expression').value, '25');
  assert.equal(output(), '82.02099738');
  click('#to-wheel [data-unit="cm"]');
  assert.equal(output(), '2,500');
});
test('Search by unit finds Fahrenheit and selects the right category and source', t => {
  const { $, input, click, output } = setup(t);
  input('华氏', '#category-search');
  assert.ok($('#category-list [data-category="temperature"][data-unit="f"]'));
  assert.ok($('#category-list [data-category="temperature-delta"][data-unit="df"]'), 'Absolute temperature and temperature intervals remain distinct results');
  click('#category-list [data-unit="f"]');
  assert.equal($('#category-title').textContent, '温度');
  assert.equal($('#from-wheel .selected').dataset.unit, 'f');
  input('32');
  assert.equal(output(), '0');
});
test('Swapping preserves the physical quantity rather than reinterpreting the input', t => {
  const { $, input, click, output } = setup(t);
  input('2.54');
  click('#from-wheel [data-unit="cm"]');
  click('#to-wheel [data-unit="in"]');
  assert.equal(output(), '1');
  click('[data-action="swap"]');
  assert.equal($('#expression').value, '1');
  assert.equal($('#from-wheel .selected').dataset.unit, 'in');
  assert.equal(output(), '2.54');
});
test('Favorites persist and can be recalled after application reload', t => {
  const first = setup(t);
  first.click('[data-action="favorite"]');
  first.click('[data-tab="favorites"]');
  assert.equal(first.$('#category-list').children.length, 1);
  const second = setup(t, first.window.localStorage.getItem('vert.local.v1'));
  assert.equal(second.$('#favorite-button').getAttribute('aria-pressed'), 'true');
  second.click('[data-tab="favorites"]');
  second.click('[data-favorite-index="0"]');
  assert.equal(second.$('#from-wheel .selected').dataset.unit, 'm');
  second.click('[data-action="favorite"]');
  assert.ok(second.$('#category-list').textContent.includes('常用的换算'));
});
test('Arithmetic results are saved to history and can be recalled', t => {
  const { $, input, click, key } = setup(t);
  input('(2+3)*4');
  key('Enter');
  assert.equal($('#expression').value, '20');
  click('[data-action="history"]');
  assert.ok($('#modal').open);
  assert.ok($('.history-item').textContent.includes('20 m'));
  click('[data-history-index="0"]');
  assert.equal($('#modal').open, false);
  assert.equal($('#expression').value, '20');
});
test('Bad input surfaces errors, and the user can recover without reloading', t => {
  const { $, input, click, output } = setup(t);
  input('1/0');
  assert.equal(output(), '—');
  assert.ok($('#rate-label').textContent.includes('除以零'));
  click('[data-action="clear"]');
  click('[data-key="1"]');
  assert.equal(output(), '3.2808399');
  click('[data-category="temperature"]');
  input('-274');
  assert.ok($('#rate-label').textContent.includes('绝对零度'));
});
test('Phone navigation, settings and keyboard search change application state', t => {
  const { $, click, key, window } = setup(t);
  click('[data-mode="phone"]');
  assert.ok($('#app').classList.contains('phone'));
  click('[data-action="open-categories"]');
  assert.equal($('#app').dataset.page, 'home');
  click('[data-home-category="mass"]');
  assert.equal($('#app').dataset.page, 'converter');
  click('[data-action="settings"]');
  $('#precision-setting').value = '2';
  $('#precision-setting').dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-action="close-modal"]');
  assert.equal($('#to-wheel .selected .unit-number').textContent, '2.2');
  key('k', { ctrlKey: true });
  assert.equal(window.document.activeElement, $('#home-search'));
});

test('Startup shows every enabled category exactly once across six tile regions and keeps calculator shortcuts inactive', t => {
  const app = setup(t, undefined, false, false, false);
  assert.equal(app.$('#app').dataset.page, 'home');
  assert.equal(app.$('#converter').hidden, true);
  assert.equal(app.$('#category-sidebar').hidden, true);
  assert.equal(app.$('#category-home').hidden, false);
  const tiles = [...app.$('#home-sections').querySelectorAll('[data-home-category]')];
  assert.equal(app.$('#home-sections').children.length, 6);
  assert.deepEqual(tiles.map(tile => tile.dataset.homeCategory).sort(), Array.from(app.window.MetrioCore.categories, cat => cat.id).sort());
  assert.ok(tiles.every(tile => tile.querySelector('svg') && tile.querySelector('.tile-name')));
  const before = app.window.localStorage.getItem('vert.local.v1');
  for (const key of ['7', 'f', 's', 'Enter', 'Escape', 'Backspace']) app.key(key);
  assert.equal(app.window.localStorage.getItem('vert.local.v1'), before);
  app.click('[data-mode="phone"]');
  assert.equal(app.$('#app').dataset.page, 'home');
  app.click('[data-home-category="length"]');
  assert.equal(app.$('#app').dataset.page, 'converter');
  assert.equal(app.$('#category-home').hidden, true);
  assert.equal(app.window.document.activeElement, app.$('#category-title'));
});

test('Menu search selects a matching source unit and returning preserves search, scroll and the last conversion', t => {
  const app = setup(t, undefined, false, false, false);
  app.input('华氏', '#home-search');
  assert.equal(app.$('#home-group-nav').hidden, true);
  assert.equal(app.$('[data-home-category="temperature"]').dataset.unit, 'f');
  app.$('#home-scroll').scrollTop = 120;
  app.click('[data-home-category="temperature"]');
  app.input('32');
  assert.equal(app.$('#from-wheel .selected').dataset.unit, 'f');
  assert.equal(app.output(), '0');
  app.click('[data-action="open-categories"]');
  assert.equal(app.$('#home-search').value, '华氏');
  assert.equal(app.$('#home-scroll').scrollTop, 120);
  assert.equal(app.window.document.activeElement, app.$('[data-home-category="temperature"]'));
  app.input('', '#home-search');
  assert.equal(app.$('#resume-conversion').hidden, false);
  app.click('#resume-conversion');
  assert.equal(app.$('#from-wheel .selected').dataset.unit, 'f');
  assert.equal(app.$('#expression').value, '32');
  assert.equal(app.output(), '0');
  const restored = setup(t, app.window.localStorage.getItem('vert.local.v1'), false, false, false);
  assert.equal(restored.$('#app').dataset.page, 'home');
  restored.click('#resume-conversion');
  assert.equal(restored.output(), '0');
  assert.equal(restored.$('#from-wheel .selected').dataset.unit, 'f');
});

test('Menu settings hide categories and units immediately, omit empty regions and retain usable favorites', t => {
  const core = require('../src/engine.js');
  const saved = JSON.stringify({ category: 'length', from: 'm', to: 'ft', expression: '1',
    disabledCategories: core.categories.filter(cat => !['length', 'mass'].includes(cat.id)).map(cat => cat.id),
    favorites: [{ category: 'length', from: 'm', to: 'ft' }] });
  const app = setup(t, saved, false, false, false);
  assert.equal(app.$('#home-sections').children.length, 1);
  assert.equal(app.$('#home-group-nav').children.length, 1);
  app.click('#home-settings-button'); app.click('[data-action="unit-settings"]');
  app.click('[data-enable-category="mass"]');
  app.click('[data-enable-unit="nm"][data-unit-category="length"]');
  app.click('[data-action="close-modal"]');
  assert.equal(app.$('#app').dataset.page, 'home');
  assert.equal(app.$('[data-home-category="mass"]'), null);
  app.input('纳米', '#home-search');
  assert.equal(app.$('[data-home-category]'), null);
  app.input('', '#home-search'); app.click('[data-home-tab="favorites"]');
  assert.equal(app.$('#home-group-nav').hidden, true);
  app.click('[data-home-favorite-index="0"]');
  assert.equal(app.$('#app').dataset.page, 'converter');
  assert.equal(app.$('#from-wheel .selected').dataset.unit, 'm');
  assert.equal(app.$('#to-wheel .selected').dataset.unit, 'ft');
});
test('Successful copying saves the displayed result and a history record', async t => {
  const { window, click } = setup(t);
  let copied;
  Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async text => { copied = text; } } });
  click('[data-action="copy"]');
  await new Promise(setImmediate);
  assert.equal(copied, '3.2808399 ft');
  assert.equal(JSON.parse(window.localStorage.getItem('vert.local.v1')).history.length, 1);
});
test('Clipboard rejection offers a manual copy field instead of claiming success', async t => {
  const { window, $, click } = setup(t);
  Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async () => { throw new Error('Denied'); } } });
  click('[data-action="copy"]');
  await new Promise(setImmediate);
  assert.equal($('#modal').open, true);
  assert.equal($('.copy-output').value, '3.2808399 ft');
  assert.equal(JSON.parse(window.localStorage.getItem('vert.local.v1')).history.length, 0);
});
test('Malformed saved state does not prevent startup', t => {
  assert.equal(setup(t, '{broken').output(), '3.2808399');
  assert.equal(setup(t, JSON.stringify({ category: 'missing', from: 'x', to: 'y', favorites: [{}] })).output(), '3.2808399');
});
test('Negative operands work with the physical keyboard and the sign key', t => {
  const { $, key, click } = setup(t);
  key('2'); key('*'); key('-'); key('3'); key('Enter');
  assert.equal($('#expression').value, '-6');
  click('[data-action="clear"]');
  click('[data-action="sign"]');
  click('[data-key="4"]');
  click('[data-key="0"]');
  assert.equal($('#expression').value, '-40');
  click('[data-action="clear"]');
  key('2'); key('*'); click('[data-action="sign"]'); key('3'); key('Enter');
  assert.equal($('#expression').value, '-6');
});
test('The Windows host receives readiness after the shared interface is initialized', t => {
  const { window, $, messages } = setup(t, undefined, true);
  assert.ok(window.document.documentElement.classList.contains('desktop-app'));
  assert.equal($('#category-title').textContent, '长度');
  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, 'metrio-ready');
  assert.equal(messages[0].categories, window.MetrioCore.categories.length);
  assert.equal(messages[0].page, 'home');
  assert.equal(messages[0].units, window.MetrioCore.categories.reduce((total, cat) => total + cat.units.length, 0));
});

function scrollingApp(t) {
  const app = setup(t, undefined, false, true);
  for (const side of ['from', 'to']) {
    const wheel = app.$(`#${side}-wheel`);
    Object.defineProperty(wheel, 'clientHeight', { value: 240 });
    wheel.style.setProperty('--row-height', '72px');
  }
  app.flushFrames();
  return app;
}

function manageUnits(app) {
  app.click('#settings-button');
  assert.equal(app.$('#modal-title').textContent, '设置');
  app.click('[data-action="unit-settings"]');
  assert.equal(app.$('#modal-title').textContent, '单位管理');
}
const unitOption = (category, unit) => `[data-enable-unit="${unit}"][data-unit-category="${category}"]`;

test('Gear settings open searchable unit management and hidden units stay hidden after reload', t => {
  const app = setup(t);
  manageUnits(app);
  assert.equal(app.$('#modal').dataset.page, 'units');
  assert.equal(app.$('#modal-back').hidden, false);
  app.input('纳米', '#unit-search');
  assert.equal(app.$('#unit-manager-groups').children.length, 1);
  app.click(unitOption('length', 'nm'));
  assert.equal(app.$('#from-wheel [data-unit="nm"]'), null);
  assert.match(app.$('#unit-manager-status').textContent, /已应用/);
  app.click('[data-action="close-modal"]');
  app.input('纳米', '#category-search');
  assert.equal(app.$('#category-list [data-unit="nm"]'), null);
  assert.ok(app.$('#category-list [data-action="unit-settings"]'));
  const persisted = app.window.localStorage.getItem('vert.local.v1');
  const restored = setup(t, persisted);
  assert.equal(restored.$('#from-wheel [data-unit="nm"]'), null);
  manageUnits(restored); restored.input('纳米', '#unit-search');
  assert.equal(restored.$(unitOption('length', 'nm')).checked, false);
  restored.click(unitOption('length', 'nm'));
  assert.ok(restored.$('#from-wheel [data-unit="nm"]'));
  restored.click('#modal-back');
  assert.equal(restored.$('#modal-title').textContent, '设置');
  assert.equal(restored.$('#modal-back').hidden, true);
});

test('Hiding the current source preserves its physical quantity and retains disabled favorites and history', t => {
  const app = setup(t);
  app.click('#favorite-button'); app.click('[data-action="equals"]');
  const before = JSON.parse(app.window.localStorage.getItem('vert.local.v1'));
  const output = app.output();
  manageUnits(app); app.click(unitOption('length', 'm'));
  assert.equal(app.$('#from-wheel [data-unit="m"]'), null);
  assert.equal(app.output(), output);
  assert.equal(app.$('#rate-label').classList.contains('error'), false);
  const after = JSON.parse(app.window.localStorage.getItem('vert.local.v1'));
  assert.deepEqual(after.favorites, before.favorites); assert.deepEqual(after.history, before.history);
  app.click('[data-action="close-modal"]'); app.click('#favorites-tab');
  assert.equal(app.$('[data-favorite-index="0"]').disabled, true);
  app.click('[data-action="history"]');
  assert.equal(app.$('[data-history-index="0"]').disabled, true);
  app.click('[data-action="close-modal"]'); manageUnits(app);
  app.click(unitOption('length', 'm')); app.click('[data-action="close-modal"]');
  assert.equal(app.$('[data-favorite-index="0"]').disabled, false);
});

test('Filtered wheel detents and keyboard movement use visible unit indices and keep the white ribbon synchronized', t => {
  const app = scrollingApp(t);
  manageUnits(app); app.click(unitOption('length', 'cm')); app.click(unitOption('length', 'km')); app.flushFrames();
  app.click('[data-action="close-modal"]');
  assert.equal(app.$('#from-wheel').scrollTop, 4 * 72);
  app.$('#from-wheel').dispatchEvent(new app.window.WheelEvent('wheel', { deltaY: 120, cancelable: true })); app.flushFrames();
  assert.equal(app.$('#from-focus .unit-symbol').textContent, 'in');
  assert.equal(app.$('#from-wheel').scrollTop, 5 * 72);
  assert.equal(app.$('#from-focus-track').style.transform, 'translate3d(0, -360px, 0)');
  app.$('#from-wheel').dispatchEvent(new app.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })); app.flushFrames();
  assert.equal(app.$('#from-focus .unit-symbol').textContent, 'm');
  assert.equal(app.$('#to-focus .unit-number').textContent, app.output());
});

test('Category switches and common/all presets persist without leaving an unavailable selection', t => {
  const app = setup(t);
  manageUnits(app);
  app.click('[data-unit-preset="common"][data-unit-category="length"]');
  assert.equal(app.$('#from-wheel').children.length, app.window.MetrioCore.getCategory('length').common.length);
  app.click('[data-enable-category="length"]');
  assert.equal(app.$('#category-title').textContent, '质量');
  assert.equal(app.$('#category-list [data-category="length"]'), null);
  assert.match(app.$('[data-unit-count="length"]').textContent, /已关闭/);
  const restored = setup(t, app.window.localStorage.getItem('vert.local.v1'));
  assert.equal(restored.$('#category-title').textContent, '质量');
  assert.equal(restored.$('#category-list [data-category="length"]'), null);
  app.click('[data-action="units-enable-all"]');
  assert.ok(app.$('#category-list [data-category="length"]'));
  assert.equal(app.$(unitOption('length', 'nm')).checked, true);
  assert.equal(app.$('[data-enable-category="length"]').checked, true);
});

test('The last category and last two units are protected, including corrupt preferences on startup', t => {
  const core = require('../src/engine.js');
  const saved = JSON.stringify({ category: 'length', from: 'm', to: 'ft', expression: '1',
    hiddenUnits: { length: core.getCategory('length').units.filter(unit => !['m', 'ft'].includes(unit.id)).map(unit => unit.id) },
    disabledCategories: core.categories.filter(cat => cat.id !== 'length').map(cat => cat.id) });
  const app = setup(t, saved); manageUnits(app);
  app.click(unitOption('length', 'm')); assert.equal(app.$(unitOption('length', 'm')).checked, true);
  assert.match(app.$('#unit-manager-status').textContent, /至少保留两个/);
  app.click('[data-enable-category="length"]'); assert.equal(app.$('[data-enable-category="length"]').checked, true);
  assert.match(app.$('#unit-manager-status').textContent, /至少保留一个/);
  const corrupt = setup(t, JSON.stringify({ hiddenUnits: { length: core.getCategory('length').units.map(unit => unit.id), mass: 'not an array' }, disabledCategories: core.categories.map(cat => cat.id) }));
  assert.equal(corrupt.$('#category-title').textContent, '长度');
  assert.ok(corrupt.$('#from-wheel [data-unit="m"]')); assert.ok(corrupt.$('#to-wheel [data-unit="ft"]'));
  assert.equal(corrupt.$('#rate-label').classList.contains('error'), false);
});

test('Every expanded category renders and converts, including logarithmic power and reciprocal pace', t => {
  const app = setup(t);
  assert.ok(app.window.MetrioCore.categories.length >= 70);
  for (const cat of app.window.MetrioCore.categories) {
    app.click(`#category-list [data-category="${cat.id}"]`);
    assert.equal(app.$('#from-wheel').children.length, cat.units.length, cat.id);
    assert.equal(app.$('#rate-label').classList.contains('error'), false, cat.id);
    assert.notEqual(app.output(), '—', cat.id);
  }
  app.click('#category-list [data-category="power"]');
  app.click('#from-wheel [data-unit="dbm"]'); app.click('#to-wheel [data-unit="w"]'); app.input('30');
  assert.equal(app.output(), '1'); assert.equal(app.$('#rate-label').textContent, '30 dBm = 1 W');
  app.click('#category-list [data-category="pace"]'); app.click('#to-wheel [data-unit="kmh"]'); app.input('5');
  assert.equal(app.output(), '12'); assert.match(app.$('#category-note').textContent, /十进制/);
});

test('Scrolling to the last source unit keeps the fixed readout and conversion in sync', t => {
  const { window, $, flushFrames, output } = scrollingApp(t);
  const wheel = $('#from-wheel');
  // Reproduce the screenshot's sea-mile/city-foot boundary, including overscroll.
  for (const offset of [11.2, 11.55, 11.9, 12.15]) {
    wheel.scrollTop = offset * 72;
    wheel.dispatchEvent(new window.Event('scroll'));
  }
  flushFrames();
  assert.equal(wheel.querySelector('.selected').dataset.unit, 'chi');
  assert.equal($('#from-focus .unit-name').textContent, '市尺');
  assert.equal($('#from-focus .unit-number').textContent, '1');
  assert.equal($('#to-focus .unit-number').textContent, '1.0936133');
  assert.equal($('#to-focus .unit-number').textContent, output());
  assert.equal(wheel.contains($('#from-focus')), false, 'The readout must not scroll out of the ribbon');
  wheel.scrollTop = -20;
  wheel.dispatchEvent(new window.Event('scrollend'));
  flushFrames();
  assert.equal($('#from-focus .unit-name').textContent, '纳米');
});

test('Selection does not change the moving rows color, font size or source number visibility', t => {
  const { window, $, click } = scrollingApp(t);
  const style = window.document.createElement('style');
  style.textContent = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
  window.document.head.append(style);
  const row = $('#from-wheel [data-unit="cm"]');
  const properties = () => [
    window.getComputedStyle(row).color,
    window.getComputedStyle(row.querySelector('.unit-value')).fontSize,
    window.getComputedStyle(row.querySelector('.from-number')).display
  ];
  const before = properties();
  click('#from-wheel [data-unit="cm"]');
  assert.deepEqual(properties(), before);
  assert.notEqual(window.getComputedStyle($('#from-focus')).color, before[0]);
  assert.equal($('#from-focus .unit-symbol').textContent, 'cm');
});

test('After resize, both wheels and the fixed readouts use the final settled units', t => {
  const { window, $, flushFrames } = scrollingApp(t);
  window.dispatchEvent(new window.Event('resize'));
  const target = $('#to-wheel');
  target.scrollTop = 3.6 * 72;
  target.dispatchEvent(new window.Event('scroll'));
  flushFrames();
  assert.equal($('#to-focus .unit-symbol').textContent, 'ft');
  target.scrollTop = 3 * 72;
  target.dispatchEvent(new window.Event('scrollend'));
  flushFrames();
  assert.equal($('#to-focus .unit-symbol').textContent, 'cm');
  assert.equal($('#to-focus .unit-number').textContent, '100');
});

test('A coarse mouse wheel input moves exactly one unit regardless of OS scroll distance', t => {
  for (const options of [
    { deltaY: 100 }, { deltaY: 120 }, { deltaY: 360 },
    { deltaY: 3, deltaMode: 1 }, { deltaY: 1, deltaMode: 2 }
  ]) {
    const { window, $, flushFrames } = scrollingApp(t);
    const wheel = $('#from-wheel');
    const event = new window.WheelEvent('wheel', { bubbles: true, cancelable: true, ...options });
    wheel.dispatchEvent(event);
    flushFrames();
    assert.equal(event.defaultPrevented, true, 'Native scrolling must not add a second movement');
    assert.equal($('#from-focus .unit-symbol').textContent, 'km');
    assert.equal(wheel.scrollTop, 6 * 72);
    wheel.dispatchEvent(new window.Event('scrollend'));
    flushFrames();
    assert.equal($('#from-focus .unit-symbol').textContent, 'km');
  }
});

test('Fast wheel inputs, direction changes and the two columns remain independent', t => {
  const { window, $, flushFrames } = scrollingApp(t);
  const tick = (side, deltaY) => $(`#${side}-wheel`).dispatchEvent(new window.WheelEvent('wheel', { deltaY, cancelable: true }));
  tick('from', 100); tick('from', 100); tick('from', 100);
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'ft');
  tick('from', -100);
  tick('to', 100);
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'in');
  assert.equal($('#to-focus .unit-symbol').textContent, 'yd');
  for (let count = 0; count < 20; count++) tick('from', -100);
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'nm');
  for (let count = 0; count < 50; count++) tick('from', 100);
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, window.MetrioCore.getCategory('length').units.at(-1).symbol);
});

test('Trackpad pixel gestures remain native, including a large delta during momentum', t => {
  const { window, $, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  for (const deltaY of [2.5, 8, 20, 100, 12, 1.2]) {
    const event = new window.WheelEvent('wheel', { deltaY, cancelable: true });
    wheel.dispatchEvent(event);
    assert.equal(event.defaultPrevented, false);
  }
  // Happy DOM has no native scroll physics; supply the resulting position.
  wheel.scrollTop = 7 * 72;
  wheel.dispatchEvent(new window.Event('scrollend'));
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'in');
});

test('Windows detents with small pixel distance still step once; zoom and horizontal input pass through', t => {
  const { window, $, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  const event = new window.WheelEvent('wheel', { deltaY: 32, cancelable: true });
  Object.defineProperty(event, 'wheelDeltaY', { value: -120 });
  wheel.dispatchEvent(event);
  flushFrames();
  assert.equal(event.defaultPrevented, true);
  assert.equal($('#from-focus .unit-symbol').textContent, 'km');
  for (const options of [{ deltaY: 100, ctrlKey: true }, { deltaY: 100, metaKey: true }, { deltaY: 100, shiftKey: true }, { deltaX: 100, deltaY: 0 }, { deltaY: 0 }]) {
    const ignored = new window.WheelEvent('wheel', { cancelable: true, ...options });
    // Happy DOM's WheelEvent omits the inherited MouseEvent modifier fields.
    for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey']) {
      Object.defineProperty(ignored, modifier, { value: Boolean(options[modifier]) });
    }
    wheel.dispatchEvent(ignored);
    assert.equal(ignored.defaultPrevented, false, JSON.stringify(options));
  }
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'km');
});

test('A unit transition has intermediate positions and keeps the clipped white track synchronized', t => {
  const { window, $, stepFrame, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 100, cancelable: true }));
  assert.equal(wheel.scrollTop, 5 * 72, 'The presentation must not jump directly to the destination');
  assert.equal($('#from-focus .unit-symbol').textContent, 'km');
  stepFrame(0);
  stepFrame(110);
  assert.ok(wheel.scrollTop > 5 * 72 && wheel.scrollTop < 6 * 72);
  assert.equal($('#from-focus-track').style.transform, `translate3d(0, ${-wheel.scrollTop}px, 0)`);
  wheel.dispatchEvent(new window.Event('scroll'));
  stepFrame();
  assert.equal($('#from-focus .unit-symbol').textContent, 'km', 'Intermediate scroll events must not replace the intended unit');
  flushFrames();
  assert.equal(wheel.scrollTop, 6 * 72);
  assert.equal(wheel.classList.contains('is-animating'), false);
});

test('Reversing or repeating a detent retargets the current position without queuing old animations', t => {
  const { window, $, stepFrame, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  const tick = deltaY => wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY, cancelable: true }));
  tick(100);
  stepFrame(0); stepFrame(80);
  const beforeReverse = wheel.scrollTop;
  tick(-100);
  assert.equal(wheel.scrollTop, beforeReverse);
  assert.equal($('#from-focus .unit-symbol').textContent, 'm');
  stepFrame(0); stepFrame(50);
  assert.ok(wheel.scrollTop < beforeReverse);
  const beforeRepeat = wheel.scrollTop;
  tick(100); tick(100);
  assert.equal(wheel.scrollTop, beforeRepeat);
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'in');
  assert.equal(wheel.scrollTop, 7 * 72);
});

test('Category changes and resize cancel obsolete transitions and align the new content', t => {
  const { window, $, click, stepFrame, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 100, cancelable: true }));
  stepFrame(0); stepFrame(60);
  click('[data-category="temperature"]');
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, '°C');
  assert.equal(wheel.scrollTop, 0);
  assert.equal(wheel.classList.contains('is-animating'), false);
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 100, cancelable: true }));
  stepFrame(0); stepFrame(40);
  window.dispatchEvent(new window.Event('resize'));
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, '°F');
  assert.equal(wheel.scrollTop, 72);
  assert.equal($('#from-focus-track').style.transform, 'translate3d(0, -72px, 0)');
});

test('Direct touch input interrupts a transition and returns control to native scrolling', t => {
  const { window, $, stepFrame, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 100, cancelable: true }));
  stepFrame(0); stepFrame(25);
  wheel.dispatchEvent(new window.Event('pointerdown'));
  assert.equal(wheel.classList.contains('is-animating'), false);
  assert.equal($('#from-focus .unit-symbol').textContent, 'm');
  wheel.scrollTop = 4 * 72;
  wheel.dispatchEvent(new window.Event('scrollend'));
  flushFrames();
  assert.equal($('#from-focus .unit-symbol').textContent, 'dm');
  assert.equal(wheel.scrollTop, 4 * 72);
});

test('Reduced-motion preference skips or finishes a transition without changing the selected unit', t => {
  const { window, $, stepFrame, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  let reduced = true;
  window.matchMedia = () => ({ matches: reduced });
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 100, cancelable: true }));
  assert.equal(wheel.scrollTop, 6 * 72);
  assert.equal(wheel.classList.contains('is-animating'), false);
  reduced = false;
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 100, cancelable: true }));
  stepFrame(0); stepFrame(40);
  assert.ok(wheel.scrollTop > 6 * 72 && wheel.scrollTop < 7 * 72);
  reduced = true;
  flushFrames();
  assert.equal(wheel.scrollTop, 7 * 72);
  assert.equal($('#from-focus .unit-symbol').textContent, 'in');
  assert.equal(wheel.classList.contains('is-animating'), false);
});

test('The cylinder keeps the center face flat and tilts the two adjacent faces in opposite directions', t => {
  const { $ } = scrollingApp(t);
  const rotation = face => Number(face.style.transform.match(/rotateX\(([-\d.e]+)rad\)/)[1]);
  for (const side of ['from', 'to']) {
    const wheel = $(`#${side}-wheel`);
    const selected = wheel.querySelector('.selected');
    assert.equal(selected.style.transform, '', 'Snap targets must remain in their original layout');
    assert.equal(selected.firstElementChild.style.transform, 'none');
    assert.equal(selected.firstElementChild.style.opacity, '1');
    assert.equal($(`#${side}-focus .unit-face`).style.transform, 'none');
    const above = selected.previousElementSibling.firstElementChild;
    const below = selected.nextElementSibling.firstElementChild;
    assert.ok(rotation(above) > 0 && rotation(above) <= 5 * Math.PI / 180, 'The upper row must tilt by at most five degrees');
    assert.ok(rotation(below) < 0 && rotation(below) >= -5 * Math.PI / 180, 'The lower row must tilt in the opposite direction by at most five degrees');
    assert.equal(rotation(above), -rotation(below));
    assert.equal(above.style.opacity, below.style.opacity);
    for (const face of wheel.querySelectorAll('.unit-face')) {
      if (face.style.transform !== 'none') assert.ok(Math.abs(rotation(face)) <= 5 * Math.PI / 180);
    }
    assert.equal(wheel.firstElementChild.firstElementChild.style.visibility, 'hidden');
    assert.equal(wheel.lastElementChild.firstElementChild.style.visibility, 'hidden');
  }
});

test('Cylinder deformation follows the visual position throughout a transition, including the white ribbon', t => {
  const { window, $, stepFrame, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  const departing = wheel.querySelector('[data-unit="m"] .unit-face');
  const arriving = wheel.querySelector('[data-unit="km"] .unit-face');
  wheel.dispatchEvent(new window.WheelEvent('wheel', { deltaY: 120, cancelable: true }));
  assert.equal(departing.style.transform, 'none', 'Changing the logical destination must not flatten it before it arrives');
  assert.notEqual(arriving.style.transform, 'none');
  for (const elapsed of [0, 35, 55, 70]) {
    stepFrame(elapsed);
    Array.from(wheel.children).forEach((row, index) => {
      const face = row.firstElementChild;
      const whiteFace = $('#from-focus-track').children[index].firstElementChild;
      assert.equal(face.style.transform, whiteFace.style.transform);
      assert.equal(face.style.visibility, whiteFace.style.visibility);
      assert.equal(face.style.opacity, whiteFace.style.opacity);
      const rotation = face.style.transform.match(/rotateX\(([-\d.e]+)rad\)/);
      if (rotation) assert.ok(Math.abs(Number(rotation[1])) <= 5 * Math.PI / 180, 'Animation must respect the five-degree limit too');
    });
  }
  assert.notEqual(departing.style.transform, 'none');
  assert.notEqual(arriving.style.transform, 'none');
  flushFrames();
  assert.equal(arriving.style.transform, 'none');
  assert.equal(arriving.style.opacity, '1');
  assert.equal($('#from-focus .unit-symbol').textContent, 'km');
});

test('Native fractional scrolling and compact row heights preserve the cylinder and clickable faces', t => {
  const { window, $, click, flushFrames } = scrollingApp(t);
  const wheel = $('#from-wheel');
  wheel.style.setProperty('--row-height', '64px');
  window.dispatchEvent(new window.Event('resize'));
  flushFrames();
  assert.equal(wheel.scrollTop, 5 * 64);
  assert.equal($('#from-focus .unit-face').style.transform, 'none');
  wheel.scrollTop = 5.5 * 64;
  wheel.dispatchEvent(new window.Event('scroll'));
  flushFrames();
  const upper = wheel.querySelector('[data-unit="m"] .unit-face');
  const lower = wheel.querySelector('[data-unit="km"] .unit-face');
  assert.equal(upper.style.opacity, lower.style.opacity);
  assert.notEqual(upper.style.transform, 'none');
  assert.notEqual(lower.style.transform, 'none');
  click('#from-wheel [data-unit="m"] .unit-face');
  flushFrames();
  assert.equal(wheel.scrollTop, 5 * 64);
  assert.equal($('#from-focus .unit-symbol').textContent, 'm');
  assert.equal(upper.style.transform, 'none');
  assert.equal(lower.style.visibility, 'visible');
});
