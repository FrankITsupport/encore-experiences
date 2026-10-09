param([string] $OutputDirectory = [Environment]::GetFolderPath('Desktop'))
$ErrorActionPreference = 'Stop'

function Get-PlainText([Security.SecureString] $secureText) {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureText)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}

try {
    $email = (Read-Host 'Admin email').Trim().ToLowerInvariant()
    if ($email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$' -or $email.Length -gt 190) {
        throw 'Enter a valid admin email address.'
    }

    $password = Get-PlainText (Read-Host 'Admin password (12 to 72 characters)' -AsSecureString)
    $confirmation = Get-PlainText (Read-Host 'Confirm admin password' -AsSecureString)
    if ($password -cne $confirmation) { throw 'The passwords do not match.' }
    $confirmation = $null

    $php = (Get-Command php.exe -ErrorAction Stop).Source
    $helper = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\server\hash-admin-password.php')).Path
    $start = New-Object Diagnostics.ProcessStartInfo
    $start.FileName = $php
    $start.Arguments = '"' + $helper + '"'
    $start.UseShellExecute = $false
    $start.RedirectStandardInput = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $start.CreateNoWindow = $true
    $process = [Diagnostics.Process]::Start($start)
    $process.StandardInput.WriteLine($password)
    $process.StandardInput.Close()
    $password = $null
    $hash = $process.StandardOutput.ReadToEnd().Trim()
    $errorText = $process.StandardError.ReadToEnd().Trim()
    $process.WaitForExit()
    if ($process.ExitCode -ne 0 -or $hash.Length -lt 30) {
        throw "PHP could not create the password hash. $errorText"
    }

    $quotedEmail = $email.Replace("'", "''")
    $quotedHash = $hash.Replace("'", "''")
    $sql = "INSERT INTO admin_users (id, email, password_hash) VALUES (1, '$quotedEmail', '$quotedHash') ON DUPLICATE KEY UPDATE email = VALUES(email), password_hash = VALUES(password_hash);`n"
    if (-not $OutputDirectory -or -not (Test-Path -LiteralPath $OutputDirectory -PathType Container)) {
        throw 'Output folder was not found.'
    }
    $output = Join-Path $OutputDirectory ("venuebox-admin-{0}.sql" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))
    [IO.File]::WriteAllText($output, $sql, (New-Object Text.UTF8Encoding($false)))
    Write-Host "Admin SQL created: $output"
    Write-Host 'Import this file into venuebox_website in phpMyAdmin, then delete the SQL file after signing in.'
} catch {
    Write-Error $_.Exception.Message
    exit 1
}
