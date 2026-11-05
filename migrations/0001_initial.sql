-- Every row belongs to one account. Visitors only ever see the shared catalog and their own data,
-- so a public demo needs no content moderation.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_salt TEXT,
  password_hash TEXT,
  is_guest INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  handle TEXT NOT NULL DEFAULT '',
  about TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  background TEXT,
  skills TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL,
  expires_at INTEGER
);
CREATE INDEX users_expiry ON users (expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);
CREATE INDEX sessions_expiry ON sessions (expires_at);

CREATE TABLE applications (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE saved_listings (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL,
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE follows (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  team_id TEXT NOT NULL,
  PRIMARY KEY (user_id, team_id)
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX posts_user ON posts (user_id, created_at);

-- post_id is either one of this user's posts or a shared post from the catalog.
CREATE TABLE replies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  person_id TEXT,
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX replies_post ON replies (user_id, post_id, created_at);

CREATE TABLE reactions (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  PRIMARY KEY (user_id, post_id, kind)
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  person_id TEXT NOT NULL,
  from_user INTEGER NOT NULL,
  body TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX messages_thread ON messages (user_id, person_id, created_at);

CREATE TABLE work_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  team TEXT NOT NULL,
  period TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  duration TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX work_history_user ON work_history (user_id, created_at);

CREATE TABLE awards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  game TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  participants TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  medal TEXT NOT NULL DEFAULT 'gold',
  created_at INTEGER NOT NULL
);
CREATE INDEX awards_user ON awards (user_id, created_at);

CREATE TABLE highlights (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '',
  played_on TEXT NOT NULL DEFAULT '',
  views TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
CREATE INDEX highlights_user ON highlights (user_id, created_at);

CREATE TABLE linked_accounts (
  user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  account_key TEXT NOT NULL,
  handle TEXT NOT NULL,
  PRIMARY KEY (user_id, account_key)
);
