(function () {
  'use strict';
  if (window.MetrioStylePanel || !document.getElementById('app')) return;

  const storageKey = 'metrio.dev.styles.v1';
  const styleUrl = new URL('style-panel.css', document.currentScript?.src || new URL('devtools/style-panel.js', location.href)).href;
  const fields = [
    { id: 'angle', group: 'wheel', label: '最大倾斜角', min: 0, max: 5, step: .25, unit: '°', fallback: 5, selector: '#app .unit-wheel', property: '--wheel-max-angle' },
    { id: 'duration', group: 'wheel', label: '过渡时长', min: 0, max: 600, step: 10, unit: 'ms', fallback: 220, selector: '#app .unit-wheel', property: '--wheel-duration' },
    { id: 'easing', group: 'wheel', label: '缓动曲线', options: { 'ease-out': '缓出 · 逐渐减速', 'ease-in-out': '缓入缓出', linear: '匀速' }, fallback: 'ease-out', selector: '#app .unit-wheel', property: '--wheel-easing' },
    { id: 'perspective', group: 'wheel', label: '透视距离', min: 200, max: 1600, step: 20, unit: 'px', fallback: 480, selector: '#app .unit-wheel', property: '--wheel-perspective' },
    { id: 'rowHeight', group: 'wheel', label: '单位行高', min: 48, max: 104, step: 2, unit: 'px', cssUnit: 'px', fallback: 72, selector: '#app .wheels, #app .unit-wheel', readSelector: '#from-wheel', property: '--row-height' },
    { id: 'fade', group: 'wheel', label: '边缘渐隐', min: 0, max: 35, step: 1, unit: '%', cssUnit: '%', fallback: 12, selector: '#app .wheel-fade', property: 'height', useFallback: true },
    { id: 'nameSize', group: 'text', label: '单位名称', min: 9, max: 20, step: 1, unit: 'px', cssUnit: 'px', fallback: 12, selector: '#app .unit-name', property: 'font-size' },
    { id: 'valueSize', group: 'text', label: '候选数字', min: 16, max: 40, step: 1, unit: 'px', cssUnit: 'px', fallback: 25, selector: '#app .unit-row .unit-value', property: 'font-size' },
    { id: 'focusSize', group: 'text', label: '高亮数字', min: 20, max: 48, step: 1, unit: 'px', cssUnit: 'px', fallback: 31, selector: '#app .unit-focus .unit-value', property: 'font-size' },
    { id: 'symbolSize', group: 'text', label: '单位符号', min: 10, max: 24, step: 1, unit: 'px', cssUnit: 'px', fallback: 15, selector: '#app .unit-symbol', property: 'font-size' },
    { id: 'padding', group: 'text', label: '文字右侧留白', min: 8, max: 48, step: 1, unit: 'px', cssUnit: 'px', fallback: 29, selector: '#app .unit-face', property: 'padding-right' },
    { id: 'accent', group: 'color', label: '主题红色', type: 'color', fallback: '#e73a32', selector: ':root', property: '--red' },
    { id: 'ink', group: 'color', label: '主要文字', type: 'color', fallback: '#303132', selector: ':root', property: '--ink' },
    { id: 'candidate', group: 'color', label: '候选单位文字', type: 'color', fallback: '#5c5e5b', selector: '#app .unit-row', property: 'color' },
    { id: 'keys', group: 'color', label: '数字键背景', type: 'color', fallback: '#e5e6e7', selector: ':root', property: '--key' }
  ];
  const byId = new Map(fields.map(field => [field.id, field]));
  function normalize(field, value) {
    if (field.options) return Object.hasOwn(field.options, value) ? value : undefined;
    if (field.type === 'color') return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value) ? value.toLowerCase() : undefined;
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') return undefined;
    const number = Number(value);
    if (!Number.isFinite(number)) return undefined;
    return Number((Math.max(field.min, Math.min(field.max, Math.round((number - field.min) / field.step) * field.step + field.min))).toFixed(3));
  }
  function readDefaults() {
    return Object.fromEntries(fields.map(field => {
      const node = document.querySelector(field.readSelector || field.selector);
      let raw = node && !field.useFallback ? getComputedStyle(node).getPropertyValue(field.property).trim() : '';
      if (field.type === 'color' && /^rgb\(/.test(raw)) {
        raw = '#' + raw.match(/\d+/g).slice(0, 3).map(value => Number(value).toString(16).padStart(2, '0')).join('');
      }
      const value = normalize(field, field.type === 'color' || field.options ? raw : parseFloat(raw));
      return [field.id, value === undefined ? field.fallback : value];
    }));
  }
  let defaults = readDefaults();
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { /* Preview also works without storage. */ }
  let values = {};
  for (const field of fields) {
    const value = normalize(field, saved.values?.[field.id]);
    if (value !== undefined) values[field.id] = value;
  }
  let enabled = saved.enabled !== false;
  let expanded = saved.expanded !== false;
  let destroyed = false;
  const host = document.createElement('div');
  host.id = 'metrio-devtools';
  host.dataset.side = saved.side === 'right' ? 'right' : 'left';
  const shadow = host.attachShadow({ mode: 'open' });
  const overrides = document.createElement('style');
  overrides.id = 'metrio-style-overrides';
  function control(field) {
    const id = `control-${field.id}`;
    if (field.options) return `<div class="field"><label for="${id}">${field.label}</label><select id="${id}" data-field="${field.id}">${Object.entries(field.options).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}</select></div>`;
    if (field.type === 'color') return `<div class="color-field"><label for="${id}">${field.label}</label><output data-color="${field.id}"></output><input id="${id}" data-field="${field.id}" type="color"></div>`;
    return `<div class="field"><div class="field-heading"><label for="${id}">${field.label}</label><span class="number"><input id="${id}" data-field="${field.id}" type="number" min="${field.min}" max="${field.max}" step="${field.step}"><span>${field.unit}</span></span></div><input class="slider" type="range" data-field="${field.id}" aria-label="${field.label}滑块" min="${field.min}" max="${field.max}" step="${field.step}"></div>`;
  }
  shadow.innerHTML = `<link rel="stylesheet" href="${styleUrl}">
    <button class="launcher" type="button" data-command="toggle" aria-label="展开样式调试" hidden><span>⌘</span> 样式调试</button>
    <section class="panel" role="region" aria-label="样式调试">
      <header><div><span class="eyebrow">METRIO / DEV</span><h2>样式调试</h2></div><div class="header-actions"><button type="button" class="icon-button" data-command="move" aria-label="移到右侧" title="切换停靠位置">⇄</button><button type="button" class="icon-button" data-command="toggle" aria-label="收起样式调试" title="收起">×</button></div></header>
      <div class="tabs" role="tablist" aria-label="样式分类">${[['wheel', '滚轮与动画'], ['text', '文字'], ['color', '配色']].map(([id, label], index) => `<button type="button" role="tab" id="tab-${id}" data-tab="${id}" aria-selected="${index === 0}" aria-controls="group-${id}">${label}</button>`).join('')}</div>
      <div class="content">${['wheel', 'text', 'color'].map((id, index) => `<div id="group-${id}" role="tabpanel" aria-labelledby="tab-${id}" ${index ? 'hidden' : ''}>${fields.filter(field => field.group === id).map(control).join('')}</div>`).join('')}
        <div class="export" hidden><label for="export-css">可独立使用的 CSS</label><textarea id="export-css" spellcheck="false" readonly></textarea><button type="button" data-command="copy">复制 CSS</button><p>追加到 src/styles.css 后，普通版也会采用这些样式。</p></div>
      </div>
      <footer><label class="preview"><input id="preview-enabled" type="checkbox">启用样式预览</label><div class="actions"><button type="button" data-command="reset">恢复默认</button><button type="button" data-command="export" class="primary">导出 CSS</button></div><p class="status" role="status" aria-live="polite">仅用于开发 · 本机自动保存</p><p class="shortcut">Ctrl + Shift + D 收起 / 展开</p></footer>
    </section>`;
  const $ = selector => shadow.querySelector(selector);
  function announce(message) { if (!destroyed) $('.status').textContent = message; }
  function exportCSS() {
    const rules = fields.filter(field => Object.hasOwn(values, field.id)).map(field => `${field.selector} { ${field.property}: ${values[field.id]}${field.cssUnit || ''} !important; }`);
    return '/* Metrio style overrides. No development tools required. */\n' + (rules.length ? rules.join('\n') : '/* No overrides: application defaults are in use. */') + '\n';
  }
  function refreshControls(editingInput) {
    shadow.querySelectorAll('[data-field]').forEach(input => { if (input !== editingInput) input.value = values[input.dataset.field] ?? defaults[input.dataset.field]; });
    shadow.querySelectorAll('[data-color]').forEach(output => { output.textContent = values[output.dataset.color] ?? defaults[output.dataset.color]; });
    $('#preview-enabled').checked = enabled;
    $('[data-command="move"]').setAttribute('aria-label', host.dataset.side === 'left' ? '移到右侧' : '移到左侧');
    $('#export-css').value = exportCSS();
  }
  function apply(editingInput) {
    if (enabled && Object.keys(values).length) {
      overrides.textContent = exportCSS();
      if (!overrides.isConnected) document.head.append(overrides);
    } else overrides.remove();
    // The converter already realigns safely on resize; no debug API is required in the app.
    window.dispatchEvent(new Event('resize'));
    refreshControls(editingInput);
  }
  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ values, enabled, expanded, side: host.dataset.side }));
      announce(enabled ? '已保存到本机 · 实时预览中' : '预览已暂停 · 当前为应用默认样式');
    } catch { announce('当前环境无法保存，仍可实时预览和导出'); }
  }
  function setExpanded(value) {
    expanded = value;
    $('.panel').hidden = !expanded;
    $('.launcher').hidden = expanded;
    if (expanded) $('[data-command="move"]').focus();
    else $('.launcher').focus();
    persist();
  }
  function shortcut(event) {
    if (event.ctrlKey && event.shiftKey && !event.altKey && event.key.toLowerCase() === 'd') {
      event.preventDefault(); event.stopImmediatePropagation(); setExpanded(!expanded);
    }
  }
  shadow.addEventListener('keydown', event => {
    // Editing a slider or export text must never type into or clear the calculator.
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); setExpanded(false); }
    const tab = event.target.closest('[role="tab"]');
    if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const tabs = [...shadow.querySelectorAll('[role="tab"]')];
      const index = tabs.indexOf(tab);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click(); tabs[next].focus();
    }
  });
  function onInput(event) {
    const input = event.target;
    const field = byId.get(input.dataset.field);
    if (!field) return;
    const typingNumber = input.type === 'number' && event.type === 'input';
    if (typingNumber && (input.value === '' || Number(input.value) < field.min || Number(input.value) > field.max)) return;
    const value = normalize(field, input.value);
    if (value === undefined) { if (event.type === 'change') refreshControls(); return; }
    values[field.id] = value;
    apply(typingNumber ? input : undefined); persist();
  }
  shadow.addEventListener('input', onInput);
  shadow.addEventListener('change', event => {
    if (event.target.id === 'preview-enabled') { enabled = event.target.checked; apply(); persist(); }
    else onInput(event);
  });
  shadow.addEventListener('click', async event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.tab) {
      shadow.querySelectorAll('[role="tab"]').forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
      shadow.querySelectorAll('[role="tabpanel"]').forEach(panel => { panel.hidden = panel.id !== `group-${button.dataset.tab}`; });
      return;
    }
    switch (button.dataset.command) {
      case 'toggle': setExpanded(!expanded); break;
      case 'move': host.dataset.side = host.dataset.side === 'left' ? 'right' : 'left'; refreshControls(); persist(); break;
      case 'reset':
        values = {}; enabled = true; overrides.remove(); defaults = readDefaults(); apply(); persist(); announce('已恢复默认 · 换算、收藏和历史不变'); break;
      case 'export': $('.export').hidden = !$('.export').hidden; if (!$('.export').hidden) { $('#export-css').value = exportCSS(); $('#export-css').focus(); $('#export-css').select(); } break;
      case 'copy':
        try { await navigator.clipboard.writeText(exportCSS()); announce('CSS 已复制，可脱离调试面板使用'); }
        catch { $('#export-css').focus(); $('#export-css').select(); announce('请按 Ctrl+C 复制已选中的 CSS'); }
        break;
    }
  });
  document.body.append(host);
  shadow.querySelectorAll('[role="tab"]').forEach(tab => { tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1; });
  window.addEventListener('keydown', shortcut, true);
  const api = {
    show: () => setExpanded(true),
    hide: () => setExpanded(false),
    exportCSS,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      window.removeEventListener('keydown', shortcut, true);
      overrides.remove(); host.remove();
      if (window.MetrioStylePanel === api) delete window.MetrioStylePanel;
      window.dispatchEvent(new Event('resize'));
    }
  };
  window.MetrioStylePanel = api;
  $('.panel').hidden = !expanded;
  $('.launcher').hidden = expanded;
  apply();
  try { window.chrome?.webview?.postMessage({ type: 'metrio-devtools-ready' }); } catch { /* Optional host notification. */ }
})();
