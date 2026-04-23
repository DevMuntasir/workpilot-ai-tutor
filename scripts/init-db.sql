-- Create study_sets table
CREATE TABLE IF NOT EXISTS study_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source_type TEXT CHECK (source_type IN ('upload', 'paste', 'manual')) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create study_items table (for different study methods)
CREATE TABLE IF NOT EXISTS study_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  method_type TEXT CHECK (method_type IN ('notes', 'multiple_choice', 'flashcards', 'tutor_lesson', 'written_tests', 'fill_blanks')) NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create study_progress table (for tracking user progress)
CREATE TABLE IF NOT EXISTS study_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_set_id UUID NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES study_items(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('unfamiliar', 'learning', 'familiar', 'mastered')) DEFAULT 'unfamiliar',
  attempts INT DEFAULT 0,
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(study_set_id, item_id)
);

-- Create grading_results table
CREATE TABLE IF NOT EXISTS grading_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  overall_score INT,
  feedback JSONB,
  strengths TEXT[],
  improvements TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_study_items_study_set_id ON study_items(study_set_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_study_set_id ON study_progress(study_set_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_status ON study_progress(status);
