# VenueBox website

React/Vite frontend for VenueBox with a PHP/MySQL content API for cPanel hosting. Public pages include the homepage and an event gallery. The `/admin` page lets the client's single admin manage events, hero slides, and equipment.

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

The homepage remains viewable without a backend using starter hero and equipment content. To enable admin and published events, follow [cPanel setup](docs/cpanel-setup.md). No third-party backend account is required.

See the [task roadmap](docs/content-admin-roadmap.md) for progress and remaining launch checks.

Automatic build, migration, and cPanel deployment from GitHub `main` are described in the [deployment guide](docs/automated-deploy.md). Deployment stays disabled until the cPanel SSH and database settings are configured.
