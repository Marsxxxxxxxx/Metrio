/* Unit definitions use SI base units. See docs/REFERENCES.md for conventions. */
(function (root) {
  'use strict';
  const u = (id, name, symbol, factor, aliases = '', offset = 0) => ({ id, name, symbol, factor, aliases, offset });
  const category = (id, name, english, icon, defaults, units, note = '') => ({ id, name, english, icon, defaults, units, note });
  const categories = [
    category('length', '长度', 'Length', 'length', ['m', 'ft'], [
      u('nm', '纳米', 'nm', 1e-9, 'nanometer'), u('um', '微米', 'μm', 1e-6, 'micrometer um'),
      u('mm', '毫米', 'mm', .001, 'millimeter'), u('cm', '厘米', 'cm', .01, 'centimeter 公分'),
      u('dm', '分米', 'dm', .1, 'decimeter'), u('m', '米', 'm', 1, 'meter metre'),
      u('km', '千米', 'km', 1000, 'kilometer 公里'), u('in', '英寸', 'in', .0254, 'inch inches'),
      u('ft', '英尺', 'ft', .3048, 'foot feet'), u('yd', '码', 'yd', .9144, 'yard'),
      u('mi', '英里', 'mi', 1609.344, 'mile'), u('nmi', '海里', 'nmi', 1852, 'nautical mile'),
      u('chi', '市尺', '尺', 1 / 3, '中国大陆')
    ]),
    category('mass', '质量', 'Weight & mass', 'mass', ['kg', 'lb'], [
      u('ug', '微克', 'μg', 1e-9, 'microgram'), u('mg', '毫克', 'mg', 1e-6, 'milligram'),
      u('g', '克', 'g', .001, 'gram'), u('kg', '千克', 'kg', 1, 'kilogram 公斤'),
      u('t', '公吨', 't', 1000, 'tonne'), u('oz', '盎司', 'oz', .028349523125, 'ounce'),
      u('lb', '磅', 'lb', .45359237, 'pound lbs'), u('st', '英石', 'st', 6.35029318, 'stone'),
      u('jin', '市斤', '斤', .5, '中国大陆'), u('liang', '市两', '两', .05, '中国大陆')
    ], '市斤、市两采用中国大陆市制。'),
    category('temperature', '温度', 'Temperature', 'temperature', ['c', 'f'], [
      u('c', '摄氏度', '°C', 1, 'celsius 摄氏', 273.15), u('f', '华氏度', '°F', 5 / 9, 'fahrenheit 华氏', 273.15 - 32 * 5 / 9),
      u('k', '开尔文', 'K', 1, 'kelvin'), u('r', '兰氏度', '°R', 5 / 9, 'rankine')
    ], '绝对温度换算；输入不可低于绝对零度。'),
    category('area', '面积', 'Area', 'area', ['m2', 'ft2'], [
      u('mm2', '平方毫米', 'mm²', 1e-6), u('cm2', '平方厘米', 'cm²', 1e-4), u('m2', '平方米', 'm²', 1, 'square meter'),
      u('km2', '平方千米', 'km²', 1e6), u('ha', '公顷', 'ha', 10000, 'hectare'), u('mu', '市亩', '亩', 2000 / 3),
      u('in2', '平方英寸', 'in²', .0254 ** 2), u('ft2', '平方英尺', 'ft²', .3048 ** 2, 'sqft'),
      u('yd2', '平方码', 'yd²', .9144 ** 2), u('acre', '英亩', 'ac', 4046.8564224, 'acre')
    ]),
    category('volume', '体积', 'Volume', 'volume', ['l', 'usgal'], [
      u('ml', '毫升', 'mL', 1e-6, 'milliliter'), u('l', '升', 'L', .001, 'liter litre'),
      u('cm3', '立方厘米', 'cm³', 1e-6, 'cc'), u('m3', '立方米', 'm³', 1),
      u('in3', '立方英寸', 'in³', .0254 ** 3), u('ft3', '立方英尺', 'ft³', .3048 ** 3),
      u('usfloz', '美制液量盎司', 'fl oz US', .003785411784 / 128),
      u('uscup', '美制杯', 'cup US', .003785411784 / 16), u('uspt', '美制液量品脱', 'pt US', .003785411784 / 8),
      u('usgal', '美制液量加仑', 'gal US', .003785411784, 'gallon'), u('impgal', '英制加仑', 'gal UK', .00454609, 'imperial gallon')
    ], '美制容量采用液量制；美制、英制单位分别列出。'),
    category('speed', '速度', 'Speed', 'speed', ['kmh', 'mph'], [
      u('ms', '米每秒', 'm/s', 1), u('kmh', '千米每小时', 'km/h', 1 / 3.6, 'kph 公里每小时'),
      u('mph', '英里每小时', 'mph', .44704), u('fts', '英尺每秒', 'ft/s', .3048),
      u('kn', '节', 'kn', 1852 / 3600, 'knot'), u('mmin', '米每分钟', 'm/min', 1 / 60)
    ]),
    category('time', '时间', 'Time', 'time', ['h', 'min'], [
      u('us', '微秒', 'μs', 1e-6), u('ms', '毫秒', 'ms', .001, 'millisecond'), u('s', '秒', 's', 1, 'second'),
      u('min', '分钟', 'min', 60, 'minute'), u('h', '小时', 'h', 3600, 'hour'),
      u('d', '天', 'd', 86400, 'day'), u('wk', '周', 'wk', 604800, 'week')
    ], '只包含固定时长单位，不将月份或年份视为固定天数。'),
    category('data', '数据容量', 'Data size', 'data', ['gb', 'gib'], [
      u('bit', '比特', 'bit', 1 / 8, 'b'), u('byte', '字节', 'B', 1, 'byte'),
      u('kb', '千字节', 'kB', 1e3, 'KB kilobyte'), u('mb', '兆字节', 'MB', 1e6, 'megabyte'),
      u('gb', '吉字节', 'GB', 1e9, 'gigabyte'), u('tb', '太字节', 'TB', 1e12, 'terabyte'),
      u('kib', '千二进制字节', 'KiB', 1024, 'kibibyte'), u('mib', '兆二进制字节', 'MiB', 1024 ** 2, 'mebibyte'),
      u('gib', '吉二进制字节', 'GiB', 1024 ** 3, 'gibibyte'), u('tib', '太二进制字节', 'TiB', 1024 ** 4, 'tebibyte')
    ], 'kB / MB / GB 使用 1000 进制；KiB / MiB / GiB 使用 1024 进制。'),
    category('pressure', '压力', 'Pressure', 'pressure', ['kpa', 'psi'], [
      u('pa', '帕斯卡', 'Pa', 1, 'pascal'), u('kpa', '千帕', 'kPa', 1000), u('mpa', '兆帕', 'MPa', 1e6),
      u('bar', '巴', 'bar', 1e5), u('mbar', '毫巴', 'mbar', 100), u('atm', '标准大气压', 'atm', 101325),
      u('psi', '磅力每平方英寸', 'psi', .45359237 * 9.80665 / .0254 ** 2), u('torr', '托', 'Torr', 101325 / 760)
    ]),
    category('energy', '能量', 'Energy', 'energy', ['kj', 'kcal'], [
      u('j', '焦耳', 'J', 1, 'joule'), u('kj', '千焦', 'kJ', 1000), u('mj', '兆焦', 'MJ', 1e6),
      u('cal', '热化学卡', 'cal', 4.184, 'calorie'), u('kcal', '热化学千卡', 'kcal', 4184, '大卡'),
      u('wh', '瓦时', 'Wh', 3600), u('kwh', '千瓦时', 'kWh', 36e5, '度'),
      u('btu', '英热单位（IT）', 'Btu', 1055.05585262)
    ]),
    category('power', '功率', 'Power', 'power', ['kw', 'hp'], [
      u('mw', '毫瓦', 'mW', .001), u('w', '瓦特', 'W', 1, 'watt'), u('kw', '千瓦', 'kW', 1000),
      u('megaw', '兆瓦', 'MW', 1e6), u('hp', '英制机械马力', 'hp', 550 * .3048 * .45359237 * 9.80665, 'horsepower'),
      u('ps', '公制马力', 'PS', 75 * 9.80665)
    ]),
    category('angle', '角度', 'Angle', 'angle', ['deg', 'rad'], [
      u('deg', '度', '°', Math.PI / 180, 'degree'), u('rad', '弧度', 'rad', 1, 'radian'),
      u('grad', '百分度', 'gon', Math.PI / 200, 'gradian'), u('turn', '周', 'rev', 2 * Math.PI, 'turn'),
      u('arcmin', '角分', '′', Math.PI / 10800), u('arcsec', '角秒', '″', Math.PI / 648000)
    ]),
    category('frequency', '频率', 'Frequency', 'frequency', ['hz', 'rpm'], [
      u('hz', '赫兹', 'Hz', 1, 'hertz'), u('khz', '千赫', 'kHz', 1000), u('mhz', '兆赫', 'MHz', 1e6),
      u('ghz', '吉赫', 'GHz', 1e9), u('rpm', '转每分钟', 'rpm', 1 / 60)
    ]),
    category('force', '力', 'Force', 'force', ['n', 'lbf'], [
      u('n', '牛顿', 'N', 1, 'newton'), u('kn', '千牛', 'kN', 1000), u('dyn', '达因', 'dyn', 1e-5, 'dyne'),
      u('kgf', '千克力', 'kgf', 9.80665), u('lbf', '磅力', 'lbf', .45359237 * 9.80665),
      u('ozf', '盎司力', 'ozf', .028349523125 * 9.80665)
    ]),
    category('torque', '扭矩', 'Torque', 'torque', ['nm', 'lbft'], [
      u('nm', '牛顿米', 'N·m', 1), u('ncm', '牛顿厘米', 'N·cm', .01), u('knm', '千牛米', 'kN·m', 1000),
      u('lbft', '磅力英尺', 'lbf·ft', .45359237 * 9.80665 * .3048), u('kgfm', '千克力米', 'kgf·m', 9.80665)
    ]),
    category('flow', '体积流量', 'Volumetric flow', 'flow', ['lmin', 'm3h'], [
      u('m3s', '立方米每秒', 'm³/s', 1), u('m3h', '立方米每小时', 'm³/h', 1 / 3600),
      u('ls', '升每秒', 'L/s', .001), u('lmin', '升每分钟', 'L/min', .001 / 60),
      u('lh', '升每小时', 'L/h', .001 / 3600), u('usgpm', '美制加仑每分钟', 'gal US/min', .003785411784 / 60)
    ]),
    category('density', '密度', 'Density', 'density', ['gcm3', 'kgm3'], [
      u('kgm3', '千克每立方米', 'kg/m³', 1), u('gcm3', '克每立方厘米', 'g/cm³', 1000),
      u('gl', '克每升', 'g/L', 1), u('kgl', '千克每升', 'kg/L', 1000),
      u('lbft3', '磅每立方英尺', 'lb/ft³', .45359237 / .3048 ** 3)
    ]),
    category('fuel', '油耗', 'Fuel consumption', 'fuel', ['l100km', 'mpgus'], [
      { ...u('l100km', '升每百千米', 'L/100 km', 100), reciprocal: true },
      u('kml', '千米每升', 'km/L', 1), u('mpgus', '英里每美制加仑', 'mpg US', 1.609344 / 3.785411784),
      u('mpguk', '英里每英制加仑', 'mpg UK', 1.609344 / 4.54609)
    ], '油耗采用倒数换算；输入须大于 0。')
  ];

  function getCategory(id) {
    const result = categories.find(item => item.id === id);
    if (!result) throw new Error('未知换算分类');
    return result;
  }
  function convert(value, categoryId, fromId, toId) {
    if (!Number.isFinite(value)) throw new Error('数值超出可计算范围');
    const cat = getCategory(categoryId);
    const from = cat.units.find(unit => unit.id === fromId);
    const to = cat.units.find(unit => unit.id === toId);
    if (!from || !to) throw new Error('请选择同一分类中的单位');
    if (categoryId === 'fuel' && value <= 0) throw new Error('油耗数值须大于 0');
    let base = from.reciprocal ? from.factor / value : value * from.factor + from.offset;
    if (categoryId === 'temperature' && base < -1e-10) throw new Error('温度不能低于绝对零度');
    if (categoryId === 'temperature' && Math.abs(base) < 1e-10) base = 0;
    const result = to.reciprocal ? to.factor / base : (base - to.offset) / to.factor;
    if (!Number.isFinite(result)) throw new Error('结果超出可显示范围');
    return Object.is(result, -0) ? 0 : result;
  }

  // A small arithmetic parser: no eval / Function, with normal operator precedence.
  function evaluate(expression) {
    const source = String(expression).replace(/×/g, '*').replace(/[÷]/g, '/').replace(/[−–]/g, '-').replace(/\s+/g, '');
    if (!source || source.length > 160) throw new Error('请输入有效算式');
    const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[()+*/-]/g);
    if (!tokens || tokens.join('') !== source) throw new Error('算式中包含不支持的字符');
    let index = 0;
    function atom() {
      if (tokens[index] === '+' || tokens[index] === '-') return tokens[index++] === '-' ? -atom() : atom();
      if (tokens[index] === '(') {
        index++;
        const value = sum();
        if (tokens[index++] !== ')') throw new Error('括号不匹配');
        return value;
      }
      const token = tokens[index++];
      if (!token || !/^(?:\d|\.)/.test(token)) throw new Error('请补全算式');
      return Number(token);
    }
    function product() {
      let value = atom();
      while (tokens[index] === '*' || tokens[index] === '/') {
        const op = tokens[index++];
        const next = atom();
        if (op === '/' && next === 0) throw new Error('不能除以零');
        value = op === '*' ? value * next : value / next;
      }
      return value;
    }
    function sum() {
      let value = product();
      while (tokens[index] === '+' || tokens[index] === '-') {
        const op = tokens[index++];
        const next = product();
        value = op === '+' ? value + next : value - next;
      }
      return value;
    }
    const value = sum();
    if (index !== tokens.length) throw new Error('请检查算式');
    if (!Number.isFinite(value)) throw new Error('数值超出可计算范围');
    return Object.is(value, -0) ? 0 : value;
  }

  function format(value, precision = 'auto', grouping = false) {
    if (!Number.isFinite(value)) return '—';
    // Remove binary floating-point noise before applying the user's decimal display limit.
    value = Number(value.toPrecision(15));
    if (Object.is(value, -0) || value === 0) return '0';
    const magnitude = Math.abs(value);
    if (magnitude >= 1e10 || magnitude < 1e-6) {
      return value.toExponential(precision === 'auto' ? 5 : Number(precision)).replace(/(\.\d*?[1-9])0+e/, '$1e').replace(/\.0+e/, 'e');
    }
    const digits = precision === 'auto' ? 8 : Number(precision);
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits, useGrouping: grouping }).format(value);
  }
  const api = { categories, getCategory, convert, evaluate, format };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.MetrioCore = api;
})(globalThis);
