-- CLEAN AND UPDATE NURSING SERVICES
-- Run this in your Supabase SQL Editor

-- 1. Remove existing nursing services
DELETE FROM services WHERE category = 'nursing';

-- 2. Insert new nursing services from the provided list
INSERT INTO services (title_ar, title_fr, price, category, image_url) VALUES
('ضمادات القرح الفراشية', 'Pansement de escarres', 800, 'nursing', 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=300'),
('ضمادات مابعد العملية', 'Pansements postopératoires', 600, 'nursing', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300'),
('أخذ عينات الدم', 'Prélèvement sanguin', 500, 'nursing', 'https://images.unsplash.com/photo-1579154235884-3323f4805f1d?w=300'),
('تركيب جهاز البول', 'Sonde urinaire', 500, 'nursing', 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=300'),
('زيارة من أجل أخذ الثوابت الحيوية', 'Visit pour les constantes', 500, 'nursing', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300'),
('حقن (IM / S/C / IV)', 'Injection IM S/C IV', 500, 'nursing', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300'),
('تركيب أنبوب التغذية', 'Sonde nasogastrique', 700, 'nursing', 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=300'),
('حقن وريدي مستمر', 'Perfusion', 600, 'nursing', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300');
