CREATE TABLE IF NOT EXISTS admin_users (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash CHAR(64) NOT NULL PRIMARY KEY,
  failures SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  last_attempt DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS events (
  id CHAR(36) NOT NULL PRIMARY KEY,
  slug VARCHAR(190) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  body MEDIUMTEXT NOT NULL,
  event_date DATE NULL,
  location VARCHAR(255) NOT NULL DEFAULT '',
  cover_path VARCHAR(500) NOT NULL DEFAULT '',
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_public (published, event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS event_images (
  id CHAR(36) NOT NULL PRIMARY KEY,
  event_id CHAR(36) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255) NOT NULL DEFAULT '',
  caption VARCHAR(500) NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_event_images_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_images_order (event_id, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hero_slides (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL,
  media_type ENUM('image','video') NOT NULL DEFAULT 'image',
  media_path VARCHAR(500) NOT NULL,
  poster_path VARCHAR(500) NOT NULL DEFAULT '',
  cta_label VARCHAR(100) NOT NULL DEFAULT '',
  cta_href VARCHAR(500) NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_hero_public (enabled, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipment (
  id CHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_path VARCHAR(500) NOT NULL DEFAULT '',
  tag VARCHAR(100) NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_equipment_public (published, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO hero_slides (id, title, subtitle, media_type, media_path, cta_label, cta_href, position, enabled) VALUES
('00000000-0000-4000-8000-000000000001', 'We Create Unforgettable Experiences', 'From mirror photobooths to 360° video experiences, we transform corporate events into immersive moments that captivate and engage.', 'image', 'static:hero-photobooth.jpg', 'Explore Our Products', '#products', 0, 1);

INSERT IGNORE INTO equipment (id, title, description, image_path, tag, position, published) VALUES
('00000000-0000-4000-8000-000000000101', 'Mirror Photobooth', 'An interactive, full-length mirror that captures stunning photos with custom animations, filters, and branded overlays. A showstopper at any corporate event.', 'static:hero-photobooth.jpg', 'Most Popular', 0, 1),
('00000000-0000-4000-8000-000000000102', '360° Video Booth', 'Step onto the platform and let our rotating camera capture epic slow-motion videos from every angle. Instant social media content your guests will love.', 'static:360-booth.jpg', 'Trending', 1, 1),
('00000000-0000-4000-8000-000000000103', 'LED Screen Displays', 'High-resolution LED screens for presentations, live feeds, and dynamic brand visuals. Available in various sizes for any venue configuration.', 'static:led-screen.jpg', 'Essential', 2, 1),
('00000000-0000-4000-8000-000000000104', 'Stage & Lighting', 'Complete stage platforms with professional lighting rigs, LED dance floors, red carpet setups, and crowd control solutions for a polished event experience.', 'static:event-lighting.jpg', 'Premium', 3, 1);
