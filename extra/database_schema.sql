-- Ra3aya Database Schema
-- Create tables for services, nurses, and storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Services table
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_fr TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('nursing', 'material')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nurses table
CREATE TABLE nurses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT NOT NULL,
    rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can restrict these later)
CREATE POLICY "Enable read access for all users" ON services FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON services FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON services FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON nurses FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON nurses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON nurses FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON nurses FOR DELETE USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nurses_updated_at BEFORE UPDATE ON nurses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO services (title_ar, title_fr, price, category, image_url) VALUES
('رعاية منزلية', 'Soins à domicile', 1500, 'nursing', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300'),
('حقن وريدية', 'Injections IV', 500, 'nursing', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'),
('تغيير الضمادات', 'Pansements', 300, 'nursing', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300'),
('قياس الضغط والسكر', 'Tension et glycémie', 200, 'nursing', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'),
('علاج طبيعي', 'Kinésithérapie', 1000, 'nursing', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300'),
('رعاية الأم والطفل', 'Soins mère-enfant', 800, 'nursing', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300'),
('كرسي متحرك', 'Fauteuil roulant', 25000, 'material', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300'),
('سرير طبي', 'Lit médical', 45000, 'material', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'),
('جهاز قياس الضغط', 'Tensiomètre', 5000, 'material', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300'),
('جهاز أكسجين', 'Concentrateur O2', 65000, 'material', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'),
('عكازات طبية', 'Béquilles', 2000, 'material', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300'),
('طقم الإسعافات الأولية', 'Trousse de premiers secours', 1500, 'material', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300');

INSERT INTO nurses (name, specialty, phone, region, rating, image_url) VALUES
('أحمد ولد محمد', 'تمريض عام', '2225123456', 'نواكشوط', 4.8, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'),
('فاطمة بنت علي', 'تمريض أطفال', '2225789012', 'نواكشوط', 4.9, 'https://images.unsplash.com/photo-1559839734-49b21253024f?w=150'),
('عمر ولد بوعلام', 'علاج طبيعي', '2225345678', 'نواذيبو', 4.7, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'),
('مريم بنت سعيد', 'رعاية كبار السن', '2225901234', 'كيفة', 4.6, 'https://images.unsplash.com/photo-1559839734-49b21253024f?w=150'),
('يوسف ولد حمادي', 'تمريض طارئ', '2225567890', 'آلاك', 4.8, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150'),
('خديجة بنت الشيخ', 'تمريض نسائي', '2225234567', 'روسو', 4.9, 'https://images.unsplash.com/photo-1559839734-49b21253024f?w=150');
