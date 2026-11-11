const { test } = require('node:test');
const assert = require('node:assert/strict');
const { categories, convert, evaluate, format } = require('../src/engine.js');
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance * (expected === 0 ? 1 : Math.abs(expected)), `${actual} != ${expected}`);

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
    assert.ok(cat.common.length >= 2 && cat.common.every(id => cat.units.some(unit => unit.id === id)));
    const ids = new Set();
    for (const unit of cat.units) {
      assert.ok(!ids.has(unit.id), `Duplicate ${cat.id}/${unit.id}`);
      ids.add(unit.id);
      assert.ok(Number.isFinite(unit.factor) && unit.factor !== 0, `${cat.id}/${unit.id}: invalid factor`);
      const input = cat.id === 'temperature' ? 300 : 123.456;
      const intermediate = convert(input, cat.id, unit.id, cat.units[0].id);
      near(convert(intermediate, cat.id, cat.units[0].id, unit.id), input, 1e-9);
    }
  }
});

test('Expanded everyday definitions distinguish customary, metric and historical conventions', () => {
  const cases = [
    ['length', 'surveyft', 'm', 1200 / 3937], ['length', 'mil', 'mm', .0254],
    ['mass', 'ozt', 'g', 31.1034768], ['mass', 'shortton', 'kg', 907.18474], ['mass', 'longton', 'kg', 1016.0469088],
    ['mass', 'dalton', 'kg', 1.66053906892e-27], ['area', 'mi2', 'm2', 2589988.110336], ['area', 'barn', 'm2', 1e-28],
    ['volume', 'ustsp', 'ml', 4.92892159375], ['volume', 'imppt', 'l', .56826125], ['volume', 'bushel', 'l', 35.23907016688],
    ['volume', 'bbl', 'l', 158.987294928], ['time', 'julianyear', 'd', 365.25], ['time', 'month30', 'd', 30],
    ['data', 'largebyte_p30', 'byte', 1e30], ['data', 'binarybyte8', 'byte', 1208925819614629174706176],
    ['pressure', 'mmhg', 'pa', 133.322387415], ['pressure', 'mmh2o', 'pa', 9.80665],
    ['energy', 'ev', 'j', 1.602176634e-19], ['energy', 'calit', 'j', 4.1868], ['energy', 'tnt', 'j', 4.184e9],
    ['power', 'refrigeration', 'kw', 3.516852842066667], ['angle', 'mil6400', 'deg', .05625],
    ['flow', 'cfm', 'ls', .4719474432], ['density', 'lbin3', 'kgm3', 27679.90471020312]
  ];
  for (const [category, from, to, expected] of cases) near(convert(1, category, from, to), expected);
  near(convert(80, 'temperature', 'reaumur', 'c'), 100);
  near(convert(7.5, 'temperature', 'romer', 'c'), 0);
  near(convert(150, 'temperature', 'delisle', 'c'), 0);
  near(convert(33, 'temperature', 'newton', 'c'), 100);
  assert.throws(() => convert(600, 'temperature', 'delisle', 'k'), /绝对零度/);
});

test('Every new scientific category has an independently specified reference conversion', () => {
  const cases = [
    ['acceleration', 'g0', 'ms2', 9.80665], ['angular-speed', 'rpm', 'degs', 6], ['solid-angle', 'sphere', 'sr', 12.566370614359172],
    ['temperature-delta', 'df', 'dc', 5 / 9], ['data-rate', 'bps_p6', 'bytes_p6', .125], ['charge', 'ah', 'mah', 1000], ['charge', 'mah', 'c', 3.6],
    ['current', 'a', 'a_n3', 1000], ['voltage', 'v_p3', 'v', 1000], ['resistance', 'ohm_p6', 'ohm_p3', 1000],
    ['conductance', 's', 's_n6', 1e6], ['capacitance', 'f_n6', 'f_n9', 1000], ['inductance', 'h_n3', 'h_n6', 1000],
    ['magnetic-flux', 'wb', 'mx', 1e8], ['magnetic-density', 't', 'gauss', 10000], ['magnetic-field', 'oe', 'am', 79.57747154594767],
    ['electric-field', 'kvcm', 'vm', 100000], ['resistivity', 'uohmcm', 'ohmm', 1e-8], ['conductivity', 'uscm', 'sm', 1e-4],
    ['heat-capacity', 'calk', 'jk', 4.184], ['specific-heat', 'calgk', 'jkgk', 4184],
    ['thermal-conductivity', 'btufthf', 'wmk', 1.730734666371391], ['heat-transfer', 'btuhft2f', 'wm2k', 5.678263341113488],
    ['thermal-resistance', 'fbtuh', 'kw', 1.895634240626634], ['heat-flux', 'mwcm2', 'wm2', 10],
    ['viscosity', 'cp', 'mpas', 1], ['kinematic-viscosity', 'cst', 'mm2s', 1], ['mass-flow', 'th', 'kgh', 1000],
    ['amount', 'mol', 'particle', 6.02214076e23], ['molarity', 'moll', 'molm3', 1000], ['molar-mass', 'gmol', 'kgmol', .001],
    ['ratio', 'percent', 'ppm', 10000], ['illuminance', 'fc', 'lx', 10.763910416709722], ['luminance', 'fl', 'nit', 3.4262590996353905],
    ['luminous-intensity', 'cd', 'cd_n3', 1000], ['luminous-flux', 'cdsr', 'lm', 1],
    ['radioactivity', 'ci', 'bq', 3.7e10], ['absorbed-dose', 'gy', 'rad', 100], ['equivalent-dose', 'sv', 'rem', 100], ['dose-rate', 'mremh', 'usvh', 10],
    ['linear-density', 'tex', 'denier', 9], ['surface-density', 'ozyd2', 'gm2', 33.905747474882],
    ['specific-volume', 'cm3g', 'm3kg', .001], ['surface-tension', 'dyncm', 'mnm', 1], ['momentum', 'lbfs', 'ns', 4.4482216152605],
    ['inertia', 'lbft2', 'kgm2', .0421401100938048], ['typography', 'pt', 'mm', .3527777777777778],
    ['cooking', 'au-tbsp', 'ml', 20], ['cooking', 'uslegal-cup', 'ml', 240], ['astronomy', 'au', 'km', 149597870.7],
    ['astronomy', 'ly', 'm', 9460730472580800], ['astronomy', 'pc', 'm', 30856775814913672],
    ['count', 'gross', 'dozen', 12], ['pressure-gradient', 'psift', 'pam', 22620.59479380176],
    ['energy-density', 'whl', 'jm3', 3600000], ['specific-energy', 'whkg', 'jkg', 3600]
  ];
  for (const [category, from, to, expected] of cases) {
    try { near(convert(1, category, from, to), expected); } catch (error) { throw new Error(`${category}: ${error.message}`); }
  }
  near(convert(5, 'pace', 'minkm', 'kmh'), 12);
  near(convert(5, 'pace', 'minkm', 'minmi'), 8.04672);
  assert.throws(() => convert(0, 'pace', 'minkm', 'kmh'), /大于 0/);
  assert.throws(() => convert(-1, 'pace', 'ms', 'minkm'), /大于 0/);
});

test('Logarithmic power uses the correct reference and domain without corrupting linear power conversions', () => {
  near(convert(0, 'power', 'dbm', 'mw'), 1);
  near(convert(30, 'power', 'dbm', 'w'), 1);
  near(convert(-30, 'power', 'dbm', 'uw'), 1);
  near(convert(1, 'power', 'w', 'dbw'), 0);
  near(convert(0, 'power', 'dbw', 'dbm'), 30);
  near(convert(-12, 'power', 'kw', 'w'), -12000);
  assert.throws(() => convert(0, 'power', 'w', 'dbm'), /大于 0/);
  assert.throws(() => convert(-1, 'power', 'w', 'dbw'), /大于 0/);
  assert.throws(() => convert(10000, 'power', 'dbm', 'w'), /范围/);
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
