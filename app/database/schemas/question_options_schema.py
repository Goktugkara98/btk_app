# =============================================================================
# QUESTION OPTIONS TABLE SCHEMA
# =============================================================================
# Soru seçenekleri tablosu için Python şeması
# =============================================================================

QUESTION_OPTIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    option_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_options_question (question_id),
    INDEX idx_options_correct (is_correct),
    INDEX idx_options_order (option_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

QUESTION_OPTIONS_SAMPLE_DATA = """
INSERT INTO question_options (question_id, text, is_correct, option_order) VALUES
-- 5 + 3 = ? (question_id: 1)
(1, '7', false, 1),
(1, '8', true, 2),
(1, '9', false, 3),
(1, '10', false, 4),

-- 12 x 4 = ? (question_id: 2)
(2, '44', false, 1),
(2, '46', false, 2),
(2, '48', true, 3),
(2, '50', false, 4),

-- 25 ÷ 5 = ? (question_id: 3)
(3, '3', false, 1),
(3, '4', false, 2),
(3, '5', true, 3),
(3, '6', false, 4),

-- 100 - 37 = ? (question_id: 4)
(4, '61', false, 1),
(4, '62', false, 2),
(4, '63', true, 3),
(4, '64', false, 4),

-- 8² = ? (question_id: 5)
(5, '16', false, 1),
(5, '32', false, 2),
(5, '64', true, 3),
(5, '128', false, 4),

-- 1/2 + 1/4 = ? (question_id: 6)
(6, '1/6', false, 1),
(6, '2/6', false, 2),
(6, '3/4', true, 3),
(6, '4/6', false, 4),

-- 3/4 x 2/3 = ? (question_id: 7)
(7, '1/2', true, 1),
(7, '2/3', false, 2),
(7, '3/4', false, 3),
(7, '6/12', false, 4),

-- 2/5 ÷ 1/5 = ? (question_id: 8)
(8, '1/5', false, 1),
(8, '2/5', false, 2),
(8, '2', true, 3),
(8, '10', false, 4),

-- 1/3 + 2/3 = ? (question_id: 9)
(9, '1/6', false, 1),
(9, '2/6', false, 2),
(9, '3/6', false, 3),
(9, '1', true, 4),

-- 5/6 - 1/6 = ? (question_id: 10)
(10, '1/6', false, 1),
(10, '2/3', true, 2),
(10, '4/6', false, 3),
(10, '5/6', false, 4),

-- Aşağıdakilerden hangisi bir isimdir? (question_id: 11)
(11, 'Koşmak', false, 1),
(11, 'Güzel', false, 2),
(11, 'Kitap', true, 3),
(11, 'Hızlı', false, 4),

-- "Güzel" kelimesi hangi tür kelimedir? (question_id: 12)
(12, 'İsim', false, 1),
(12, 'Fiil', false, 2),
(12, 'Sıfat', true, 3),
(12, 'Zamir', false, 4),

-- Hangi cümlede fiil yanlış çekimlenmiştir? (question_id: 13)
(13, 'Ben gidiyorum', false, 1),
(13, 'Sen geliyorsun', false, 2),
(13, 'O okuyor', false, 3),
(13, 'Biz gidiyoruz', false, 4),

-- Aşağıdakilerden hangisi bir zamirdir? (question_id: 14)
(14, 'Ev', false, 1),
(14, 'Ben', true, 2),
(14, 'Güzel', false, 3),
(14, 'Koşmak', false, 4),

-- "Koşmak" fiilinin şimdiki zaman 1. tekil şahıs çekimi nedir? (question_id: 15)
(15, 'Koşuyorum', true, 1),
(15, 'Koşuyorsun', false, 2),
(15, 'Koşuyor', false, 3),
(15, 'Koşuyoruz', false, 4),

-- Aşağıdakilerden hangisi maddenin fiziksel halidir? (question_id: 16)
(16, 'Katı', true, 1),
(16, 'Yanma', false, 2),
(16, 'Çürüme', false, 3),
(16, 'Paslanma', false, 4),

-- Suyun donma noktası kaç derecedir? (question_id: 17)
(17, '-1°C', false, 1),
(17, '0°C', true, 2),
(17, '1°C', false, 3),
(17, '100°C', false, 4),

-- Hangi olay fiziksel değişimdir? (question_id: 18)
(18, 'Kağıdın yanması', false, 1),
(18, 'Suyun buharlaşması', true, 2),
(18, 'Demirin paslanması', false, 3),
(18, 'Sütün ekşimesi', false, 4),

-- Maddenin en küçük yapı taşı nedir? (question_id: 19)
(19, 'Molekül', false, 1),
(19, 'Atom', true, 2),
(19, 'Hücre', false, 3),
(19, 'Proton', false, 4),

-- Hangi madde sıvı haldedir? (question_id: 20)
(20, 'Buz', false, 1),
(20, 'Su', true, 2),
(20, 'Su buharı', false, 3),
(20, 'Kaya', false, 4)
ON DUPLICATE KEY UPDATE 
    text = VALUES(text),
    is_correct = VALUES(is_correct),
    option_order = VALUES(option_order);
""" 