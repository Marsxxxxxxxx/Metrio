(function () {
  'use strict';
  if (window.MetrioStylePanel || !document.getElementById('app')) return;

  const storageKey = 'metrio.dev.styles.v1';
  const styleUrl = new URL('style-panel.css', document.currentScript?.src || new URL('devtools/style-panel.js', location.href)).href;
  let fields;
  try { fields = JSON.parse(document.getElementById('metrio-style-schema').textContent); }
  catch { return; /* The optional tools may have been removed. */ }
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
  function readApplied() {
    try {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--metrio-saved-styles').trim();
      const parsed = JSON.parse(decodeURIComponent(raw.replace(/^['"]|['"]$/g, '')));
      return Object.fromEntries(fields.map(field => [field.id, normalize(field, parsed?.[field.id])]).filter(([, value]) => value !== undefined));
    } catch { return {}; }
  }
  let appliedValues = readApplied();
  let defaults = { ...readDefaults(), ...appliedValues };
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
  let saving = false;
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
        <div class="export" hidden><label for="export-css">可独立使用的 CSS</label><textarea id="export-css" spellcheck="false" readonly></textarea><button type="button" data-command="copy">复制 CSS</button><p>供备份或分享使用。日常调整直接点“保存并应用”即可。</p></div>
      </div>
      <footer><label class="preview"><input id="preview-enabled" type="checkbox">启用样式预览</label><button type="button" data-command="save" class="save-button">保存并应用</button><div class="actions"><button type="button" data-command="reset">重置预览</button><button type="button" data-command="export">导出 CSS</button></div><p class="status" role="status" aria-live="polite">保存后普通版也会保留样式</p><p class="shortcut">Ctrl + Shift + D 收起 / 展开</p></footer>
    </section>`;
  const $ = selector => shadow.querySelector(selector);
  function announce(message) { if (!destroyed) $('.status').textContent = message; }
  function exportCSS() {
    const current = { ...appliedValues, ...values };
    const rules = fields.filter(field => Object.hasOwn(current, field.id)).map(field => `${field.selector} { ${field.property}: ${current[field.id]}${field.cssUnit || ''} !important; }`);
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
  function persist(quiet = false) {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ values, enabled, expanded, side: host.dataset.side }));
      if (!quiet) announce(enabled ? '预览草稿已记住 · 点击保存后写入程序' : '预览已暂停 · 显示程序已保存的样式');
    } catch { if (!quiet) announce('无法保存预览草稿，仍可预览并写入程序'); }
  }
  function requestSave(current) {
    const bridge = window.chrome?.webview;
    if (bridge?.postMessage && bridge.addEventListener) {
      return new Promise((resolve, reject) => {
        const requestId = crypto.randomUUID();
        const cleanup = () => { clearTimeout(timer); bridge.removeEventListener('message', receive); };
        const receive = event => {
          if (event.data?.type !== 'metrio-style-save-result' || event.data.requestId !== requestId) return;
          cleanup(); resolve(event.data);
        };
        const timer = setTimeout(() => { cleanup(); reject(new Error('未收到保存结果，请重新打开程序核对。')); }, 15000);
        bridge.addEventListener('message', receive);
        try { bridge.postMessage({ type: 'metrio-save-styles', requestId, values: current }); }
        catch (error) { cleanup(); reject(error); }
      });
    }
    return fetch('/__styles', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ values: current }), signal: AbortSignal.timeout(15000)
    }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '保存失败，请检查开发服务器。');
      return result;
    });
  }
  async function saveAndApply() {
    if (saving || destroyed) return;
    saving = true;
    shadow.querySelectorAll('[data-field], #preview-enabled, [data-command="reset"], [data-command="save"]').forEach(input => { input.disabled = true; });
    $('[data-command="save"]').textContent = '正在保存…';
    announce('正在写入程序样式…');
    try {
      const result = await requestSave({ ...appliedValues, ...values });
      if (!result.ok || typeof result.css !== 'string' || !result.values) throw new Error(result.error || '没有收到有效的保存结果。');
      const permanent = document.createElement('style');
      permanent.id = 'metrio-user-styles';
      permanent.textContent = result.css;
      const previous = document.getElementById(permanent.id);
      if (previous) previous.replaceWith(permanent); else document.head.append(permanent);
      overrides.remove();
      appliedValues = result.values;
      values = {}; enabled = true;
      defaults = { ...readDefaults(), ...appliedValues };
      persist(true);
      window.dispatchEvent(new Event('resize'));
      if (!destroyed) {
        refreshControls();
        announce(result.desktopUpdated ? '已保存并应用 · 普通桌面版重开后生效' : '已保存到项目 · 构建后桌面版也会生效');
      }
      return true;
    } catch (error) {
      announce('未完成保存：' + error.message);
      return false;
    } finally {
      saving = false;
      if (!destroyed) {
        shadow.querySelectorAll('[data-field], #preview-enabled, [data-command="reset"], [data-command="save"]').forEach(input => { input.disabled = false; });
        $('[data-command="save"]').textContent = '保存并应用';
      }
    }
  }
  function setExpanded(value) {
    expanded = value;
    $('.panel').hidden = !expanded;
    $('.launcher').hidden = expanded;
    if (expanded) $('[data-command="move"]').focus();
    else $('.launcher').focus();
    persist(true);
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
    if (!field || saving) return;
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
    if (!button || button.disabled) return;
    if (button.dataset.tab) {
      shadow.querySelectorAll('[role="tab"]').forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
      shadow.querySelectorAll('[role="tabpanel"]').forEach(panel => { panel.hidden = panel.id !== `group-${button.dataset.tab}`; });
      return;
    }
    switch (button.dataset.command) {
      case 'toggle': setExpanded(!expanded); break;
      case 'move': host.dataset.side = host.dataset.side === 'left' ? 'right' : 'left'; refreshControls(); persist(true); break;
      case 'reset':
        values = {}; enabled = true; overrides.remove(); defaults = { ...readDefaults(), ...appliedValues }; apply(); persist(true); announce('预览已重置 · 显示程序已保存的样式'); break;
      case 'save': await saveAndApply(); break;
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
    saveAndApply,
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
  if (Object.keys(values).length) announce(enabled ? '已恢复预览草稿 · 点击保存后写入程序' : '预览已暂停 · 显示程序已保存的样式');
  try { window.chrome?.webview?.postMessage({ type: 'metrio-devtools-ready' }); } catch { /* Optional host notification. */ }
})();
