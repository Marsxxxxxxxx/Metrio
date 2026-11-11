# Metrio 开发说明

以下命令均在项目根目录执行。本机工作目录为 `D:\WorkFlow\Projects\Metrio`；其他位置的副本按各自路径操作。

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `index.html` | 分类首页与换算界面的结构、应用入口 |
| `src/styles.css` | 红白配色、排版、滚轮与响应式布局 |
| `src/user-styles.css` | 已保存并应用的独立样式覆盖 |
| `src/app.js` | 分区菜单、滚动、输入、收藏、记录与单位开关 |
| `src/engine.js` | 单位定义、换算引擎、算式解析与数值格式化 |
| `assets/` | SVG 图标与 Windows 图标 |
| `devtools/` | 可独立隐藏或移除的样式调试面板 |
| `scripts/dev-server.cjs` | 零依赖的本地开发服务器 |
| `scripts/style-store.cjs` | 浏览器开发入口的样式保存与校验 |
| `desktop/` | Windows 原生窗口、DPI 配置、样式保存实现与便携版说明 |
| `scripts/build-desktop.ps1` | Windows 编译、打包与完整性清单生成 |
| `scripts/check-desktop.cjs` | 桌面包哈希、资源一致性与 x64 架构检查 |
| `tests/` | 换算、界面、滚动、样式保存和本地资源测试 |

## 调试 Windows 界面

双击 `调试桌面版 Metrio.cmd`。此模式直接读取项目中的 `index.html`、`src/` 和 `assets/`，修改并保存界面文件后自动刷新，无需重新编译窗口程序。存在 `devtools/` 时自动挂载独立样式面板，其文件修改也会触发刷新。

| 操作 | 功能 |
| --- | --- |
| `F12` | 打开 WebView2 开发工具 |
| `Ctrl+R` | 刷新界面 |
| `Ctrl+Shift+D` | 收起或展开样式面板 |
| 面板内的 `Esc` | 仅收起面板，不清空算式 |
| 顶部“手机” | 在 Windows 窗口中预览手机宽度 |

样式调整即时预览，草稿与换算数据分开保存。点击“保存并应用”写入 `src/user-styles.css`，并同步本地桌面运行目录；普通入口重开后生效，隐藏或删除调试面板也会保留。暂停或重置预览会回到已保存的样式。

普通桌面入口不加载面板。需要永久移除时，可删除 `devtools/` 并重新打开程序。参数范围、保存机制与移除方式见[样式调试面板](../devtools/README.md)。

## 浏览器开发预览

双击 `调试 Metrio.cmd`，在浏览器打开终端打印的地址。启动文件会查找已安装的 Node.js，也支持当前机器上的 Codex 捆绑 Node.js。

也可直接执行：

```powershell
node scripts/dev-server.cjs
```

默认地址为 `http://127.0.0.1:4173`，仅监听本机回环地址。修改 HTML、CSS 或 JavaScript 后自动刷新，使用 `Ctrl+C` 停止。端口被占用时可指定另一个端口：

```powershell
node scripts/dev-server.cjs 4174
```

地址加 `?debug=0` 可完全停用样式面板。直接打开 `index.html` 不经过开发服务器，不提供文件变更自动刷新。

## 构建 Windows 便携版

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-desktop.ps1
node scripts/check-desktop.cjs
```

构建输出为 `dist/Metrio/` 与 `dist/Metrio-<版本号>-windows-x64.zip`。只更新运行目录、不生成 ZIP 时，可给构建脚本传入 `-NoArchive`。

构建使用 Windows 的 .NET Framework C# 编译器，无需完整 .NET SDK。首次构建从 NuGet 下载固定版本的 Microsoft WebView2 SDK 并核对 SHA-256，后续使用 `.local/webview2/` 缓存。`desktop/Program.cs` 实现原生窗口，`desktop/App.config` 配置 DPI。

普通便携版按白名单复制运行文件，不包含样式调试菜单。`src/user-styles.css` 会随程序打包；生成后的 ZIP 是当次构建的快照，保存新样式后需重新构建 ZIP。

应用版本同时出现在项目清单、界面、Windows 程序元数据和构建脚本中；发布前应保持一致，并确认程序包资源与源文件相符。

## 测试与检查

正常使用和本地开发服务器不需要安装 Node.js 依赖。完整测试中的 DOM 集成测试使用开发依赖 `happy-dom`，新环境先运行 `npm install` 或 `pnpm install`。

```powershell
node --test tests/*.test.cjs
node --check src/app.js
node --check src/engine.js
node --check scripts/dev-server.cjs
```

自动测试覆盖固定参考值、单位往返、温标偏移、绝对零度、油耗与配速的倒数换算、对数功率、美英制容量、十进制与二进制数据、算式优先级和非法输入。

DOM 集成测试覆盖分类菜单、键盘、搜索、交换、收藏持久化、历史、单位设置、复制成功与拒绝后的手动复制，以及滚动和样式保存行为。该环境没有实际布局引擎；尺寸、滚动动效和显示残影仍需真实浏览器或桌面窗口检查。各版本已完成的检查见[验证记录](VERIFICATION.md)。

## 实现与参考

Windows 使用 WebView2 虚拟主机映射加载本地内容，普通使用无需 HTTP 服务器。用户数据目录延续 `%LOCALAPPDATA%\Vert`，保留更名前的数据。SDK 固定为 `1.0.4258.31`，许可和通知随便携版保存于 `licenses/`。

单位定义、设计来源、Windows API 与滚动实现的参考链接集中在[参考说明](REFERENCES.md)。版本变更记录见[CHANGELOG.md](../CHANGELOG.md)。
