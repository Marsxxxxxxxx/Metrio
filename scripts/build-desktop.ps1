param([switch]$NoArchive)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$version = '0.2.3'
$sdkVersion = '1.0.4258.31'
$sdkHash = '56F7F4B8BF9AEE4B8EFEFBBDD4F67D5F74EBD1B100ED0806DA71BF76AF481AA9'
$cacheRoot = Join-Path $projectRoot '.local\webview2'
$packagePath = Join-Path $cacheRoot ('Microsoft.Web.WebView2.' + $sdkVersion + '.nupkg')
$sdkRoot = Join-Path $cacheRoot $sdkVersion
$outputRoot = Join-Path $projectRoot 'dist\Metrio'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
if (-not (Test-Path -LiteralPath $compiler)) { throw '.NET Framework C# compiler is missing. This build script requires Windows x64 with .NET Framework 4.8.' }
New-Item -ItemType Directory -Force -Path $cacheRoot, $outputRoot | Out-Null
if (-not (Test-Path -LiteralPath $packagePath)) {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -UseBasicParsing -Uri ('https://api.nuget.org/v3-flatcontainer/microsoft.web.webview2/' + $sdkVersion + '/microsoft.web.webview2.' + $sdkVersion + '.nupkg') -OutFile $packagePath
}
if ((Get-FileHash -LiteralPath $packagePath -Algorithm SHA256).Hash -ne $sdkHash) { throw 'The WebView2 SDK package hash did not match the pinned version.' }
if (-not (Test-Path -LiteralPath $sdkRoot)) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($packagePath, $sdkRoot)
}
$iconPath = Join-Path $projectRoot 'assets\metrio.ico'
& (Join-Path $PSScriptRoot 'make-icon.ps1') -OutputPath $iconPath
$assemblyRoot = Join-Path $sdkRoot 'lib\net462'
$arguments = @(
    '/nologo', '/target:winexe', '/platform:x64', '/optimize+', '/langversion:5', '/codepage:65001',
    ('/out:' + (Join-Path $outputRoot 'Metrio.exe')),
    ('/win32icon:' + $iconPath),
    ('/win32manifest:' + (Join-Path $projectRoot 'desktop\app.manifest')),
    '/reference:System.dll', '/reference:System.Core.dll', '/reference:System.Drawing.dll',
    '/reference:System.Windows.Forms.dll', '/reference:System.Web.Extensions.dll',
    ('/reference:' + (Join-Path $assemblyRoot 'Microsoft.Web.WebView2.Core.dll')),
    ('/reference:' + (Join-Path $assemblyRoot 'Microsoft.Web.WebView2.WinForms.dll')),
    (Join-Path $projectRoot 'desktop\Program.cs')
)
& $compiler @arguments
if ($LASTEXITCODE -ne 0) { throw 'Desktop compilation failed.' }
Copy-Item -LiteralPath (Join-Path $projectRoot 'desktop\App.config') -Destination (Join-Path $outputRoot 'Metrio.exe.config') -Force
foreach ($assembly in @('Microsoft.Web.WebView2.Core.dll', 'Microsoft.Web.WebView2.WinForms.dll')) {
    Copy-Item -LiteralPath (Join-Path $assemblyRoot $assembly) -Destination $outputRoot -Force
}
Copy-Item -LiteralPath (Join-Path $sdkRoot 'runtimes\win-x64\native\WebView2Loader.dll') -Destination $outputRoot -Force
$webRoot = Join-Path $outputRoot 'www'
New-Item -ItemType Directory -Force -Path $webRoot, (Join-Path $webRoot 'src'), (Join-Path $webRoot 'assets') | Out-Null
foreach ($relativePath in @('index.html', 'src\app.js', 'src\engine.js', 'src\styles.css', 'assets\icon.svg')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $relativePath) -Destination (Join-Path $webRoot $relativePath) -Force
}
$licenses = Join-Path $outputRoot 'licenses'
New-Item -ItemType Directory -Force -Path $licenses | Out-Null
Copy-Item -LiteralPath (Join-Path $sdkRoot 'LICENSE.txt') -Destination (Join-Path $licenses 'Microsoft.Web.WebView2-LICENSE.txt') -Force
Copy-Item -LiteralPath (Join-Path $sdkRoot 'NOTICE.txt') -Destination (Join-Path $licenses 'Microsoft.Web.WebView2-NOTICE.txt') -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'desktop\USAGE.txt') -Destination $outputRoot -Force
Copy-Item -LiteralPath (Join-Path $projectRoot 'desktop\Metrio Compatibility.cmd') -Destination $outputRoot -Force
$manifest = @{ version = $version; architecture = 'x64'; webViewSdk = $sdkVersion; files = @() }
foreach ($item in (Get-ChildItem -LiteralPath $outputRoot -Recurse -File | Where-Object { $_.Name -ne 'build-manifest.json' })) {
    $manifest.files += @{ path = $item.FullName.Substring($outputRoot.Length + 1).Replace('\', '/'); sha256 = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash; bytes = $item.Length }
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $outputRoot 'build-manifest.json') -Encoding UTF8
if (-not $NoArchive) {
    $zipPath = Join-Path $projectRoot ('dist\Metrio-' + $version + '-windows-x64.zip')
    Compress-Archive -LiteralPath $outputRoot -DestinationPath $zipPath -Force
    Write-Output ('Archive: ' + $zipPath)
}
Write-Output ('Desktop app: ' + (Join-Path $outputRoot 'Metrio.exe'))
