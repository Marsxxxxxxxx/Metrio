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
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
    history: '<path d="M3 11a9 9 0 1 1 2 7M3 5v6h6m3-5v6l4 2"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="white"/><circle cx="15" cy="17" r="3" fill="white"/>',
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
  const state = {
    category: initial.category, from: initial.from, to: initial.to,
    expression: typeof initial.expression === 'string' && initial.expression.length <= 160 ? initial.expression : '1',
    precision: ['auto', '2', '4', '6', '8'].includes(saved.precision) ? saved.precision : 'auto',
    grouping: saved.grouping !== false,
    favorites: Array.isArray(saved.favorites) ? saved.favorites.filter(validPair).slice(0, 100) : [],
    history: Array.isArray(saved.history) ? saved.history.filter(item => validPair(item) && typeof item.expression === 'string' && item.expression.length <= 160 && Number.isFinite(item.time)).slice(0, 30) : [],
    tab: 'all', search: '', fresh: true, mode: 'desktop'
  };
  let toastTimer;
  let announceTimer;
  let alignFrame;
  let storageWarned = false;
  let result = { input: 1, value: 1, error: '' };
  const app = $('#app');
  const expression = $('#expression');
  const wheels = { from: $('#from-wheel'), to: $('#to-wheel') };
  const focusedUnits = { from: $('#from-focus'), to: $('#to-focus') };
  function setText(node, text) { if (node.textContent !== text) node.textContent = text; }
  function save() {
    const { category, from, to, expression, precision, grouping, favorites, history } = state;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ category, from, to, expression, precision, grouping, favorites, history })); }
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
    const cat = currentCategory();
    try {
      result = { input: evaluatePreview(), error: '' };
      result.value = Core.convert(result.input, state.category, state.from, state.to);
    } catch (error) { result = { input: null, value: null, error: error.message }; }
    for (const side of ['from', 'to']) {
      wheels[side].querySelectorAll('.unit-row').forEach((node, index) => {
        const unit = cat.units[index];
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
      });
      const unit = currentUnit(side);
      const number = result.error ? '—' : format(side === 'from' ? result.input : result.value);
      const focus = focusedUnits[side];
      setText(focus.querySelector('.unit-name'), unit.name);
      setText(focus.querySelector('.unit-number'), number);
      setText(focus.querySelector('.unit-symbol'), unit.symbol);
      focus.classList.toggle('long-value', number.length + unit.symbol.length > 14);
    }
    const rate = $('#rate-label');
    rate.classList.toggle('error', Boolean(result.error));
    if (result.error) rate.textContent = result.error;
    else if (state.category === 'temperature') {
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
  function categoryButton(cat, unit) {
    const selected = cat.id === state.category && (!unit || state.from === unit.id);
    return `<button type="button" class="category-item ${selected ? 'selected' : ''}" data-category="${cat.id}" ${unit ? `data-unit="${unit.id}"` : ''} ${selected ? 'aria-current="true"' : ''}>${icon(cat.icon)}<span class="category-copy"><strong>${unit ? escapeHTML(unit.name) : cat.name}</strong><small>${unit ? `${cat.name} · ${escapeHTML(unit.symbol)}` : cat.english}</small></span><span class="category-meta">${unit ? '↗' : String(cat.units.length).padStart(2, '0')}</span></button>`;
  }
  function renderCategories() {
    $('#category-count').textContent = Core.categories.length;
    $('#favorite-count').textContent = state.favorites.length || '';
    document.querySelectorAll('[data-tab]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.tab === state.tab)));
    let html = '';
    const query = state.search.trim().toLowerCase();
    if (state.tab === 'favorites' && !query) {
      html = state.favorites.map((pair, index) => {
        const cat = Core.getCategory(pair.category);
        const from = cat.units.find(unit => unit.id === pair.from);
        const to = cat.units.find(unit => unit.id === pair.to);
        return `<button class="category-item ${pairKey(pair) === pairKey(state) ? 'selected' : ''}" data-favorite-index="${index}">${icon(cat.icon)}<span class="category-copy"><strong>${escapeHTML(from.symbol)} → ${escapeHTML(to.symbol)}</strong><small>${cat.name} · ${escapeHTML(from.name)} / ${escapeHTML(to.name)}</small></span></button>`;
      }).join('');
      if (!html) html = `<div class="empty-state">${icon('star')}常用的换算，留在这里。<br>点击键盘上的星标即可收藏。</div>`;
    } else if (query) {
      for (const cat of Core.categories) {
        if (`${cat.name} ${cat.english}`.toLowerCase().includes(query)) html += categoryButton(cat);
        else html += cat.units.filter(unit => `${unit.name} ${unit.symbol} ${unit.aliases}`.toLowerCase().includes(query)).map(unit => categoryButton(cat, unit)).join('');
      }
      if (!html) html = `<div class="empty-state">${icon('search')}没有找到匹配的单位<br>试试「长度」「英寸」或「km」。</div>`;
    } else html = Core.categories.map(cat => categoryButton(cat)).join('');
    $('#category-list').innerHTML = html;
  }
  function alignWheels() {
    cancelAnimationFrame(alignFrame);
    alignFrame = requestAnimationFrame(() => {
      const cat = currentCategory();
      for (const side of ['from', 'to']) {
        const wheel = wheels[side];
        if (!wheel.clientHeight) continue;
        const rowHeight = parseFloat(getComputedStyle(wheel).getPropertyValue('--row-height')) || 72;
        const padding = Math.max(0, (wheel.clientHeight - rowHeight) / 2);
        wheel.style.paddingBlock = `${padding}px`;
        wheel.style.scrollPaddingBlock = `${padding}px`;
        wheel.scrollTop = cat.units.findIndex(unit => unit.id === state[side]) * rowHeight;
      }
      alignFrame = 0;
    });
  }
  function renderConverter() {
    const cat = currentCategory();
    $('#category-title').textContent = cat.name;
    $('#category-english').textContent = cat.english;
    $('#current-icon').innerHTML = icon(cat.icon);
    for (const side of ['from', 'to']) {
      wheels[side].innerHTML = cat.units.map(unit => `<button type="button" class="unit-row" data-side="${side}" data-unit="${unit.id}" aria-label="${side === 'from' ? '输入' : '输出'}单位：${escapeHTML(unit.name)} ${escapeHTML(unit.symbol)}" aria-pressed="false" tabindex="-1"><span class="unit-name">${escapeHTML(unit.name)}</span><span class="unit-value"><span class="unit-number ${side === 'from' ? 'from-number' : ''}"></span><span class="unit-symbol">${escapeHTML(unit.symbol)}</span></span></button>`).join('');
    }
    updateResult();
    alignWheels();
  }
  function chooseCategory(categoryId, fromId, toId) {
    const cat = Core.getCategory(categoryId);
    state.category = cat.id;
    state.from = fromId || cat.defaults[0];
    state.to = toId || cat.defaults[1];
    if (state.from === state.to && !toId) state.to = cat.units.find(unit => unit.id !== state.from).id;
    state.fresh = true;
    app.dataset.page = 'converter';
    renderCategories();
    renderConverter();
  }
  function selectUnit(side, unitId, reposition = true) {
    if (!currentCategory().units.some(unit => unit.id === unitId)) return;
    state[side] = unitId;
    updateResult();
    if (reposition) alignWheels();
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
  function showModal(title, html) {
    $('#modal-title').textContent = title;
    $('#modal-content').innerHTML = html;
    if (!$('#modal').open) $('#modal').showModal();
  }
  function showSettings() {
    showModal('设置', `<label class="setting-row"><span>显示精度<small>仅影响显示，不影响内部计算</small></span><select id="precision-setting" aria-label="显示精度">${[['auto', '自动'], ['2', '最多 2 位小数'], ['4', '最多 4 位小数'], ['6', '最多 6 位小数'], ['8', '最多 8 位小数']].map(([value, label]) => `<option value="${value}" ${state.precision === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label class="setting-row"><span>千位分隔符<small>例如 12,345.67</small></span><input id="grouping-setting" type="checkbox" ${state.grouping ? 'checked' : ''} aria-label="千位分隔符"></label><p class="modal-note">红白配色 · 所有换算在本机完成。<br>支持键盘数字、+ − × ÷、括号和 Enter。<br>Esc 清空输入，Ctrl + K 搜索单位。<br>输入框外按 F 收藏，按 S 交换单位。</p><p class="modal-note">${escapeHTML(currentCategory().note || '单位采用固定定义，换算结果以显示精度为准。')}</p>`);
  }
  function showHistory() {
    const items = state.history.map((entry, index) => {
      const cat = Core.getCategory(entry.category);
      try {
        const input = Core.evaluate(entry.expression);
        const output = Core.convert(input, entry.category, entry.from, entry.to);
        const from = cat.units.find(unit => unit.id === entry.from);
        const to = cat.units.find(unit => unit.id === entry.to);
        return `<button class="history-item" data-history-index="${index}"><span>${format(input)} ${escapeHTML(from.symbol)} <span style="color:var(--red)">→</span> ${format(output)} ${escapeHTML(to.symbol)}</span><small>${cat.name} · ${new Date(entry.time).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</small></button>`;
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
      case 'open-categories': app.dataset.page = 'categories'; break;
      case 'close-categories': app.dataset.page = 'converter'; alignWheels(); break;
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
      case 'history': showHistory(); break;
      case 'close-modal': $('#modal').close(); break;
      case 'about':
        showModal('关于 Metrio · 度衡', `<div class="about-logo"><img src="assets/icon.svg" alt=""><div><strong>Metrio</strong><small>度衡 · Unit Converter · v0.2.3</small></div></div><div class="about-copy"><p>度衡（Metrio）是一个参考经典 VERT 界面的个人换算工具。保留红白界面、双列滚动与折角选中条，让熟悉的换算回到手边。</p><p>当前支持 ${Core.categories.length} 个分类、${Core.categories.reduce((total, cat) => total + cat.units.length, 0)} 个单位。所有换算在本机完成。</p><p>原设计：Andrej Mihelic<br><a href="https://dribbble.com/shots/1707405-Vert-Unit-and-Currency-Converter" target="_blank" rel="noopener noreferrer">查看原设计 ↗</a></p><p class="modal-note">个人重实现，与原作者无关联。<br>本版尚未加入汇率、衣物尺码和配料重量换算。</p></div>`);
        break;
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const data = button.dataset;
    if (data.action) performAction(data.action);
    else if (data.key) appendKey(data.key);
    else if (data.category) chooseCategory(data.category, data.unit);
    else if (data.side) selectUnit(data.side, data.unit);
    else if (data.tab) { state.tab = data.tab; state.search = ''; $('#category-search').value = ''; renderCategories(); }
    else if (data.favoriteIndex !== undefined) {
      const pair = state.favorites[Number(data.favoriteIndex)];
      if (pair) chooseCategory(pair.category, pair.from, pair.to);
    } else if (data.historyIndex !== undefined) {
      const entry = state.history[Number(data.historyIndex)];
      if (entry) { state.expression = entry.expression; chooseCategory(entry.category, entry.from, entry.to); $('#modal').close(); }
    } else if (data.mode) {
      state.mode = data.mode;
      app.classList.toggle('phone', data.mode === 'phone');
      app.dataset.page = 'converter';
      document.querySelectorAll('[data-mode]').forEach(node => { node.classList.toggle('active', node === button); node.setAttribute('aria-pressed', String(node === button)); });
      alignWheels();
    }
  });
  $('#category-search').addEventListener('input', event => { state.search = event.target.value; renderCategories(); });
  expression.addEventListener('input', () => {
    const selection = expression.selectionStart;
    state.expression = expression.value;
    state.fresh = false;
    updateResult();
    expression.setSelectionRange(selection, selection);
  });
  expression.addEventListener('focus', () => { state.fresh = false; });
  document.addEventListener('change', event => {
    if (event.target.id === 'precision-setting') { state.precision = event.target.value; updateResult(); }
    if (event.target.id === 'grouping-setting') { state.grouping = event.target.checked; updateResult(); }
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !$('#modal').open) {
      event.preventDefault();
      app.dataset.page = 'categories';
      $('#category-search').focus();
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if ($('#modal').open) return;
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
          return;
        }
      }
      // OS scrolling preferences express a detent as pixels, lines or pages;
      // that distance must not skip items in a discrete unit selector.
      event.preventDefault();
      const units = currentCategory().units;
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
        if (!wheels[side].clientHeight) return;
        const rowHeight = parseFloat(getComputedStyle(wheels[side]).getPropertyValue('--row-height')) || 72;
        const unit = currentCategory().units[Math.max(0, Math.min(currentCategory().units.length - 1, Math.round(wheels[side].scrollTop / rowHeight)))];
        if (unit && unit.id !== state[side]) selectUnit(side, unit.id, false);
      });
    }
    wheels[side].addEventListener('scroll', scheduleSelection, { passive: true });
    wheels[side].addEventListener('scrollend', scheduleSelection, { passive: true });
    wheels[side].addEventListener('keydown', event => {
      const directions = { ArrowUp: -1, ArrowDown: 1, PageUp: -3, PageDown: 3 };
      if (!(event.key in directions)) return;
      event.preventDefault();
      const units = currentCategory().units;
      const index = units.findIndex(unit => unit.id === state[side]);
      selectUnit(side, units[Math.max(0, Math.min(units.length - 1, index + directions[event.key]))].id);
    });
  }
  fillIcons();
  renderCategories();
  renderConverter();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(alignWheels).observe($('#wheels'));
  window.addEventListener('resize', alignWheels);
  if (desktopHost) {
    window.chrome.webview.postMessage({ type: 'metrio-ready', version: '0.2.3', categories: Core.categories.length, units: Core.categories.reduce((total, cat) => total + cat.units.length, 0) });
  }
  // Local development only: direct file opening has no server or network dependency.
  if (/^https?:$/.test(location.protocol) && ['localhost', '127.0.0.1'].includes(location.hostname) && typeof EventSource !== 'undefined') {
    const changes = new EventSource('/__events');
    changes.addEventListener('reload', () => location.reload());
  }
})();
