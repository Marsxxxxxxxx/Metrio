const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { once } = require('node:events');

test('Development entry can hide the panel or lose its entire directory without changing the app entry', { timeout: 15000 }, async t => {
  const tempParent = fs.realpathSync(os.tmpdir());
  const root = fs.mkdtempSync(path.join(tempParent, 'metrio-dev-server-test-'));
  let child;
  t.after(async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      const ended = once(child, 'exit'); child.kill(); await ended;
    }
    const resolved = fs.realpathSync(root);
    assert.equal(path.dirname(resolved), tempParent);
    assert.ok(path.basename(resolved).startsWith('metrio-dev-server-test-'));
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.mkdirSync(path.join(root, 'devtools'));
  fs.copyFileSync(path.resolve(__dirname, '../scripts/dev-server.cjs'), path.join(root, 'scripts/dev-server.cjs'));
  const html = '<!doctype html><html><head><title>Metrio test</title></head><body>Converter remains available</body></html>';
  fs.writeFileSync(path.join(root, 'index.html'), html);
  fs.writeFileSync(path.join(root, 'devtools/style-panel.js'), '/* optional panel fixture */');
  fs.writeFileSync(path.join(root, 'devtools/style-panel.css'), '/* optional styles fixture */');
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1'); await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  child = spawn(process.execPath, [path.join(root, 'scripts/dev-server.cjs'), String(port)], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: String(port) } });
  await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Development server did not start')), 7000);
    const finish = error => { clearTimeout(timer); child.stdout.removeListener('data', onData); child.removeListener('error', onError); child.removeListener('exit', onExit); error ? reject(error) : resolve(); };
    const onData = chunk => { output += chunk; if (output.includes('Local:')) finish(); };
    const onError = error => finish(error);
    const onExit = code => finish(new Error(`Development server exited: ${code}`));
    child.stdout.on('data', onData); child.once('error', onError); child.once('exit', onExit);
  });
  const base = `http://127.0.0.1:${port}`;
  assert.match(await (await fetch(base)).text(), /<script defer src="devtools\/style-panel.js"><\/script>/);
  assert.equal(await (await fetch(base + '/?debug=0')).text(), html);
  assert.equal((await fetch(base + '/devtools/style-panel.js')).status, 200);
  fs.unlinkSync(path.join(root, 'devtools/style-panel.js'));
  fs.unlinkSync(path.join(root, 'devtools/style-panel.css'));
  fs.rmdirSync(path.join(root, 'devtools'));
  assert.equal(await (await fetch(base)).text(), html, 'Deleting the optional directory must leave the app entry usable');
  assert.equal((await fetch(base + '/devtools/style-panel.js')).status, 404);
  assert.equal(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), html, 'Injection must never rewrite the source entry');
  assert.equal((await fetch(base + '/desktop/Program.cs')).status, 404, 'The server must retain its static-file allowlist');
});
