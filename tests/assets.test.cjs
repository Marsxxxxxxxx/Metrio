const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
test('The direct-open entry point has all local assets and no external runtime dependency', () => {
  for (const [, reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    assert.ok(!/^https?:|^\/\//.test(reference), `External runtime asset: ${reference}`);
    assert.ok(fs.existsSync(path.resolve(root, reference)), `Missing asset: ${reference}`);
  }
  assert.ok(html.indexOf('src/engine.js') < html.indexOf('src/app.js'));
  assert.equal(new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1])).size, [...html.matchAll(/id="([^"]+)"/g)].length, 'Duplicate DOM ids');
});
