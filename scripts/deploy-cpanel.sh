#!/usr/bin/env bash
set -euo pipefail

# Runs on a GitHub Actions Linux runner. Requires an existing database config
# outside the document root and SSH access to the cPanel account.
: "${CPANEL_HOST:?Set CPANEL_HOST}"
: "${CPANEL_USER:?Set CPANEL_USER}"
: "${CPANEL_DEPLOY_PATH:?Set CPANEL_DEPLOY_PATH}"
: "${CPANEL_SITE_URL:?Set CPANEL_SITE_URL}"
: "${CPANEL_SSH_PRIVATE_KEY:?Set CPANEL_SSH_PRIVATE_KEY}"
: "${CPANEL_KNOWN_HOSTS:?Set CPANEL_KNOWN_HOSTS}"
CPANEL_PORT="${CPANEL_PORT:-22}"

[[ "$CPANEL_HOST" =~ ^[A-Za-z0-9.-]+$ ]] || { echo 'Invalid cPanel host.' >&2; exit 1; }
[[ "$CPANEL_USER" =~ ^[A-Za-z0-9_-]+$ ]] || { echo 'Invalid cPanel user.' >&2; exit 1; }
[[ "$CPANEL_PORT" =~ ^[0-9]+$ ]] || { echo 'Invalid SSH port.' >&2; exit 1; }
[[ "$CPANEL_DEPLOY_PATH" =~ ^/[A-Za-z0-9_./-]+$ ]] || { echo 'Invalid document root path.' >&2; exit 1; }
[[ "$CPANEL_DEPLOY_PATH" != *'/../'* && "$CPANEL_DEPLOY_PATH" != *'/..' && "$CPANEL_DEPLOY_PATH" != *'/./'* ]] || { echo 'Document root path cannot contain dot segments.' >&2; exit 1; }
[[ "$CPANEL_DEPLOY_PATH" == */public_html || "$CPANEL_DEPLOY_PATH" == */public_html/* ]] || { echo 'Document root must be within public_html.' >&2; exit 1; }
[[ "$CPANEL_SITE_URL" =~ ^https://[A-Za-z0-9.-]+/?$ ]] || { echo 'Set CPANEL_SITE_URL to the HTTPS domain root.' >&2; exit 1; }

test -f dist/index.html
test -f dist/.htaccess
test -f dist/api/index.php
test -f dist/uploads/.htaccess
test -f server/migrate.php
test -d server/migrations
if find dist/uploads -type f ! -name .htaccess -print -quit | grep -q .; then
  echo 'The build unexpectedly contains uploaded media. Stop before deploying it.' >&2
  exit 1
fi

mkdir -p "$HOME/.ssh"
printf '%s\n' "$CPANEL_SSH_PRIVATE_KEY" > "$HOME/.ssh/venuebox_deploy"
printf '%s\n' "$CPANEL_KNOWN_HOSTS" > "$HOME/.ssh/known_hosts"
chmod 700 "$HOME/.ssh"
chmod 600 "$HOME/.ssh/venuebox_deploy" "$HOME/.ssh/known_hosts"

ssh_command=(ssh -i "$HOME/.ssh/venuebox_deploy" -p "$CPANEL_PORT" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes)
remote="$CPANEL_USER@$CPANEL_HOST"

echo 'Checking the cPanel paths and private database config...'
"${ssh_command[@]}" "$remote" "test -d '$CPANEL_DEPLOY_PATH' && test -f \"\$HOME/venuebox-config.php\" && mkdir -p \"\$HOME/venuebox-deploy\""

echo 'Uploading and applying database migrations...'
tar -C server -cf - migrate.php migrations | "${ssh_command[@]}" "$remote" 'cd "$HOME/venuebox-deploy" && tar -xf -'
"${ssh_command[@]}" "$remote" 'php "$HOME/venuebox-deploy/migrate.php" "$HOME/venuebox-config.php"'

echo 'Uploading the built website (existing uploads are retained)...'
tar -C dist -cf - . | "${ssh_command[@]}" "$remote" "cd '$CPANEL_DEPLOY_PATH' && tar -xf -"

echo 'Checking the public API...'
response=$(curl --fail --silent --show-error --location --retry 3 --retry-delay 2 "${CPANEL_SITE_URL%/}/api/index.php?resource=equipment")
[[ "$response" =~ ^[[:space:]]*\[ ]] || { echo 'The public API did not return an equipment list.' >&2; exit 1; }
echo 'Deployment completed.'
