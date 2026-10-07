<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if ($argc !== 2 || !is_file($argv[1])) {
    fwrite(STDERR, "Usage: php create-admin.php /home/CPANELUSER/venuebox-config.php\n");
    exit(1);
}
$config = require $argv[1];
fwrite(STDOUT, "Admin email: ");
$email = strtolower(trim((string) fgets(STDIN)));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { fwrite(STDERR, "Invalid email.\n"); exit(1); }
fwrite(STDOUT, "Password: ");
$hideInput = DIRECTORY_SEPARATOR === '/' && function_exists('shell_exec') && trim((string) shell_exec('stty -g 2>/dev/null')) !== '';
if ($hideInput) shell_exec('stty -echo');
try { $password = rtrim((string) fgets(STDIN), "\r\n"); }
finally { if ($hideInput) { shell_exec('stty echo'); fwrite(STDOUT, "\n"); } }
if (strlen($password) < 12) { fwrite(STDERR, "Use at least 12 characters.\n"); exit(1); }
$db = new PDO(
    'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
    $config['db_user'], $config['db_password'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);
$db->prepare('INSERT INTO admin_users (id, email, password_hash) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email), password_hash = VALUES(password_hash)')
    ->execute([$email, password_hash($password, PASSWORD_DEFAULT)]);
fwrite(STDOUT, "Admin account saved. Sign in at /admin.\n");
