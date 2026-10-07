# Automatic deployment from GitHub to cPanel

The repository uses the **`main`** branch. The workflow in `.github/workflows/cpanel-deploy.yml` runs on every push to `main`: install dependencies, lint, type-check, test, build, and save the website artifact. Once enabled, it also connects to cPanel over SSH, applies pending database migrations, uploads the built website, and checks the public API. It does not need Node.js on cPanel.

## VenueBox hosting details confirmed

| Setting | Value |
| --- | --- |
| cPanel user | `venuebox` |
| Live site | `https://venuebox.co.ke` |
| Home directory | `/home/venuebox` |
| Live document root | `/home/venuebox/public_html` |
| Server name in cPanel | `wp25` |
| Shared IP | `102.218.215.20` |
| Likely full server hostname | `wp25.host-ww.net` (resolves to the shared IP; confirm with host) |
| SSH port and shell access | Awaiting hosting-provider confirmation; port 22 timed out from the local machine on 2026-10-07. |

The public deployment key is on the project owner's computer at `C:\Users\USER\.ssh\venuebox_github_deploy.pub`. Its private counterpart is in the same directory without `.pub`. Import and authorize only the public key in cPanel; add the private key to GitHub Actions only after SSH access is confirmed. Do not commit either key.

## One-time cPanel setup

1. Back up the existing live site and its database before the first switch. Confirm the live domain's **Document Root** in cPanel → Domains. The deployment path must be that folder, normally `/home/CPANELUSER/public_html`.
2. Confirm **SSH Access** is enabled for the cPanel account, external SSH connections are permitted, and PHP 8.1+ is available from the shell. The workflow uses SSH, `tar`, and PHP CLI on the host.
3. Create a dedicated SSH key pair for deployment on your computer. Import and **authorize the public key** in cPanel → SSH Access → Manage SSH Keys. Keep the private key on your computer and in a GitHub Actions secret only. Never commit it or send it in chat.
4. Create a new MySQL/MariaDB database and user with Database Wizard. Put a completed `venuebox-config.php` in `/home/CPANELUSER/`, outside `public_html`. Use `server/venuebox-config.example.php` as the template. The workflow will create the tables using its first migration, so manual import of `server/schema.sql` is optional.
5. Create the single admin account once with `server/create-admin.php` using cPanel Terminal. Do this after the first migration has run. Keep the setup script outside the document root and remove it after use.

If the hosting plan has no SSH access, ask the host to enable it before turning on this workflow. FTP can transfer the built files, but this workflow also needs a secure way to run database migrations on the server.

## GitHub repository settings

Go to the repository's **Settings → Secrets and variables → Actions**. Add these repository **variables**:

| Name | Example | Purpose |
| --- | --- | --- |
| `CPANEL_DEPLOY_ENABLED` | `false` initially | Set to `true` only when the account, backup, and paths are ready. |
| `CPANEL_HOST` | `server.example.com` | SSH hostname from the host. |
| `CPANEL_USER` | `cpaneluser` | cPanel SSH username. |
| `CPANEL_PORT` | `22` | SSH port; defaults to 22 if blank. |
| `CPANEL_DEPLOY_PATH` | `/home/cpaneluser/public_html` | Exact live domain document root. |
| `CPANEL_SITE_URL` | `https://example.com` | Live domain used for the post-deploy API check. |

Add these repository **secrets**:

| Name | Contents |
| --- | --- |
| `CPANEL_SSH_PRIVATE_KEY` | Full text of the dedicated SSH private key. |
| `CPANEL_KNOWN_HOSTS` | The SSH host key entry for the host and port, checked against the fingerprint supplied by the hosting provider. |

For a non-default SSH port, the known-hosts entry uses `[hostname]:port` syntax. The workflow verifies the host key and will stop if it does not match. Do not use `StrictHostKeyChecking=no`.

## Turn it on

1. Commit and push the website code and workflow to `main` while `CPANEL_DEPLOY_ENABLED` is `false`. In GitHub → Actions, check that the **build** job succeeds. The deploy job should be skipped.
2. Finish the cPanel database config and SSH settings, confirm the document root, and download a backup of the old site.
3. Set `CPANEL_DEPLOY_ENABLED` to `true`. Run **Actions → Build and deploy to cPanel → Run workflow** on `main` for the first deployment. After that, each push to `main` deploys automatically after the checks pass.
4. Check the site, `/events`, `/admin`, and a real image/video upload. Create the admin login after the initial migration if it does not exist yet.

The deployment extracts the new build into the document root without deleting files that are already there. This preserves `uploads/` and avoids removing other folders in the cPanel account. Old build files can be cleaned up separately after the first successful switch. The private database config is never copied into the website folder or GitHub artifact.

## Database changes and recovery

Put each new database change in a new numbered SQL file in `server/migrations/`, such as `0002_add_field.sql`. Never edit a migration already applied to production; the runner checks its checksum. On each deployment, pending migrations run **before** the new site files are copied. Write changes so the old site code can still run while the migration executes.

MySQL schema changes may not roll back automatically. Back up the database before a schema release. To stop future automatic deployments, set `CPANEL_DEPLOY_ENABLED` to `false`. A Git revert and push can restore older website code; a database rollback needs a restore or a new corrective migration.

The workflow does not create or store a database password, SSH key, or admin password. Those are one-time hosting settings. It also cannot verify live upload limits until deployed to the actual host.
