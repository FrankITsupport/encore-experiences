<?php
declare(strict_types=1);

// Run from the command line only. Migration files are applied once, in name order.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit(1);
}

function sql_statements(string $sql): array {
    $statements = [];
    $current = '';
    $quote = null;
    $lineComment = false;
    $blockComment = false;
    $length = strlen($sql);

    for ($index = 0; $index < $length; $index++) {
        $char = $sql[$index];
        $next = $index + 1 < $length ? $sql[$index + 1] : '';

        if ($lineComment) {
            if ($char === "\n") { $lineComment = false; $current .= "\n"; }
            continue;
        }
        if ($blockComment) {
            if ($char === '*' && $next === '/') { $blockComment = false; $index++; }
            continue;
        }
        if ($quote !== null) {
            $current .= $char;
            if ($char === '\\' && $quote !== '`' && $next !== '') {
                $current .= $next;
                $index++;
            } elseif ($char === $quote) {
                if ($next === $quote) { $current .= $next; $index++; }
                else $quote = null;
            }
            continue;
        }
        if ($char === '-' && $next === '-' && ($index + 2 >= $length || ctype_space($sql[$index + 2]))) {
            $lineComment = true;
            $index++;
            continue;
        }
        if ($char === '#') { $lineComment = true; continue; }
        if ($char === '/' && $next === '*') { $blockComment = true; $index++; continue; }
        if ($char === "'" || $char === '"' || $char === '`') { $quote = $char; $current .= $char; continue; }
        if ($char === ';') {
            if (trim($current) !== '') $statements[] = trim($current);
            $current = '';
            continue;
        }
        $current .= $char;
    }
    if ($quote !== null || $blockComment) throw new RuntimeException('Unclosed SQL quote or comment.');
    if (trim($current) !== '') $statements[] = trim($current);
    return $statements;
}

try {
    $files = glob(__DIR__ . '/migrations/*.sql') ?: [];
    sort($files, SORT_STRING);
    if (!$files) throw new RuntimeException('No migration files found.');
    $migrations = [];
    foreach ($files as $file) {
        $name = basename($file);
        if (!preg_match('/^[0-9]{4}_[a-z0-9_]+\.sql$/', $name)) throw new RuntimeException("Invalid migration name: $name");
        $contents = file_get_contents($file);
        if ($contents === false) throw new RuntimeException("Cannot read migration: $name");
        $statements = sql_statements($contents);
        if (!$statements) throw new RuntimeException("Empty migration: $name");
        $migrations[] = [$name, hash('sha256', $contents), $statements];
    }

    if (($argv[1] ?? '') === '--check') {
        foreach ($migrations as [$name, , $statements]) echo "$name: " . count($statements) . " statements\n";
        exit(0);
    }
    $configPath = $argv[1] ?? '';
    if (!is_file($configPath)) throw new RuntimeException('Usage: php migrate.php /home/CPANELUSER/venuebox-config.php');
    $config = require $configPath;
    $db = new PDO(
        'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
        $config['db_user'], $config['db_password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
    );
    $db->exec('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(190) NOT NULL PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    $lock = $db->query("SELECT GET_LOCK('venuebox-migrations', 30)")->fetchColumn();
    if ((int) $lock !== 1) throw new RuntimeException('Could not acquire the migration lock.');

    try {
        $lookup = $db->prepare('SELECT checksum FROM schema_migrations WHERE name = ?');
        $record = $db->prepare('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)');
        foreach ($migrations as [$name, $checksum, $statements]) {
            $lookup->execute([$name]);
            $existing = $lookup->fetchColumn();
            if ($existing !== false) {
                if (!hash_equals((string) $existing, $checksum)) throw new RuntimeException("Applied migration changed: $name");
                echo "Already applied: $name\n";
                continue;
            }
            foreach ($statements as $statement) $db->exec($statement);
            $record->execute([$name, $checksum]);
            echo "Applied: $name\n";
        }
    } finally {
        $db->query("SELECT RELEASE_LOCK('venuebox-migrations')");
    }
} catch (Throwable $error) {
    fwrite(STDERR, "Migration failed: " . $error->getMessage() . "\n");
    exit(1);
}
