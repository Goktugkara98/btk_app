# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, veritabanı şemasının (tabloların) oluşturulması ve yönetilmesi
# için gerekli geçiş işlemlerini yürüten `Migrations` sınıfını içerir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# 4.0. MIGRATIONS SINIFI
#   4.1. Başlatma ve Bağlantı Sahipliği
#     4.1.1. __init__(self, db_connection)
#   4.2. Dahili Bağlantı Yönetimi
#     4.2.1. _ensure_connection(self)
#     4.2.2. _close_if_owned(self)
#   4.3. Geçiş Metotları (Migration Methods)
#     4.3.1. create_users_table(self)
#     4.3.2. create_education_tables(self)
#     4.3.3. create_question_tables(self)
#     4.3.4. create_sample_data(self)
#   4.4. Ana Geçiş Yöneticisi
#     4.4.1. run_migrations(self)
# 5.0. DOĞRUDAN ÇALIŞTIRMA BLOĞU
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# =============================================================================
from mysql.connector import Error as MySQLError
from typing import Optional
from app.database.db_connection import DatabaseConnection

# =============================================================================
# 4.0. MIGRATIONS SINIFI
# =============================================================================
class Migrations:
    """
    Veritabanı şemasını (tabloları) oluşturmak için geçiş işlemlerini yürütür.
    """

    # -------------------------------------------------------------------------
    # 4.1. Başlatma ve Bağlantı Sahipliği
    # -------------------------------------------------------------------------
    def __init__(self, db_connection: Optional[DatabaseConnection] = None):
        """4.1.1. Sınıfın kurucu metodu. Harici veya dahili bağlantı kullanır."""
        if db_connection:
            self.db: DatabaseConnection = db_connection
            self.own_connection: bool = False
        else:
            self.db: DatabaseConnection = DatabaseConnection()
            self.own_connection: bool = True

    # -------------------------------------------------------------------------
    # 4.2. Dahili Bağlantı Yönetimi
    # -------------------------------------------------------------------------
    def _ensure_connection(self):
        """4.2.1. Veritabanı bağlantısı kapalıysa yeniden kurar."""
        self.db._ensure_connection()

    def _close_if_owned(self):
        """4.2.2. Eğer bağlantı bu sınıf tarafından oluşturulduysa kapatır."""
        if self.own_connection:
            self.db.close()

    # -------------------------------------------------------------------------
    # 4.3. Geçiş Metotları (Migration Methods)
    # -------------------------------------------------------------------------
    def create_users_table(self):
        """4.3.1. `users` tablosunu oluşturur veya var olduğunu doğrular."""
        self._ensure_connection()
        try:
            with self.db as conn:
                query = """
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        email VARCHAR(100) UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(100),
                        is_active BOOLEAN DEFAULT true,
                        role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """
                conn.cursor.execute(query)
                conn.connection.commit()
        except MySQLError:
            raise

    def create_education_tables(self):
        """4.3.2. Eğitim hiyerarşisi tablolarını oluşturur."""
        self._ensure_connection()
        try:
            with self.db as conn:
                # Eğitim seviyeleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS education_levels (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE,
                        short_name VARCHAR(10) NOT NULL UNIQUE,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)

                # Sınıf seviyeleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS grade_levels (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        education_level_id INT NOT NULL,
                        name VARCHAR(20) NOT NULL,
                        short_name VARCHAR(10) NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (education_level_id) REFERENCES education_levels(id) ON DELETE CASCADE,
                        UNIQUE KEY unique_grade (education_level_id, name)
                    )
                """)

                # Dersler
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS subjects (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        short_name VARCHAR(20) NOT NULL UNIQUE,
                        description TEXT,
                        icon VARCHAR(50),
                        color VARCHAR(7) DEFAULT '#4a6cf7',
                        is_active BOOLEAN DEFAULT true,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)

                # Sınıf-Ders ilişkisi
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS grade_subjects (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        grade_level_id INT NOT NULL,
                        subject_id INT NOT NULL,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
                        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                        UNIQUE KEY unique_grade_subject (grade_level_id, subject_id)
                    )
                """)

                # Konular
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS topics (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        subject_id INT NOT NULL,
                        name VARCHAR(200) NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
                    )
                """)

                # Alt konular
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS subtopics (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        topic_id INT NOT NULL,
                        name VARCHAR(200) NOT NULL,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
                    )
                """)

                conn.connection.commit()
        except MySQLError:
            raise

    def create_question_tables(self):
        """4.3.3. Soru bankası tablolarını oluşturur."""
        self._ensure_connection()
        try:
            with self.db as conn:
                # Soru tipleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS question_types (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE,
                        short_name VARCHAR(20) NOT NULL UNIQUE,
                        description TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Zorluk seviyeleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS difficulty_levels (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(20) NOT NULL UNIQUE,
                        short_name VARCHAR(10) NOT NULL UNIQUE,
                        description TEXT,
                        color VARCHAR(7) DEFAULT '#28a745',
                        points_multiplier DECIMAL(3,2) DEFAULT 1.00,
                        is_active BOOLEAN DEFAULT true,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Ana soru tablosu
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS questions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        grade_level_id INT NOT NULL,
                        subject_id INT NOT NULL,
                        topic_id INT NOT NULL,
                        subtopic_id INT NOT NULL,
                        question_type_id INT NOT NULL,
                        difficulty_level_id INT NOT NULL,
                        question_text TEXT NOT NULL,
                        explanation TEXT,
                        base_points INT DEFAULT 10,
                        time_limit INT DEFAULT 60,
                        is_active BOOLEAN DEFAULT true,
                        is_approved BOOLEAN DEFAULT false,
                        is_featured BOOLEAN DEFAULT false,
                        total_attempts INT DEFAULT 0,
                        correct_attempts INT DEFAULT 0,
                        average_time_taken INT DEFAULT 0,
                        created_by INT,
                        approved_by INT,
                        approved_at TIMESTAMP NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (grade_level_id) REFERENCES grade_levels(id) ON DELETE CASCADE,
                        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
                        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
                        FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE,
                        FOREIGN KEY (question_type_id) REFERENCES question_types(id) ON DELETE CASCADE,
                        FOREIGN KEY (difficulty_level_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE
                    )
                """)

                # Soru seçenekleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS question_options (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        question_id INT NOT NULL,
                        option_text TEXT NOT NULL,
                        is_correct BOOLEAN DEFAULT false,
                        option_letter CHAR(1) NOT NULL,
                        sort_order INT DEFAULT 0,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
                    )
                """)

                # Soru etiketleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS question_tags (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(50) NOT NULL UNIQUE,
                        description TEXT,
                        color VARCHAR(7) DEFAULT '#6c757d',
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)

                # Soru-Etiket ilişkisi
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS question_tag_relations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        question_id INT NOT NULL,
                        tag_id INT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
                        FOREIGN KEY (tag_id) REFERENCES question_tags(id) ON DELETE CASCADE,
                        UNIQUE KEY unique_question_tag (question_id, tag_id)
                    )
                """)

                # Soru medya dosyaları
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS question_media (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        question_id INT NOT NULL,
                        media_type ENUM('image', 'video', 'audio', 'document') NOT NULL,
                        file_name VARCHAR(255) NOT NULL,
                        file_path VARCHAR(500) NOT NULL,
                        file_url VARCHAR(500),
                        file_size INT,
                        mime_type VARCHAR(100),
                        alt_text VARCHAR(200),
                        caption TEXT,
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
                    )
                """)

                # Quiz denemeleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS quiz_attempts (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT,
                        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        completed_at TIMESTAMP NULL,
                        score INT DEFAULT 0,
                        max_score INT DEFAULT 0,
                        percentage DECIMAL(5,2) DEFAULT 0,
                        time_taken INT DEFAULT 0,
                        is_passed BOOLEAN DEFAULT false,
                        attempt_number INT DEFAULT 1,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
                    )
                """)

                # Kullanıcı cevapları
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_answers (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        attempt_id INT NOT NULL,
                        question_id INT NOT NULL,
                        selected_options JSON,
                        is_correct BOOLEAN,
                        points_earned INT DEFAULT 0,
                        time_taken INT DEFAULT 0,
                        hints_used INT DEFAULT 0,
                        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
                        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
                    )
                """)

                # Kullanıcı istatistikleri
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS user_statistics (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        user_id INT NOT NULL,
                        total_attempts INT DEFAULT 0,
                        best_score INT DEFAULT 0,
                        average_score DECIMAL(5,2) DEFAULT 0,
                        total_time_taken INT DEFAULT 0,
                        last_attempt_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                    )
                """)

                conn.connection.commit()
        except MySQLError:
            raise

    def create_sample_data(self):
        """4.3.4. Örnek verileri ekler."""
        self._ensure_connection()
        try:
            with self.db as conn:
                # Eğitim seviyeleri
                conn.cursor.execute("""
                    INSERT IGNORE INTO education_levels (name, short_name, description, sort_order) VALUES
                    ('İlkokul', 'ilk', 'İlkokul eğitim seviyesi', 1),
                    ('Ortaokul', 'orta', 'Ortaokul eğitim seviyesi', 2),
                    ('Lise', 'lise', 'Lise eğitim seviyesi', 3),
                    ('Üniversite', 'uni', 'Üniversite eğitim seviyesi', 4)
                """)

                # Sınıf seviyeleri
                conn.cursor.execute("""
                    INSERT IGNORE INTO grade_levels (education_level_id, name, short_name, sort_order) VALUES
                    (1, '1. Sınıf', '1', 1), (1, '2. Sınıf', '2', 2), (1, '3. Sınıf', '3', 3), (1, '4. Sınıf', '4', 4),
                    (2, '5. Sınıf', '5', 5), (2, '6. Sınıf', '6', 6), (2, '7. Sınıf', '7', 7), (2, '8. Sınıf', '8', 8),
                    (3, '9. Sınıf', '9', 9), (3, '10. Sınıf', '10', 10), (3, '11. Sınıf', '11', 11), (3, '12. Sınıf', '12', 12)
                """)

                # Dersler
                conn.cursor.execute("""
                    INSERT IGNORE INTO subjects (name, short_name, description, icon, color, sort_order) VALUES
                    ('Matematik', 'mat', 'Matematik dersi', 'bi-calculator', '#dc3545', 1),
                    ('Türkçe', 'turk', 'Türkçe dersi', 'bi-book', '#28a745', 2),
                    ('Fen Bilgisi', 'fen', 'Fen Bilgisi dersi', 'bi-atom', '#17a2b8', 3),
                    ('Sosyal Bilgiler', 'sos', 'Sosyal Bilgiler dersi', 'bi-globe', '#ffc107', 4),
                    ('İngilizce', 'ing', 'İngilizce dersi', 'bi-translate', '#6f42c1', 5)
                """)

                # Sınıf-Ders ilişkileri (5. sınıf için)
                conn.cursor.execute("""
                    INSERT IGNORE INTO grade_subjects (grade_level_id, subject_id) VALUES
                    (5, 1), (5, 2), (5, 3), (5, 4), (5, 5)
                """)

                # Konular (Matematik için)
                conn.cursor.execute("""
                    INSERT IGNORE INTO topics (subject_id, name, sort_order) VALUES
                    (1, 'Sayılar', 1), (1, 'Geometri', 2), (1, 'Cebir', 3), (1, 'Ölçme', 4)
                """)

                # Alt konular (Sayılar için)
                conn.cursor.execute("""
                    INSERT IGNORE INTO subtopics (topic_id, name, sort_order) VALUES
                    (1, 'Doğal Sayılar', 1), (1, 'Kesirler', 2), (1, 'Ondalık Sayılar', 3), (1, 'Yüzdeler', 4)
                """)

                # Soru tipleri
                conn.cursor.execute("""
                    INSERT IGNORE INTO question_types (name, short_name, description) VALUES
                    ('Çoktan Seçmeli', 'multiple_choice', 'Tek doğru cevaplı çoktan seçmeli sorular'),
                    ('Çoklu Seçim', 'multiple_select', 'Birden fazla doğru cevaplı sorular'),
                    ('Doğru-Yanlış', 'true_false', 'Doğru veya yanlış soruları'),
                    ('Boşluk Doldurma', 'fill_blank', 'Boşluk doldurma soruları'),
                    ('Eşleştirme', 'matching', 'Eşleştirme soruları')
                """)

                # Zorluk seviyeleri
                conn.cursor.execute("""
                    INSERT IGNORE INTO difficulty_levels (name, short_name, description, color, points_multiplier, sort_order) VALUES
                    ('Kolay', 'easy', 'Kolay seviye sorular', '#28a745', 1.00, 1),
                    ('Orta', 'medium', 'Orta seviye sorular', '#ffc107', 1.25, 2),
                    ('Zor', 'hard', 'Zor seviye sorular', '#fd7e14', 1.50, 3),
                    ('Çok Zor', 'expert', 'Çok zor seviye sorular', '#dc3545', 2.00, 4)
                """)

                # Örnek soru
                conn.cursor.execute("""
                    INSERT IGNORE INTO questions (
                        grade_level_id, subject_id, topic_id, subtopic_id, 
                        question_type_id, difficulty_level_id, 
                        question_text, explanation, base_points
                    ) VALUES (
                        5, 1, 1, 1, 1, 1,
                        'Aşağıdaki sayılardan hangisi en büyüktür?',
                        'Sayıları karşılaştırırken basamak sayısına ve her basamaktaki rakamın değerine bakılır. 1250 sayısı 4 basamaklı, diğerleri 3 basamaklıdır.',
                        10
                    )
                """)

                # Soru seçenekleri
                conn.cursor.execute("""
                    INSERT IGNORE INTO question_options (question_id, option_text, is_correct, option_letter, sort_order) VALUES
                    (1, '1250', true, 'A', 1),
                    (1, '999', false, 'B', 2),
                    (1, '850', false, 'C', 3),
                    (1, '750', false, 'D', 4)
                """)

                # Soru etiketleri
                conn.cursor.execute("""
                    INSERT IGNORE INTO question_tags (name, description, color) VALUES
                    ('Temel', 'Temel seviye sorular', '#28a745'),
                    ('Kritik', 'Kritik konular', '#dc3545'),
                    ('Sınav', 'Sınav odaklı sorular', '#ffc107'),
                    ('Günlük Hayat', 'Günlük hayatla ilgili sorular', '#17a2b8'),
                    ('Problem Çözme', 'Problem çözme becerisi gerektiren sorular', '#6f42c1')
                """)

                conn.connection.commit()
        except MySQLError:
            raise

    # -------------------------------------------------------------------------
    # 4.4. Ana Geçiş Yöneticisi
    # -------------------------------------------------------------------------
    def run_migrations(self):
        """4.4.1. Proje için gerekli olan tüm tabloları oluşturur."""
        try:
            print("Veritabanı geçişleri başlatılıyor...")
            
            # Kullanıcı tablosu
            self.create_users_table()
            print("- 'users' tablosu başarıyla oluşturuldu veya zaten mevcut.")
            
            # Eğitim tabloları
            self.create_education_tables()
            print("- Eğitim hiyerarşisi tabloları başarıyla oluşturuldu.")
            
            # Soru tabloları
            self.create_question_tables()
            print("- Soru bankası tabloları başarıyla oluşturuldu.")
            
            # Örnek veriler
            self.create_sample_data()
            print("- Örnek veriler başarıyla eklendi.")
            
            print("Tüm geçişler başarıyla tamamlandı.")
        except MySQLError as e:
            print(f"Geçiş sırasında bir hata oluştu: {e}")
            raise
        finally:
            self._close_if_owned()

# =============================================================================
# 5.0. DOĞRUDAN ÇALIŞTIRMA BLOĞU
# =============================================================================
if __name__ == "__main__":
    migrations = Migrations()
    migrations.run_migrations()