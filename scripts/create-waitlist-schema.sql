-- Create waitlist table for managing user applications
CREATE TABLE IF NOT EXISTS waitlist_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('creator', 'cooker')),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  -- Creator-specific fields
  social_handle VARCHAR(255),
  cooking_experience VARCHAR(100),
  specialty VARCHAR(255),
  audience_size VARCHAR(50),
  content_type VARCHAR(100),
  goals TEXT,
  
  -- Cooker-specific fields
  kitchen_setup VARCHAR(100),
  cooking_goals TEXT,
  frequency VARCHAR(50),
  challenges TEXT,
  interests VARCHAR(255),
  
  -- Metadata
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_email ON waitlist_entries(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_type ON waitlist_entries(type);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_status ON waitlist_entries(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_entries_submitted_at ON waitlist_entries(submitted_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_waitlist_entries_updated_at 
    BEFORE UPDATE ON waitlist_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow anyone to insert (submit waitlist applications)
CREATE POLICY "Allow public waitlist submissions" ON waitlist_entries
    FOR INSERT WITH CHECK (true);

-- Allow users to read their own entry
CREATE POLICY "Users can view own waitlist entry" ON waitlist_entries
    FOR SELECT USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow service role to do everything (for admin operations)
CREATE POLICY "Service role full access" ON waitlist_entries
    FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON waitlist_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON waitlist_entries TO anon;
GRANT ALL ON waitlist_entries TO service_role;
