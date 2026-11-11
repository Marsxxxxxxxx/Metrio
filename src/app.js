(function () {
  'use strict';
  const Core = window.MetrioCore;
  const desktopHost = location.hostname === 'vert.example' && Boolean(window.chrome && window.chrome.webview);
  if (desktopHost) document.documentElement.classList.add('desktop-app');
  const $ = selector => document.querySelector(selector);
  const icons = {
    length: '<path d="M4 7h16v10H4zM7 7v5m3-5v3m4-3v5m3-5v3"/>',
    mass: '<path d="M5 8h14l2 13H3z"/><circle cx="12" cy="5" r="3"/>',
    temperature: '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z"/><path d="M12 8v10m6-12h3m-3 4h2"/>',
    area: '<rect x="4" y="4" width="16" height="16"/><path d="m4 20 16-16M4 10l6-6m4 16 6-6"/>',
    volume: '<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5m-9 5v10"/>',
    speed: '<path d="M4 19a10 10 0 1 1 16 0M12 4v3M4 10l3 1m13-1-3 1m-5 5 5-7"/><circle cx="12" cy="16" r="2"/>',
    time: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    data: '<rect x="3" y="3" width="18" height="7" rx="1"/><rect x="3" y="14" width="18" height="7" rx="1"/><path d="M7 6.5h.01M7 17.5h.01m4-11h6m-6 11h6"/>',
    pressure: '<circle cx="12" cy="11" r="8"/><path d="m12 11 4-4M12 19v3m-5 0h10M5 11h1m12 0h1M12 4v1"/>',
    energy: '<path d="m13 2-9 12h7l-1 8 10-13h-8z"/>',
    power: '<path d="M12 2v9m-6-7a9 9 0 1 0 12 0"/>',
    angle: '<path d="M3 4v17h18M3 21 19 5m-16 7a9 9 0 0 1 6 3"/>',
    frequency: '<path d="M2 12c3-14 7-14 10 0s7 14 10 0M2 12h20"/>',
    force: '<path d="M3 12h17m-5-5 5 5-5 5M3 5v14"/>',
    torque: '<path d="M20 8a8 8 0 1 0 0 9m0-14v5h-5"/><circle cx="12" cy="12" r="2"/>',
    flow: '<path d="M3 7h15m-4-4 4 4-4 4M6 17h15M10 13l-4 4 4 4"/>',
    density: '<path d="M4 3h16v18H4zM4 14h16M8 17h.01m4 0h.01m4 0h.01M8 10h.01m8-3h.01"/>',
    fuel: '<path d="M4 21V4h10v17M2 21h14M4 10h10m0-4h2l4 4v8a2 2 0 0 0 4 0V9l-4-4"/>',
    chemistry: '<path d="M9 3h6m-5 0v7L4 20h16l-6-10V3M7 15h10"/>',
    ratio: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M4 20 20 4"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    radiation: '<circle cx="12" cy="12" r="2"/><path d="m10 9-3-5a9 9 0 0 1 10 0l-3 5m1 3h6a9 9 0 0 1-5 8l-3-5m-3 0-3 5a9 9 0 0 1-5-8h6"/>',
    astronomy: '<ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-30 12 12)"/><circle cx="12" cy="12" r="7"/>',
    cooking: '<path d="M4 7h13v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3ZM17 8h2a3 3 0 0 1 0 6h-2M7 3v1m4-1v1m4-1v1M4 11h4m-4 4h4"/>',
    typography: '<path d="M3 5h18M12 5v15M8 20h8M3 5v4m18-4v4"/>',
    count: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>',
    'data-rate': '<path d="M3 7h17l-4-4m4 4-4 4M21 17H4l4-4m-4 4 4 4"/>',
    pace: '<circle cx="12" cy="13" r="8"/><path d="M9 2h6m-3 0v3m7 1 2 2M12 13l3-4"/>',
    acceleration: '<path d="M3 17h17l-4-4m4 4-4 4M3 11h10M3 5h5"/>',
    'solid-angle': '<path d="M12 3 3 19q9 5 18 0ZM12 3v17M8 10q4 3 8 0"/>',
    charge: '<rect x="3" y="6" width="17" height="12" rx="2"/><path d="M20 10h2v4h-2M7 12h4m-2-2v4m5-2h3"/>',
    current: '<circle cx="12" cy="12" r="9"/><path d="m7 16 5-9 5 9M9 13h6"/>',
    voltage: '<circle cx="12" cy="12" r="9"/><path d="m7 8 5 9 5-9"/>',
    resistance: '<path d="M2 12h3l2-5 3 10 4-10 3 10 2-5h3"/>',
    conductance: '<path d="M3 8h18M3 16h18M7 5 4 8l3 3m10 2 3 3-3 3"/>',
    capacitance: '<path d="M2 12h7M9 5v14m6-14v14m0-7h7"/>',
    inductance: '<path d="M2 14h3V9a2 2 0 0 1 4 0v5-5a2 2 0 0 1 4 0v5-5a2 2 0 0 1 4 0v5h5"/>',
    'magnetic-flux': '<path d="M5 3v11a7 7 0 0 0 14 0V3h-4v11a3 3 0 0 1-6 0V3ZM5 7h4m6 0h4"/>',
    'magnetic-field': '<path d="M3 5h18M3 12h18M3 19h18M16 2l3 3-3 3m0 1 3 3-3 3m0 1 3 3-3 3"/>',
    'temperature-delta': '<path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0ZM18 5l3 5h-6"/>',
    viscosity: '<path d="M12 2c-2 4-8 9-8 13a8 8 0 0 0 16 0c0-4-6-9-8-13ZM8 14h8m-7 4h6"/>',
    'surface-density': '<path d="m12 2 10 6-10 6L2 8Zm-10 11 10 6 10-6M2 17l10 5 10-5"/>',
    'linear-density': '<path d="M4 5h16M4 19h16M7 5v14m10-14v14M7 9h10M7 15h10m-5-6v6"/>',
    amount: '<circle cx="6" cy="7" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="14" cy="18" r="3"/><path d="m9 7 6-1m2 3-2 6M8 10l4 5"/>',
    molarity: '<path d="M8 2h8M9 2v7l-5 9a3 3 0 0 0 3 4h10a3 3 0 0 0 3-4l-5-9V2M7 15h10M10 18h.01m4 1h.01"/>',
    illuminance: '<path d="M3 20h18M12 3v3m-7 0 2 2m12-2-2 2M5 15a7 7 0 0 1 14 0M8 15h8"/>',
    'luminous-flux': '<circle cx="9" cy="12" r="5"/><path d="m14 7 7-4m-7 9h7m-7 5 7 4"/>',
    'arrow-left': '<path d="M20 12H4m6-6-6 6 6 6"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    history: '<path d="M3 11a9 9 0 1 1 2 7M3 5v6h6m3-5v6l4 2"/>',
    settings: '<path d="M10 2h4l.5 3 1.5.9 2.8-1 2 3.4-2.2 2v3.4l2.2 2-2 3.4-2.8-1-1.5.9-.5 3h-4l-.5-3-1.5-.9-2.8 1-2-3.4 2.2-2v-3.4l-2.2-2 2-3.4 2.8 1L9.5 5Z"/><circle cx="12" cy="12" r="3"/>',
    swap: '<path d="M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V3H3v13h5"/>',
    backspace: '<path d="M9 5h12v14H9l-7-7zM12 9l6 6m0-6-6 6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    desktop: '<rect x="2" y="3" width="20" height="14" rx="1"/><path d="M8 21h8m-4-4v4"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>',
    mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v7"/>',
    'arrow-up-right': '<path d="M6 18 18 6M7 6h11v11"/>'
  };
  function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.length}</svg>`; }
  function categoryIcon(cat) { return icon(icons[cat.id] ? cat.id : cat.icon); }
  const categoryGroups = [
    { id: 'everyday', name: '日常生活', english: 'EVERYDAY', description: '生活尺度、厨房用量与数字世界', categories: ['length', 'mass', 'temperature', 'area', 'volume', 'time', 'speed', 'fuel', 'cooking', 'count', 'data', 'data-rate', 'typography'] },
    { id: 'mechanics', name: '运动与力学', english: 'MOTION & MECHANICS', description: '运动、受力与流体', categories: ['pace', 'acceleration', 'angle', 'angular-speed', 'frequency', 'solid-angle', 'force', 'torque', 'pressure', 'flow', 'mass-flow', 'surface-tension', 'momentum', 'inertia', 'pressure-gradient'] },
    { id: 'electrical', name: '电学与磁学', english: 'ELECTRICITY & MAGNETISM', description: '电路、电池与电磁场', categories: ['charge', 'current', 'voltage', 'resistance', 'conductance', 'capacitance', 'inductance', 'magnetic-flux', 'magnetic-density', 'magnetic-field', 'electric-field', 'resistivity', 'conductivity'] },
    { id: 'thermal', name: '能量与热学', english: 'ENERGY & HEAT', description: '能量、功率与热量传递', categories: ['energy', 'power', 'temperature-delta', 'heat-capacity', 'specific-heat', 'thermal-conductivity', 'heat-transfer', 'thermal-resistance', 'heat-flux', 'energy-density', 'specific-energy'] },
    { id: 'materials', name: '材料与化学', english: 'MATERIALS & CHEMISTRY', description: '物质性质、浓度与纺织计量', categories: ['density', 'specific-volume', 'viscosity', 'kinematic-viscosity', 'amount', 'molarity', 'molar-mass', 'ratio', 'linear-density', 'surface-density'] },
    { id: 'light-space', name: '光学与天文', english: 'LIGHT & SPACE', description: '光照、天文距离与辐射计量', categories: ['illuminance', 'luminance', 'luminous-intensity', 'luminous-flux', 'astronomy', 'radioactivity', 'absorbed-dose', 'equivalent-dose', 'dose-rate'] }
  ];
  function fillIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = icon(node.dataset.icon); }); }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
  // Keep the original storage key so branding changes do not reset user data.
  const STORAGE_KEY = 'vert.local.v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { /* A restricted browser session is still usable. */ }
  function validPair(pair) {
    const cat = Core.categories.find(item => item.id === pair?.category);
    return Boolean(cat && cat.units.some(unit => unit.id === pair.from) && cat.units.some(unit => unit.id === pair.to));
  }
  const initial = validPair(saved) ? saved : { category: 'length', from: 'm', to: 'ft', expression: '1' };
  const hiddenUnits = {};
  for (const cat of Core.categories) {
    const hidden = new Set(Array.isArray(saved.hiddenUnits?.[cat.id]) ? saved.hiddenUnits[cat.id] : []);
    // Repair obsolete or malformed preferences without touching favorites or history.
    if (cat.units.filter(unit => !hidden.has(unit.id)).length < 2) cat.defaults.forEach(id => hidden.delete(id));
    hiddenUnits[cat.id] = cat.units.filter(unit => hidden.has(unit.id)).map(unit => unit.id);
  }
  let disabledCategories = Core.categories.filter(cat => Array.isArray(saved.disabledCategories) && saved.disabledCategories.includes(cat.id)).map(cat => cat.id);
  if (disabledCategories.length === Core.categories.length) disabledCategories = disabledCategories.filter(id => id !== 'length');
  const state = {
    category: initial.category, from: initial.from, to: initial.to,
    expression: typeof initial.expression === 'string' && initial.expression.length <= 160 ? initial.expression : '1',
    precision: ['auto', '2', '4', '6', '8'].includes(saved.precision) ? saved.precision : 'auto',
    grouping: saved.grouping !== false,
    hiddenUnits, disabledCategories,
    favorites: Array.isArray(saved.favorites) ? saved.favorites.filter(validPair).slice(0, 100) : [],
    history: Array.isArray(saved.history) ? saved.history.filter(item => validPair(item) && typeof item.expression === 'string' && item.expression.length <= 160 && Number.isFinite(item.time)).slice(0, 30) : [],
    tab: 'all', search: '', homeTab: 'all', homeSearch: '', fresh: true, mode: 'desktop'
  };
  let toastTimer;
  let announceTimer;
  let alignFrame;
  let storageWarned = false;
  let result = { input: 1, value: 1, error: '' };
  const app = $('#app');
  let hasConversion = validPair(saved);
  let homeScrollTop = 0;
  const expression = $('#expression');
  const wheels = { from: $('#from-wheel'), to: $('#to-wheel') };
  const focusTracks = { from: $('#from-focus-track'), to: $('#to-focus-track') };
  const wheelFaces = { from: [], to: [] };
  const wheelMotions = { from: null, to: null };
  function setText(node, text) { if (node.textContent !== text) node.textContent = text; }
  function save() {
    const { category, from, to, expression, precision, grouping, favorites, history, hiddenUnits, disabledCategories } = state;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ category, from, to, expression, precision, grouping, favorites, history, hiddenUnits, disabledCategories })); }
    catch {
      if (!storageWarned) { storageWarned = true; toast('当前浏览器无法保存设置；仍可正常换算'); }
    }
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('#toast').textContent = message;
    $('#toast').classList.add('show');
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2400);
  }
  function currentCategory() { return Core.getCategory(state.category); }
  function activeCategories() { return Core.categories.filter(cat => !state.disabledCategories.includes(cat.id)); }
  function visibleUnits(cat = currentCategory()) {
    const hidden = new Set(state.hiddenUnits[cat.id]);
    return cat.units.filter(unit => !hidden.has(unit.id));
  }
  function pairEnabled(pair) {
    return !state.disabledCategories.includes(pair.category) && !state.hiddenUnits[pair.category].includes(pair.from) && !state.hiddenUnits[pair.category].includes(pair.to);
  }
  function reconcileSelection(preserveQuantity = false) {
    const before = { category: state.category, from: state.from };
    const cat = activeCategories().find(item => item.id === state.category) || activeCategories()[0];
    const units = visibleUnits(cat);
    const ids = new Set(units.map(unit => unit.id));
    state.category = cat.id;
    state.from = before.category === cat.id && ids.has(state.from) ? state.from : ids.has(cat.defaults[0]) ? cat.defaults[0] : units[0].id;
    state.to = before.category === cat.id && ids.has(state.to) ? state.to : ids.has(cat.defaults[1]) ? cat.defaults[1] : units.find(unit => unit.id !== state.from).id;
    if (preserveQuantity && before.category === cat.id && before.from !== state.from) {
      try { state.expression = String(Number(Core.convert(evaluatePreview(), cat.id, before.from, state.from).toPrecision(15))); }
      catch { /* An incomplete expression remains editable after the unit switch. */ }
    }
  }
  function currentUnit(side) { return currentCategory().units.find(unit => unit.id === state[side]); }
  function pairKey(pair) { return `${pair.category}:${pair.from}:${pair.to}`; }
  function isFavorite() { return state.favorites.some(pair => pairKey(pair) === pairKey(state)); }
  function format(value) { return Core.format(value, state.precision, state.grouping); }
  function evaluatePreview() {
    let text = state.expression.trim();
    if (!text || text === '-' || text === '−' || text === '.') return 0;
    text = text.replace(/[+\-−×÷*/]+$/, '');
    return Core.evaluate(text || '0');
  }
  function updateResult() {
    const units = visibleUnits();
    try {
      result = { input: evaluatePreview(), error: '' };
      result.value = Core.convert(result.input, state.category, state.from, state.to);
    } catch (error) { result = { input: null, value: null, error: error.message }; }
    for (const side of ['from', 'to']) {
      const previousFocus = focusTracks[side].querySelector('[id]');
      if (previousFocus) previousFocus.removeAttribute('id');
      wheels[side].querySelectorAll('.unit-row').forEach((node, index) => {
        const unit = units[index];
        const selected = unit.id === state[side];
        node.classList.toggle('selected', selected);
        node.setAttribute('aria-pressed', String(selected));
        node.tabIndex = selected ? 0 : -1;
        let number = '';
        if (side === 'from') number = result.input === null ? '—' : format(result.input);
        else {
          try { number = result.input === null ? '—' : format(Core.convert(result.input, state.category, state.from, unit.id)); }
          catch { number = '—'; }
        }
        setText(node.querySelector('.unit-number'), number);
        node.classList.toggle('long-value', (number.length + unit.symbol.length) > 14);
        const focus = focusTracks[side].children[index];
        setText(focus.querySelector('.unit-number'), number);
        focus.classList.toggle('long-value', number.length + unit.symbol.length > 14);
        if (selected) focus.id = `${side}-focus`;
      });
    }
    const rate = $('#rate-label');
    rate.classList.toggle('error', Boolean(result.error));
    if (result.error) rate.textContent = result.error;
    else if (state.category === 'temperature' || currentUnit('from').logarithmic || currentUnit('to').logarithmic || state.category === 'pace') {
      rate.textContent = `${format(result.input)} ${currentUnit('from').symbol} = ${format(result.value)} ${currentUnit('to').symbol}`;
    } else if (state.category === 'fuel') {
      rate.textContent = '油耗 · 美制与英制分别计算';
    } else {
      rate.textContent = `1 ${currentUnit('from').symbol} = ${format(Core.convert(1, state.category, state.from, state.to))} ${currentUnit('to').symbol}`;
    }
    const favoriteButton = $('#favorite-button');
    favoriteButton.setAttribute('aria-pressed', String(isFavorite()));
    favoriteButton.setAttribute('aria-label', isFavorite() ? '取消收藏当前换算' : '收藏当前换算');
    expression.value = state.expression.replace(/\*/g, '×').replace(/\//g, '÷');
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      $('#live-result').textContent = result.error || `${format(result.input)} ${currentUnit('from').name} 等于 ${format(result.value)} ${currentUnit('to').name}`;
    }, 350);
    save();
  }
  function homeTile(cat, unit, matchCount = 0) {
    const detail = unit ? `${unit.name} · ${unit.symbol}${matchCount > 1 ? ` 等 ${matchCount} 项` : ''}` : `${visibleUnits(cat).length} 个单位`;
    return `<button type="button" class="category-tile" data-home-category="${cat.id}" ${unit ? `data-unit="${unit.id}"` : ''} aria-label="${escapeHTML(cat.name + '，' + detail)}">${categoryIcon(cat)}<span class="tile-name">${cat.name}</span><small>${escapeHTML(detail)}</small></button>`;
  }
  function renderHome() {
    const query = state.homeSearch.trim().toLowerCase();
    const cats = activeCategories();
    const activeIds = new Set(cats.map(cat => cat.id));
    const groups = categoryGroups.map(group => ({ ...group, items: group.categories.filter(id => activeIds.has(id)).map(id => Core.getCategory(id)) })).filter(group => group.items.length);
    $('#home-overview').textContent = `${groups.length} 个区域 · ${cats.length} 个分类 · ${cats.reduce((sum, cat) => sum + visibleUnits(cat).length, 0)} 个单位`;
    $('#home-favorite-count').textContent = state.favorites.length || '';
    document.querySelectorAll('[data-home-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.homeTab === state.homeTab)));
    const nav = $('#home-group-nav');
    nav.hidden = Boolean(query) || state.homeTab !== 'all';
    nav.innerHTML = groups.map(group => `<button type="button" data-home-group="${group.id}">${group.name}</button>`).join('');
    const resume = $('#resume-conversion');
    resume.hidden = !hasConversion || Boolean(query) || state.homeTab !== 'all';
    resume.innerHTML = `${categoryIcon(currentCategory())}<span><small>继续上次换算</small><strong>${currentCategory().name}<span>${escapeHTML(currentUnit('from').symbol)} → ${escapeHTML(currentUnit('to').symbol)}</span></strong></span>${icon('arrow-up-right')}`;
    let found = 0;
    let html = '';
    if (state.homeTab === 'favorites') {
      const tiles = state.favorites.map((pair, index) => {
        const cat = Core.getCategory(pair.category);
        const from = cat.units.find(unit => unit.id === pair.from), to = cat.units.find(unit => unit.id === pair.to);
        if (query && !`${cat.name} ${cat.english} ${from.name} ${from.symbol} ${to.name} ${to.symbol}`.toLowerCase().includes(query)) return '';
        found++;
        return `<button type="button" class="category-tile favorite-tile" data-home-favorite-index="${index}" ${pairEnabled(pair) ? '' : 'disabled title="在设置 → 单位管理中重新开启"'}>${categoryIcon(cat)}<span class="tile-name">${escapeHTML(from.symbol)} → ${escapeHTML(to.symbol)}</span><small>${cat.name}${pairEnabled(pair) ? '' : ' · 已关闭'}</small></button>`;
      }).join('');
      if (found) html = `<section class="category-region"><div class="region-heading"><h2>我的收藏</h2><span>${found} 个换算</span></div><div class="category-grid">${tiles}</div></section>`;
    } else {
      for (const group of groups) {
        const tiles = group.items.map(cat => {
          if (!query || `${cat.name} ${cat.english} ${group.name}`.toLowerCase().includes(query)) return homeTile(cat);
          const matches = visibleUnits(cat).filter(unit => `${unit.name} ${unit.symbol} ${unit.aliases}`.toLowerCase().includes(query));
          return matches.length ? homeTile(cat, matches[0], matches.length) : '';
        }).filter(Boolean);
        if (!tiles.length) continue;
        found += tiles.length;
        html += `<section class="category-region" aria-labelledby="home-group-${group.id}"><div class="region-heading"><div><h2 id="home-group-${group.id}" tabindex="-1">${group.name}<small>${group.english}</small></h2><p>${group.description}</p></div><span>${tiles.length} 类</span></div><div class="category-grid">${tiles.join('')}</div></section>`;
      }
    }
    $('#home-sections').innerHTML = html || `<div class="empty-state">${icon(state.homeTab === 'favorites' ? 'star' : 'search')}${state.homeTab === 'favorites' && !query ? '还没有收藏的换算<br>进入分类，点击键盘上的星标即可收藏。' : '没有找到匹配的分类或单位<br><button class="text-button" data-action="unit-settings">到单位管理中查找</button>'}</div>`;
    $('#home-search-status').textContent = query ? `找到 ${found} 个${state.homeTab === 'favorites' ? '收藏' : '分类'}` : '';
  }
  function showHome() {
    for (const side of ['from', 'to']) stopWheelMotion(side);
    cancelAnimationFrame(alignFrame);
    alignFrame = 0;
    app.dataset.page = 'home';
    $('#category-home').hidden = false;
    $('#category-sidebar').hidden = true;
    $('#converter').hidden = true;
    renderHome();
    $('#home-scroll').scrollTop = homeScrollTop;
    ($(`[data-home-category="${state.category}"]`) || $('#home-title')).focus({ preventScroll: true });
  }
  function showConverter() {
    if (app.dataset.page === 'home') homeScrollTop = $('#home-scroll').scrollTop;
    hasConversion = true;
    app.dataset.page = 'converter';
    $('#category-home').hidden = true;
    $('#category-sidebar').hidden = false;
    $('#converter').hidden = false;
  }
  function categoryButton(cat, unit) {
    const selected = cat.id === state.category && (!unit || state.from === unit.id);
    return `<button type="button" class="category-item ${selected ? 'selected' : ''}" data-category="${cat.id}" ${unit ? `data-unit="${unit.id}"` : ''} ${selected ? 'aria-current="true"' : ''}>${categoryIcon(cat)}<span class="category-copy"><strong>${unit ? escapeHTML(unit.name) : cat.name}</strong><small>${unit ? `${cat.name} · ${escapeHTML(unit.symbol)}` : cat.english}</small></span><span class="category-meta">${unit ? '↗' : String(visibleUnits(cat).length).padStart(2, '0')}</span></button>`;
  }
  function renderCategories() {
    renderHome();
    $('#category-count').textContent = activeCategories().length;
    $('#favorite-count').textContent = state.favorites.length || '';
    document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === state.tab)));
    let html = '';
    const query = state.search.trim().toLowerCase();
    if (state.tab === 'favorites' && !query) {
      html = state.favorites.map((pair, index) => {
        const cat = Core.getCategory(pair.category);
        const from = cat.units.find(unit => unit.id === pair.from);
        const to = cat.units.find(unit => unit.id === pair.to);
        return `<button class="category-item ${pairKey(pair) === pairKey(state) ? 'selected' : ''}" data-favorite-index="${index}" ${pairEnabled(pair) ? '' : 'disabled title="在设置 → 单位管理中重新开启"'}>${categoryIcon(cat)}<span class="category-copy"><strong>${escapeHTML(from.symbol)} → ${escapeHTML(to.symbol)}</strong><small>${cat.name} · ${escapeHTML(from.name)} / ${escapeHTML(to.name)}${pairEnabled(pair) ? '' : ' · 已关闭'}</small></span></button>`;
      }).join('');
      if (!html) html = `<div class="empty-state">${icon('star')}常用的换算，留在这里。<br>点击键盘上的星标即可收藏。</div>`;
    } else if (query) {
      for (const cat of activeCategories()) {
        if (`${cat.name} ${cat.english}`.toLowerCase().includes(query)) html += categoryButton(cat);
        else html += visibleUnits(cat).filter(unit => `${unit.name} ${unit.symbol} ${unit.aliases}`.toLowerCase().includes(query)).map(unit => categoryButton(cat, unit)).join('');
      }
      if (!html) html = `<div class="empty-state">${icon('search')}没有找到已开启的单位<br><button class="text-button" data-action="unit-settings">到单位管理中查找</button></div>`;
    } else html = activeCategories().map(cat => categoryButton(cat)).join('');
    $('#category-list').innerHTML = html;
  }
  function rowHeightFor(side) {
    return parseFloat(getComputedStyle(wheels[side]).getPropertyValue('--row-height')) || 72;
  }
  function styleNumber(style, property, fallback, min, max) {
    const value = parseFloat(style.getPropertyValue(property));
    return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  }
  function syncWheelPresentation(side) {
    const rowHeight = rowHeightFor(side);
    const style = getComputedStyle(wheels[side]);
    const wheelMaxAngle = styleNumber(style, '--wheel-max-angle', 5, 0, 90) * Math.PI / 180;
    const wheelPerspective = styleNumber(style, '--wheel-perspective', 480, 80, 5000);
    const scrollTop = wheels[side].scrollTop;
    // Spread the shallow curve across the visible wheel, including partial edge rows.
    const visibleRadius = Math.max(rowHeight, (wheels[side].clientHeight + rowHeight) / 2);
    const radius = wheelMaxAngle > 0 ? visibleRadius / wheelMaxAngle : 0;
    focusTracks[side].style.transform = `translate3d(0, ${-scrollTop}px, 0)`;
    wheelFaces[side].forEach((faces, index) => {
      const offset = index * rowHeight - scrollTop;
      const angle = wheelMaxAngle > 0 ? Math.max(-wheelMaxAngle, Math.min(wheelMaxAngle, offset / radius)) : 0;
      const visible = Math.abs(offset) <= visibleRadius;
      let transform = 'none';
      let opacity = visible ? Math.pow(Math.cos(angle), .45) : 0;
      if (visible && wheelMaxAngle > 0 && Math.abs(offset) > .01) {
        const y = radius * Math.sin(angle);
        const depth = radius * (Math.cos(angle) - 1);
        // Move each face onto the cylinder, then project about the picker center.
        // The outer button stays flat so native scrolling and snap distances do not change.
        transform = `translateY(${-offset}px) perspective(${wheelPerspective}px) translate3d(0, ${y}px, ${depth}px) rotateX(${-angle}rad)`;
      } else if (visible) opacity = 1;
      for (const face of faces) {
        face.style.transform = transform;
        face.style.opacity = String(opacity);
        face.style.visibility = visible ? 'visible' : 'hidden';
      }
    });
  }
  function stopWheelMotion(side) {
    const motion = wheelMotions[side];
    if (motion) cancelAnimationFrame(motion.frame);
    wheelMotions[side] = null;
    wheels[side].classList.remove('is-animating');
  }
  function selectVisibleUnit(side) {
    const units = visibleUnits();
    const index = Math.max(0, Math.min(units.length - 1, Math.round(wheels[side].scrollTop / rowHeightFor(side))));
    if (units[index].id !== state[side]) selectUnit(side, units[index].id, false);
  }
  function interruptWheelMotion(side) {
    if (!wheelMotions[side]) return;
    stopWheelMotion(side);
    syncWheelPresentation(side);
    selectVisibleUnit(side);
  }
  function animateWheel(side) {
    const wheel = wheels[side];
    if (!wheel.clientHeight || alignFrame) return;
    const target = visibleUnits().findIndex(unit => unit.id === state[side]) * rowHeightFor(side);
    const start = wheel.scrollTop;
    const previous = wheelMotions[side];
    if (previous) cancelAnimationFrame(previous.frame);
    const style = getComputedStyle(wheel);
    const duration = styleNumber(style, '--wheel-duration', 220, 0, 3000);
    const easing = style.getPropertyValue('--wheel-easing').trim();
    const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    if (Math.abs(target - start) < .5 || duration === 0 || reducedMotion()) {
      stopWheelMotion(side);
      wheel.scrollTop = target;
      syncWheelPresentation(side);
      return;
    }
    // Keep the destination in state immediately, so fast detents count once.
    // Only the presentation moves; scroll events must not overwrite the destination.
    const motion = { frame: 0, started: null };
    wheelMotions[side] = motion;
    wheel.classList.add('is-animating');
    function tick(time) {
      if (wheelMotions[side] !== motion) return;
      if (motion.started === null) motion.started = time;
      const progress = reducedMotion() ? 1 : Math.min(1, (time - motion.started) / duration);
      const eased = easing === 'linear' ? progress : easing === 'ease-in-out'
        ? (progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2)
        : 1 - (1 - progress) ** 3;
      wheel.scrollTop = start + (target - start) * eased;
      syncWheelPresentation(side);
      if (progress < 1) motion.frame = requestAnimationFrame(tick);
      else {
        // Finish at the exact row before restoring native snapping.
        wheel.scrollTop = target;
        stopWheelMotion(side);
        syncWheelPresentation(side);
      }
    }
    motion.frame = requestAnimationFrame(tick);
  }
  function alignWheels() {
    for (const side of ['from', 'to']) stopWheelMotion(side);
    cancelAnimationFrame(alignFrame);
    if (app.dataset.page !== 'converter') { alignFrame = 0; return; }
    alignFrame = requestAnimationFrame(() => {
      const units = visibleUnits();
      for (const side of ['from', 'to']) {
        const wheel = wheels[side];
        if (!wheel.clientHeight) continue;
        const rowHeight = rowHeightFor(side);
        const padding = Math.max(0, (wheel.clientHeight - rowHeight) / 2);
        wheel.style.paddingBlock = `${padding}px`;
        wheel.style.scrollPaddingBlock = `${padding}px`;
        wheel.scrollTop = units.findIndex(unit => unit.id === state[side]) * rowHeight;
        syncWheelPresentation(side);
      }
      alignFrame = 0;
    });
  }
  function renderConverter() {
    for (const side of ['from', 'to']) stopWheelMotion(side);
    const cat = currentCategory();
    const units = visibleUnits(cat);
    $('#category-title').textContent = cat.name;
    $('#category-english').textContent = cat.english;
    $('#current-icon').innerHTML = categoryIcon(cat);
    $('#category-note').textContent = cat.note || '';
    $('#category-note').hidden = !cat.note;
    for (const side of ['from', 'to']) {
      wheels[side].innerHTML = units.map(unit => `<button type="button" class="unit-row" data-side="${side}" data-unit="${unit.id}" aria-label="${side === 'from' ? '输入' : '输出'}单位：${escapeHTML(unit.name)} ${escapeHTML(unit.symbol)}" aria-pressed="false" tabindex="-1"><span class="unit-face"><span class="unit-name">${escapeHTML(unit.name)}</span><span class="unit-value"><span class="unit-number ${side === 'from' ? 'from-number' : ''}"></span><span class="unit-symbol">${escapeHTML(unit.symbol)}</span></span></span></button>`).join('');
      focusTracks[side].innerHTML = units.map(unit => `<div class="unit-focus"><div class="unit-face"><span class="unit-name">${escapeHTML(unit.name)}</span><span class="unit-value"><span class="unit-number"></span><span class="unit-symbol">${escapeHTML(unit.symbol)}</span></span></div></div>`).join('');
      wheelFaces[side] = Array.from(wheels[side].children, (row, index) => [row.firstElementChild, focusTracks[side].children[index].firstElementChild]);
    }
    updateResult();
    alignWheels();
  }
  function chooseCategory(categoryId, fromId, toId) {
    const cat = Core.getCategory(categoryId);
    if (state.disabledCategories.includes(cat.id)) return;
    const units = visibleUnits(cat);
    state.category = cat.id;
    state.from = units.some(unit => unit.id === fromId) ? fromId : units.some(unit => unit.id === cat.defaults[0]) ? cat.defaults[0] : units[0].id;
    state.to = units.some(unit => unit.id === toId) ? toId : units.some(unit => unit.id === cat.defaults[1]) ? cat.defaults[1] : units[1].id;
    if (state.from === state.to && !toId) state.to = units.find(unit => unit.id !== state.from).id;
    state.fresh = true;
    showConverter();
    renderCategories();
    renderConverter();
    if (!$('#modal').open) $('#category-title').focus({ preventScroll: true });
  }
  function selectUnit(side, unitId, reposition = true) {
    if (!visibleUnits().some(unit => unit.id === unitId)) return;
    state[side] = unitId;
    updateResult();
    if (reposition) animateWheel(side);
    if (state.tab === 'favorites' || state.search) renderCategories();
  }
  function appendKey(key) {
    let text = state.expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (/\d/.test(key)) {
      if (state.fresh || text === '0') text = key;
      else if (text === '-0') text = `-${key}`;
      else text += key;
      state.fresh = false;
    } else if (key === '.') {
      if (state.fresh) text = '0.';
      else if (!/[.eE]/.test(text.split(/[+*/-]/).at(-1))) text += /\d$/.test(text) ? '.' : '0.';
      state.fresh = false;
    } else if ('+-*/'.includes(key)) {
      if (!text || text === '-') text = key === '-' ? '-' : '0' + key;
      else if (key === '-' && /[+*/]$/.test(text)) text += key;
      else if (/[+*/-]$/.test(text)) text = text.replace(/[+*/-]+$/, key);
      else text += key;
      state.fresh = false;
    } else if (key === '(' || key === ')') {
      text = state.fresh ? key : text + key;
      state.fresh = false;
    }
    if (text.length > 160) { toast('算式已达到长度上限'); return; }
    state.expression = text;
    updateResult();
  }
  function addHistory() {
    if (result.error) return;
    const entry = { category: state.category, from: state.from, to: state.to, expression: state.expression, time: Date.now() };
    const previous = state.history[0];
    if (!previous || pairKey(previous) !== pairKey(entry) || previous.expression !== entry.expression) state.history.unshift(entry);
    state.history = state.history.slice(0, 30);
    save();
  }
  function showModal(title, html, page = 'general') {
    $('#modal').dataset.page = page;
    $('#modal-back').hidden = page !== 'units';
    $('#modal-title').textContent = title;
    $('#modal-content').innerHTML = html;
    $('#modal-content').scrollTop = 0;
    if (!$('#modal').open) $('#modal').showModal();
  }
  function showSettings() {
    showModal('设置', `<button class="setting-row setting-link" data-action="unit-settings"><span>单位管理<small>${activeCategories().length} 个分类 · ${activeCategories().reduce((total, cat) => total + visibleUnits(cat).length, 0)} 个已开启单位</small></span><span aria-hidden="true">›</span></button><label class="setting-row"><span>显示精度<small>仅影响显示，不影响内部计算</small></span><select id="precision-setting" aria-label="显示精度">${[['auto', '自动'], ['2', '最多 2 位小数'], ['4', '最多 4 位小数'], ['6', '最多 6 位小数'], ['8', '最多 8 位小数']].map(([value, label]) => `<option value="${value}" ${state.precision === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label class="setting-row"><span>千位分隔符<small>例如 12,345.67</small></span><input id="grouping-setting" type="checkbox" ${state.grouping ? 'checked' : ''} aria-label="千位分隔符"></label><p class="modal-note">红白配色 · 所有换算在本机完成。<br>支持键盘数字、+ − × ÷、括号和 Enter。<br>Esc 清空输入，Ctrl + K 搜索单位。<br>输入框外按 F 收藏，按 S 交换单位。</p><p class="modal-note">${escapeHTML(currentCategory().note || '单位采用固定定义，换算结果以显示精度为准。')}</p>`, 'settings');
  }
  let unitSearch = '';
  let openUnitGroups = new Set();
  function showUnitSettings() {
    unitSearch = '';
    openUnitGroups = new Set([state.category]);
    showModal('单位管理', `<div class="unit-manager-toolbar"><label class="unit-manager-search">${icon('search')}<input id="unit-search" type="search" placeholder="搜索分类、名称或符号" aria-label="搜索所有单位" autocomplete="off"></label><div class="unit-manager-overview"><span id="unit-manager-count"></span><button class="text-button" data-action="units-enable-all">全部开启</button></div></div><p class="unit-manager-help">勾选后即时生效。每类至少保留 2 个单位，也可关闭整个分类。</p><p id="unit-manager-status" class="unit-manager-status" role="status" aria-live="polite"></p><div id="unit-manager-groups"></div>`, 'units');
    renderUnitGroups();
  }
  function renderUnitGroups() {
    const query = unitSearch.trim().toLowerCase();
    let html = '';
    for (const cat of Core.categories) {
      const categoryMatch = `${cat.name} ${cat.english}`.toLowerCase().includes(query);
      const matches = cat.units.filter(unit => !query || categoryMatch || `${unit.name} ${unit.symbol} ${unit.aliases}`.toLowerCase().includes(query));
      if (!matches.length) continue;
      const enabled = !state.disabledCategories.includes(cat.id);
      html += `<details class="unit-group" data-unit-group="${cat.id}" ${query || openUnitGroups.has(cat.id) ? 'open' : ''}><summary>${categoryIcon(cat)}<span class="unit-group-name">${cat.name}<small>${cat.english}</small></span><span class="unit-group-count" data-unit-count="${cat.id}"></span></summary><div class="unit-group-tools"><label class="category-switch"><input type="checkbox" data-enable-category="${cat.id}" aria-label="开启${cat.name}分类" ${enabled ? 'checked' : ''}>开启此分类</label><div><button data-unit-preset="all" data-unit-category="${cat.id}">本类全选</button><button data-unit-preset="common" data-unit-category="${cat.id}">仅常用</button></div></div><div class="unit-options">${matches.map(unit => `<label class="unit-option"><input type="checkbox" data-enable-unit="${unit.id}" data-unit-category="${cat.id}" aria-label="${escapeHTML(cat.name + '：' + unit.name + ' ' + unit.symbol)}" ${state.hiddenUnits[cat.id].includes(unit.id) ? '' : 'checked'}><span>${escapeHTML(unit.name)}<small>${escapeHTML(unit.symbol)}</small></span></label>`).join('')}</div>${cat.note ? `<p class="unit-definition-note">${escapeHTML(cat.note)}</p>` : ''}</details>`;
    }
    $('#unit-manager-groups').innerHTML = html || '<p class="empty-state">没有找到匹配的分类或单位。</p>';
    $('#unit-manager-groups').querySelectorAll('details').forEach(details => details.addEventListener('toggle', () => {
      if (!unitSearch) { if (details.open) openUnitGroups.add(details.dataset.unitGroup); else openUnitGroups.delete(details.dataset.unitGroup); }
    }));
    refreshUnitManager();
  }
  function refreshUnitManager() {
    if (!$('#unit-manager-count')) return;
    const cats = activeCategories();
    $('#unit-manager-count').textContent = `${cats.length} / ${Core.categories.length} 类 · ${cats.reduce((total, cat) => total + visibleUnits(cat).length, 0)} / ${Core.categories.reduce((total, cat) => total + cat.units.length, 0)} 个单位`;
    document.querySelectorAll('[data-unit-count]').forEach(node => {
      const cat = Core.getCategory(node.dataset.unitCount);
      node.textContent = state.disabledCategories.includes(cat.id) ? '已关闭' : `${visibleUnits(cat).length} / ${cat.units.length}`;
    });
    document.querySelectorAll('[data-enable-category]').forEach(input => { input.checked = !state.disabledCategories.includes(input.dataset.enableCategory); });
    document.querySelectorAll('[data-enable-unit]').forEach(input => { input.checked = !state.hiddenUnits[input.dataset.unitCategory].includes(input.dataset.enableUnit); });
  }
  function applyUnitPreferences(message = '已应用，重新打开仍会保留。') {
    reconcileSelection(true);
    renderCategories(); renderConverter();
    refreshUnitManager();
    $('#unit-manager-status').textContent = storageWarned ? '已在当前窗口生效；当前环境无法保存设置。' : message;
  }
  function setCategoryEnabled(id, enabled) {
    if (!enabled && !state.disabledCategories.includes(id) && activeCategories().length === 1) {
      $('#unit-manager-status').textContent = '至少保留一个开启的分类。'; refreshUnitManager(); return;
    }
    state.disabledCategories = state.disabledCategories.filter(item => item !== id);
    if (!enabled) state.disabledCategories.push(id);
    applyUnitPreferences();
  }
  function setUnitEnabled(categoryId, unitId, enabled) {
    const cat = Core.getCategory(categoryId);
    if (!enabled && !state.hiddenUnits[categoryId].includes(unitId) && visibleUnits(cat).length <= 2) {
      $('#unit-manager-status').textContent = '每类至少保留两个单位；不需要时可关闭整个分类。'; refreshUnitManager(); return;
    }
    state.hiddenUnits[categoryId] = state.hiddenUnits[categoryId].filter(id => id !== unitId);
    if (!enabled) state.hiddenUnits[categoryId].push(unitId);
    applyUnitPreferences();
  }
  function showHistory() {
    const items = state.history.map((entry, index) => {
      const cat = Core.getCategory(entry.category);
      try {
        const input = Core.evaluate(entry.expression);
        const output = Core.convert(input, entry.category, entry.from, entry.to);
        const from = cat.units.find(unit => unit.id === entry.from);
        const to = cat.units.find(unit => unit.id === entry.to);
        return `<button class="history-item" data-history-index="${index}" ${pairEnabled(entry) ? '' : 'disabled title="在设置 → 单位管理中重新开启"'}><span>${format(input)} ${escapeHTML(from.symbol)} <span style="color:var(--red)">→</span> ${format(output)} ${escapeHTML(to.symbol)}</span><small>${cat.name} · ${new Date(entry.time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}${pairEnabled(entry) ? '' : ' · 单位已关闭'}</small></button>`;
      } catch { return ''; }
    }).join('');
    showModal('换算记录', items || `<div class="empty-state">${icon('history')}还没有换算记录<br>按下 = 或复制结果后，记录会保存在这里。</div>`);
  }
  async function copyResult() {
    if (result.error) { toast(result.error); return; }
    const text = `${format(result.value)} ${currentUnit('to').symbol}`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      addHistory();
      toast(`已复制 ${text}`);
    } catch {
      showModal('复制结果', `<p class="about-copy">请选择并复制下方结果：</p><input class="copy-output" value="${escapeHTML(text)}" readonly aria-label="待复制的结果">`);
      $('.copy-output').select();
    }
  }
  function performAction(action) {
    switch (action) {
      case 'open-categories': showHome(); break;
      case 'resume-conversion': chooseCategory(state.category, state.from, state.to); break;
      case 'clear': state.expression = '0'; state.fresh = true; updateResult(); break;
      case 'backspace': state.expression = state.expression.slice(0, -1) || '0'; state.fresh = false; updateResult(); break;
      case 'sign': {
        try {
          const text = state.expression.trim();
          if (!text || text === '0') state.expression = '-0';
          else if (text === '-0') state.expression = '0';
          else if (/[+*/×÷]$/.test(text)) state.expression = `${text}-`;
          else if (/[+*/×÷]-$/.test(text)) state.expression = text.slice(0, -1);
          else state.expression = String(-Core.evaluate(text));
          state.fresh = false; updateResult();
        }
        catch (error) { toast(error.message); }
        break;
      }
      case 'equals': {
        try {
          const input = Core.evaluate(state.expression || '0');
          Core.convert(input, state.category, state.from, state.to);
          state.expression = String(Number(input.toPrecision(15)));
          state.fresh = true;
          updateResult();
          addHistory();
          toast('已计算 · 记录已保存');
        } catch (error) { toast(error.message); }
        break;
      }
      case 'swap': {
        if (result.error) { toast(result.error); break; }
        const value = result.value;
        [state.from, state.to] = [state.to, state.from];
        state.expression = String(Number(value.toPrecision(15)));
        state.fresh = true;
        updateResult();
        alignWheels();
        renderCategories();
        break;
      }
      case 'favorite': {
        if (isFavorite()) { state.favorites = state.favorites.filter(pair => pairKey(pair) !== pairKey(state)); toast('已取消收藏'); }
        else { state.favorites.push({ category: state.category, from: state.from, to: state.to }); toast('已加入我的收藏'); }
        updateResult(); renderCategories(); break;
      }
      case 'copy': copyResult(); break;
      case 'settings': showSettings(); break;
      case 'unit-settings': showUnitSettings(); break;
      case 'units-enable-all':
        state.disabledCategories = [];
        for (const cat of Core.categories) state.hiddenUnits[cat.id] = [];
        applyUnitPreferences('全部分类与单位已开启。'); break;
      case 'history': showHistory(); break;
      case 'close-modal': $('#modal').close(); break;
      case 'about':
        showModal('关于 Metrio · 度衡', `<div class="about-logo"><img src="assets/icon.svg" alt=""><div><strong>Metrio</strong><small>度衡 · Unit Converter · v0.5.0</small></div></div><div class="about-copy"><p>度衡（Metrio）是一个参考经典 VERT 界面的个人换算工具。保留红白界面、双列滚动与折角选中条，让熟悉的换算回到手边。</p><p>当前支持 ${Core.categories.length} 个分类、${Core.categories.reduce((total, cat) => total + cat.units.length, 0)} 个单位。所有换算在本机完成。</p><p>原设计：Andrej Mihelic<br><a href="https://dribbble.com/shots/1707405-Vert-Unit-and-Currency-Converter" target="_blank" rel="noopener noreferrer">查看原设计 ↗</a></p><p class="modal-note">个人重实现，与原作者无关联。<br>本版尚未加入汇率、衣物尺码和配料重量换算。</p></div>`);
        break;
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const data = button.dataset;
    if (data.homeGroup) {
      const heading = $(`#home-group-${data.homeGroup}`);
      const scroller = $('#home-scroll');
      heading?.focus({ preventScroll: true });
      if (heading) scroller.scrollTo({ top: scroller.scrollTop + heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 22, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    } else if (data.homeTab) {
      state.homeTab = data.homeTab; renderHome(); $('#home-scroll').scrollTop = 0;
    } else if (data.homeCategory) {
      chooseCategory(data.homeCategory, data.unit);
    } else if (data.homeFavoriteIndex !== undefined) {
      const pair = state.favorites[Number(data.homeFavoriteIndex)];
      if (pair && pairEnabled(pair)) chooseCategory(pair.category, pair.from, pair.to);
    } else if (data.unitPreset) {
      const cat = Core.getCategory(data.unitCategory);
      state.hiddenUnits[cat.id] = data.unitPreset === 'all' ? [] : cat.units.filter(unit => !cat.common.includes(unit.id)).map(unit => unit.id);
      applyUnitPreferences(data.unitPreset === 'all' ? `${cat.name}的全部单位已开启。` : `${cat.name}已保留常用单位。`);
    } else if (data.action) performAction(data.action);
    else if (data.key) appendKey(data.key);
    else if (data.category) chooseCategory(data.category, data.unit);
    else if (data.side) selectUnit(data.side, data.unit);
    else if (data.tab) { state.tab = data.tab; state.search = ''; $('#category-search').value = ''; renderCategories(); }
    else if (data.favoriteIndex !== undefined) {
      const pair = state.favorites[Number(data.favoriteIndex)];
      if (pair && pairEnabled(pair)) chooseCategory(pair.category, pair.from, pair.to);
    } else if (data.historyIndex !== undefined) {
      const entry = state.history[Number(data.historyIndex)];
      if (entry && pairEnabled(entry)) { state.expression = entry.expression; chooseCategory(entry.category, entry.from, entry.to); $('#modal').close(); }
    } else if (data.mode) {
      state.mode = data.mode;
      app.classList.toggle('phone', data.mode === 'phone');
      document.querySelectorAll('[data-mode]').forEach(node => { node.classList.toggle('active', node === button); node.setAttribute('aria-pressed', String(node === button)); });
      alignWheels();
    }
  });
  $('#category-search').addEventListener('input', event => { state.search = event.target.value; renderCategories(); });
  $('#home-search').addEventListener('input', event => { state.homeSearch = event.target.value; renderHome(); $('#home-scroll').scrollTop = 0; });
  document.addEventListener('input', event => { if (event.target.id === 'unit-search') { unitSearch = event.target.value; renderUnitGroups(); } });
  expression.addEventListener('input', () => {
    const selection = expression.selectionStart;
    state.expression = expression.value;
    state.fresh = false;
    updateResult();
    expression.setSelectionRange(selection, selection);
  });
  expression.addEventListener('focus', () => { state.fresh = false; });
  document.addEventListener('change', event => {
    if (event.target.dataset.enableCategory) setCategoryEnabled(event.target.dataset.enableCategory, event.target.checked);
    if (event.target.dataset.enableUnit) setUnitEnabled(event.target.dataset.unitCategory, event.target.dataset.enableUnit, event.target.checked);
    if (event.target.id === 'precision-setting') { state.precision = event.target.value; updateResult(); }
    if (event.target.id === 'grouping-setting') { state.grouping = event.target.checked; updateResult(); }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !$('#modal').open) {
      event.preventDefault();
      if (app.dataset.page !== 'home') showHome();
      $('#home-search').focus();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if ($('#modal').open) return;
    if (app.dataset.page !== 'converter') return;
    const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    if (editing && event.target !== expression) return;
    if (event.key === 'Enter') {
      if (event.target.closest('button') && !event.target.closest('#keypad') && !event.target.closest('.unit-wheel')) return;
      event.preventDefault(); performAction('equals'); return;
    }
    if (event.key === 'Escape') { event.preventDefault(); performAction('clear'); return; }
    if (editing) return;
    if (/^[0-9.+*/()\-]$/.test(event.key)) { event.preventDefault(); appendKey(event.key); }
    else if (event.key === 'Backspace') { event.preventDefault(); performAction('backspace'); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); performAction('favorite'); }
    else if (event.key.toLowerCase() === 's') { event.preventDefault(); performAction('swap'); }
  });
  for (const side of ['from', 'to']) {
    let frame = 0;
    let lastContinuousWheel = -Infinity;
    wheels[side].addEventListener('wheel', event => {
      if (app.dataset.page !== 'converter') return;
      const mode = event.deltaMode;
      const delta = event.deltaY;
      if (event.ctrlKey || event.metaKey || event.shiftKey || !event.cancelable || !Number.isFinite(delta) || delta === 0 || Math.abs(event.deltaX) >= Math.abs(delta)) return;
      if (mode === 0) {
        const now = performance.now();
        // Browsers expose both mice and trackpads as wheel events. Preserve a
        // continuous pixel gesture, including its larger/accelerated tail.
        const legacy = Math.abs(event.wheelDeltaY || 0);
        const detent = legacy >= 120 && legacy % 120 === 0;
        if (now - lastContinuousWheel < 200 || (!detent && (Math.abs(delta) < 40 || !Number.isInteger(delta) || event.deltaX !== 0))) {
          lastContinuousWheel = now;
          interruptWheelMotion(side);
          return;
        }
      }
      // OS scrolling preferences express a detent as pixels, lines or pages;
      // that distance must not skip items in a discrete unit selector.
      event.preventDefault();
      const units = visibleUnits();
      const index = units.findIndex(unit => unit.id === state[side]);
      const next = Math.max(0, Math.min(units.length - 1, index + Math.sign(delta)));
      if (next !== index) selectUnit(side, units[next].id);
    }, { passive: false });
    function scheduleSelection() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // A resize or category change can realign both wheels in the same frame.
        // Retry afterwards rather than dropping the final scroll update.
        if (alignFrame) { scheduleSelection(); return; }
        if (app.dataset.page !== 'converter' || !wheels[side].clientHeight) return;
        if (wheelMotions[side]) return;
        syncWheelPresentation(side);
        selectVisibleUnit(side);
      });
    }
    wheels[side].addEventListener('scroll', scheduleSelection, { passive: true });
    wheels[side].addEventListener('scrollend', scheduleSelection, { passive: true });
    wheels[side].addEventListener('pointerdown', () => interruptWheelMotion(side), { passive: true });
    wheels[side].addEventListener('keydown', event => {
      const directions = { ArrowUp: -1, ArrowDown: 1, PageUp: -3, PageDown: 3 };
      if (!(event.key in directions)) return;
      event.preventDefault();
      const units = visibleUnits();
      const index = units.findIndex(unit => unit.id === state[side]);
      selectUnit(side, units[Math.max(0, Math.min(units.length - 1, index + directions[event.key]))].id);
    });
  }
  reconcileSelection();
  fillIcons();
  renderCategories();
  renderConverter();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(alignWheels).observe($('#wheels'));
  window.addEventListener('resize', alignWheels);
  if (desktopHost) {
    window.chrome.webview.postMessage({ type: 'metrio-ready', version: '0.5.0', page: app.dataset.page, categories: Core.categories.length, units: Core.categories.reduce((total, cat) => total + cat.units.length, 0) });
  }
  // Local development only: direct file opening has no server or network dependency.
  if (/^https?:$/.test(location.protocol) && ['localhost', '127.0.0.1'].includes(location.hostname) && typeof EventSource !== 'undefined') {
    const changes = new EventSource('/__events');
    changes.addEventListener('reload', () => location.reload());
  }
})();
