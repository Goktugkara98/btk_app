-- Basit Soru Bankası Veritabanı Şeması
-- Tek sınıf, tek ders, tek konu için

-- ========================================
-- 1. SORULAR TABLOSU
-- ========================================

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    explanation TEXT,
    difficulty ENUM('kolay', 'orta', 'zor') DEFAULT 'orta',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. SORU SEÇENEKLERİ TABLOSU
-- ========================================

CREATE TABLE question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    option_letter CHAR(1) NOT NULL, -- A, B, C, D
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ========================================
-- 3. ÖRNEK VERİLER
-- ========================================

-- Örnek sorular
INSERT INTO questions (question_text, explanation, difficulty) VALUES
('Aşağıdaki sayılardan hangisi en büyüktür?', 'Sayıları karşılaştırırken basamak sayısına bakılır. 1250 sayısı 4 basamaklı, diğerleri 3 basamaklıdır.', 'kolay'),
('Hangi sayı 1000 ile 2000 arasındadır?', '1000 ile 2000 arasındaki sayılar 4 basamaklıdır ve 1 ile başlar.', 'orta'),
('1500 sayısının yarısı kaçtır?', 'Bir sayının yarısını bulmak için 2''ye böleriz. 1500 ÷ 2 = 750', 'kolay');

-- Soru 1 için seçenekler
INSERT INTO question_options (question_id, option_text, is_correct, option_letter) VALUES
(1, '1250', true, 'A'),
(1, '999', false, 'B'),
(1, '850', false, 'C'),
(1, '750', false, 'D');

-- Soru 2 için seçenekler
INSERT INTO question_options (question_id, option_text, is_correct, option_letter) VALUES
(2, '950', false, 'A'),
(2, '1500', true, 'B'),
(2, '2100', false, 'C'),
(2, '800', false, 'D');

-- Soru 3 için seçenekler
INSERT INTO question_options (question_id, option_text, is_correct, option_letter) VALUES
(3, '500', false, 'A'),
(3, '750', true, 'B'),
(3, '1000', false, 'C'),
(3, '1250', false, 'D');

-- ========================================
-- 4. YARDIMCI SORGULAR
-- ========================================

-- Tüm soruları seçenekleriyle birlikte getir
SELECT 
    q.id,
    q.question_text,
    q.explanation,
    q.difficulty,
    GROUP_CONCAT(
        CONCAT(qo.option_letter, ') ', qo.option_text, 
               CASE WHEN qo.is_correct THEN ' (DOĞRU)' ELSE '' END
        ) ORDER BY qo.option_letter SEPARATOR ' | '
    ) as options
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
WHERE q.is_active = true
GROUP BY q.id
ORDER BY q.id;

-- Zorluk seviyesine göre soru sayıları
SELECT 
    difficulty,
    COUNT(*) as question_count
FROM questions 
WHERE is_active = true
GROUP BY difficulty; 