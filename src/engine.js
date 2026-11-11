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

  // Explicit definitions and derived factors; see docs/REFERENCES.md for conventions.
  const inch = .0254, foot = .3048, pound = .45359237, gravity = 9.80665;
  const lbf = pound * gravity, gallon = .003785411784, imperialGallon = .00454609;
  const btu = 1055.05585262, electronVolt = 1.602176634e-19, avogadro = 6.02214076e23;
  const au = 149597870700, lightYear = 299792458 * 365.25 * 86400, parsec = au * 648000 / Math.PI;
  const prefixes = { '-30': ['quecto', 'q'], '-27': ['ronto', 'r'], '-24': ['幺', 'y'], '-21': ['仄', 'z'], '-18': ['阿', 'a'], '-15': ['飞', 'f'], '-12': ['皮', 'p'], '-9': ['纳', 'n'], '-6': ['微', 'μ'], '-3': ['毫', 'm'], '-2': ['厘', 'c'], '-1': ['分', 'd'], 0: ['', ''], 1: ['十', 'da'], 2: ['百', 'h'], 3: ['千', 'k'], 6: ['兆', 'M'], 9: ['吉', 'G'], 12: ['太', 'T'], 15: ['拍', 'P'], 18: ['艾', 'E'], 21: ['泽', 'Z'], 24: ['尧', 'Y'], 27: ['ronna', 'R'], 30: ['quetta', 'Q'] };
  function si(id, name, symbol, powers, aliases = '', scale = 1) {
    return powers.map(exponent => u(exponent ? `${id}_${exponent < 0 ? 'n' : 'p'}${Math.abs(exponent)}` : id, prefixes[exponent][0] + name, prefixes[exponent][1] + symbol, scale * 10 ** exponent, aliases));
  }
  function extend(id, units, note) {
    const cat = categories.find(item => item.id === id);
    cat.units.push(...units);
    if (note) cat.note = note;
  }
  extend('length', [
    u('pm', '皮米', 'pm', 1e-12), u('fm', '飞米', 'fm', 1e-15, 'fermi'), u('angstrom', '埃', 'Å', 1e-10, 'angstrom'),
    u('dam', '十米', 'dam', 10), u('hm', '百米', 'hm', 100), u('megam', '兆米', 'Mm', 1e6),
    u('mil', '密耳', 'mil', inch / 1000, 'thou 千分之一英寸'), u('hand', '掌（4 英寸）', 'hh', inch * 4, 'hand'),
    u('fathom', '英寻（国际英尺）', 'fathom', foot * 6), u('rod', '杆（国际英尺）', 'rd', foot * 16.5, 'perch pole'),
    u('chain', '链（国际英尺）', 'ch', foot * 66), u('furlong', '弗隆（国际英尺）', 'fur', foot * 660),
    u('surveyft', '美国测量英尺（历史）', 'ft US survey', 1200 / 3937), u('link', '链节（国际英尺）', 'link', foot * .66),
    u('cun', '市寸', '寸', 1 / 30), u('zhang', '市丈', '丈', 10 / 3), u('li', '市里', '里', 500),
    u('au', '天文单位', 'au', au), u('ly', '光年（儒略年）', 'ly', lightYear), u('pc', '秒差距', 'pc', parsec)
  ], '英美长度默认采用国际英尺；美国测量英尺单独标为历史单位。市制采用中国大陆定义。');
  extend('mass', [
    u('ng', '纳克', 'ng', 1e-12), u('pg', '皮克', 'pg', 1e-15), u('dag', '十克', 'dag', .01), u('hg', '百克', 'hg', .1),
    u('ct', '公制克拉', 'ct', .0002, 'carat'), u('grain', '格令', 'gr', pound / 7000), u('dram', '常衡打兰', 'dr', pound / 256),
    u('ozt', '金衡盎司', 'oz t', pound * 480 / 7000, 'troy ounce'), u('lbt', '金衡磅', 'lb t', pound * 5760 / 7000),
    u('dwt', '英钱', 'dwt', pound * 24 / 7000, 'pennyweight'), u('shortton', '美制短吨', 'ton US', pound * 2000),
    u('longton', '英制长吨', 'ton UK', pound * 2240), u('cwtus', '美制英担', 'cwt US', pound * 100), u('cwtuk', '英制英担', 'cwt UK', pound * 112),
    u('slug', '斯勒格', 'slug', lbf / foot), u('dan', '市担', '担', 50), u('qian', '市钱', '钱', .005),
    u('dalton', '道尔顿（2022 CODATA）', 'Da', 1.66053906892e-27, 'atomic mass unit 原子质量单位 u')
  ], '市制采用中国大陆定义；常衡与金衡分列。道尔顿采用 2022 CODATA 近似值。');
  extend('temperature', [
    u('reaumur', '列氏度', '°Ré', 1.25, 'reaumur', 273.15),
    u('romer', '罗默度', '°Rø', 40 / 21, 'romer', 273.15 - 7.5 * 40 / 21),
    u('newton', '牛顿温标', '°N', 100 / 33, 'newton', 273.15),
    u('delisle', '德利尔度', '°De', -2 / 3, 'delisle', 373.15)
  ], '绝对温度不能低于绝对零度。温度变化量请使用“温差”分类。');
  extend('area', [
    u('um2', '平方微米', 'μm²', 1e-12), u('dm2', '平方分米', 'dm²', .01), u('are', '公亩', 'a', 100),
    u('mi2', '平方英里', 'mi²', 1609.344 ** 2), u('rood', '英亩的四分之一', 'rood', 4046.8564224 / 4),
    u('rod2', '平方杆', 'rd²', (16.5 * foot) ** 2), u('qing', '市顷', '顷', 200000 / 3),
    u('barn', '靶恩', 'b', 1e-28, 'barn 核反应截面'), u('mbarn', '毫靶恩', 'mb', 1e-31), u('circularmil', '圆密耳', 'cmil', Math.PI / 4 * (inch / 1000) ** 2)
  ]);
  extend('volume', [
    u('ul', '微升', 'μL', 1e-9), u('nl', '纳升', 'nL', 1e-12), u('cl', '厘升', 'cL', 1e-5), u('dl', '分升', 'dL', 1e-4),
    u('hl', '百升', 'hL', .1), u('mm3', '立方毫米', 'mm³', 1e-9), u('dm3', '立方分米', 'dm³', .001), u('yd3', '立方码', 'yd³', .9144 ** 3),
    u('usqt', '美制液量夸脱', 'qt US', gallon / 4), u('ustbsp', '美制汤匙', 'tbsp US', gallon / 256), u('ustsp', '美制茶匙', 'tsp US', gallon / 768),
    u('impoz', '英制液量盎司', 'fl oz UK', imperialGallon / 160), u('imppt', '英制品脱', 'pt UK', imperialGallon / 8), u('impqt', '英制夸脱', 'qt UK', imperialGallon / 4),
    u('metriccup', '公制杯（250 mL）', 'cup 250', .00025), u('jpcup', '日制杯（200 mL）', 'cup 200', .0002),
    u('usdrypt', '美制干量品脱', 'dry pt US', .03523907016688 / 64), u('usdryqt', '美制干量夸脱', 'dry qt US', .03523907016688 / 32),
    u('bushel', '美制蒲式耳', 'bu US', .03523907016688), u('peck', '美制配克', 'pk US', .03523907016688 / 4),
    u('bbl', '石油桶（42 美制加仑）', 'bbl', gallon * 42), u('acreft', '英亩英尺', 'ac·ft', 4046.8564224 * foot)
  ], '美制液量、干量与英制容量分列；杯明确标出制式。烹饪用量另见“厨房容量”。');
  extend('speed', [u('cms', '厘米每秒', 'cm/s', .01), u('mms', '毫米每秒', 'mm/s', .001), u('kms', '千米每秒', 'km/s', 1000),
    u('kmmin', '千米每分钟', 'km/min', 1000 / 60), u('ftmin', '英尺每分钟', 'ft/min', foot / 60), u('ins', '英寸每秒', 'in/s', inch),
    u('mach', '马赫（干燥空气 15°C）', 'Ma @15°C', 340.294, 'mach'), u('lightspeed', '真空光速', 'c', 299792458)
  ], '马赫数按干燥空气 15°C、声速约 340.294 m/s 换算；其他介质或温度不适用。');
  extend('time', [u('ns', '纳秒', 'ns', 1e-9), u('ps', '皮秒', 'ps', 1e-12), u('fs', '飞秒', 'fs', 1e-15),
    u('fortnight', '两周', 'fortnight', 1209600), u('year365', '平年（365 天）', 'yr 365d', 31536000),
    u('year366', '闰年（366 天）', 'yr 366d', 31622400), u('julianyear', '儒略年（365.25 天）', 'a Julian', 31557600),
    u('month30', '月（固定 30 天）', 'mo 30d', 2592000), u('decade', '十年（儒略年）', 'decade', 315576000), u('century', '世纪（儒略年）', 'century', 3155760000)
  ], '月份和年份必须选择标注的固定天数定义，不作日历日期推算。');
  extend('data', [u('nibble', '半字节', 'nibble', .5), ...si('largebyte', '字节', 'B', [15, 18, 21, 24, 27, 30], 'byte'),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((power, i) => u(`binarybit${power}`, ['千', '兆', '吉', '太', '拍', '艾', '泽', '尧'][i] + '二进制比特', ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'][i] + 'bit', 1024 ** power / 8)),
    ...[5, 6, 7, 8].map((power, i) => u(`binarybyte${power}`, ['拍', '艾', '泽', '尧'][i] + '二进制字节', ['Pi', 'Ei', 'Zi', 'Yi'][i] + 'B', 1024 ** power)),
    ...si('decimalbit', '比特', 'bit', [3, 6, 9, 12, 15, 18, 21, 24, 27, 30], 'bit', 1 / 8)
  ]);
  extend('pressure', [u('hpa', '百帕', 'hPa', 100), u('gpa', '吉帕', 'GPa', 1e9), u('upa', '微帕', 'μPa', 1e-6),
    u('mmhg', '毫米汞柱（约定值）', 'mmHg', 133.322387415), u('inhg', '英寸汞柱（约定值）', 'inHg', 133.322387415 * 25.4),
    u('mmh2o', '毫米水柱（约定值）', 'mmH₂O', gravity), u('cmh2o', '厘米水柱（约定值）', 'cmH₂O', gravity * 10),
    u('inh2o', '英寸水柱（约定值）', 'inH₂O', gravity * 25.4), u('kgfcm2', '千克力每平方厘米', 'kgf/cm²', gravity * 1e4),
    u('psf', '磅力每平方英尺', 'psf', lbf / foot ** 2), u('ksi', '千磅力每平方英寸', 'ksi', lbf / inch ** 2 * 1000), u('barye', '巴里', 'Ba', .1)
  ], '水柱、汞柱采用约定值；Torr 按标准大气压的 1/760 定义，与约定 mmHg 略有差别。');
  extend('energy', [u('uj', '微焦', 'μJ', 1e-6), u('millij', '毫焦', 'mJ', .001), u('gj', '吉焦', 'GJ', 1e9), u('tj', '太焦', 'TJ', 1e12),
    u('erg', '尔格', 'erg', 1e-7), u('ev', '电子伏', 'eV', electronVolt), u('kev', '千电子伏', 'keV', electronVolt * 1000),
    u('mev', '兆电子伏', 'MeV', electronVolt * 1e6), u('gev', '吉电子伏', 'GeV', electronVolt * 1e9), u('tev', '太电子伏', 'TeV', electronVolt * 1e12),
    u('mwh', '兆瓦时', 'MWh', 3.6e9), u('gwh', '吉瓦时', 'GWh', 3.6e12), u('ftlbf', '英尺磅力', 'ft·lbf', foot * lbf),
    u('calit', '国际蒸汽表卡', 'cal IT', 4.1868), u('thermus', '美制撒姆', 'therm US', 105480400),
    u('thermec', '欧洲撒姆', 'therm EC', 105506000), u('tnt', '吨 TNT 当量', 't TNT', 4.184e9)
  ], '卡和千卡默认热化学定义；IT 卡另列。电子伏使用精确定义的基本电荷。');
  extend('power', [u('uw', '微瓦', 'μW', 1e-6), u('nw', '纳瓦', 'nW', 1e-9), u('gw', '吉瓦', 'GW', 1e9),
    u('btuh', '英热单位每小时（IT）', 'Btu/h', btu / 3600), u('btus', '英热单位每秒（IT）', 'Btu/s', btu),
    u('cals', '热化学卡每秒', 'cal/s', 4.184), u('kcalh', '热化学千卡每小时', 'kcal/h', 4184 / 3600),
    u('refrigeration', '冷吨（美制）', 'TR', btu * 12000 / 3600), u('ftlbfs', '英尺磅力每秒', 'ft·lbf/s', foot * lbf),
    { ...u('dbm', '毫瓦分贝', 'dBm', .001), logarithmic: true }, { ...u('dbw', '瓦分贝', 'dBW', 1), logarithmic: true }
  ], 'dBm / dBW 分别以 1 mW / 1 W 为参考，采用 10·log₁₀(P/P₀)；转换为分贝时功率须大于 0。');
  extend('angle', [u('mrad', '毫弧度', 'mrad', .001), u('urad', '微弧度', 'μrad', 1e-6), u('mil6400', '密位（6400 制）', 'mil 6400', 2 * Math.PI / 6400),
    u('mil6000', '密位（6000 制）', 'mil 6000', 2 * Math.PI / 6000), u('quadrant', '直角', '∟', Math.PI / 2), u('sextant', '六分圆', 'sextant', Math.PI / 3)]);
  extend('frequency', [u('uhz', '微赫', 'μHz', 1e-6), u('millihz', '毫赫', 'mHz', .001), u('thz', '太赫', 'THz', 1e12),
    u('rps', '转每秒', 'rps', 1), u('cph', '周每小时', 'cycle/h', 1 / 3600), u('bpm', '次每分钟', 'BPM', 1 / 60)]);
  extend('force', [u('un', '微牛', 'μN', 1e-6), u('mn', '毫牛', 'mN', .001), u('megan', '兆牛', 'MN', 1e6), u('gf', '克力', 'gf', gravity / 1000),
    u('tf', '公吨力', 'tf', gravity * 1000), u('kip', '千磅力', 'kip', lbf * 1000), u('poundal', '磅达', 'pdl', pound * foot)]);
  extend('torque', [u('nmm', '牛顿毫米', 'N·mm', .001), u('mnm', '毫牛顿米', 'mN·m', .001), u('lbfin', '磅力英寸', 'lbf·in', lbf * inch),
    u('ozfin', '盎司力英寸', 'ozf·in', lbf * inch / 16), u('kgfcm', '千克力厘米', 'kgf·cm', gravity * .01), u('gfcm', '克力厘米', 'gf·cm', gravity * 1e-5), u('dyncm', '达因厘米', 'dyn·cm', 1e-7)]);
  extend('flow', [u('m3min', '立方米每分钟', 'm³/min', 1 / 60), u('m3d', '立方米每天', 'm³/d', 1 / 86400),
    u('mlmin', '毫升每分钟', 'mL/min', 1e-6 / 60), u('mlh', '毫升每小时', 'mL/h', 1e-6 / 3600),
    u('cfm', '立方英尺每分钟', 'cfm', foot ** 3 / 60), u('cfs', '立方英尺每秒', 'cfs', foot ** 3),
    u('impgpm', '英制加仑每分钟', 'gal UK/min', imperialGallon / 60), u('usgph', '美制加仑每小时', 'gal US/h', gallon / 3600),
    u('bbld', '石油桶每天', 'bbl/d', gallon * 42 / 86400)
  ], '均为实际体积流量；标准状态气体流量需要指定温度与压力。');
  extend('density', [u('mgml', '毫克每毫升', 'mg/mL', 1), u('mgl', '毫克每升', 'mg/L', .001), u('ugl', '微克每升', 'μg/L', 1e-6),
    u('gml', '克每毫升', 'g/mL', 1000), u('tm3', '公吨每立方米', 't/m³', 1000), u('lbin3', '磅每立方英寸', 'lb/in³', pound / inch ** 3),
    u('lbusgal', '磅每美制加仑', 'lb/gal US', pound / gallon), u('lbimpgal', '磅每英制加仑', 'lb/gal UK', pound / imperialGallon)]);
  extend('fuel', [u('mil', '英里每升', 'mi/L', 1.609344), { ...u('lkm', '升每千米', 'L/km', 1), reciprocal: true },
    { ...u('usgal100mi', '美制加仑每百英里', 'gal US/100 mi', 160.9344 / 3.785411784), reciprocal: true },
    { ...u('ukgal100mi', '英制加仑每百英里', 'gal UK/100 mi', 160.9344 / 4.54609), reciprocal: true }]);

  categories.push(
    category('acceleration', '加速度', 'Acceleration', 'speed', ['ms2', 'g0'], [
      u('ms2', '米每二次方秒', 'm/s²', 1), u('cms2', '伽（厘米每二次方秒）', 'Gal', .01), u('mgal', '毫伽', 'mGal', 1e-5), u('ugal', '微伽', 'μGal', 1e-8),
      u('g0', '标准重力加速度', 'g₀', gravity), u('fts2', '英尺每二次方秒', 'ft/s²', foot), u('ins2', '英寸每二次方秒', 'in/s²', inch),
      u('kmh2', '千米每二次方小时', 'km/h²', 1000 / 3600 ** 2), u('kmhs', '千米每小时每秒', '(km/h)/s', 1 / 3.6)
    ], '标准重力 g₀ = 9.80665 m/s²。'),
    category('pace', '配速', 'Running pace', 'time', ['minkm', 'minmi'], [
      { ...u('minkm', '分钟每千米', 'min/km', 1000 / 60), reciprocal: true }, { ...u('minmi', '分钟每英里', 'min/mi', 1609.344 / 60), reciprocal: true },
      { ...u('seckm', '秒每千米', 's/km', 1000), reciprocal: true }, { ...u('sec100m', '秒每百米', 's/100 m', 100), reciprocal: true },
      u('kmh', '千米每小时', 'km/h', 1 / 3.6), u('mph', '英里每小时', 'mph', .44704), u('ms', '米每秒', 'm/s', 1)
    ], '分钟采用十进制：5.5 min/km = 5 分 30 秒每千米；输入须大于 0。'),
    category('angular-speed', '角速度', 'Angular velocity', 'torque', ['rads', 'rpm'], [
      u('rads', '弧度每秒', 'rad/s', 1), u('radmin', '弧度每分钟', 'rad/min', 1 / 60), u('degs', '度每秒', '°/s', Math.PI / 180),
      u('degmin', '度每分钟', '°/min', Math.PI / 10800), u('rpm', '转每分钟', 'rpm', Math.PI / 30), u('rps', '转每秒', 'rev/s', 2 * Math.PI), u('rph', '转每小时', 'rev/h', Math.PI / 1800)
    ]),
    category('solid-angle', '立体角', 'Solid angle', 'angle', ['sr', 'deg2'], [
      u('sr', '球面度', 'sr', 1), u('msr', '毫球面度', 'msr', .001), u('usr', '微球面度', 'μsr', 1e-6),
      u('deg2', '平方度', 'deg²', (Math.PI / 180) ** 2), u('amin2', '平方角分', 'arcmin²', (Math.PI / 10800) ** 2), u('asec2', '平方角秒', 'arcsec²', (Math.PI / 648000) ** 2), u('sphere', '完整球面', 'sphere', 4 * Math.PI)
    ]),
    category('temperature-delta', '温差', 'Temperature interval', 'temperature', ['dc', 'df'], [
      u('dc', '摄氏温差', 'Δ°C', 1), u('df', '华氏温差', 'Δ°F', 5 / 9), u('dk', '开尔文温差', 'ΔK', 1), u('dr', '兰氏温差', 'Δ°R', 5 / 9), u('dre', '列氏温差', 'Δ°Ré', 1.25), u('mk', '毫开尔文温差', 'ΔmK', .001)
    ], '温差只换算比例，不加温标零点偏移。'),
    category('data-rate', '数据速率', 'Data transfer rate', 'data', ['bps_p6', 'bytes_p6'], [
      ...si('bps', '比特每秒', 'bit/s', [0, 3, 6, 9, 12, 15, 18]), ...si('bytes', '字节每秒', 'B/s', [0, 3, 6, 9, 12, 15], 'byte/s', 8),
      ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap((power, i) => [u(`kibps${power}`, '二进制比特速率 ' + ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'][i], ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'][i] + 'bit/s', 1024 ** power), u(`kibytes${power}`, '二进制字节速率 ' + ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'][i], ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'][i] + 'B/s', 8 * 1024 ** power)])
    ], 'bit 为比特，B 为字节；1 B = 8 bit。十进制与二进制速率分别列出。'),
    category('charge', '电荷 / 电池容量', 'Electric charge', 'energy', ['ah', 'mah'], [
      ...si('c', '库仑', 'C', [-9, -6, -3, 0, 3, 6]), u('ah', '安时', 'Ah', 3600), u('mah', '毫安时', 'mAh', 3.6), u('as', '安秒', 'A·s', 1),
      u('e', '基本电荷', 'e', electronVolt), u('faraday', '法拉第（每摩尔电荷）', 'F charge', avogadro * electronVolt), u('abc', '电磁库仑', 'abC', 10)
    ], 'Ah / mAh 是电荷量；换算为 Wh 还需要电压，因此不在此直接互换。'),
    category('current', '电流', 'Electric current', 'power', ['a', 'a_n3'], [...si('a', '安培', 'A', [-12, -9, -6, -3, 0, 3, 6]), u('aba', '电磁安培 / 毕奥', 'abA', 10)]),
    category('voltage', '电压', 'Voltage', 'energy', ['v', 'v_n3'], [...si('v', '伏特', 'V', [-9, -6, -3, 0, 3, 6, 9]), u('abv', '电磁伏特', 'abV', 1e-8)]),
    category('resistance', '电阻', 'Electrical resistance', 'power', ['ohm', 'ohm_p3'], [...si('ohm', '欧姆', 'Ω', [-9, -6, -3, 0, 3, 6, 9, 12]), u('abohm', '电磁欧姆', 'abΩ', 1e-9)]),
    category('conductance', '电导', 'Electrical conductance', 'power', ['s', 's_n3'], [...si('s', '西门子', 'S', [-12, -9, -6, -3, 0, 3]), u('mho', '姆欧', '℧', 1)]),
    category('capacitance', '电容', 'Capacitance', 'power', ['f_n6', 'f_n9'], [...si('f', '法拉', 'F', [-15, -12, -9, -6, -3, 0, 3]), u('abf', '电磁法拉', 'abF', 1e9)]),
    category('inductance', '电感', 'Inductance', 'power', ['h_n3', 'h_n6'], [...si('h', '亨利', 'H', [-12, -9, -6, -3, 0, 3]), u('abh', '电磁亨利', 'abH', 1e-9)]),
    category('magnetic-flux', '磁通量', 'Magnetic flux', 'flow', ['wb', 'mx'], [...si('wb', '韦伯', 'Wb', [-9, -6, -3, 0, 3]), u('mx', '麦克斯韦', 'Mx', 1e-8)]),
    category('magnetic-density', '磁感应强度', 'Magnetic flux density', 'density', ['t', 'gauss'], [...si('t', '特斯拉', 'T', [-12, -9, -6, -3, 0, 3]), u('gauss', '高斯', 'G', 1e-4), u('mgauss', '毫高斯', 'mG', 1e-7), u('gamma', '伽马（磁场）', 'γ', 1e-9)]),
    category('magnetic-field', '磁场强度', 'Magnetic field strength', 'force', ['am', 'oe'], [u('am', '安培每米', 'A/m', 1), u('kam', '千安培每米', 'kA/m', 1000), u('acm', '安培每厘米', 'A/cm', 100), u('oe', '奥斯特', 'Oe', 1000 / (4 * Math.PI)), u('koe', '千奥斯特', 'kOe', 1e6 / (4 * Math.PI))]),
    category('electric-field', '电场强度', 'Electric field strength', 'energy', ['vm', 'vcm'], [u('vm', '伏特每米', 'V/m', 1), u('vcm', '伏特每厘米', 'V/cm', 100), u('vmm', '伏特每毫米', 'V/mm', 1000), u('kvm', '千伏每米', 'kV/m', 1000), u('kvcm', '千伏每厘米', 'kV/cm', 1e5), u('nc', '牛顿每库仑', 'N/C', 1)]),
    category('resistivity', '电阻率', 'Electrical resistivity', 'power', ['ohmm', 'ohmcm'], [u('ohmm', '欧姆米', 'Ω·m', 1), u('ohmcm', '欧姆厘米', 'Ω·cm', .01), u('uohmm', '微欧姆米', 'μΩ·m', 1e-6), u('uohmcm', '微欧姆厘米', 'μΩ·cm', 1e-8), u('ohmmm2m', '欧姆平方毫米每米', 'Ω·mm²/m', 1e-6), u('ohmft', '欧姆英尺', 'Ω·ft', foot)]),
    category('conductivity', '电导率', 'Electrical conductivity', 'power', ['sm', 'uscm'], [u('sm', '西门子每米', 'S/m', 1), u('scm', '西门子每厘米', 'S/cm', 100), u('mscm', '毫西门子每厘米', 'mS/cm', .1), u('uscm', '微西门子每厘米', 'μS/cm', 1e-4), u('msm', '毫西门子每米', 'mS/m', .001), u('usm', '微西门子每米', 'μS/m', 1e-6)]),
    category('heat-capacity', '热容 / 熵', 'Heat capacity & entropy', 'temperature', ['jk', 'calk'], [u('jk', '焦耳每开尔文', 'J/K', 1), u('kjk', '千焦每开尔文', 'kJ/K', 1000), u('jc', '焦耳每摄氏温差', 'J/°C', 1), u('calk', '热化学卡每开尔文', 'cal/K', 4.184), u('kcalk', '热化学千卡每开尔文', 'kcal/K', 4184), u('btuf', '英热单位每华氏温差（IT）', 'Btu/°F', btu * 1.8)]),
    category('specific-heat', '比热容', 'Specific heat capacity', 'temperature', ['jkgk', 'calgk'], [u('jkgk', '焦耳每千克开尔文', 'J/(kg·K)', 1), u('kjkgk', '千焦每千克开尔文', 'kJ/(kg·K)', 1000), u('jgk', '焦耳每克开尔文', 'J/(g·K)', 1000), u('calgk', '热化学卡每克开尔文', 'cal/(g·K)', 4184), u('btulbf', '英热单位每磅华氏温差（IT）', 'Btu/(lb·°F)', btu * 1.8 / pound)]),
    category('thermal-conductivity', '热导率', 'Thermal conductivity', 'temperature', ['wmk', 'btufthf'], [u('wmk', '瓦每米开尔文', 'W/(m·K)', 1), u('wcmk', '瓦每厘米开尔文', 'W/(cm·K)', 100), u('mwmk', '毫瓦每米开尔文', 'mW/(m·K)', .001), u('calcmsk', '热化学卡每厘米秒开尔文', 'cal/(cm·s·K)', 418.4), u('btufthf', '英热单位每小时英尺华氏温差', 'Btu/(h·ft·°F)', btu * 1.8 / (3600 * foot)), u('btuinhft2f', '英热单位英寸每小时平方英尺华氏温差', 'Btu·in/(h·ft²·°F)', btu * inch * 1.8 / (3600 * foot ** 2))]),
    category('heat-transfer', '传热系数', 'Heat transfer coefficient', 'temperature', ['wm2k', 'btuhft2f'], [u('wm2k', '瓦每平方米开尔文', 'W/(m²·K)', 1), u('kwm2k', '千瓦每平方米开尔文', 'kW/(m²·K)', 1000), u('wcm2k', '瓦每平方厘米开尔文', 'W/(cm²·K)', 1e4), u('btuhft2f', '英热单位每小时平方英尺华氏温差', 'Btu/(h·ft²·°F)', btu * 1.8 / (3600 * foot ** 2))]),
    category('thermal-resistance', '热阻', 'Thermal resistance', 'temperature', ['kw', 'fbtuh'], [u('kw', '开尔文每瓦', 'K/W', 1), u('cw', '摄氏温差每瓦', '°C/W', 1), u('kkw', '开尔文每千瓦', 'K/kW', .001), u('fbtuh', '华氏温差小时每英热单位（IT）', '°F·h/Btu', 3600 / (1.8 * btu))], '这里是整体热阻 K/W；不与面积热阻 m²·K/W 混用。'),
    category('heat-flux', '热流密度 / 辐照度', 'Heat flux & irradiance', 'energy', ['wm2', 'wcm2'], [u('wm2', '瓦每平方米', 'W/m²', 1), u('kwm2', '千瓦每平方米', 'kW/m²', 1000), u('wcm2', '瓦每平方厘米', 'W/cm²', 1e4), u('mwcm2', '毫瓦每平方厘米', 'mW/cm²', 10), u('btuhft2', '英热单位每小时平方英尺（IT）', 'Btu/(h·ft²)', btu / (3600 * foot ** 2)), u('calcm2s', '热化学卡每平方厘米秒', 'cal/(cm²·s)', 41840)]),
    category('viscosity', '动力黏度', 'Dynamic viscosity', 'flow', ['mpas', 'cp'], [u('pas', '帕秒', 'Pa·s', 1), u('mpas', '毫帕秒', 'mPa·s', .001), u('upas', '微帕秒', 'μPa·s', 1e-6), u('p', '泊', 'P', .1), u('cp', '厘泊', 'cP', .001), u('kgms', '千克每米秒', 'kg/(m·s)', 1), u('lbfts', '磅每英尺秒', 'lb/(ft·s)', pound / foot), u('lbfsft2', '磅力秒每平方英尺', 'lbf·s/ft²', lbf / foot ** 2)]),
    category('kinematic-viscosity', '运动黏度', 'Kinematic viscosity', 'flow', ['mm2s', 'cst'], [u('m2s', '平方米每秒', 'm²/s', 1), u('mm2s', '平方毫米每秒', 'mm²/s', 1e-6), u('cm2s', '平方厘米每秒', 'cm²/s', 1e-4), u('st', '斯托克斯', 'St', 1e-4), u('cst', '厘斯', 'cSt', 1e-6), u('ft2s', '平方英尺每秒', 'ft²/s', foot ** 2), u('ft2h', '平方英尺每小时', 'ft²/h', foot ** 2 / 3600)], '与动力黏度互换需要流体密度，不作直接互换。'),
    category('mass-flow', '质量流量', 'Mass flow', 'flow', ['kgs', 'kgh'], [u('kgs', '千克每秒', 'kg/s', 1), u('kgmin', '千克每分钟', 'kg/min', 1 / 60), u('kgh', '千克每小时', 'kg/h', 1 / 3600), u('gs', '克每秒', 'g/s', .001), u('gmin', '克每分钟', 'g/min', .001 / 60), u('th', '公吨每小时', 't/h', 1000 / 3600), u('td', '公吨每天', 't/d', 1000 / 86400), u('lbs', '磅每秒', 'lb/s', pound), u('lbmin', '磅每分钟', 'lb/min', pound / 60), u('lbh', '磅每小时', 'lb/h', pound / 3600)]),
    category('amount', '物质的量', 'Amount of substance', 'chemistry', ['mol', 'mol_n3'], [...si('mol', '摩尔', 'mol', [-12, -9, -6, -3, 0, 3, 6]), u('particle', '基本实体个数', 'entities', 1 / avogadro), u('lbmol', '磅摩尔', 'lbmol', pound * 1000)], '实体种类须一致；粒子个数按阿伏伽德罗常数精确定义。'),
    category('molarity', '物质的量浓度', 'Molar concentration', 'chemistry', ['moll', 'mmoll'], [u('molm3', '摩尔每立方米', 'mol/m³', 1), u('moll', '摩尔每升', 'mol/L', 1000), u('mmoll', '毫摩尔每升', 'mmol/L', 1), u('umoll', '微摩尔每升', 'μmol/L', .001), u('nmoll', '纳摩尔每升', 'nmol/L', 1e-6), u('kmolm3', '千摩尔每立方米', 'kmol/m³', 1000)], '换算为质量浓度需要物质的摩尔质量。'),
    category('molar-mass', '摩尔质量', 'Molar mass', 'chemistry', ['gmol', 'kgmol'], [u('kgmol', '千克每摩尔', 'kg/mol', 1), u('gmol', '克每摩尔', 'g/mol', .001), u('mgmol', '毫克每摩尔', 'mg/mol', 1e-6), u('kgkmol', '千克每千摩尔', 'kg/kmol', .001), u('lblbmol', '磅每磅摩尔', 'lb/lbmol', .001)]),
    category('ratio', '比例 / 浓度分数', 'Ratio & fraction', 'ratio', ['percent', 'ppm'], [u('fraction', '无量纲比值', '1', 1), u('percent', '百分比', '%', .01), u('permille', '千分比', '‰', .001), u('basispoint', '基点 / 万分比', 'bp', 1e-4), u('ppm', '百万分比', 'ppm', 1e-6), u('ppb', '十亿分比', 'ppb', 1e-9), u('ppt', '万亿分比', 'ppt (10⁻¹²)', 1e-12)], '换算前后须使用同一种分数（质量、体积或物质的量）；ppm 不直接等同于 mg/L。'),
    category('illuminance', '照度', 'Illuminance', 'light', ['lx', 'fc'], [...si('lx', '勒克斯', 'lx', [-6, -3, 0, 3, 6]), u('fc', '英尺烛光', 'fc', 1 / foot ** 2), u('phot', '辐透', 'ph', 1e4), u('lmm2', '流明每平方米', 'lm/m²', 1)]),
    category('luminance', '亮度', 'Luminance', 'light', ['nit', 'fl'], [u('nit', '尼特 / 坎德拉每平方米', 'cd/m²', 1, 'nit nits'), u('kcdm2', '千坎德拉每平方米', 'kcd/m²', 1000), u('cdcm2', '斯提 / 坎德拉每平方厘米', 'sb', 1e4), u('cdft2', '坎德拉每平方英尺', 'cd/ft²', 1 / foot ** 2), u('lambert', '朗伯', 'L', 1e4 / Math.PI), u('fl', '英尺朗伯', 'fL', 1 / (Math.PI * foot ** 2)), u('asb', '阿熙提', 'asb', 1 / Math.PI)]),
    category('luminous-intensity', '发光强度', 'Luminous intensity', 'light', ['cd', 'cd_n3'], si('cd', '坎德拉', 'cd', [-6, -3, 0, 3, 6])),
    category('luminous-flux', '光通量', 'Luminous flux', 'light', ['lm', 'lm_p3'], [...si('lm', '流明', 'lm', [-6, -3, 0, 3, 6]), u('cdsr', '坎德拉球面度', 'cd·sr', 1)]),
    category('radioactivity', '放射性活度', 'Radioactivity', 'radiation', ['bq', 'ci'], [...si('bq', '贝可勒尔', 'Bq', [-3, 0, 3, 6, 9, 12]), u('ci', '居里', 'Ci', 3.7e10), u('mci', '毫居里', 'mCi', 3.7e7), u('uci', '微居里', 'μCi', 3.7e4), u('nci', '纳居里', 'nCi', 37), u('dpm', '衰变每分钟', 'dpm', 1 / 60), u('rd', '卢瑟福', 'Rd', 1e6)]),
    category('absorbed-dose', '吸收剂量', 'Absorbed dose', 'radiation', ['gy', 'rad'], [...si('gy', '戈瑞', 'Gy', [-9, -6, -3, 0, 3]), u('rad', '拉德', 'rad', .01), u('mrad', '毫拉德', 'mrad', 1e-5), u('ergg', '尔格每克', 'erg/g', 1e-4)], '吸收剂量 Gy 与当量剂量 Sv 是不同物理量，不能直接互换。'),
    category('equivalent-dose', '当量剂量', 'Equivalent dose', 'radiation', ['sv_n3', 'rem'], [...si('sv', '希沃特', 'Sv', [-9, -6, -3, 0]), u('rem', '雷姆', 'rem', .01), u('mrem', '毫雷姆', 'mrem', 1e-5), u('urem', '微雷姆', 'μrem', 1e-8)], '仅换算同类剂量单位，不将吸收剂量或放射性活度换算为人体剂量。'),
    category('dose-rate', '当量剂量率', 'Equivalent dose rate', 'radiation', ['usvh', 'mremh'], [u('svs', '希沃特每秒', 'Sv/s', 1), u('svh', '希沃特每小时', 'Sv/h', 1 / 3600), u('msvh', '毫希沃特每小时', 'mSv/h', .001 / 3600), u('usvh', '微希沃特每小时', 'μSv/h', 1e-6 / 3600), u('nsvh', '纳希沃特每小时', 'nSv/h', 1e-9 / 3600), u('remh', '雷姆每小时', 'rem/h', .01 / 3600), u('mremh', '毫雷姆每小时', 'mrem/h', 1e-5 / 3600)]),
    category('linear-density', '线密度 / 纱支', 'Linear density', 'density', ['tex', 'denier'], [u('kgm', '千克每米', 'kg/m', 1), u('gm', '克每米', 'g/m', .001), u('gkm', '克每千米', 'g/km', 1e-6), u('tex', '特克斯', 'tex', 1e-6), u('dtex', '分特克斯', 'dtex', 1e-7), u('denier', '旦尼尔', 'den', .001 / 9000), u('lbft', '磅每英尺', 'lb/ft', pound / foot)]),
    category('surface-density', '面密度 / 克重', 'Surface density', 'density', ['gm2', 'ozyd2'], [u('kgm2', '千克每平方米', 'kg/m²', 1), u('gm2', '克每平方米', 'g/m²', .001, 'gsm'), u('mgcm2', '毫克每平方厘米', 'mg/cm²', .01), u('ozyd2', '盎司每平方码', 'oz/yd²', pound / 16 / .9144 ** 2), u('ozft2', '盎司每平方英尺', 'oz/ft²', pound / 16 / foot ** 2), u('lbft2', '磅每平方英尺', 'lb/ft²', pound / foot ** 2)]),
    category('specific-volume', '比容', 'Specific volume', 'volume', ['m3kg', 'ft3lb'], [u('m3kg', '立方米每千克', 'm³/kg', 1), u('lkg', '升每千克', 'L/kg', .001), u('cm3g', '立方厘米每克', 'cm³/g', .001), u('ft3lb', '立方英尺每磅', 'ft³/lb', foot ** 3 / pound), u('in3lb', '立方英寸每磅', 'in³/lb', inch ** 3 / pound)]),
    category('surface-tension', '表面张力', 'Surface tension', 'force', ['nm', 'dyncm'], [u('nm', '牛顿每米', 'N/m', 1), u('mnm', '毫牛顿每米', 'mN/m', .001), u('dyncm', '达因每厘米', 'dyn/cm', .001), u('lbfin', '磅力每英寸', 'lbf/in', lbf / inch), u('lbfft', '磅力每英尺', 'lbf/ft', lbf / foot)]),
    category('momentum', '动量 / 冲量', 'Momentum & impulse', 'force', ['kgms', 'lbfs'], [u('kgms', '千克米每秒', 'kg·m/s', 1), u('ns', '牛顿秒', 'N·s', 1), u('kns', '千牛顿秒', 'kN·s', 1000), u('gms', '克米每秒', 'g·m/s', .001), u('lbfs', '磅力秒', 'lbf·s', lbf), u('lbfts', '磅英尺每秒', 'lb·ft/s', pound * foot)]),
    category('inertia', '转动惯量', 'Moment of inertia', 'torque', ['kgm2', 'lbft2'], [u('kgm2', '千克平方米', 'kg·m²', 1), u('kgcm2', '千克平方厘米', 'kg·cm²', 1e-4), u('gcm2', '克平方厘米', 'g·cm²', 1e-7), u('lbft2', '磅平方英尺', 'lb·ft²', pound * foot ** 2), u('lbin2', '磅平方英寸', 'lb·in²', pound * inch ** 2), u('slugft2', '斯勒格平方英尺', 'slug·ft²', lbf * foot)]),
    category('typography', '排版长度', 'Typography', 'length', ['pt', 'mm'], [u('pt', 'PostScript 点（1/72 英寸）', 'pt', inch / 72), u('pica', 'PostScript 派卡（12 点）', 'pc', inch / 6), u('csspx', 'CSS 参考像素（1/96 英寸）', 'px CSS', inch / 96), u('mm', '毫米', 'mm', .001), u('cm', '厘米', 'cm', .01), u('in', '英寸', 'in', inch)], 'CSS px 是参考长度，不代表某台屏幕的实际物理像素；实际像素长度需要 DPI。'),
    category('cooking', '厨房容量', 'Cooking volume', 'volume', ['ml', 'ustbsp'], [u('ml', '毫升', 'mL', 1), u('l', '升', 'L', 1000),
      u('ustsp', '美制茶匙', 'tsp US', gallon * 1e6 / 768), u('ustbsp', '美制汤匙', 'tbsp US', gallon * 1e6 / 256), u('uscup', '美制杯', 'cup US', gallon * 1e6 / 16),
      u('metric-tsp', '公制茶匙（5 mL）', 'tsp 5', 5), u('metric-tbsp', '公制汤匙（15 mL）', 'tbsp 15', 15), u('au-tbsp', '澳制汤匙（20 mL）', 'tbsp AU', 20),
      u('metric-cup', '公制杯（250 mL）', 'cup 250', 250), u('uslegal-cup', '美制营养标签杯（240 mL）', 'cup 240', 240), u('jp-cup', '日制杯（200 mL）', 'cup 200', 200),
      u('usfloz', '美制液量盎司', 'fl oz US', gallon * 1e6 / 128), u('impfloz', '英制液量盎司', 'fl oz UK', imperialGallon * 1e6 / 160)
    ], '这里换算体积；面粉、糖、油等换算为克还需要各自的密度。'),
    category('astronomy', '天文距离', 'Astronomical distance', 'astronomy', ['ly', 'pc'], [u('m', '米', 'm', 1), u('km', '千米', 'km', 1000), u('au', '天文单位', 'au', au),
      u('lightsecond', '光秒', 'light-s', 299792458), u('lightminute', '光分', 'light-min', 299792458 * 60), u('lighthour', '光时', 'light-h', 299792458 * 3600), u('lightday', '光日', 'light-d', 299792458 * 86400),
      u('ly', '光年（儒略年）', 'ly', lightYear), u('pc', '秒差距', 'pc', parsec), u('kpc', '千秒差距', 'kpc', parsec * 1000), u('mpc', '兆秒差距', 'Mpc', parsec * 1e6), u('gpc', '吉秒差距', 'Gpc', parsec * 1e9)
    ], 'au 采用 IAU 精确定义；pc = 648000/π au；光年采用 365.25 天。'),
    category('count', '数量', 'Counting units', 'ratio', ['piece', 'dozen'], [u('piece', '个', 'pc', 1), u('pair', '对', 'pair', 2), u('dozen', '打', 'doz', 12), u('score', '二十个', 'score', 20), u('gross', '罗（十二打）', 'gross', 144), u('greatgross', '大罗（十二罗）', 'great gross', 1728), u('hundred', '百', '100', 100), u('thousand', '千', '1000', 1000)]),
    category('pressure-gradient', '压力梯度', 'Pressure gradient', 'pressure', ['pam', 'psift'], [u('pam', '帕每米', 'Pa/m', 1), u('kpam', '千帕每米', 'kPa/m', 1000), u('mpakm', '兆帕每千米', 'MPa/km', 1000), u('barm', '巴每米', 'bar/m', 1e5), u('psift', '磅力每平方英寸每英尺', 'psi/ft', lbf / inch ** 2 / foot)]),
    category('energy-density', '能量密度', 'Energy density', 'energy', ['jm3', 'whl'], [u('jm3', '焦耳每立方米', 'J/m³', 1), u('kjm3', '千焦每立方米', 'kJ/m³', 1000), u('mjm3', '兆焦每立方米', 'MJ/m³', 1e6), u('jl', '焦耳每升', 'J/L', 1000), u('whl', '瓦时每升', 'Wh/L', 3.6e6), u('kwhm3', '千瓦时每立方米', 'kWh/m³', 3.6e6), u('btuft3', '英热单位每立方英尺（IT）', 'Btu/ft³', btu / foot ** 3)]),
    category('specific-energy', '比能量', 'Specific energy', 'energy', ['jkg', 'whkg'], [u('jkg', '焦耳每千克', 'J/kg', 1), u('kjkg', '千焦每千克', 'kJ/kg', 1000), u('mjkg', '兆焦每千克', 'MJ/kg', 1e6), u('whkg', '瓦时每千克', 'Wh/kg', 3600), u('kwhkg', '千瓦时每千克', 'kWh/kg', 3.6e6), u('calg', '热化学卡每克', 'cal/g', 4184), u('btulb', '英热单位每磅（IT）', 'Btu/lb', btu / pound)])
  );
  const commonUnits = {
    length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'mi'], mass: ['mg', 'g', 'kg', 't', 'oz', 'lb', 'jin'],
    temperature: ['c', 'f', 'k'], area: ['cm2', 'm2', 'km2', 'ha', 'mu', 'ft2', 'acre'],
    volume: ['ml', 'l', 'cm3', 'm3', 'usgal', 'impgal'], speed: ['ms', 'kmh', 'mph', 'kn'],
    time: ['ms', 's', 'min', 'h', 'd', 'wk'], data: ['bit', 'byte', 'kb', 'mb', 'gb', 'tb', 'mib', 'gib', 'tib'],
    pressure: ['pa', 'kpa', 'mpa', 'bar', 'atm', 'psi', 'mmhg'], energy: ['j', 'kj', 'kcal', 'wh', 'kwh'],
    power: ['w', 'kw', 'hp', 'ps', 'dbm'], angle: ['deg', 'rad', 'arcmin', 'arcsec'], frequency: ['hz', 'khz', 'mhz', 'ghz', 'rpm']
  };
  for (const cat of categories) cat.common = commonUnits[cat.id] || [...new Set([...cat.defaults, ...cat.units.slice(0, 3).map(unit => unit.id)])];
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
  const unitMaps = new Map(categories.map(cat => [cat.id, new Map(cat.units.map(unit => [unit.id, unit]))]));

  function getCategory(id) {
    const result = categoryMap.get(id);
    if (!result) throw new Error('未知换算分类');
    return result;
  }
  function convert(value, categoryId, fromId, toId) {
    if (!Number.isFinite(value)) throw new Error('数值超出可计算范围');
    const cat = getCategory(categoryId);
    const from = unitMaps.get(cat.id).get(fromId);
    const to = unitMaps.get(cat.id).get(toId);
    if (!from || !to) throw new Error('请选择同一分类中的单位');
    if (categoryId === 'fuel' && value <= 0) throw new Error('油耗数值须大于 0');
    if (categoryId === 'pace' && value <= 0) throw new Error('配速数值须大于 0');
    let base = from.logarithmic ? from.factor * 10 ** (value / 10) : from.reciprocal ? from.factor / value : value * from.factor + from.offset;
    if (categoryId === 'temperature' && base < -1e-10) throw new Error('温度不能低于绝对零度');
    if (categoryId === 'temperature' && Math.abs(base) < 1e-10) base = 0;
    if (!Number.isFinite(base)) throw new Error('数值超出可计算范围');
    if (to.logarithmic && base <= 0) throw new Error('转换为分贝时功率须大于 0');
    const result = to.logarithmic ? 10 * Math.log10(base / to.factor) : to.reciprocal ? to.factor / base : (base - to.offset) / to.factor;
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
