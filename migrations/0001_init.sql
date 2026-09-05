CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  host_token TEXT NOT NULL,
  scale_type TEXT NOT NULL,
  scale_values TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('rough','sprint')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_active_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE stories (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE story_history (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES stories(id),
  room_id TEXT NOT NULL REFERENCES rooms(id),
  story_title TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('rough','sprint')),
  final_point TEXT NOT NULL,
  avg_risk REAL NOT NULL,
  avg_complexity REAL NOT NULL,
  avg_repetition REAL NOT NULL,
  round_count INTEGER NOT NULL DEFAULT 1,
  member_votes_json TEXT,
  finalized_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_stories_room ON stories(room_id);
CREATE INDEX idx_history_room ON story_history(room_id);
CREATE INDEX idx_history_finalized_at ON story_history(finalized_at);
