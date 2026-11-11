const { test } = require('node:test');
const assert = require('node:assert/strict');
const { categories, convert, evaluate, format } = require('../src/engine.js');
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `${actual} != ${expected}`);

test('Exact reference values for length, mass, area and US / imperial volume', () => {
  near(convert(1, 'length', 'in', 'cm'), 2.54);
  near(convert(1, 'length', 'mi', 'm'), 1609.344);
  near(convert(1, 'mass', 'lb', 'kg'), .45359237);
  near(convert(1, 'mass', 'jin', 'g'), 500);
  near(convert(1, 'area', 'acre', 'm2'), 4046.8564224);
  near(convert(1, 'volume', 'usgal', 'l'), 3.785411784);
  near(convert(1, 'volume', 'impgal', 'l'), 4.54609);
});
test('Temperature uses offsets and respects absolute zero', () => {
  near(convert(0, 'temperature', 'c', 'f'), 32);
  near(convert(212, 'temperature', 'f', 'c'), 100);
  near(convert(-40, 'temperature', 'f', 'c'), -40);
  near(convert(-273.15, 'temperature', 'c', 'k'), 0);
  near(convert(0, 'temperature', 'k', 'f'), -459.67);
  assert.throws(() => convert(-274, 'temperature', 'c', 'f'), /绝对零度/);
});
test('Fuel economy is reciprocal and distinguishes gallon definitions', () => {
  near(convert(8, 'fuel', 'l100km', 'mpgus'), 29.401822916666667);
  near(convert(8, 'fuel', 'l100km', 'kml'), 12.5);
  near(convert(40, 'fuel', 'mpguk', 'l100km'), 7.062023408412554);
  assert.throws(() => convert(0, 'fuel', 'l100km', 'kml'), /大于 0/);
  assert.throws(() => convert(-1, 'fuel', 'kml', 'mpgus'), /大于 0/);
});
test('Bits, decimal bytes and binary bytes stay distinct', () => {
  assert.equal(convert(8, 'data', 'bit', 'byte'), 1);
  assert.equal(convert(1, 'data', 'gb', 'mb'), 1000);
  assert.equal(convert(1, 'data', 'gib', 'mib'), 1024);
  assert.equal(convert(1, 'data', 'mb', 'kib'), 976.5625);
});
test('Engineering reference values are dimensionally consistent', () => {
  near(convert(36, 'speed', 'kmh', 'ms'), 10);
  near(convert(1, 'pressure', 'atm', 'pa'), 101325);
  near(convert(1, 'energy', 'kcal', 'j'), 4184);
  near(convert(1, 'energy', 'kwh', 'j'), 3600000);
  near(convert(1, 'power', 'ps', 'w'), 735.49875);
  near(convert(180, 'angle', 'deg', 'rad'), Math.PI);
  near(convert(60, 'frequency', 'rpm', 'hz'), 1);
  near(convert(1, 'force', 'kgf', 'n'), 9.80665);
  near(convert(1, 'torque', 'lbft', 'nm'), 1.3558179483314004);
  near(convert(60, 'flow', 'lmin', 'm3h'), 3.6);
  near(convert(1, 'density', 'gcm3', 'kgm3'), 1000);
});
test('Every catalog unit round-trips through its category base', () => {
  const catIds = new Set();
  for (const cat of categories) {
    assert.ok(!catIds.has(cat.id), `Duplicate category ${cat.id}`);
    catIds.add(cat.id);
    assert.ok(cat.defaults.every(id => cat.units.some(unit => unit.id === id)));
    const ids = new Set();
    for (const unit of cat.units) {
      assert.ok(!ids.has(unit.id), `Duplicate ${cat.id}/${unit.id}`);
      ids.add(unit.id);
      const input = cat.id === 'temperature' ? 300 : 123.456;
      const intermediate = convert(input, cat.id, unit.id, cat.units[0].id);
      near(convert(intermediate, cat.id, cat.units[0].id, unit.id), input, 1e-9);
    }
  }
});
test('Arithmetic follows precedence, parentheses, unary signs and scientific notation', () => {
  assert.equal(evaluate('2 + 3 × 4'), 14);
  assert.equal(evaluate('(2 + 3) × 4'), 20);
  assert.equal(evaluate('10 ÷ (2 + 3)'), 2);
  assert.equal(evaluate('-40'), -40);
  assert.equal(evaluate('2 * -3'), -6);
  assert.equal(evaluate('-(2+3)'), -5);
  assert.equal(evaluate('1e-6 * 1e6'), 1);
  near(evaluate('.1 + .2'), .3);
});
test('Invalid expressions and overflow fail without executing code', () => {
  for (const text of ['2/0', '2+', '(2+3', '1..2', '2(3)', 'NaN', 'Infinity', '1e999', '1;process.exit()', 'globalThis.x=1', '1'.repeat(161)]) assert.throws(() => evaluate(text), undefined, text);
  assert.throws(() => convert(Infinity, 'length', 'm', 'ft'));
  assert.throws(() => convert(1, 'length', 'm', 'kg'));
  assert.throws(() => convert(1, 'missing', 'm', 'ft'));
});
test('Display formatting is stable for zero, precision and very small values', () => {
  assert.equal(format(-0), '0');
  assert.equal(format(.1 + .2), '0.3');
  assert.equal(format(convert(1, 'length', 'm', 'nm'), 'auto', true), '1,000,000,000');
  assert.equal(format(12345.6789, '2', true), '12,345.68');
  assert.equal(format(1e-9), '1e-9');
  assert.equal(format(1e12), '1e+12');
  assert.equal(format(NaN), '—');
});
