# 设计与换算参考

本项目现名 **Metrio（度衡）**。文中 VERT 是原始设计参考或历史版本名称。

## 设计

- 用户提供的原作者设计：[Andrej Mihelic — Vert, Unit and Currency Converter](https://dribbble.com/shots/1707405-Vert-Unit-and-Currency-Converter)。
- 用户提供的历史评测：[TapSmart — Review: Vert 2](https://www.tapsmart.com/apps/review-vert-2/)。
- 用户在本次对话提供的两张图片：原设计师的红白透视稿，以及 VERT 2.0.1 的白色 iPhone 截图。采用白色单位列表、红色折角选中条、浅灰五列键盘和红色线框功能键。
- 桌面侧栏、搜索框、工具栏和手机预览按钮是为 Windows 调试补充的交互，不声称是原版逐像素复刻。

## 单位

- [NIST SP 811, Appendix B: Conversion Factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors)
- [NIST SP 811, Appendix B.8: Factors Listed Alphabetically](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8)
- [BIPM: SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes)

长度采用国际英尺和国际英寸；磅采用常衡磅。加仑明确区分美制液量与英制，杯和品脱明确采用美制液量。马力区分英制机械马力与公制马力。卡路里采用热化学定义，Btu 采用 IT 定义。市尺、市斤、市两和市亩采用中国大陆市制，未声称适用于其他地区。

温度使用带偏移的绝对温标映射。油耗先归一为 km/L，再进行倒数换算；零和负数不支持。数据容量明确区分 1000 进制和 1024 进制。时间不提供长度不固定的月和年。

计算采用 JavaScript IEEE 754 双精度浮点数，显示时进行舍入；不是任意精度计量软件。算式使用本地解析器，不使用 eval 或 Function。

## 验证边界

程序测试、DOM 集成测试与资源检查可在 Windows Node.js 下运行。DOM 集成测试仅在 Node 进程中构造文档和事件，没有真实布局引擎。

0.2.0 桌面版已通过原生窗口进行实际 UI 检查：桌面与手机预览、分类菜单、长度与温度换算、算式输入、复制成功提示与对应历史记录，以及重启后恢复输入与收藏。开发模式的文件变更自动刷新也已验证。便携包另检查了文件 SHA-256、源文件一致性、EXE 与 WebView2Loader 的 x64 架构。其他 Windows 电脑、多显示器与 DPI 组合、iPhone 和 PWA 离线安装未验证。

## Windows 桌面实现

- [Microsoft：WebView2 加载本地内容](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/working-with-local-content)：通过虚拟主机映射读取本地 `www` 文件，应用本身无需 HTTP 服务器。
- [Microsoft：WebView2 用户数据目录](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/user-data-folder)：应用数据仍保存在 `%LOCALAPPDATA%\Vert\WebView2`，保留旧目录与内部本地域名，避免产品改名后丢失原有收藏和记录。
- [Microsoft：WebView2 Runtime 分发](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution)：便携包依赖系统已有的 Evergreen Runtime，未将运行时内置。
- [Microsoft：Windows Forms 高 DPI 支持](https://learn.microsoft.com/en-us/dotnet/desktop/winforms/high-dpi-support-in-windows-forms)：使用 .NET Framework 4.8 与 PerMonitorV2 配置。

WebView2 SDK 固定为 1.0.4258.31，构建脚本核对 NuGet 包的 SHA-256。其许可和通知随便携版保存在 `licenses/`，参考截图不打包。

0.2.1 将选中内容放到静止的红色条内，避免以滚动行的选中状态改变白色文字、字号和布局。软件渲染是独立的可选诊断模式：通过 SDK `CoreWebView2EnvironmentOptions.AdditionalBrowserArguments` 传入 `--disable-gpu`，没有更改系统显卡设置。它不表示已确定残影由 GPU 导致。

0.2.1 的真实窗口滚动验证因 Computer Use 自动许可检查连续超时而未完成。DOM 回归测试覆盖选择和显示同步、候选行样式稳定，以及末端与缩放后的滚动事件，不具备观察显卡合成残影的能力。

0.2.2 根据滚轮事件的像素、行或页单位归一化离散选择。`deltaMode` 的含义见 [MDN：WheelEvent.deltaMode](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode)。缩放与触控板也可能产生 wheel 事件，见 [MDN：wheel event](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)。连续像素输入的判断使用事件幅度、近期手势和可用的 Windows 滚轮刻度信息，是应用层启发式，不宣称浏览器提供了精确的鼠标/触控板设备标识。
