-- RLS SETUP FOR NURSES TABLE
-- This ensures that only admins can approve nurses, and only active nurses are shown to users.

-- 1. Enable RLS on the nurses table
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Active Nurses" ON public.nurses;
DROP POLICY IF EXISTS "Nurses Self Registration" ON public.nurses;
DROP POLICY IF EXISTS "Admin Full Access" ON public.nurses;

-- 3. Policy: Anyone can view ONLY 'active' nurses
CREATE POLICY "Public Read Active Nurses" ON public.nurses
FOR SELECT USING (status = 'active');

-- 4. Policy: Anyone can register (INSERT) as 'pending'
-- We use a check to ensure they can't set themselves to 'active' on insert
CREATE POLICY "Nurses Self Registration" ON public.nurses
FOR INSERT WITH CHECK (status = 'pending');

-- 5. Policy: Admin (using service role or specific header/key) has full access
-- Note: In a production environment, you would use service_role or Auth.
-- For this "Frictionless" admin panel, we assume the admin's Supabase client 
-- has bypass RLS or uses a key that can be checked.
-- Since the Admin Panel uses the same Anon key but different logic, 
-- we will use a separate policy for the admin based on a "secret" if possible, 
-- or simply rely on the fact that the Service Role (from Supabase dashboard) bypasses RLS.
