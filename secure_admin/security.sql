-- Enable RLS on tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;

-- SERVICES: Public usually strictly Read-Only
CREATE POLICY "Public Services Read" ON services FOR SELECT USING (true);
-- (No public INSERT/UPDATE/DELETE policy means strictly forbidden for anon key)

-- NURSES: Public can Read and Register (Insert), but NOT Update/Delete
CREATE POLICY "Public Nurses Read" ON nurses FOR SELECT USING (true);
CREATE POLICY "Public Nurses Register" ON nurses FOR INSERT WITH CHECK (true);
-- (No public UDPATE/DELETE policy means they can't edit/delete after insertion)

-- STORAGE:
-- Ensure storage bucket 'images' is public
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

-- Allow public access to view images
CREATE POLICY "Public Images Read" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- Allow public to upload images (for receipts/profile pics)
CREATE POLICY "Public Images Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
-- (No public UPDATE/DELETE)
