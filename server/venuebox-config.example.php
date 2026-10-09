<?php
// Copy to /home/venuebox/venuebox-config.php, outside public_html.
// Replace only the placeholder line with the database user's password.
return [
    'db_host' => 'localhost',
    'db_name' => 'venuebox_website',
    'db_user' => 'venuebox_venuebox',
    'db_password' => <<<'VENUEBOX_DB_PASSWORD'
REPLACE_WITH_DATABASE_PASSWORD
VENUEBOX_DB_PASSWORD,
];
