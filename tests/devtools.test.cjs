/* Optional developer UI integration. The main application is exercised without it too. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Window } = require('happy-dom');
const root = path.resolve(__dirname, '..');
const panelPath = path.join(root, 'devtools/style-panel.js');
const optional = { skip: !fs.existsSync(panelPath) };
function setup(t, saved) {
  const window = new Window({ url: 'http://127.0.0.1:4173/', settings: {
    enableJavaScriptEvaluation: true, disableJavaScriptFileLoading: true,
    enableCSSFileLoading: false, suppressInsecureJavaScriptEnvironmentWarning: true
  } });
  t.after(() => window.happyDOM.close());
  const frames = new Map();
  let id = 0, time = 0;
  window.requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  window.cancelAnimationFrame = key => frames.delete(key);
  const step = (elapsed = 16) => { time += elapsed; const batch = [...frames.values()]; frames.clear(); batch.forEach(callback => callback(time)); };
  const flush = () => { let count = 0; while (frames.size) { assert.ok(++count < 100); step(); } };
  window.document.write(fs.readFileSync(path.join(root, 'index.html'), 'utf8'));
  const style = window.document.createElement('style');
  style.textContent = fs.readFileSync(path.join(root, 'src/styles.css'), 'utf8');
  window.document.head.append(style);
  for (const side of ['from', 'to']) Object.defineProperty(window.document.getElementById(`${side}-wheel`), 'clientHeight', { value: 240 });
  window.eval(fs.readFileSync(path.join(root, 'src/engine.js'), 'utf8'));
  window.eval(fs.readFileSync(path.join(root, 'src/app.js'), 'utf8'));
  const $ = selector => window.document.querySelector(selector);
  const ui = selector => $('#metrio-devtools').shadowRoot.querySelector(selector);
  const mount = () => { window.eval(fs.readFileSync(panelPath, 'utf8')); flush(); };
  const change = (name, value, event = 'input') => {
    const input = ui(`#control-${name}`); input.value = value;
    input.dispatchEvent(new window.Event(event, { bubbles: true, composed: true })); flush();
  };
  if (saved) window.localStorage.setItem('metrio.dev.styles.v1', JSON.stringify(saved));
  flush();
  return { window, $, ui, step, flush, mount, change };
}

test('Developer controls update live geometry, fonts and color without changing conversion data', optional, t => {
  const { window, $, ui, mount, change, flush } = setup(t);
  assert.equal($('#metrio-devtools'), null);
  $('#favorite-button').click();
  const applicationData = window.localStorage.getItem('vert.local.v1');
  mount();
  change('rowHeight', '88'); change('angle', '0'); change('duration', '0');
  change('focusSize', '40'); change('accent', '#c82121');
  assert.equal($('#from-wheel').scrollTop, 5 * 88);
  assert.equal(window.getComputedStyle($('#from-focus .unit-value')).fontSize, '40px');
  assert.equal(window.getComputedStyle(window.document.documentElement).getPropertyValue('--red'), '#c82121');
  for (const face of $('#from-wheel').querySelectorAll('.unit-face')) assert.equal(face.style.transform, 'none');
  assert.equal(window.localStorage.getItem('vert.local.v1'), applicationData);
  assert.equal(ui('#control-angle').value, '0');
  $('#from-wheel').dispatchEvent(new window.WheelEvent('wheel', { deltaY: 120, cancelable: true }));
  assert.equal($('#from-wheel').scrollTop, 6 * 88, 'Zero-duration motion should complete immediately');
  flush();
  assert.equal($('#from-focus .unit-symbol').textContent, 'km');
  assert.equal($('#to-focus .unit-number').textContent, '3,280.83989501');
});

test('Preview, collapse and reset operate independently of saved favorites and calculator state', optional, t => {
  const { window, $, ui, mount, change, flush } = setup(t);
  $('#favorite-button').click();
  const saved = window.localStorage.getItem('vert.local.v1');
  mount(); change('rowHeight', '90');
  window.MetrioStylePanel.hide();
  assert.equal(ui('.panel').hidden, true);
  assert.ok($('#metrio-style-overrides'), 'Collapsing keeps the preview active');
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'D', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true }));
  assert.equal(ui('.panel').hidden, false);
  ui('#preview-enabled').click(); flush();
  assert.equal($('#metrio-style-overrides'), null);
  assert.equal($('#from-wheel').scrollTop, 5 * 72);
  ui('#preview-enabled').click(); flush();
  assert.equal($('#from-wheel').scrollTop, 5 * 90);
  ui('[data-command="reset"]').click(); flush();
  assert.equal($('#metrio-style-overrides'), null);
  assert.equal($('#from-wheel').scrollTop, 5 * 72);
  assert.equal(window.localStorage.getItem('vert.local.v1'), saved);
});

test('Removing the entire panel restores the app and mounting again restores only developer preferences', optional, t => {
  const { window, $, ui, mount, change, flush } = setup(t);
  mount(); change('rowHeight', '86');
  const api = window.MetrioStylePanel;
  api.destroy(); api.destroy(); flush();
  assert.equal($('#metrio-devtools'), null);
  assert.equal($('#metrio-style-overrides'), null);
  assert.equal(window.MetrioStylePanel, undefined);
  assert.equal($('#from-wheel').scrollTop, 5 * 72);
  window.document.body.dispatchEvent(new window.KeyboardEvent('keydown', { key: '7', bubbles: true }));
  assert.equal($('#expression').value, '7');
  mount();
  assert.equal(ui('#control-rowHeight').value, '86');
  assert.equal($('#from-wheel').scrollTop, 5 * 86);
  assert.equal($('#expression').value, '7');
});

test('Panel keyboard input and incomplete numbers cannot trigger the calculator or fight typing', optional, t => {
  const { window, $, ui, mount, change } = setup(t);
  mount();
  change('rowHeight', '7');
  assert.equal(ui('#control-rowHeight').value, '7');
  assert.equal($('#metrio-style-overrides'), null);
  change('rowHeight', '72');
  change('duration', '3');
  assert.equal(ui('#control-duration').value, '3');
  change('duration', '300');
  assert.equal(ui('#control-duration').value, '300');
  for (const key of ['7', 's', 'f', 'Enter', 'Escape']) {
    ui('#control-duration').dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true, composed: true, cancelable: true }));
  }
  assert.equal($('#expression').value, '1');
  assert.equal($('#from-focus .unit-symbol').textContent, 'm');
  assert.equal($('#favorite-button').getAttribute('aria-pressed'), 'false');
  assert.equal(ui('.panel').hidden, true);
  window.document.body.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal($('#expression').value, '0');
});

test('Exported CSS controls the application even after the panel has been completely removed', optional, t => {
  const { window, $, mount, change, step, flush } = setup(t);
  mount(); change('angle', '2'); change('duration', '400'); change('easing', 'linear'); change('rowHeight', '86');
  const exported = window.MetrioStylePanel.exportCSS();
  window.MetrioStylePanel.destroy(); flush();
  const style = window.document.createElement('style'); style.textContent = exported; window.document.head.append(style);
  window.dispatchEvent(new window.Event('resize')); flush();
  assert.equal($('#from-wheel').scrollTop, 5 * 86);
  $('#from-wheel').dispatchEvent(new window.WheelEvent('wheel', { deltaY: 120, cancelable: true }));
  step(0); step(100);
  assert.equal($('#from-wheel').scrollTop, 5.25 * 86, 'Exported linear duration must remain effective without the panel');
  flush();
  assert.equal($('#from-wheel').scrollTop, 6 * 86);
  assert.equal($('#from-focus .unit-symbol').textContent, 'km');
  assert.equal(window.MetrioStylePanel, undefined);
});

test('Invalid saved values are bounded and cannot inject CSS; unavailable storage does not block preview', optional, t => {
  const { window, $, ui, mount, change } = setup(t, { values: { angle: 900, rowHeight: 999, accent: 'red; } body { display:none', easing: '__proto__', duration: 'Infinity' } });
  mount();
  assert.equal(ui('#control-angle').value, '5');
  assert.equal(ui('#control-rowHeight').value, '104');
  assert.equal(ui('#control-easing').value, 'ease-out');
  assert.ok(!window.MetrioStylePanel.exportCSS().includes('display:none'));
  Object.defineProperty(window, 'localStorage', { value: { setItem() { throw new Error('Storage blocked'); } }, configurable: true });
  change('angle', '1');
  assert.ok($('#metrio-style-overrides').textContent.includes('--wheel-max-angle: 1'));
  assert.match(ui('.status').textContent, /无法保存/);
});
