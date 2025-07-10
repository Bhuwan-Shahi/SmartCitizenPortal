-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'department_head')),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  head_user_id UUID REFERENCES users(id),
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add department assignment and admin fields to complaints
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS assigned_department_id UUID REFERENCES departments(id),
ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE,
ADD COLUMN IF NOT EXISTS actual_completion_date DATE;

-- Create complaint_comments table for communication
CREATE TABLE IF NOT EXISTS complaint_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create complaint_status_history table for tracking
CREATE TABLE IF NOT EXISTS complaint_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by_user_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample departments
INSERT INTO departments (name, description, contact_email) VALUES
('Roads & Infrastructure', 'Handles road maintenance, potholes, and infrastructure issues', 'roads@city.gov'),
('Utilities', 'Manages water, electricity, and utility-related complaints', 'utilities@city.gov'),
('Sanitation', 'Waste management and cleanliness issues', 'sanitation@city.gov'),
('Public Safety', 'Safety concerns and emergency issues', 'safety@city.gov'),
('Parks & Recreation', 'Park maintenance and recreational facilities', 'parks@city.gov'),
('Public Transport', 'Bus stops, transportation issues', 'transport@city.gov')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_department ON complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_user ON complaints(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_complaint ON complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_status_history_complaint ON complaint_status_history(complaint_id);

-- Update RLS policies
CREATE POLICY "Allow admin access to users" ON users
  FOR ALL USING (true);

CREATE POLICY "Allow public read access to departments" ON departments
  FOR SELECT USING (true);

CREATE POLICY "Allow admin access to departments" ON departments
  FOR ALL USING (true);

CREATE POLICY "Allow public read access to comments" ON complaint_comments
  FOR SELECT USING (NOT is_internal);

CREATE POLICY "Allow admin access to comments" ON complaint_comments
  FOR ALL USING (true);

CREATE POLICY "Allow admin access to status history" ON complaint_status_history
  FOR ALL USING (true);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_status_history ENABLE ROW LEVEL SECURITY;
