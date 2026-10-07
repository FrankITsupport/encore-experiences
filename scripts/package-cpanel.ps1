$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$dist = (Resolve-Path -LiteralPath (Join-Path $workspace 'dist')).Path
$release = Join-Path $workspace 'release'
[System.IO.Directory]::CreateDirectory($release) | Out-Null

$siteZip = Join-Path $release 'venuebox-website.zip'
$setupZip = Join-Path $release 'venuebox-setup.zip'
foreach ($zip in @($siteZip, $setupZip)) {
    if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
}

$requiredSiteFiles = @('.htaccess', 'index.html', 'favicon.svg', 'favicon.ico', 'api/index.php', 'uploads/.htaccess')
foreach ($file in $requiredSiteFiles) {
    if (-not (Test-Path -LiteralPath (Join-Path $dist $file) -PathType Leaf)) {
        throw "Missing site file: $file"
    }
}

$archive = [System.IO.Compression.ZipFile]::Open($siteZip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($file in (Get-ChildItem -LiteralPath $dist -Recurse -File -Force)) {
        $entryName = $file.FullName.Substring($dist.Length + 1).Replace('\', '/')
        $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
        $inputStream = [System.IO.File]::OpenRead($file.FullName)
        $outputStream = $entry.Open()
        try { $inputStream.CopyTo($outputStream) }
        finally { $outputStream.Dispose(); $inputStream.Dispose() }
    }
}
finally { $archive.Dispose() }

$setupFiles = @(
    'server/schema.sql',
    'server/migrate.php',
    'server/migrations/0001_initial.sql',
    'server/create-admin.php',
    'server/venuebox-config.example.php',
    'docs/cpanel-setup.md',
    'docs/automated-deploy.md',
    'release/DEPLOY.txt'
)
$archive = [System.IO.Compression.ZipFile]::Open($setupZip, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    foreach ($relative in $setupFiles) {
        $source = Join-Path $workspace $relative
        if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing setup file: $relative" }
        $entryName = $relative.Replace('\', '/')
        if ($entryName -eq 'release/DEPLOY.txt') { $entryName = 'DEPLOY.txt' }
        $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
        $inputStream = [System.IO.File]::OpenRead($source)
        $outputStream = $entry.Open()
        try { $inputStream.CopyTo($outputStream) }
        finally { $outputStream.Dispose(); $inputStream.Dispose() }
    }
}
finally { $archive.Dispose() }

Write-Output $siteZip
Write-Output $setupZip
