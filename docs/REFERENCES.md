# 设计与换算参考

本项目现名 **Metrio（度衡）**。文中 VERT 是原始设计参考或历史版本名称。操作方法见[使用指南](USAGE.md)，构建与调试见[开发说明](DEVELOPMENT.md)，测试结果见[验证记录](VERIFICATION.md)。

## 设计

- 用户提供的原作者设计：[Andrej Mihelic — Vert, Unit and Currency Converter](https://dribbble.com/shots/1707405-Vert-Unit-and-Currency-Converter)。
- 用户提供的历史评测：[TapSmart — Review: Vert 2](https://www.tapsmart.com/apps/review-vert-2/)。
- 用户提供的两张参考图片：原设计师的红白透视稿，以及 VERT 2.0.1 的白色 iPhone 截图。采用白色单位列表、红色折角选中条、浅灰五列键盘和红色线框功能键。
- 桌面侧栏、搜索框、工具栏和手机预览按钮是为 Windows 调试补充的交互，不声称是原版逐像素复刻。

本项目是个人重实现，与 VERT 原作者无关联。参考图片仅用于设计对照，没有作为界面组件或品牌宣传图直接打包。图标以 SVG 重新绘制；界面使用系统字体。

## 单位

- [NIST SP 811, Appendix B: Conversion Factors](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors)
- [NIST SP 811, Appendix B.8: Factors Listed Alphabetically](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8)
- [BIPM: SI prefixes](https://www.bipm.org/en/measurement-units/si-prefixes)
- [NIST SP 811, Appendix B.9: 按物理量分类的换算系数](https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b9)
- [NIST: 二进制前缀与 bit / byte](https://physics.nist.gov/cuu/Units/binary.html)
- [NIST: 2022 CODATA 常数表](https://www.physics.nist.gov/cuu/pdf/wall_2022.pdf)：基本电荷、阿伏伽德罗常数、原子质量单位；道尔顿采用 1.66053906892×10⁻²⁷ kg，为测量值而非精确常数。
- [IAU 2015 Resolutions](https://www.iau.org/static/resolutions/IAU2015_English.pdf)：秒差距采用 648000/π au；[NASA JPL 的 au 定义](https://cneos.jpl.nasa.gov/glossary/au.html)为精确的 149597870700 m。
- [W3C: CSS 长度单位](https://www.w3.org/Style/Examples/007/units.en.html)：1 in = 72 pt = 6 pc = 96 个 CSS 参考 px。
- [FDA: 家庭量具的营养标签定义](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-guidelines-determining-metric-equivalents-household-measures)：240 mL 杯与美制传统液量杯分列。
- [NSW Health: The Yummy Tummy Book](https://healthykids.nsw.gov.au/downloads/file/campaignsprograms/TheYummyTummyBook.pdf)：澳制汤匙采用 20 mL。
- [NASA: NDARC Theory](https://rotorcraft.arc.nasa.gov/Publications/files/Johnson_1085_TN21612_NASA%20TP-2009-215402-app7.pdf)：标准海平面声速约 340.294 m/s；马赫条目标明干燥空气 15°C 的约定条件。

长度默认采用国际英尺和国际英寸，历史美国测量英尺单列；磅默认采用常衡磅，金衡单位单列。容量明确区分美制液量、美制干量与英制，杯另标具体制式或毫升数。马力区分英制机械马力与公制马力。卡路里默认采用热化学定义，IT 卡单列，Btu 采用 IT 定义。市尺、市斤、市两和市亩采用中国大陆市制，未声称适用于其他地区。

温度使用带偏移的绝对温标映射；温差单独分类，只换算比例。油耗先归一为 km/L，再进行倒数换算；配速归一为 m/s，分钟按十进制输入，二者都要求输入大于零。功率中的 dBm、dBW 以 1 mW、1 W 为参考，按 10·log₁₀(P/P₀) 转换。数据容量明确区分 1000 进制和 1024 进制。时间仅提供标出固定定义的月、年，不推算真实日历月份。

0.4.0 共 71 类、736 个分类内单位条目。相同物理单位可在面向不同用途的分类重复出现，例如长度与天文距离、体积与厨房容量。单位数量是条目数，不表示 736 个互不重复的物理定义。

质量、体积、物质的量、活度、吸收剂量、当量剂量均保持各自维度。mg/L 与 ppm、mAh 与 Wh、动力黏度与运动黏度、Gy 与 Sv 等需要额外物质参数或条件，不作无条件互换。单位管理只控制可见性，不删除定义或换算记录。

计算采用 JavaScript IEEE 754 双精度浮点数，显示时进行舍入；不是任意精度计量软件。算式使用本地解析器，不使用 eval 或 Function。

## 功能范围

当前交付为 Windows 桌面版与本地网页，包含 71 个分类、736 个分类内单位条目。尚未提供实时汇率、衣物尺码、攀岩评级或任意自定义复合单位；配料体积转重量需要物质密度，本版未提供配料数据库。

## Windows 桌面实现

- [Microsoft：WebView2 加载本地内容](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/working-with-local-content)：通过虚拟主机映射读取本地 `www` 文件，应用本身无需 HTTP 服务器。
- [Microsoft：WebView2 用户数据目录](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/user-data-folder)：应用数据仍保存在 `%LOCALAPPDATA%\Vert\WebView2`，保留旧目录与内部本地域名，避免产品改名后丢失原有收藏和记录。
- [Microsoft：WebView2 Runtime 分发](https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/distribution)：便携包依赖系统已有的 Evergreen Runtime，未将运行时内置。
- [Microsoft：Windows Forms 高 DPI 支持](https://learn.microsoft.com/en-us/dotnet/desktop/winforms/high-dpi-support-in-windows-forms)：使用 .NET Framework 4.8 与 PerMonitorV2 配置。

WebView2 SDK 固定为 1.0.4258.31，构建脚本核对 NuGet 包的 SHA-256。其许可和通知随便携版保存在 `licenses/`，参考截图不打包。

0.2.1 将选中内容放到静止的红色条内，避免以滚动行的选中状态改变白色文字、字号和布局。软件渲染是独立的可选诊断模式：通过 SDK `CoreWebView2EnvironmentOptions.AdditionalBrowserArguments` 传入 `--disable-gpu`，没有更改系统显卡设置。它不表示已确定残影由 GPU 导致。

0.2.2 根据滚轮事件的像素、行或页单位归一化离散选择。`deltaMode` 的含义见 [MDN：WheelEvent.deltaMode](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode)。缩放与触控板也可能产生 wheel 事件，见 [MDN：wheel event](https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event)。连续像素输入的判断使用事件幅度、近期手势和可用的 Windows 滚轮刻度信息，是应用层启发式，不宣称浏览器提供了精确的鼠标/触控板设备标识。
