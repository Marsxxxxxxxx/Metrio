const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { compileStyles, saveStyles } = require('../scripts/style-store.cjs');
const schemaPath = path.resolve(__dirname, '../devtools/style-schema.json');
const optional = { skip: !fs.existsSync(schemaPath) };
const read = file => fs.readFileSync(file, 'utf8');
function fixture(t) {
  const parent = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(parent, 'metrio-style-test-'));
  t.after(() => {
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), parent); assert.ok(path.basename(resolved).startsWith('metrio-style-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  for (const dir of ['devtools', 'src', 'dist/Metrio/www/src']) fs.mkdirSync(path.join(root, dir), { recursive: true });
  fs.copyFileSync(schemaPath, path.join(root, 'devtools/style-schema.json'));
  for (const file of ['style-panel.js', 'style-panel.css']) fs.writeFileSync(path.join(root, 'devtools', file), '');
  fs.writeFileSync(path.join(root, 'dist/Metrio/www/index.html'), '<link href="src/user-styles.css">');
  const source = path.join(root, 'src/user-styles.css');
  const desktop = path.join(root, 'dist/Metrio/www/src/user-styles.css');
  const manifest = path.join(root, 'dist/Metrio/build-manifest.json');
  fs.writeFileSync(source, '/* initial source */'); fs.writeFileSync(desktop, '/* initial desktop */');
  fs.writeFileSync(manifest, JSON.stringify({ version: 'fixture', files: [{ path: 'www/src/user-styles.css', bytes: 0, sha256: '' }] }));
  return { root, source, desktop, manifest };
}
function verifySaved(files, result) {
  assert.equal(read(files.source), result.css); assert.equal(read(files.desktop), result.css);
  const entry = JSON.parse(read(files.manifest)).files[0];
  assert.equal(entry.bytes, Buffer.byteLength(result.css));
  assert.equal(entry.sha256, crypto.createHash('sha256').update(result.css).digest('hex').toUpperCase());
}

test('Saving writes standalone source and desktop CSS and updates the desktop integrity manifest', optional, t => {
  const files = fixture(t);
  const result = saveStyles(files.root, { angle: 90, rowHeight: 240, duration: 3000, accent: '#CC2233', easing: 'linear' });
  verifySaved(files, result);
  assert.equal(result.desktopUpdated, true);
  assert.equal(result.values.accent, '#cc2233');
  assert.match(result.css, /--metrio-saved-styles:/);
  assert.match(result.css, /--wheel-max-angle: 90 !important/);
});

test('Invalid or arbitrary CSS/path input is rejected without changing any file', optional, t => {
  const files = fixture(t);
  const before = [files.source, files.desktop, files.manifest].map(read);
  for (const values of [null, [], { angle: 91 }, { angle: -1 }, { angle: '90' }, { angle: NaN }, { angle: Infinity }, { duration: 3001 }, { accent: '#fff' }, { accent: 'red;display:none' }, { easing: '__proto__' }, { path: '../index.html' }]) {
    assert.throws(() => saveStyles(files.root, values));
    assert.deepEqual([files.source, files.desktop, files.manifest].map(read), before);
  }
});

test('A late file replacement failure rolls back both copies and cleans temporary files', optional, t => {
  const files = fixture(t);
  const before = [files.source, files.desktop, files.manifest].map(read);
  const rename = fs.renameSync;
  fs.renameSync = (from, to) => { if (to === files.manifest) throw new Error('fixture: locked manifest'); return rename(from, to); };
  try { assert.throws(() => saveStyles(files.root, { angle: 45 }), /locked manifest/); }
  finally { fs.renameSync = rename; }
  assert.deepEqual([files.source, files.desktop, files.manifest].map(read), before);
  assert.ok(fs.readdirSync(files.root, { recursive: true }).every(file => !file.endsWith('.tmp')));
});

test('A source-only project can save, while an outdated desktop build fails before changing the source', optional, t => {
  const files = fixture(t);
  const index = path.join(files.root, 'dist/Metrio/www/index.html');
  fs.writeFileSync(index, 'old desktop');
  assert.throws(() => saveStyles(files.root, { angle: 20 }), /重新构建/);
  assert.equal(read(files.source), '/* initial source */');
  fs.unlinkSync(index);
  assert.equal(saveStyles(files.root, { angle: 20 }).desktopUpdated, false);
  assert.match(read(files.source), /--wheel-max-angle: 20/);
});

test('Windows native store matches web saving and rolls back when the manifest is locked', { ...optional, skip: optional.skip || process.platform !== 'win32', timeout: 30000 }, t => {
  const files = fixture(t);
  const harness = path.join(files.root, 'StoreTest.cs');
  const exe = path.join(files.root, 'StoreTest.exe');
  fs.writeFileSync(harness, `using System; using System.IO; using System.Collections.Generic; using System.Web.Script.Serialization;
namespace MetrioDesktop { class StoreTest { static int Main(string[] args) {
try { var json = new JavaScriptSerializer(); var values = json.Deserialize<Dictionary<string, object>>(File.ReadAllText(args[1]));
if (args.Length > 2) { using(var locked = new FileStream(Path.Combine(args[0], "dist", "Metrio", "build-manifest.json"), FileMode.Open, FileAccess.Read, FileShare.Read)) StyleSettingsStore.Save(args[0], values); }
else Console.Write(json.Serialize(StyleSettingsStore.Save(args[0], values))); return 0;
} catch(Exception error) { Console.Error.Write(error.Message); return 1; } } } }`);
  const compiler = path.join(process.env.WINDIR, 'Microsoft.NET/Framework64/v4.0.30319/csc.exe');
  const build = spawnSync(compiler, ['/nologo', '/langversion:5', '/codepage:65001', '/reference:System.Web.Extensions.dll', '/out:' + exe, path.resolve(__dirname, '../desktop/StyleSettingsStore.cs'), harness], { encoding: 'utf8', windowsHide: true });
  assert.equal(build.status, 0, build.stdout + build.stderr);
  const input = path.join(files.root, 'input.json');
  const values = { angle: 89.75, rowHeight: 148, duration: 2700, perspective: 80, fade: 30, focusSize: 90, accent: '#AB1234', easing: 'ease-in-out' };
  fs.writeFileSync(input, JSON.stringify(values));
  const run = (...args) => spawnSync(exe, [files.root, input, ...args], { encoding: 'utf8', windowsHide: true });
  const success = run(); assert.equal(success.status, 0, success.stderr);
  const result = JSON.parse(success.stdout); verifySaved(files, result);
  assert.equal(result.css, compileStyles(values, JSON.parse(read(schemaPath))).css);
  const before = [files.source, files.desktop, files.manifest].map(read);
  fs.writeFileSync(input, JSON.stringify({ angle: 50 }));
  assert.equal(run('lock').status, 1);
  assert.deepEqual([files.source, files.desktop, files.manifest].map(read), before);
  for (const invalid of [{ angle: 91 }, { angle: '90' }, { angle: true }, { path: '../escape' }, { easing: '__proto__' }, { accent: 'red' }]) {
    fs.writeFileSync(input, JSON.stringify(invalid)); assert.equal(run().status, 1);
    assert.deepEqual([files.source, files.desktop, files.manifest].map(read), before);
  }
  assert.ok(fs.readdirSync(files.root, { recursive: true }).every(file => !file.endsWith('.tmp')));
});
