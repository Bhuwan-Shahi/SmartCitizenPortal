-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Pending',
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  date_submitted DATE DEFAULT CURRENT_DATE,
  upvotes INTEGER DEFAULT 0,
  user_id UUID,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_date ON complaints(date_submitted);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints(latitude, longitude);

-- Enable Row Level Security
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your use case)
CREATE POLICY "Allow public read access" ON complaints
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON complaints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON complaints
  FOR UPDATE USING (true);
