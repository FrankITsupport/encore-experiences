# VenueBox content and admin roadmap

Last updated: 2026-10-09

## Goal

The client signs in at `/admin` to manage event stories and galleries, hero image or video slides, and equipment text and images. The React site, PHP API, MySQL database, and uploaded files all live on the same cPanel hosting account. The client does not need to use cPanel for routine editing.

## Task path

Check a box when the acceptance condition has been verified. Code written locally is described below; live workflows stay open until tested on the host.

### 0. Scope and hosting

- [x] **P0-01 — Audit the site.** Identify routing, current content, and build settings.
- [x] **P0-02 — Confirm the editing workflow.** One shared admin login; hero videos are uploaded in admin.
- [x] **P0-03 — Confirm cPanel capabilities.** PHP and MySQL/MariaDB are available.
- [x] **P0-04 — Agree on pages.** `/events`, `/events/:slug`, and `/admin`.
- [ ] **P0-05 — Confirm deployment path and media limits.** Identify document root/subfolder and verify the host accepts the chosen video limit.

### 1. cPanel backend

- [x] **P1-01 — Write the MySQL schema.** Events, ordered photos, hero slides, equipment, and one admin account are in `server/schema.sql`.
- [x] **P1-02 — Write the PHP API.** Public read endpoints and authenticated editor endpoints are in `public/api/index.php`.
- [x] **P1-03 — Add upload handling.** Validate MIME type and size on the server, generate safe file names, and block script execution in the upload directory.
- [x] **P1-04 — Add admin security.** Password hashes, login throttling, session cookies, CSRF checks, and server side publication rules are implemented locally.
- [x] **P1-05 — Configure a real database.** `venuebox_website` and `venuebox_venuebox` are configured in cPanel, the schema is imported, the private config is outside `public_html`, and the user confirmed the admin login works.
- [ ] **P1-06 — Verify API permissions on live hosting.** Test anonymous reads, blocked writes/uploads, login, and draft privacy with direct requests.

### 2. Admin editing

- [x] **P2-01 — Build sign-in shell.** Login, logout, loading and error states are implemented locally.
- [x] **P2-02 — Build event editor.** Draft/publish, write-up, cover, ordered gallery photos, alt text, and captions are implemented locally.
- [x] **P2-03 — Build hero editor.** Image/video slides, poster, copy, order, and visibility are implemented locally.
- [x] **P2-04 — Build equipment editor.** Text, image, tag, order, and publication are implemented locally.
- [ ] **P2-05 — Verify editing on cPanel.** Create, edit, reorder, publish, and delete real records and uploads.

### 3. Public website

- [x] **P3-01 — Build events gallery and detail page.** Implemented locally.
- [x] **P3-02 — Build hero carousel and equipment loading.** Implemented locally with starter content fallback.
- [ ] **P3-03 — Verify public pages.** Check direct links and refreshes, draft privacy, responsive media, keyboard controls, and video playback on the real host.

### 4. Handover

- [ ] **P4-01 — Configure backups.** Include database and uploaded files; perform one restore check.
- [ ] **P4-02 — Add launch content.** Import client events and approved media.
- [x] **P4-03 — Give client editing guide.** See [client editing guide](client-editing-guide.md) for the login and event/hero/equipment workflow.
- [x] **P4-04 — Prepare GitHub automation.** The workflow is on GitHub `main`; its first build succeeded. The SSH deployment job is gated off until hosting access is ready.
- [ ] **P4-05 — Connect and verify automatic deployment.** Configure cPanel SSH and GitHub secrets/variables, run the first live deployment, then confirm later pushes update the site without touching uploads.

## Current limits and decisions

- Images are capped at 12 MB; hero videos at 50 MB in application code. cPanel's PHP and web server limits must also permit this. A 50 MB upload is a single request and may need a lower limit on shared hosting.
- Images are resized in the browser before upload where possible. Uploaded videos are served directly by the host. Heavy traffic or large video files may call for a media service later.
- Uploaded files remain after deleting a content record, to avoid breaking other references. File cleanup and an upload library can be added after the core workflow is verified.
- The one login is shared by you and the client as requested. This cannot provide an individual audit trail; a second login can be added later.

See [cPanel setup](cpanel-setup.md) for deployment steps.

## Local verification on 2026-10-07

- Production build, TypeScript check, PHP syntax check, and Vitest passed. ESLint reported no errors and seven existing Fast Refresh warnings in shared UI components.
- Browser smoke checks covered the homepage and events page at mobile and desktop widths, a published event detail page with a gallery, and all three admin editor tabs using mocked API responses. The homepage no longer scrolls horizontally.
- An unsigned PHP session returned `null`; anonymous write and upload requests returned HTTP 401.
- Both cPanel ZIPs were rebuilt. The website archive now uses forward slash paths and contains the API, starter media, and upload protection file.

## Live verification on 2026-10-09

- The homepage, `/events`, and `/admin` all returned HTTP 200 from the cPanel site. The hero and equipment API endpoints returned HTTP 200, and the events endpoint returned an empty list before content was added.
- The user confirmed the database-backed admin sign-in works. Anonymous event writes and media uploads returned HTTP 401.
- Real image/video uploads, editing and publishing records, draft privacy, video playback, host upload limits, and backups still need live checks.
- Automatic deployment remains disabled until the hosting provider confirms SSH shell access and port. See [automatic deployment](automated-deploy.md).
