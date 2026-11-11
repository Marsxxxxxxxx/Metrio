$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { $null }
if (-not $nodePath) {
    $standardNode = Join-Path $env:ProgramFiles 'nodejs\node.exe'
    if (Test-Path -LiteralPath $standardNode) { $nodePath = $standardNode }
}
if (-not $nodePath) {
    $runtimes = Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' -ErrorAction SilentlyContinue | Sort-Object Version -Descending
    foreach ($runtime in $runtimes) {
        $candidate = Join-Path $runtime.InstallLocation 'dependencies\node\bin\node.exe'
        if (Test-Path -LiteralPath $candidate) { $nodePath = $candidate; break }
    }
}
if (-not $nodePath) {
    Write-Host 'Node.js was not found. Install Node.js 20+, or open index.html directly.'
    exit 1
}
& $nodePath (Join-Path $PSScriptRoot 'dev-server.cjs')
