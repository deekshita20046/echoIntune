-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 5,
  note TEXT,
  date DATE NOT NULL,
  probability DECIMAL(5,4) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, date);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_mood_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_mood_entries_updated_at ON mood_entries;
CREATE TRIGGER update_mood_entries_updated_at 
    BEFORE UPDATE ON mood_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_mood_entries_updated_at();

-- Grant permissions to deekshita user
GRANT ALL PRIVILEGES ON TABLE mood_entries TO deekshita;
GRANT USAGE, SELECT ON SEQUENCE mood_entries_id_seq TO deekshita;

SELECT 'mood_entries table created successfully!' as status;

