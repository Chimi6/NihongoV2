-- Dictionary Schema

-- Main dictionary entries table
CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY,
    term TEXT NOT NULL,              -- Japanese term (kanji/kana)
    reading TEXT NOT NULL,           -- Hiragana/katakana reading
    priority_score INTEGER,          -- Frequency/priority score
    news_freq TEXT,
    is_redirect BOOLEAN DEFAULT FALSE,
    redirects_to INTEGER,
    FOREIGN KEY (redirects_to) REFERENCES entries(id)
);

-- Parts of speech table (expanded with all verb types, adjective types, etc.)
CREATE TABLE IF NOT EXISTS parts_of_speech (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,       -- e.g., 'n', 'v1', 'adj-na'
    priority_score INTEGER,         -- Priority/importance score
    description TEXT,               -- Human readable description
    category TEXT                   -- Broad category (verb, adj, noun, etc.)
);

CREATE TABLE IF NOT EXISTS entry_pos (
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    pos_id INTEGER REFERENCES parts_of_speech(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, pos_id)
);

-- Field/domain categories (math, medicine, computing, etc.)
CREATE TABLE IF NOT EXISTS fields (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,      -- e.g., 'math', 'med', 'comp'
    description TEXT               -- Human readable description
);

CREATE TABLE IF NOT EXISTS entry_fields (
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, field_id)
);

-- Dialects table
CREATE TABLE IF NOT EXISTS dialects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,      -- e.g., 'ksb', 'ktb'
    description TEXT               -- Human readable description
);

CREATE TABLE IF NOT EXISTS entry_dialects (
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    dialect_id INTEGER REFERENCES dialects(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, dialect_id)
);

-- Usage types (formal, colloquial, archaic, etc.)
CREATE TABLE IF NOT EXISTS usage_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,      -- e.g., 'col', 'hon', 'arch'
    description TEXT,              -- Human readable description
    category TEXT                  -- Broad category (formality, time period, etc.)
);

CREATE TABLE IF NOT EXISTS entry_usage (
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    usage_type_id INTEGER REFERENCES usage_types(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, usage_type_id)
);

-- News frequency rankings
CREATE TABLE IF NOT EXISTS news_freq (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    rank_type TEXT NOT NULL,        -- e.g., 'news1k', 'news2k'
    rank_start INTEGER,            -- Start of rank range
    rank_end INTEGER,              -- End of rank range
    UNIQUE(entry_id, rank_type)
);

-- Name entity types
CREATE TABLE IF NOT EXISTS name_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,      -- e.g., 'person', 'place', 'company'
    description TEXT               -- Human readable description
);

CREATE TABLE IF NOT EXISTS entry_names (
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    name_type_id INTEGER REFERENCES name_types(id) ON DELETE CASCADE,
    PRIMARY KEY (entry_id, name_type_id)
);

-- Definitions table (one-to-many with entries)
CREATE TABLE IF NOT EXISTS definitions (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    content TEXT NOT NULL,          -- The English definition
    position INTEGER NOT NULL,      -- Order of definitions
    sense_number INTEGER,          -- Original sense number if available
    UNIQUE(entry_id, position)
);

-- Example sentences (one-to-many with entries)
CREATE TABLE IF NOT EXISTS examples (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    japanese_text TEXT NOT NULL,    -- Japanese example
    english_text TEXT NOT NULL,     -- English translation
    position INTEGER NOT NULL,      -- Order of examples
    UNIQUE(entry_id, position)
);

-- Alternative forms/spellings (one-to-many with entries)
CREATE TABLE IF NOT EXISTS alternative_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    term TEXT NOT NULL,
    reading TEXT NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES entries(id),
    UNIQUE(entry_id, term, reading)
);

-- Cross references between entries (many-to-many)
CREATE TABLE IF NOT EXISTS cross_references (
    from_entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    to_entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    ref_type TEXT,                 -- e.g., 'see also', 'antonym', 'synonym'
    PRIMARY KEY (from_entry_id, to_entry_id)
);

-- Special markers for entries
CREATE TABLE IF NOT EXISTS special_markers (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    marker TEXT NOT NULL,          -- e.g., '⭐', '⚠️', '⛬'
    description TEXT,             -- Meaning of the marker
    UNIQUE(entry_id, marker)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_term ON entries(term);
CREATE INDEX IF NOT EXISTS idx_entries_reading ON entries(reading);
CREATE INDEX IF NOT EXISTS idx_definitions_entry_id ON definitions(entry_id);
CREATE INDEX IF NOT EXISTS idx_examples_entry_id ON examples(entry_id);
CREATE INDEX IF NOT EXISTS idx_news_freq_entry_id ON news_freq(entry_id);
CREATE INDEX IF NOT EXISTS idx_special_markers_entry_id ON special_markers(entry_id);

-- Example data insertion for parts of speech
INSERT INTO parts_of_speech (name, description, category) VALUES
    ('n', 'Noun', 'noun'),
    ('v1', 'Ichidan verb', 'verb'),
    ('v5', 'Godan verb', 'verb'),
    ('adj-i', 'I-adjective', 'adjective'),
    ('adj-na', 'Na-adjective', 'adjective');

-- Example data insertion for usage types
INSERT INTO usage_types (name, description, category) VALUES
    ('uk', 'Usually written using kana alone', 'writing'),
    ('arch', 'Archaic', 'time_period'),
    ('obs', 'Obsolete', 'time_period'),
    ('rare', 'Rare', 'frequency');

-- Example data insertion for fields
INSERT INTO fields (name, description) VALUES
    ('math', 'Mathematics'),
    ('med', 'Medicine'),
    ('comp', 'Computing'),
    ('physics', 'Physics'),
    ('chem', 'Chemistry'),
    ('biol', 'Biology'); 