'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const stylesheet = 'src/user-styles.css';
const desktopStylesheet = 'www/' + stylesheet;
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));

function hasDevtools(root) {
  return ['style-panel.js', 'style-panel.css', 'style-schema.json'].every(file => fs.existsSync(path.join(root, 'devtools', file)));
}
function compileStyles(values, schema) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error('样式参数必须是对象。');
  const allowed = new Set(schema.map(field => field.id));
  if (Object.keys(values).some(id => !allowed.has(id))) throw new Error('包含不支持的样式参数。');
  const normalized = {};
  const rules = [];
  for (const field of schema) {
    if (!Object.hasOwn(values, field.id)) continue;
    let value = values[field.id];
    const valid = field.options ? typeof value === 'string' && Object.hasOwn(field.options, value)
      : field.type === 'color' ? typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
        : typeof value === 'number' && Number.isFinite(value) && value >= field.min && value <= field.max;
    if (!valid) throw new Error(`无效的样式参数：${field.label}`);
    if (field.type === 'color') value = value.toLowerCase();
    else if (typeof value === 'number') value = Number(value.toFixed(3));
    normalized[field.id] = value;
    rules.push(`${field.selector} { ${field.property}: ${value}${field.cssUnit || ''} !important; }`);
  }
  return { values: normalized, css: '/* Saved by Metrio. This stylesheet works without development tools. */\n'
    + `:root { --metrio-saved-styles: '${encodeURIComponent(JSON.stringify(normalized))}'; }\n` + (rules.length ? rules.join('\n') + '\n' : '') };
}

// Prepare every write before touching any target; restore earlier targets if a later replacement fails.
function replaceFiles(files) {
  const transaction = crypto.randomUUID();
  const prepared = [];
  const committed = [];
  try {
    for (const [file, data] of files) {
      const previous = fs.existsSync(file) ? fs.readFileSync(file) : null;
      const temp = file + '.' + transaction + '.tmp';
      prepared.push({ file, temp, previous });
      fs.writeFileSync(temp, data, { flag: 'wx' });
    }
    for (const entry of prepared) { fs.renameSync(entry.temp, entry.file); committed.push(entry); }
  } catch (error) {
    const failures = [];
    for (const entry of committed.reverse()) {
      try {
        if (entry.previous === null) fs.unlinkSync(entry.file);
        else { fs.writeFileSync(entry.temp, entry.previous); fs.renameSync(entry.temp, entry.file); }
      } catch { failures.push(entry.file); }
    }
    if (failures.length) throw new Error('保存未完成，部分文件无法恢复：' + failures.join('、'));
    throw error;
  } finally {
    for (const entry of prepared) { try { fs.unlinkSync(entry.temp); } catch { /* Already moved or not created. */ } }
  }
}

function saveStyles(root, values) {
  if (!hasDevtools(root)) throw new Error('样式调试工具已移除，请重新打开应用。');
  const result = compileStyles(values, readJSON(path.join(root, 'devtools/style-schema.json')));
  const bytes = Buffer.from(result.css, 'utf8');
  const writes = [[path.join(root, stylesheet), bytes]];
  const output = path.join(root, 'dist/Metrio');
  const desktopUpdated = fs.existsSync(path.join(output, 'www/index.html'));
  if (desktopUpdated) {
    if (!fs.readFileSync(path.join(output, 'www/index.html'), 'utf8').includes('src/user-styles.css')) throw new Error('请先重新构建桌面版，再保存样式。');
    const manifestPath = path.join(output, 'build-manifest.json');
    const manifest = readJSON(manifestPath);
    const entry = manifest.files?.find(item => item.path === desktopStylesheet);
    if (!entry) throw new Error('桌面版缺少样式清单，请先重新构建。');
    entry.bytes = bytes.length;
    entry.sha256 = crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase();
    writes.push([path.join(output, desktopStylesheet), bytes], [manifestPath, JSON.stringify(manifest, null, 2) + '\n']);
  }
  replaceFiles(writes);
  return { ...result, desktopUpdated };
}
module.exports = { hasDevtools, compileStyles, saveStyles };
