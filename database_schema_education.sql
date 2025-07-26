-- Eğitim Odaklı Soru Bankası Sistemi Veritabanı Şeması
-- PostgreSQL veya MySQL için uyumlu

-- ========================================
-- EĞİTİM HİYERARŞİSİ TABLOLARI
-- ========================================

-- Eğitim seviyeleri (İlkokul, Ortaokul, Lise, Üniversite)
CREATE TABLE education_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'İlkokul', 'Ortaokul', 'Lise', 'Üniversite'
    short_name VARCHAR(10) NOT NULL UNIQUE, -- 'ilk', 'orta', 'lise', 'uni'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sınıf seviyeleri
CREATE TABLE grade_levels (
    id SERIAL PRIMARY KEY,
    education_level_id INTEGER REFERENCES education_levels(id) ON DELETE CASCADE,
    name VARCHAR(20) NOT NULL, -- '1. Sınıf', '2. Sınıf', '9. Sınıf', '10. Sınıf'
    short_name VARCHAR(10) NOT NULL, -- '1', '2', '9', '10'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(education_level_id, name)
);

-- Dersler
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'Matematik', 'Türkçe', 'Fen Bilgisi', 'Sosyal Bilgiler'
    short_name VARCHAR(20) NOT NULL UNIQUE, -- 'mat', 'turk', 'fen', 'sos'
    description TEXT,
    icon VARCHAR(50), -- 'bi-calculator', 'bi-book', 'bi-atom', 'bi-globe'
    color VARCHAR(7) DEFAULT '#4a6cf7',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sınıf-Ders ilişkisi (hangi sınıfta hangi dersler var)
CREATE TABLE grade_subjects (
    id SERIAL PRIMARY KEY,
    grade_level_id INTEGER REFERENCES grade_levels(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grade_level_id, subject_id)
);

-- Konular (Units/Topics)
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL, -- 'Sayılar', 'Geometri', 'Cebir', 'Dilbilgisi'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alt konular (Subtopics)
CREATE TABLE subtopics (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL, -- 'Doğal Sayılar', 'Kesirler', 'Üçgenler', 'Fiiller'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- SORU TİPLERİ VE KATEGORİLERİ
-- ========================================

-- Soru tipleri
CREATE TABLE question_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'Çoktan Seçmeli', 'Doğru-Yanlış', 'Boşluk Doldurma'
    short_name VARCHAR(20) NOT NULL UNIQUE, -- 'multiple_choice', 'true_false', 'fill_blank'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zorluk seviyeleri
CREATE TABLE difficulty_levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE, -- 'Kolay', 'Orta', 'Zor', 'Çok Zor'
    short_name VARCHAR(10) NOT NULL UNIQUE, -- 'easy', 'medium', 'hard', 'expert'
    description TEXT,
    color VARCHAR(7) DEFAULT '#28a745', -- Yeşil, Sarı, Turuncu, Kırmızı
    points_multiplier DECIMAL(3,2) DEFAULT 1.00, -- Puan çarpanı
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- SORU BANKASI TABLOLARI
-- ========================================

-- Ana soru tablosu
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    grade_level_id INTEGER REFERENCES grade_levels(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
    subtopic_id INTEGER REFERENCES subtopics(id) ON DELETE CASCADE,
    question_type_id INTEGER REFERENCES question_types(id) ON DELETE CASCADE,
    difficulty_level_id INTEGER REFERENCES difficulty_levels(id) ON DELETE CASCADE,
    
    -- Soru içeriği
    question_text TEXT NOT NULL,
    explanation TEXT, -- Doğru cevabın açıklaması
    
    -- Puanlama
    base_points INTEGER DEFAULT 10, -- Temel puan
    time_limit INTEGER DEFAULT 60, -- Saniye cinsinden
    
    -- Durum
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false, -- Onay durumu
    is_featured BOOLEAN DEFAULT false, -- Öne çıkan soru
    
    -- İstatistikler
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    average_time_taken INTEGER DEFAULT 0,
    
    -- Metadata
    created_by INTEGER, -- users tablosuna referans
    approved_by INTEGER, -- users tablosuna referans
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soru seçenekleri (Çoktan seçmeli için)
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    option_letter CHAR(1) NOT NULL, -- A, B, C, D, E
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soru etiketleri (Tags)
CREATE TABLE question_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6c757d',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soru-Etiket ilişkisi
CREATE TABLE question_tag_relations (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES question_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, tag_id)
);

-- Soru medya dosyaları
CREATE TABLE question_media (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    media_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    file_size INTEGER, -- Byte cinsinden
    mime_type VARCHAR(100),
    alt_text VARCHAR(200),
    caption TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- İNDEKSLER
-- ========================================

-- Performans için indeksler
CREATE INDEX idx_grade_levels_education ON grade_levels(education_level_id);
CREATE INDEX idx_grade_subjects_grade ON grade_subjects(grade_level_id);
CREATE INDEX idx_grade_subjects_subject ON grade_subjects(subject_id);
CREATE INDEX idx_subtopics_topic ON subtopics(topic_id);

CREATE INDEX idx_questions_grade ON questions(grade_level_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_subtopic ON questions(subtopic_id);
CREATE INDEX idx_questions_type ON questions(question_type_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level_id);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_approved ON questions(is_approved);
CREATE INDEX idx_questions_featured ON questions(is_featured);

CREATE INDEX idx_question_options_question ON question_options(question_id);
CREATE INDEX idx_question_options_correct ON question_options(is_correct);

CREATE INDEX idx_question_tag_relations_question ON question_tag_relations(question_id);
CREATE INDEX idx_question_tag_relations_tag ON question_tag_relations(tag_id);

CREATE INDEX idx_question_media_question ON question_media(question_id);
CREATE INDEX idx_question_media_type ON question_media(media_type);

-- ========================================
-- ÖRNEK VERİLER
-- ========================================

-- Eğitim seviyeleri
INSERT INTO education_levels (name, short_name, description, sort_order) VALUES
('İlkokul', 'ilk', 'İlkokul eğitim seviyesi', 1),
('Ortaokul', 'orta', 'Ortaokul eğitim seviyesi', 2),
('Lise', 'lise', 'Lise eğitim seviyesi', 3),
('Üniversite', 'uni', 'Üniversite eğitim seviyesi', 4);

-- Sınıf seviyeleri
INSERT INTO grade_levels (education_level_id, name, short_name, sort_order) VALUES
-- İlkokul
(1, '1. Sınıf', '1', 1),
(1, '2. Sınıf', '2', 2),
(1, '3. Sınıf', '3', 3),
(1, '4. Sınıf', '4', 4),
-- Ortaokul
(2, '5. Sınıf', '5', 5),
(2, '6. Sınıf', '6', 6),
(2, '7. Sınıf', '7', 7),
(2, '8. Sınıf', '8', 8),
-- Lise
(3, '9. Sınıf', '9', 9),
(3, '10. Sınıf', '10', 10),
(3, '11. Sınıf', '11', 11),
(3, '12. Sınıf', '12', 12);

-- Dersler
INSERT INTO subjects (name, short_name, description, icon, color, sort_order) VALUES
('Matematik', 'mat', 'Matematik dersi', 'bi-calculator', '#dc3545', 1),
('Türkçe', 'turk', 'Türkçe dersi', 'bi-book', '#28a745', 2),
('Fen Bilgisi', 'fen', 'Fen Bilgisi dersi', 'bi-atom', '#17a2b8', 3),
('Sosyal Bilgiler', 'sos', 'Sosyal Bilgiler dersi', 'bi-globe', '#ffc107', 4),
('İngilizce', 'ing', 'İngilizce dersi', 'bi-translate', '#6f42c1', 5);

-- Sınıf-Ders ilişkileri (5. sınıf için örnek)
INSERT INTO grade_subjects (grade_level_id, subject_id) VALUES
(5, 1), -- 5. Sınıf Matematik
(5, 2), -- 5. Sınıf Türkçe
(5, 3), -- 5. Sınıf Fen Bilgisi
(5, 4), -- 5. Sınıf Sosyal Bilgiler
(5, 5); -- 5. Sınıf İngilizce

-- Konular (Matematik için)
INSERT INTO topics (subject_id, name, sort_order) VALUES
(1, 'Sayılar', 1),
(1, 'Geometri', 2),
(1, 'Cebir', 3),
(1, 'Ölçme', 4);

-- Alt konular (Sayılar için)
INSERT INTO subtopics (topic_id, name, sort_order) VALUES
(1, 'Doğal Sayılar', 1),
(1, 'Kesirler', 2),
(1, 'Ondalık Sayılar', 3),
(1, 'Yüzdeler', 4);

-- Soru tipleri
INSERT INTO question_types (name, short_name, description) VALUES
('Çoktan Seçmeli', 'multiple_choice', 'Tek doğru cevaplı çoktan seçmeli sorular'),
('Çoklu Seçim', 'multiple_select', 'Birden fazla doğru cevaplı sorular'),
('Doğru-Yanlış', 'true_false', 'Doğru veya yanlış soruları'),
('Boşluk Doldurma', 'fill_blank', 'Boşluk doldurma soruları'),
('Eşleştirme', 'matching', 'Eşleştirme soruları');

-- Zorluk seviyeleri
INSERT INTO difficulty_levels (name, short_name, description, color, points_multiplier, sort_order) VALUES
('Kolay', 'easy', 'Kolay seviye sorular', '#28a745', 1.00, 1),
('Orta', 'medium', 'Orta seviye sorular', '#ffc107', 1.25, 2),
('Zor', 'hard', 'Zor seviye sorular', '#fd7e14', 1.50, 3),
('Çok Zor', 'expert', 'Çok zor seviye sorular', '#dc3545', 2.00, 4);

-- Örnek soru (5. Sınıf Matematik - Doğal Sayılar)
INSERT INTO questions (
    grade_level_id, subject_id, topic_id, subtopic_id, 
    question_type_id, difficulty_level_id, 
    question_text, explanation, base_points
) VALUES (
    5, 1, 1, 1, -- 5. Sınıf, Matematik, Sayılar, Doğal Sayılar
    1, 1, -- Çoktan seçmeli, Kolay
    'Aşağıdaki sayılardan hangisi en büyüktür?',
    'Sayıları karşılaştırırken basamak sayısına ve her basamaktaki rakamın değerine bakılır. 1250 sayısı 4 basamaklı, diğerleri 3 basamaklıdır.',
    10
);

-- Soru seçenekleri
INSERT INTO question_options (question_id, option_text, is_correct, option_letter, sort_order) VALUES
(1, '1250', true, 'A', 1),
(1, '999', false, 'B', 2),
(1, '850', false, 'C', 3),
(1, '750', false, 'D', 4);

-- Soru etiketleri
INSERT INTO question_tags (name, description, color) VALUES
('Temel', 'Temel seviye sorular', '#28a745'),
('Kritik', 'Kritik konular', '#dc3545'),
('Sınav', 'Sınav odaklı sorular', '#ffc107'),
('Günlük Hayat', 'Günlük hayatla ilgili sorular', '#17a2b8'),
('Problem Çözme', 'Problem çözme becerisi gerektiren sorular', '#6f42c1');

-- ========================================
-- GÖRÜNÜMLER (VIEWS)
-- ========================================

-- Soru detay görünümü
CREATE VIEW question_details AS
SELECT 
    q.id,
    q.question_text,
    q.explanation,
    q.base_points,
    q.time_limit,
    q.is_active,
    q.is_approved,
    q.is_featured,
    q.total_attempts,
    q.correct_attempts,
    q.average_time_taken,
    
    -- Eğitim bilgileri
    el.name as education_level,
    gl.name as grade_level,
    s.name as subject,
    t.name as topic,
    st.name as subtopic,
    
    -- Soru tipi ve zorluk
    qt.name as question_type,
    dl.name as difficulty_level,
    dl.color as difficulty_color,
    dl.points_multiplier,
    
    -- Hesaplanmış alanlar
    CASE 
        WHEN q.total_attempts > 0 
        THEN ROUND((q.correct_attempts::DECIMAL / q.total_attempts) * 100, 2)
        ELSE 0 
    END as success_rate,
    
    (q.base_points * dl.points_multiplier) as final_points,
    
    q.created_at,
    q.updated_at
FROM questions q
JOIN grade_levels gl ON q.grade_level_id = gl.id
JOIN education_levels el ON gl.education_level_id = el.id
JOIN subjects s ON q.subject_id = s.id
JOIN topics t ON q.topic_id = t.id
JOIN subtopics st ON q.subtopic_id = st.id
JOIN question_types qt ON q.question_type_id = qt.id
JOIN difficulty_levels dl ON q.difficulty_level_id = dl.id
WHERE q.is_active = true;

-- ========================================
-- TRIGGER'LAR
-- ========================================

-- Soru istatistiklerini güncelleyen trigger
CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Bu fonksiyon quiz_attempts tablosundan sonra çağrılacak
    -- Şimdilik boş bırakıyoruz, daha sonra implement edeceğiz
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- YORUMLAR
-- ========================================

/*
Bu şema eğitim odaklı bir soru bankası sistemi için tasarlanmıştır.

Özellikler:
- Eğitim seviyesi hiyerarşisi (İlkokul > 5. Sınıf > Matematik > Sayılar > Doğal Sayılar)
- Çoktan seçmeli sorular için optimize edilmiş
- Her soru için 4 yanlış, 1 doğru cevap
- Zorluk seviyeleri ve puan çarpanları
- Etiket sistemi
- Medya desteği
- İstatistik takibi

Kullanım:
1. Önce eğitim seviyesi ve sınıf seçilir
2. Ders seçilir
3. Konu ve alt konu seçilir
4. Soru tipi ve zorluk seviyesi belirlenir
5. Soru eklenir

Gelecek geliştirmeler:
- Quiz oluşturma sistemi
- Kullanıcı yönetimi
- İstatistik ve raporlama
- Admin paneli
*/ 