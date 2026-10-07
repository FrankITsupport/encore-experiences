<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function fail(string $message, int $status = 400): never { respond(['error' => $message], $status); }

function database(): PDO {
    $configFile = getenv('VENUEBOX_CONFIG') ?: rtrim((string) (getenv('HOME') ?: dirname(__DIR__, 2)), '/\\') . '/venuebox-config.php';
    if (!is_file($configFile)) fail('Admin server is not configured.', 503);
    $config = require $configFile;
    return new PDO(
        'mysql:host=' . $config['db_host'] . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
        $config['db_user'], $config['db_password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]
    );
}

function start_admin_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_name('venuebox_admin');
    session_set_cookie_params(['httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite' => 'Lax', 'path' => '/']);
    session_start();
}

function require_admin(bool $checkCsrf = false): void {
    start_admin_session();
    if (empty($_SESSION['admin_id'])) fail('Please sign in again.', 401);
    if ($checkCsrf && (empty($_SESSION['csrf']) || empty($_SERVER['HTTP_X_CSRF_TOKEN']) || !hash_equals((string) $_SESSION['csrf'], (string) $_SERVER['HTTP_X_CSRF_TOKEN']))) fail('Session expired. Refresh and sign in again.', 403);
}

function json_input(): array {
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($data)) fail('Invalid request body.');
    return $data;
}

function rows(PDO $db, string $sql, array $args = []): array {
    $query = $db->prepare($sql);
    $query->execute($args);
    return $query->fetchAll();
}

function valid_media_path(string $path): bool {
    return (bool) preg_match('~^(static:[a-z0-9-]+\.(jpg|png|webp)|uploads/(events|hero|equipment)/[a-f0-9-]{36}\.(jpg|png|webp|avif|mp4|webm))$~i', $path);
}

function fields_for(string $table, array $input, PDO $db, ?string $id): array {
    $allowed = [
        'events' => ['slug','title','summary','body','event_date','location','cover_path','published'],
        'event_images' => ['event_id','image_path','alt_text','caption','position'],
        'hero_slides' => ['title','subtitle','media_type','media_path','poster_path','cta_label','cta_href','position','enabled'],
        'equipment' => ['title','description','image_path','tag','position','published'],
    ];
    $data = array_intersect_key($input, array_flip($allowed[$table]));
    foreach ($data as $key => $value) {
        if ($value !== null && !is_scalar($value)) fail("Invalid $key.");
        if (is_string($value) && strlen($value) > ($key === 'body' ? 50000 : 10000)) fail("$key is too long.");
    }
    foreach (['cover_path', 'image_path', 'media_path', 'poster_path'] as $field) {
        if (!empty($data[$field]) && !valid_media_path((string) $data[$field])) fail("Invalid $field.");
    }
    foreach (['published', 'enabled'] as $field) if (isset($data[$field])) $data[$field] = (int) (bool) $data[$field];
    if ($table === 'events') {
        if (isset($data['slug']) && !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', (string) $data['slug'])) fail('Invalid event URL slug.');
        if (isset($data['event_date']) && $data['event_date'] !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $data['event_date'])) fail('Invalid event date.');
        if (array_key_exists('published', $data) && $data['published']) {
            $merged = $id ? (rows($db, 'SELECT * FROM events WHERE id = ?', [$id])[0] ?? []) : [];
            $merged = array_merge($merged, $data);
            if (empty($merged['title']) || empty($merged['summary']) || empty($merged['cover_path'])) fail('Add a title, summary, and cover image before publishing.');
            $images = $id ? rows($db, 'SELECT alt_text FROM event_images WHERE event_id = ?', [$id]) : [];
            if (!$images) fail('Add at least one gallery photo before publishing.');
            foreach ($images as $image) if (trim($image['alt_text']) === '') fail('Add alt text to every gallery photo before publishing.');
        }
    }
    if ($table === 'event_images') {
        if (!$id && empty($data['event_id'])) fail('Select an event first.');
        $eventId = $id ? (rows($db, 'SELECT event_id FROM event_images WHERE id = ?', [$id])[0]['event_id'] ?? '') : (string) $data['event_id'];
        $published = $eventId ? (rows($db, 'SELECT published FROM events WHERE id = ?', [$eventId])[0]['published'] ?? 0) : 0;
        if ($published && isset($data['alt_text']) && trim((string) $data['alt_text']) === '') fail('Published gallery photos need alt text.');
        if ($published && !$id && trim((string) ($data['alt_text'] ?? '')) === '') fail('Add alt text before adding a photo to a published event.');
    }
    if ($table === 'hero_slides') {
        if (isset($data['media_type']) && !in_array($data['media_type'], ['image', 'video'], true)) fail('Invalid slide type.');
        if (!empty($data['cta_href']) && !preg_match('~^(#|/(?!/)|https://)~', (string) $data['cta_href'])) fail('Invalid button link.');
        if (!empty($data['enabled']) && empty($data['media_path'])) fail('Upload media before showing this slide.');
        if (($data['media_type'] ?? null) === 'video' && !empty($data['enabled']) && empty($data['poster_path'])) fail('Add a video poster.');
    }
    return $data;
}

function uuid(): string {
    $hex = bin2hex(random_bytes(16));
    return substr($hex,0,8) . '-' . substr($hex,8,4) . '-4' . substr($hex,13,3) . '-8' . substr($hex,17,3) . '-' . substr($hex,20,12);
}

function upload_media(): never {
    $folder = (string) ($_GET['folder'] ?? '');
    if (!in_array($folder, ['events', 'hero', 'equipment'], true)) fail('Invalid upload folder.');
    if (!isset($_FILES['file']) || !is_array($_FILES['file'])) fail('Choose a file.');
    $file = $_FILES['file'];
    if ($file['error'] !== UPLOAD_ERR_OK) fail('Upload failed. Check the server upload size settings.');
    $size = (int) $file['size'];
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    $types = ['image/jpeg'=>'jpg', 'image/png'=>'png', 'image/webp'=>'webp', 'image/avif'=>'avif', 'video/mp4'=>'mp4', 'video/webm'=>'webm'];
    if (!isset($types[$mime])) fail('Use a JPG, PNG, WebP, AVIF, MP4, or WebM file.');
    if (str_starts_with($mime, 'video/') && $folder !== 'hero') fail('Videos are only available for hero slides.');
    if ($size <= 0 || $size > (str_starts_with($mime, 'image/') ? 12 : 50) * 1048576) fail('File exceeds the allowed size.');
    if (str_starts_with($mime, 'image/') && !getimagesize($file['tmp_name'])) fail('Invalid image file.');
    $name = uuid() . '.' . $types[$mime];
    $directory = dirname(__DIR__) . '/uploads/' . $folder;
    if (!is_dir($directory) && !mkdir($directory, 0755, true)) fail('Could not create upload folder.', 500);
    if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) fail('Could not save uploaded file.', 500);
    chmod($directory . '/' . $name, 0644);
    respond(['path' => 'uploads/' . $folder . '/' . $name]);
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $action = (string) ($_GET['action'] ?? '');
    $resource = (string) ($_GET['resource'] ?? '');

    if ($action === 'session' && $method === 'GET') {
        start_admin_session();
        if (empty($_SESSION['admin_id'])) respond(null);
        respond(['email' => $_SESSION['email'], 'csrf' => $_SESSION['csrf']]);
    }
    if ($action === 'login' && $method === 'POST') {
        start_admin_session();
        $data = json_input();
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');
        $db = database();
        $ipHash = hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
        $attempt = rows($db, 'SELECT failures, last_attempt FROM login_attempts WHERE ip_hash = ?', [$ipHash])[0] ?? null;
        if ($attempt && $attempt['failures'] >= 5 && strtotime($attempt['last_attempt']) > time() - 900) fail('Too many sign-in attempts. Try again in 15 minutes.', 429);
        $user = rows($db, 'SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1', [$email])[0] ?? null;
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $db->prepare('INSERT INTO login_attempts (ip_hash, failures, last_attempt) VALUES (?,1,NOW()) ON DUPLICATE KEY UPDATE failures = IF(last_attempt < NOW() - INTERVAL 15 MINUTE,1,failures+1), last_attempt = NOW()')->execute([$ipHash]);
            fail('Incorrect email or password.', 401);
        }
        $db->prepare('DELETE FROM login_attempts WHERE ip_hash = ?')->execute([$ipHash]);
        session_regenerate_id(true);
        $_SESSION['admin_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
        respond(['email' => $user['email'], 'csrf' => $_SESSION['csrf']]);
    }
    if ($action === 'logout' && $method === 'POST') {
        require_admin(true);
        $_SESSION = [];
        session_destroy();
        respond(['ok' => true]);
    }
    if ($action === 'upload' && $method === 'POST') { require_admin(true); upload_media(); }
    if ($action === 'swap' && $method === 'POST') {
        require_admin(true);
        if (!in_array($resource, ['event_images','hero_slides','equipment'], true)) fail('Invalid resource.');
        $data = json_input();
        $db = database();
        $db->beginTransaction();
        $a = rows($db, "SELECT id, position FROM $resource WHERE id = ? FOR UPDATE", [$data['first'] ?? ''])[0] ?? null;
        $b = rows($db, "SELECT id, position FROM $resource WHERE id = ? FOR UPDATE", [$data['second'] ?? ''])[0] ?? null;
        if (!$a || !$b) fail('Record not found.', 404);
        $db->prepare("UPDATE $resource SET position = ? WHERE id = ?")->execute([$b['position'], $a['id']]);
        $db->prepare("UPDATE $resource SET position = ? WHERE id = ?")->execute([$a['position'], $b['id']]);
        $db->commit();
        respond(['ok' => true]);
    }

    if ($resource === 'event' && $method === 'GET') {
        $db = database();
        $event = rows($db, 'SELECT * FROM events WHERE slug = ? AND published = 1 LIMIT 1', [(string) ($_GET['slug'] ?? '')])[0] ?? null;
        if (!$event) respond(null);
        $event['published'] = (bool) $event['published'];
        $event['event_images'] = rows($db, 'SELECT * FROM event_images WHERE event_id = ? ORDER BY position, id', [$event['id']]);
        respond($event);
    }
    $tables = ['events','event_images','hero_slides','equipment'];
    if (!in_array($resource, $tables, true)) fail('Unknown endpoint.', 404);
    $admin = ($_GET['admin'] ?? '') === '1' || $resource === 'event_images';
    if ($method !== 'GET') require_admin(true);
    elseif ($admin) require_admin();
    $db = database();
    if ($method === 'GET') {
        if ($resource === 'events') $data = rows($db, 'SELECT * FROM events' . ($admin ? '' : ' WHERE published = 1') . ' ORDER BY event_date DESC, created_at DESC');
        elseif ($resource === 'hero_slides') $data = rows($db, 'SELECT * FROM hero_slides' . ($admin ? '' : ' WHERE enabled = 1') . ' ORDER BY position, id');
        elseif ($resource === 'equipment') $data = rows($db, 'SELECT * FROM equipment' . ($admin ? '' : ' WHERE published = 1') . ' ORDER BY position, id');
        else $data = rows($db, 'SELECT * FROM event_images WHERE event_id = ? ORDER BY position, id', [(string) ($_GET['event_id'] ?? '')]);
        foreach ($data as &$item) foreach (['published','enabled'] as $boolean) if (isset($item[$boolean])) $item[$boolean] = (bool) $item[$boolean];
        respond($data);
    }
    $id = (string) ($_GET['id'] ?? '');
    if ($id && !preg_match('/^[a-f0-9-]{36}$/i', $id)) fail('Invalid record ID.');
    if ($method === 'DELETE') {
        if (!$id) fail('Missing record ID.');
        if ($resource === 'event_images') {
            $image = rows($db, 'SELECT event_id FROM event_images WHERE id = ?', [$id])[0] ?? null;
            if ($image) {
                $event = rows($db, 'SELECT published FROM events WHERE id = ?', [$image['event_id']])[0] ?? null;
                $count = rows($db, 'SELECT COUNT(*) AS total FROM event_images WHERE event_id = ?', [$image['event_id']])[0]['total'] ?? 0;
                if ($event && $event['published'] && $count <= 1) fail('Keep at least one photo on a published event. Unpublish it first.');
            }
        }
        $db->prepare("DELETE FROM $resource WHERE id = ?")->execute([$id]);
        respond(['ok' => true]);
    }
    if (!in_array($method, ['POST', 'PUT'], true)) fail('Method not allowed.', 405);
    if ($method === 'PUT' && !$id) fail('Missing record ID.');
    $data = fields_for($resource, json_input(), $db, $id ?: null);
    if (!$data) fail('No fields to save.');
    if ($method === 'POST') {
        $id = uuid();
        $data = ['id' => $id] + $data;
        $columns = array_keys($data);
        $sql = "INSERT INTO $resource (" . implode(',', $columns) . ') VALUES (' . implode(',', array_fill(0, count($columns), '?')) . ')';
        $db->prepare($sql)->execute(array_values($data));
    } else {
        $sets = implode(',', array_map(fn($field) => "$field = ?", array_keys($data)));
        $query = $db->prepare("UPDATE $resource SET $sets WHERE id = ?");
        $query->execute([...array_values($data), $id]);
        if ($query->rowCount() === 0 && !rows($db, "SELECT id FROM $resource WHERE id = ?", [$id])) fail('Record not found.', 404);
    }
    respond(['id' => $id]);
} catch (PDOException $error) {
    error_log($error);
    if ($error->getCode() === '23000') fail('A record with this value already exists, or a related record is missing.');
    fail('A database error occurred.', 500);
} catch (Throwable $error) {
    error_log($error);
    fail('The server could not complete this request.', 500);
}
