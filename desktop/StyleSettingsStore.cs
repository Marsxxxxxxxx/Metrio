using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;

namespace MetrioDesktop
{
    // Optional development writer. The released converter only reads the resulting CSS.
    internal static class StyleSettingsStore
    {
        private static readonly Encoding Utf8 = new UTF8Encoding(false);
        private sealed class PendingFile
        {
            public string Path;
            public string Temporary;
            public byte[] Previous;
        }

        public static bool Available(string root)
        {
            foreach (string file in new[] { "style-panel.js", "style-panel.css", "style-schema.json" })
                if (!File.Exists(System.IO.Path.Combine(root, "devtools", file))) return false;
            return true;
        }

        public static Dictionary<string, object> Save(string root, Dictionary<string, object> values)
        {
            if (!Available(root)) throw new InvalidOperationException("样式调试工具已移除，请重新打开应用。");
            if (values == null) throw new ArgumentException("样式参数必须是对象。");
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            Dictionary<string, object>[] schema = serializer.Deserialize<Dictionary<string, object>[]>(File.ReadAllText(System.IO.Path.Combine(root, "devtools", "style-schema.json")));
            HashSet<string> allowed = new HashSet<string>();
            foreach (Dictionary<string, object> field in schema) allowed.Add((string)field["id"]);
            foreach (string id in values.Keys) if (!allowed.Contains(id)) throw new ArgumentException("包含不支持的样式参数。");
            Dictionary<string, object> normalized = new Dictionary<string, object>();
            StringBuilder rules = new StringBuilder();
            foreach (Dictionary<string, object> field in schema)
            {
                string id = (string)field["id"];
                if (!values.ContainsKey(id)) continue;
                object value = values[id];
                bool valid;
                string cssValue;
                if (field.ContainsKey("options"))
                {
                    Dictionary<string, object> options = field["options"] as Dictionary<string, object>;
                    valid = value is string && options != null && options.ContainsKey((string)value);
                    cssValue = value as string;
                }
                else if (field.ContainsKey("type") && (string)field["type"] == "color")
                {
                    valid = value is string && Regex.IsMatch((string)value, "^#[0-9a-fA-F]{6}$");
                    cssValue = valid ? ((string)value).ToLowerInvariant() : null;
                    value = cssValue;
                }
                else
                {
                    valid = value is int || value is long || value is double || value is decimal;
                    double number = valid ? Convert.ToDouble(value, CultureInfo.InvariantCulture) : double.NaN;
                    valid = valid && !double.IsNaN(number) && !double.IsInfinity(number)
                        && number >= Convert.ToDouble(field["min"]) && number <= Convert.ToDouble(field["max"]);
                    value = Math.Round(number, 3, MidpointRounding.AwayFromZero);
                    cssValue = ((double)value).ToString("0.###", CultureInfo.InvariantCulture);
                }
                if (!valid) throw new ArgumentException("无效的样式参数：" + field["label"]);
                normalized.Add(id, value);
                rules.Append(field["selector"]).Append(" { ").Append(field["property"]).Append(": ").Append(cssValue)
                    .Append(field.ContainsKey("cssUnit") ? field["cssUnit"] : "").Append(" !important; }\n");
            }
            string css = "/* Saved by Metrio. This stylesheet works without development tools. */\n"
                + ":root { --metrio-saved-styles: '" + Uri.EscapeDataString(serializer.Serialize(normalized)) + "'; }\n" + rules;
            byte[] bytes = Utf8.GetBytes(css);
            List<KeyValuePair<string, byte[]>> writes = new List<KeyValuePair<string, byte[]>>();
            writes.Add(new KeyValuePair<string, byte[]>(System.IO.Path.Combine(root, "src", "user-styles.css"), bytes));
            string output = System.IO.Path.Combine(root, "dist", "Metrio");
            string desktopIndex = System.IO.Path.Combine(output, "www", "index.html");
            bool desktopUpdated = File.Exists(desktopIndex);
            if (desktopUpdated)
            {
                if (!File.ReadAllText(desktopIndex).Contains("src/user-styles.css")) throw new InvalidOperationException("请先重新构建桌面版，再保存样式。");
                string manifestPath = System.IO.Path.Combine(output, "build-manifest.json");
                Dictionary<string, object> manifest = serializer.Deserialize<Dictionary<string, object>>(File.ReadAllText(manifestPath));
                Dictionary<string, object> entry = null;
                if (manifest.ContainsKey("files") && manifest["files"] is IEnumerable)
                {
                    foreach (object item in (IEnumerable)manifest["files"])
                    {
                        Dictionary<string, object> candidate = item as Dictionary<string, object>;
                        if (candidate != null && candidate.ContainsKey("path") && Convert.ToString(candidate["path"]) == "www/src/user-styles.css") entry = candidate;
                    }
                }
                if (entry == null) throw new InvalidOperationException("桌面版缺少样式清单，请先重新构建。");
                entry["bytes"] = bytes.Length;
                using (SHA256 sha = SHA256.Create()) entry["sha256"] = BitConverter.ToString(sha.ComputeHash(bytes)).Replace("-", "");
                writes.Add(new KeyValuePair<string, byte[]>(System.IO.Path.Combine(output, "www", "src", "user-styles.css"), bytes));
                writes.Add(new KeyValuePair<string, byte[]>(manifestPath, Utf8.GetBytes(serializer.Serialize(manifest) + "\n")));
            }
            ReplaceFiles(writes);
            return new Dictionary<string, object> { { "css", css }, { "values", normalized }, { "desktopUpdated", desktopUpdated } };
        }

        private static void Replace(string temporary, string target)
        {
            if (File.Exists(target)) File.Replace(temporary, target, null);
            else File.Move(temporary, target);
        }

        private static void ReplaceFiles(List<KeyValuePair<string, byte[]>> writes)
        {
            string transaction = Guid.NewGuid().ToString("N");
            List<PendingFile> prepared = new List<PendingFile>();
            List<PendingFile> committed = new List<PendingFile>();
            try
            {
                foreach (KeyValuePair<string, byte[]> write in writes)
                {
                    PendingFile entry = new PendingFile { Path = write.Key, Temporary = write.Key + "." + transaction + ".tmp", Previous = File.Exists(write.Key) ? File.ReadAllBytes(write.Key) : null };
                    prepared.Add(entry);
                    using (FileStream file = new FileStream(entry.Temporary, FileMode.CreateNew, FileAccess.Write)) file.Write(write.Value, 0, write.Value.Length);
                }
                foreach (PendingFile entry in prepared) { Replace(entry.Temporary, entry.Path); committed.Add(entry); }
            }
            catch
            {
                List<string> failures = new List<string>();
                committed.Reverse();
                foreach (PendingFile entry in committed)
                {
                    try
                    {
                        if (entry.Previous == null) File.Delete(entry.Path);
                        else { File.WriteAllBytes(entry.Temporary, entry.Previous); Replace(entry.Temporary, entry.Path); }
                    }
                    catch { failures.Add(entry.Path); }
                }
                if (failures.Count > 0) throw new IOException("保存未完成，部分文件无法恢复：" + string.Join("、", failures));
                throw;
            }
            finally
            {
                foreach (PendingFile entry in prepared) { try { File.Delete(entry.Temporary); } catch { } }
            }
        }
    }
}
