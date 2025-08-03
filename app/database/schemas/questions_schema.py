# =============================================================================
# QUESTIONS TABLE SCHEMA
# =============================================================================
# Sorular tablosu için Python şeması
# =============================================================================

QUESTIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    topic_id INT NOT NULL,
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    question_type ENUM('multiple_choice', 'true_false', 'fill_blank', 'essay') DEFAULT 'multiple_choice',
    points INT DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    INDEX idx_questions_topic (topic_id),
    INDEX idx_questions_difficulty (difficulty_level),
    INDEX idx_questions_type (question_type),
    INDEX idx_questions_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""

QUESTIONS_SAMPLE_DATA = """
INSERT INTO questions (text, topic_id, difficulty_level, question_type, points) VALUES
-- Matematik Soruları (Sayılar konusu - topic_id: 1)
('5 + 3 = ?', 1, 'easy', 'multiple_choice', 1),
('12 x 4 = ?', 1, 'medium', 'multiple_choice', 2),
('25 ÷ 5 = ?', 1, 'easy', 'multiple_choice', 1),
('100 - 37 = ?', 1, 'medium', 'multiple_choice', 2),
('8² = ?', 1, 'hard', 'multiple_choice', 3),

-- Matematik Soruları (Kesirler konusu - topic_id: 2)
('1/2 + 1/4 = ?', 2, 'medium', 'multiple_choice', 2),
('3/4 x 2/3 = ?', 2, 'hard', 'multiple_choice', 3),
('2/5 ÷ 1/5 = ?', 2, 'hard', 'multiple_choice', 3),
('1/3 + 2/3 = ?', 2, 'easy', 'multiple_choice', 1),
('5/6 - 1/6 = ?', 2, 'easy', 'multiple_choice', 1),

-- Türkçe Soruları (Dilbilgisi konusu - topic_id: 6)
('Aşağıdakilerden hangisi bir isimdir?', 6, 'easy', 'multiple_choice', 1),
('"Güzel" kelimesi hangi tür kelimedir?', 6, 'medium', 'multiple_choice', 2),
('Hangi cümlede fiil yanlış çekimlenmiştir?', 6, 'hard', 'multiple_choice', 3),
('Aşağıdakilerden hangisi bir zamirdir?', 6, 'medium', 'multiple_choice', 2),
('"Koşmak" fiilinin şimdiki zaman 1. tekil şahıs çekimi nedir?', 6, 'hard', 'multiple_choice', 3),

-- Fen Bilgisi Soruları (Madde konusu - topic_id: 11)
('Aşağıdakilerden hangisi maddenin fiziksel halidir?', 11, 'easy', 'multiple_choice', 1),
('Suyun donma noktası kaç derecedir?', 11, 'medium', 'multiple_choice', 2),
('Hangi olay fiziksel değişimdir?', 11, 'medium', 'multiple_choice', 2),
('Maddenin en küçük yapı taşı nedir?', 11, 'easy', 'multiple_choice', 1),
('Hangi madde sıvı haldedir?', 11, 'easy', 'multiple_choice', 1)
ON DUPLICATE KEY UPDATE 
    text = VALUES(text),
    difficulty_level = VALUES(difficulty_level),
    points = VALUES(points);
""" 