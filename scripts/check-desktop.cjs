const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist', 'Metrio');
const manifest = JSON.parse(fs.readFileSync(path.join(output, 'build-manifest.json'), 'utf8').replace(/^\uFEFF/, ''));
const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
assert.equal(manifest.version, version);
for (const file of manifest.files) {
  const fullPath = path.resolve(output, file.path);
  assert.ok(fullPath.startsWith(output + path.sep));
  const data = fs.readFileSync(fullPath);
  assert.equal(data.length, file.bytes, file.path);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex').toUpperCase(), file.sha256, file.path);
}
for (const file of ['index.html', 'src/app.js', 'src/engine.js', 'src/styles.css', 'assets/icon.svg']) {
  assert.ok(fs.readFileSync(path.join(root, file)).equals(fs.readFileSync(path.join(output, 'www', file))), `Stale packaged asset: ${file}`);
}
for (const file of ['USAGE.txt', 'Metrio Compatibility.cmd']) {
  assert.ok(fs.readFileSync(path.join(root, 'desktop', file)).equals(fs.readFileSync(path.join(output, file))), `Stale desktop file: ${file}`);
}
for (const file of ['Metrio.exe', 'WebView2Loader.dll']) {
  const data = fs.readFileSync(path.join(output, file));
  assert.equal(data.subarray(0, 2).toString(), 'MZ');
  const pe = data.readUInt32LE(0x3c);
  assert.equal(data.readUInt32LE(pe), 0x00004550);
  assert.equal(data.readUInt16LE(pe + 4), 0x8664, `${file} should be x64`);
}
assert.ok(fs.existsSync(path.join(output, 'licenses', 'Microsoft.Web.WebView2-LICENSE.txt')));
console.log(`Metrio ${version}: ${manifest.files.length} packaged files verified; x64 executable and native loader verified; web assets match source.`);
