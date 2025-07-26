-- Quiz Sistemi Veritabanı Şeması
-- PostgreSQL veya MySQL için uyumlu

-- ========================================
-- ANA TABLOLAR
-- ========================================

-- Quiz kategorileri
CREATE TABLE quiz_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#4a6cf7',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz'ler
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES quiz_categories(id),
    difficulty ENUM('kolay', 'orta', 'zor') DEFAULT 'orta',
    duration INTEGER DEFAULT 600, -- saniye cinsinden
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_by INTEGER, -- users tablosuna referans
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz ayarları
CREATE TABLE quiz_settings (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT true,
    show_explanation BOOLEAN DEFAULT true,
    show_correct_answer BOOLEAN DEFAULT true,
    allow_review BOOLEAN DEFAULT true,
    allow_retry BOOLEAN DEFAULT false,
    time_limit_per_question INTEGER DEFAULT 60,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Soru kategorileri
CREATE TABLE question_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES question_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sorular
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES question_categories(id),
    type ENUM('single-choice', 'multiple-choice', 'true-false', 'fill-blank') NOT NULL,
    text TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    difficulty ENUM('kolay', 'orta', 'zor') DEFAULT 'orta',
    time_limit INTEGER DEFAULT 60,
    min_correct INTEGER DEFAULT 1, -- multiple-choice için
    max_correct INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER, -- users tablosuna referans
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seçenekler
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medya dosyaları
CREATE TABLE question_media (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    type ENUM('image', 'video', 'audio') NOT NULL,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(200),
    caption TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İpuçları
CREATE TABLE question_hints (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    cost INTEGER DEFAULT 0, -- Puan kesintisi
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- KULLANICI İLİŞKİLİ TABLOLAR
-- ========================================

-- Kullanıcılar (eğer yoksa)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz denemeleri
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id INTEGER REFERENCES quizzes(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    time_taken INTEGER DEFAULT 0, -- saniye cinsinden
    is_passed BOOLEAN DEFAULT false,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı cevapları
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id),
    selected_options JSON, -- [1, 3] şeklinde seçilen option ID'leri
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0, -- saniye cinsinden
    hints_used INTEGER DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı istatistikleri
CREATE TABLE user_statistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id INTEGER REFERENCES quizzes(id),
    total_attempts INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0,
    total_time_taken INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- İNDEKSLER
-- ========================================

-- Performans için indeksler
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE INDEX idx_question_options_correct ON question_options(is_correct);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_completed ON quiz_attempts(completed_at);

CREATE INDEX idx_user_answers_attempt_id ON user_answers(attempt_id);
CREATE INDEX idx_user_answers_question_id ON user_answers(question_id);

-- ========================================
-- ÖRNEK VERİLER
-- ========================================

-- Kategoriler
INSERT INTO quiz_categories (name, description, icon, color) VALUES
('Genel Kültür', 'Genel kültür soruları', 'bi-book', '#4a6cf7'),
('Bilim', 'Bilim ve teknoloji soruları', 'bi-atom', '#28a745'),
('Tarih', 'Tarih soruları', 'bi-calendar-event', '#dc3545'),
('Coğrafya', 'Coğrafya soruları', 'bi-geo-alt', '#ffc107');

-- Soru kategorileri
INSERT INTO question_categories (name, description) VALUES
('Coğrafya', 'Coğrafya ile ilgili sorular'),
('Tarih', 'Tarih ile ilgili sorular'),
('Bilim', 'Bilim ile ilgili sorular'),
('Astronomi', 'Astronomi ile ilgili sorular'),
('Kimya', 'Kimya ile ilgili sorular');

-- Quiz
INSERT INTO quizzes (title, description, category_id, difficulty, duration, passing_score) VALUES
('Temel Genel Kültür Testi', 'Genel kültür bilginizi test edin!', 1, 'orta', 600, 70);

-- Quiz ayarları
INSERT INTO quiz_settings (quiz_id, shuffle_questions, shuffle_options, show_explanation, time_limit_per_question) VALUES
(1, true, true, true, 60);

-- Sorular
INSERT INTO questions (quiz_id, category_id, type, text, explanation, points, difficulty, time_limit) VALUES
(1, 1, 'single-choice', 'Türkiye''nin başkenti neresidir?', 'Türkiye Cumhuriyeti''nin başkenti 13 Ekim 1923''ten beri Ankara''dır.', 10, 'kolay', 45),
(1, 1, 'multiple-choice', 'Hangileri Dünya''nın en büyük okyanuslarındandır?', 'Büyük Okyanus (Pasifik) ve Atlas Okyanusu (Atlantik) dünyanın en büyük iki okyanusudur.', 15, 'orta', 60),
(1, 4, 'true-false', 'Ay Dünya''nın doğal uydusudur.', 'Evet, Ay Dünya''nın tek doğal uydusudur ve Dünya etrafındaki bir turunu yaklaşık 27.3 günde tamamlar.', 5, 'kolay', 30);

-- Seçenekler
INSERT INTO question_options (question_id, text, is_correct, order_index) VALUES
-- Soru 1
(1, 'İstanbul', false, 1),
(1, 'Ankara', true, 2),
(1, 'İzmir', false, 3),
(1, 'Bursa', false, 4),
-- Soru 2
(2, 'Büyük Okyanus', true, 1),
(2, 'Atlas Okyanusu', true, 2),
(2, 'Hint Okyanusu', false, 3),
(2, 'Kuzey Buz Denizi', false, 4),
(2, 'Akdeniz', false, 5),
-- Soru 3
(3, 'Doğru', true, 1),
(3, 'Yanlış', false, 2);

-- İpuçları
INSERT INTO question_hints (question_id, text, cost, order_index) VALUES
(1, 'M.Ö. 3. yüzyılda kurulmuştur.', 2, 1),
(1, 'Anadolu''nın ortasında yer alır.', 1, 2),
(2, 'Biri ''Pasifik'' olarak da bilinir.', 3, 1); 