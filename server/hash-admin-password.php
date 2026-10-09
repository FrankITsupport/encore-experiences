<?php
declare(strict_types=1);

// Local CLI helper for scripts/create-admin-sql.ps1. Never upload this file.
if (PHP_SAPI !== 'cli') { exit(1); }
$password = fgets(STDIN);
if ($password === false) { fwrite(STDERR, "No password was supplied.\n"); exit(1); }
$password = rtrim($password, "\r\n");
if (strlen($password) < 12 || strlen($password) > 72) {
    fwrite(STDERR, "Use a password between 12 and 72 bytes.\n");
    exit(1);
}
echo password_hash($password, PASSWORD_DEFAULT), PHP_EOL;
