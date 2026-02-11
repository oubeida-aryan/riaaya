-- NEW MIGRATION: ADD LOCATION AND STATUS TO NURSES
-- Run this in your Supabase SQL Editor

ALTER TABLE nurses 
ADD COLUMN lat FLOAT8,
ADD COLUMN lng FLOAT8;

ALTER TABLE nurses 
ADD COLUMN status TEXT DEFAULT 'pending' 
CHECK (status IN ('active', 'pending', 'rejected'));
