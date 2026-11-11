using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Runtime.Versioning;
using System.Text;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

[assembly: AssemblyTitle("Metrio · 度衡")]
[assembly: AssemblyDescription("Metrio (度衡) — personal unit converter for Windows")]
[assembly: AssemblyProduct("Metrio · 度衡")]
[assembly: AssemblyVersion("0.5.0.0")]
[assembly: AssemblyFileVersion("0.5.0.0")]
[assembly: TargetFramework(".NETFramework,Version=v4.8", FrameworkDisplayName = ".NET Framework 4.8")]

namespace MetrioDesktop
{
    internal static class Program
    {
        [STAThread]
        private static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            try
            {
                string contentRoot = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "www");
                // Preserve the existing profile so a product rename keeps user data intact.
                string profileRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Vert");
                bool development = false;
                bool softwareRendering = false;
                for (int index = 0; index < args.Length; index++)
                {
                    if (args[index] == "--dev" && index + 1 < args.Length)
                    {
                        development = true;
                        contentRoot = Path.GetFullPath(args[++index]);
                    }
                    else if (args[index] == "--profile" && index + 1 < args.Length)
                    {
                        profileRoot = Path.GetFullPath(args[++index]);
                    }
                    else if (args[index] == "--software-rendering") softwareRendering = true;
                    else throw new ArgumentException("不支持的启动参数：" + args[index]);
                }
                if (!File.Exists(Path.Combine(contentRoot, "index.html")))
                    throw new FileNotFoundException("没有找到界面文件。请保持 Metrio.exe 与 www 文件夹在同一目录。", contentRoot);
                Directory.CreateDirectory(profileRoot);
                Application.Run(new MainWindow(contentRoot, profileRoot, development, softwareRendering));
            }
            catch (Exception error)
            {
                MessageBox.Show("Metrio 无法启动。\r\n\r\n" + error.Message, "Metrio", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }

    public sealed class WindowPlacement
    {
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public bool Maximized { get; set; }
    }

    internal sealed class MainWindow : Form
    {
        // This internal origin owns existing localStorage. It is not a network host.
        private const string AppHost = "vert.example";
        private const string AppUrl = "https://vert.example/index.html?desktop=1";
        private readonly string contentRoot;
        private readonly string profileRoot;
        private readonly bool development;
        private readonly bool softwareRendering;
        private readonly WebView2 webView;
        private readonly Label loading;
        private readonly Timer refreshTimer;
        private readonly JavaScriptSerializer serializer = new JavaScriptSerializer();
        private FileSystemWatcher watcher;
        private bool closing;

        public MainWindow(string contentRoot, string profileRoot, bool development, bool softwareRendering)
        {
            this.contentRoot = contentRoot;
            this.profileRoot = profileRoot;
            this.development = development;
            this.softwareRendering = softwareRendering;
            Text = development ? "Metrio · 度衡 · 界面调试" : (softwareRendering ? "Metrio · 度衡 · 兼容渲染" : "Metrio · 度衡");
            BackColor = Color.FromArgb(243, 243, 241);
            // The docked WebView handles its own DPI; avoid scaling the client area twice.
            AutoScaleMode = AutoScaleMode.None;
            ClientSize = new Size(1040, 810);
            MinimumSize = new Size(410, 670);
            StartPosition = FormStartPosition.CenterScreen;
            Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            RestorePlacement();

            webView = new WebView2();
            webView.Dock = DockStyle.Fill;
            webView.DefaultBackgroundColor = BackColor;
            Controls.Add(webView);
            loading = new Label();
            loading.Dock = DockStyle.Fill;
            loading.Text = "Metrio · 度衡\r\n正在打开单位换算…";
            loading.Font = new Font("Segoe UI", 13);
            loading.TextAlign = ContentAlignment.MiddleCenter;
            loading.ForeColor = Color.FromArgb(140, 140, 138);
            Controls.Add(loading);
            loading.BringToFront();

            refreshTimer = new Timer();
            refreshTimer.Interval = 200;
            refreshTimer.Tick += delegate
            {
                refreshTimer.Stop();
                if (!closing && webView.CoreWebView2 != null) webView.CoreWebView2.Reload();
            };
            Log("starting version=0.5.0 mode=" + (development ? "development" : "desktop"));
            Log("rendering=" + (softwareRendering ? "software" : "default"));
        }

        protected override async void OnShown(EventArgs e)
        {
            base.OnShown(e);
            try
            {
                string runtime = CoreWebView2Environment.GetAvailableBrowserVersionString();
                Log("runtime=" + runtime);
                CoreWebView2EnvironmentOptions options = new CoreWebView2EnvironmentOptions();
                if (softwareRendering) options.AdditionalBrowserArguments = "--disable-gpu";
                CoreWebView2Environment environment = await CoreWebView2Environment.CreateAsync(null, Path.Combine(profileRoot, "WebView2"), options);
                if (closing) return;
                await webView.EnsureCoreWebView2Async(environment);
                if (closing) return;
                CoreWebView2 core = webView.CoreWebView2;
                core.Settings.IsStatusBarEnabled = false;
                core.Settings.AreDefaultContextMenusEnabled = development;
                core.Settings.AreDevToolsEnabled = true;
                core.Settings.AreBrowserAcceleratorKeysEnabled = true;
                core.Settings.IsZoomControlEnabled = true;
                core.Settings.IsBuiltInErrorPageEnabled = false;
                core.SetVirtualHostNameToFolderMapping(AppHost, contentRoot, CoreWebView2HostResourceAccessKind.DenyCors);
                core.NavigationStarting += OnNavigationStarting;
                core.NewWindowRequested += delegate(object sender, CoreWebView2NewWindowRequestedEventArgs args)
                {
                    args.Handled = true;
                    if (args.IsUserInitiated) OpenExternal(args.Uri);
                };
                core.NavigationCompleted += delegate(object sender, CoreWebView2NavigationCompletedEventArgs args)
                {
                    if (!args.IsSuccess)
                    {
                        Log("navigation-failed " + args.WebErrorStatus);
                        loading.Text = "界面加载失败：" + args.WebErrorStatus + "\r\n请关闭后重新打开 Metrio。";
                        loading.Visible = true;
                        loading.BringToFront();
                    }
                };
                core.WebMessageReceived += OnWebMessageReceived;
                core.ProcessFailed += delegate(object sender, CoreWebView2ProcessFailedEventArgs args)
                {
                    Log("webview-process-failed " + args.ProcessFailedKind);
                    loading.Text = "界面进程已停止。\r\n请关闭后重新打开 Metrio。";
                    loading.Visible = true;
                    loading.BringToFront();
                };
                core.PermissionRequested += delegate(object sender, CoreWebView2PermissionRequestedEventArgs args)
                {
                    // This local calculator needs no camera, microphone, location or clipboard-read access.
                    args.State = CoreWebView2PermissionState.Deny;
                };
                core.AddWebResourceRequestedFilter("*", CoreWebView2WebResourceContext.All);
                core.WebResourceRequested += delegate(object sender, CoreWebView2WebResourceRequestedEventArgs args)
                {
                    if (!IsLocalPage(args.Request.Uri))
                        args.Response = environment.CreateWebResourceResponse(new MemoryStream(), 403, "External resources are disabled", "Content-Type: text/plain");
                    else if (new Uri(args.Request.Uri).AbsolutePath == "/src/user-styles.css")
                    {
                        string file = Path.Combine(contentRoot, "src", "user-styles.css");
                        byte[] bytes = File.Exists(file) ? File.ReadAllBytes(file) : new byte[0];
                        args.Response = environment.CreateWebResourceResponse(new MemoryStream(bytes), 200, "OK", "Content-Type: text/css; charset=utf-8\r\nCache-Control: no-store");
                    }
                };
                if (development)
                {
                    WatchSourceFiles();
                    if (StyleSettingsStore.Available(contentRoot))
                    {
                        try
                        {
                            string schema = serializer.Serialize(File.ReadAllText(Path.Combine(contentRoot, "devtools", "style-schema.json")));
                            await core.AddScriptToExecuteOnDocumentCreatedAsync("document.addEventListener('DOMContentLoaded', function () { if (location.hostname !== 'vert.example' || new URLSearchParams(location.search).get('debug') === '0') return; var schema = document.createElement('script'); schema.id = 'metrio-style-schema'; schema.type = 'application/json'; schema.textContent = " + schema + "; document.head.appendChild(schema); var script = document.createElement('script'); script.src = '/devtools/style-panel.js'; script.onerror = function () { script.remove(); }; document.head.appendChild(script); }, { once: true });");
                        }
                        catch (Exception error) { Log("devtools-unavailable " + error.Message); }
                    }
                }
                core.Navigate(AppUrl);
            }
            catch (WebView2RuntimeNotFoundException)
            {
                Log("missing-webview2-runtime");
                loading.Text = "需要 Microsoft Edge WebView2 Runtime 才能打开 Metrio。\r\n\r\n请从 Microsoft 官方网站安装 Evergreen Runtime，\r\n然后重新运行 Metrio。\r\n\r\nhttps://developer.microsoft.com/microsoft-edge/webview2/";
            }
            catch (Exception error)
            {
                if (closing) return;
                Log("startup-error " + error);
                loading.Text = "Metrio 启动失败。\r\n\r\n" + error.Message + "\r\n\r\n切换普通/兼容模式前，请先关闭所有 Metrio 窗口。\r\n详细信息已写入应用数据目录中的 desktop.log。";
            }
        }

        private void OnWebMessageReceived(object sender, CoreWebView2WebMessageReceivedEventArgs args)
        {
            if (!IsLocalPage(args.Source)) return;
            try
            {
                Dictionary<string, object> message = serializer.Deserialize<Dictionary<string, object>>(args.WebMessageAsJson);
                if (message.ContainsKey("type") && Convert.ToString(message["type"]) == "metrio-ready")
                {
                    loading.Visible = false;
                    webView.Focus();
                    Log("ui-ready categories=" + message["categories"] + " units=" + message["units"] + (message.ContainsKey("page") ? " page=" + message["page"] : ""));
                }
                else if (development && message.ContainsKey("type") && Convert.ToString(message["type"]) == "metrio-devtools-ready") Log("devtools-ready");
                else if (development && message.ContainsKey("type") && Convert.ToString(message["type"]) == "metrio-save-styles") SaveStyles(message);
            }
            catch (Exception error) { Log("invalid-ready-message " + error.Message); }
        }

        private void SaveStyles(Dictionary<string, object> message)
        {
            string requestId = message.ContainsKey("requestId") ? message["requestId"] as string : null;
            if (requestId == null || !System.Text.RegularExpressions.Regex.IsMatch(requestId, "^[a-zA-Z0-9-]{1,64}$")) return;
            Dictionary<string, object> reply;
            try
            {
                if (message.Count != 3 || !message.ContainsKey("values")) throw new ArgumentException("无效的保存请求。");
                reply = StyleSettingsStore.Save(contentRoot, message["values"] as Dictionary<string, object>);
                reply["ok"] = true;
                Log("styles-saved desktop=" + reply["desktopUpdated"]);
            }
            catch (Exception error)
            {
                reply = new Dictionary<string, object> { { "ok", false }, { "error", error.Message } };
                Log("styles-save-failed " + error.Message);
            }
            reply["type"] = "metrio-style-save-result";
            reply["requestId"] = requestId;
            webView.CoreWebView2.PostWebMessageAsJson(serializer.Serialize(reply));
        }

        private static bool IsLocalPage(string value)
        {
            Uri uri;
            return Uri.TryCreate(value, UriKind.Absolute, out uri) && uri.Scheme == "https" && uri.Host == AppHost;
        }

        private void OnNavigationStarting(object sender, CoreWebView2NavigationStartingEventArgs args)
        {
            if (IsLocalPage(args.Uri)) return;
            args.Cancel = true;
            if (args.IsUserInitiated) OpenExternal(args.Uri);
        }

        private void OpenExternal(string value)
        {
            Uri uri;
            if (!Uri.TryCreate(value, UriKind.Absolute, out uri) || (uri.Scheme != "https" && uri.Scheme != "http")) return;
            try { Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute = true }); }
            catch (Exception error) { Log("external-link-error " + error.Message); }
        }

        private void WatchSourceFiles()
        {
            watcher = new FileSystemWatcher(contentRoot);
            watcher.IncludeSubdirectories = true;
            watcher.NotifyFilter = NotifyFilters.LastWrite | NotifyFilters.FileName;
            FileSystemEventHandler onChange = delegate(object sender, FileSystemEventArgs args)
            {
                string relative = args.FullPath.Substring(contentRoot.TrimEnd(Path.DirectorySeparatorChar).Length).TrimStart(Path.DirectorySeparatorChar).Replace('\\', '/');
                // The save reply applies this stylesheet without interrupting the request with a reload.
                if (relative.Equals("src/user-styles.css", StringComparison.OrdinalIgnoreCase) || relative.StartsWith("src/user-styles.css.", StringComparison.OrdinalIgnoreCase)) return;
                if (relative != "index.html" && !relative.StartsWith("src/", StringComparison.OrdinalIgnoreCase) && !relative.StartsWith("assets/", StringComparison.OrdinalIgnoreCase) && !relative.StartsWith("devtools/", StringComparison.OrdinalIgnoreCase)) return;
                if (closing || !IsHandleCreated) return;
                try { BeginInvoke(new Action(delegate { refreshTimer.Stop(); refreshTimer.Start(); })); }
                catch (InvalidOperationException) { }
            };
            watcher.Changed += onChange;
            watcher.Created += onChange;
            watcher.Deleted += onChange;
            watcher.Renamed += delegate(object sender, RenamedEventArgs args) { onChange(sender, args); };
            watcher.EnableRaisingEvents = true;
        }

        private void RestorePlacement()
        {
            try
            {
                string file = Path.Combine(profileRoot, "window.json");
                if (!File.Exists(file)) return;
                WindowPlacement saved = serializer.Deserialize<WindowPlacement>(File.ReadAllText(file));
                if (saved == null || saved.Width < 410 || saved.Height < 670 || saved.Width > 10000 || saved.Height > 10000) return;
                Rectangle bounds = new Rectangle(saved.X, saved.Y, saved.Width, saved.Height);
                foreach (Screen screen in Screen.AllScreens)
                {
                    Rectangle visible = Rectangle.Intersect(screen.WorkingArea, bounds);
                    if (visible.Width >= 200 && visible.Height >= 200)
                    {
                        StartPosition = FormStartPosition.Manual;
                        Bounds = bounds;
                        if (saved.Maximized) WindowState = FormWindowState.Maximized;
                        break;
                    }
                }
            }
            catch (Exception error) { Log("window-restore-error " + error.Message); }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            base.OnFormClosing(e);
            if (e.Cancel) return;
            closing = true;
            if (watcher != null) watcher.Dispose();
            refreshTimer.Dispose();
            try
            {
                Rectangle bounds = WindowState == FormWindowState.Normal ? Bounds : RestoreBounds;
                WindowPlacement value = new WindowPlacement { X = bounds.X, Y = bounds.Y, Width = bounds.Width, Height = bounds.Height, Maximized = WindowState == FormWindowState.Maximized };
                File.WriteAllText(Path.Combine(profileRoot, "window.json"), serializer.Serialize(value), Encoding.UTF8);
            }
            catch (Exception error) { Log("window-save-error " + error.Message); }
            webView.Dispose();
            Log("closed");
        }

        private void Log(string message)
        {
            try { File.AppendAllText(Path.Combine(profileRoot, "desktop.log"), DateTimeOffset.Now.ToString("o") + " " + message + Environment.NewLine, Encoding.UTF8); }
            catch { /* Logging must not prevent the calculator from opening. */ }
        }
    }
}
