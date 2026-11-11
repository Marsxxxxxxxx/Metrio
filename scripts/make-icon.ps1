param([Parameter(Mandatory = $true)][string]$OutputPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$images = @()
foreach ($size in @(16, 24, 32, 48, 64, 128, 256)) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.ScaleTransform(($size / 128.0), ($size / 128.0))
    $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shape.AddArc(0, 0, 56, 56, 180, 90)
    $shape.AddArc(72, 0, 56, 56, 270, 90)
    $shape.AddArc(72, 72, 56, 56, 0, 90)
    $shape.AddArc(0, 72, 56, 56, 90, 90)
    $shape.CloseFigure()
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(231, 58, 50))
    $graphics.FillPath($brush, $shape)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 6)
    $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLines($pen, [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(29, 94), [System.Drawing.PointF]::new(29, 34), [System.Drawing.PointF]::new(64, 76), [System.Drawing.PointF]::new(99, 34), [System.Drawing.PointF]::new(99, 94)))
    $stream = New-Object System.IO.MemoryStream
    $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    $images += @{ Size = $size; Data = $stream.ToArray() }
    $stream.Dispose(); $pen.Dispose(); $brush.Dispose(); $shape.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
$file = [System.IO.File]::Create($OutputPath)
$writer = New-Object System.IO.BinaryWriter($file)
try {
    $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$images.Count)
    $offset = 6 + 16 * $images.Count
    foreach ($image in $images) {
        $dimension = if ($image.Size -eq 256) { 0 } else { $image.Size }
        $writer.Write([byte]$dimension); $writer.Write([byte]$dimension)
        $writer.Write([byte]0); $writer.Write([byte]0)
        $writer.Write([uint16]1); $writer.Write([uint16]32)
        $writer.Write([uint32]$image.Data.Length); $writer.Write([uint32]$offset)
        $offset += $image.Data.Length
    }
    foreach ($image in $images) { $writer.Write([byte[]]$image.Data) }
} finally { $writer.Dispose(); $file.Dispose() }
