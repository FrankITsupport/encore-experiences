# cPanel-only setup and deployment

The client edits the site at `https://YOUR_DOMAIN/admin`. cPanel is used only for initial setup, backups, and technical maintenance.

For builds and deployments triggered automatically by pushes to GitHub `main`, follow [automatic deployment](automated-deploy.md). The instructions below also support manual ZIP uploads.

## If an older site is live

1. In cPanel **Domains**, note the live domain's document root. Do not extract the new ZIP there yet.
2. Use **Backup Wizard** to download a full account backup, or at least the home directory and every database used by the old site. Keep a copy away from the hosting account.
3. If your plan allows another domain/subdomain, create a staging subdomain such as `preview.YOUR_DOMAIN` with its **own document root**. Do not select **Share document root**. The ready-made website ZIP uses root-relative URLs, so a staging subdomain works without rebuilding; a path such as `YOUR_DOMAIN/preview/` needs a separate subfolder build.
4. Upload and extract `venuebox-website.zip` into the staging document root, then complete the database and admin setup below. Test public pages, sign-in, and a real image and video upload on staging.
5. For the final switch, identify which files belong to the old site before moving them out of the live document root. Do not merge the two sites' `index.php`, `index.html`, or `.htaccess` files. Keep other domains' folders and existing `uploads/` data. Copy the tested new site files into the live document root, then test the live URLs again. If unsure which files are safe to move, inspect the live document root with your developer first.

If the staging subdomain and live domain share one database, edits made on staging will also appear on the live site once switched. Keep staging private while preparing content.

## Before uploading

1. Confirm the domain document root in cPanel and that it runs PHP 8.1 or newer with `pdo_mysql`, `fileinfo`, and `session` support.
2. In **Database Wizard**, create a MySQL/MariaDB database and database user with access to that database. Note the full names, including any cPanel account prefix.
3. For a manual first deployment, import `server/schema.sql` using phpMyAdmin. For automatic deployment, the migration runner creates these tables on the first run, so this import is optional.
4. Copy `server/venuebox-config.example.php` to `/home/YOUR_CPANEL_USER/venuebox-config.php`, fill in the database settings, and keep that file **outside** `public_html` or the domain document root. The API looks in the hosting account's `HOME` directory by default. If that environment variable is unavailable, set `VENUEBOX_CONFIG` to the absolute config path in the PHP environment. Do not put the config file in `dist`, `public`, or Git.
5. Create the admin login from cPanel Terminal: upload `server/create-admin.php` outside the document root, then run `php create-admin.php /home/YOUR_CPANEL_USER/venuebox-config.php`. Enter the email and a password of at least 12 characters. This writes a password hash to `admin_users`. Remove the uploaded setup script afterward. If Terminal is unavailable, extract the setup ZIP on the Windows computer and double-click `scripts/create-admin-sql.cmd`. It prompts for the admin email and a password locally, then creates a `venuebox-admin-*.sql` file on the Desktop. Import that file into the website database with phpMyAdmin. After signing in, delete the Desktop SQL file. Do not upload the helper scripts or a plaintext password to `public_html`.

## Upload the website

1. Run `npm install` and `npm run build` locally. Set `VITE_BASE_PATH` to `/` for a domain root or `/subfolder/` for a subfolder before building. Run `powershell -ExecutionPolicy Bypass -File scripts/package-cpanel.ps1` to recreate the two ZIPs after future builds.
2. Upload **the contents** of `dist` to the document root or chosen subfolder. The ready-made `release/venuebox-website.zip` contains the same files. FileZilla transfers ZIPs but does not extract them: extract locally before transfer, or extract on the server with cPanel File Manager. If you extract on the server, delete the ZIP from the public website folder afterward. Include hidden `.htaccess` files, `api/index.php`, and `uploads/.htaccess`. Keep the separate setup ZIP outside the document root. Enable HTTPS and redirect HTTP to HTTPS before handing over the login.
3. Ensure PHP can write to `uploads/` and its `events`, `hero`, and `equipment` subfolders. The API creates those subfolders on first upload. Do not overwrite or delete existing uploaded files during later frontend deployments.
4. Visit `/api/index.php?action=session`; while signed out it should return `null`. Visit `/admin`, sign in, and add a draft event, gallery photo, hero slide, and equipment edit.
5. Test `/events`, a published event URL, and `/admin` by opening each directly and refreshing. The supplied root `.htaccess` routes React pages to `index.html` while leaving API and media files alone.

## Video and backup settings

The app currently allows images up to 12 MB and hero MP4/WebM videos up to 50 MB. Set PHP `upload_max_filesize` to at least `50M`, `post_max_size` above that (for example `64M`), and check the hosting provider's web server and account limits. If the host cannot reliably accept 50 MB requests, lower the app limit and use shorter/compressed video. Uploads use a single HTTP request with progress; they cannot resume after a disconnect.

Back up both the MySQL database and the document root's `uploads/` folder. A frontend build alone does not include uploaded content. Use cPanel Backup Wizard or your host's backup service and test a restore before launch.

## Local development

The frontend alone runs with starter hero and equipment images via `npm run dev`. For admin/API development, run PHP with a local MySQL database and a local config file. Start `php -S 127.0.0.1:18081 -t public`, then start Vite. Vite proxies `/api` to the PHP server. Set `VENUEBOX_CONFIG` to the local config path if needed.
