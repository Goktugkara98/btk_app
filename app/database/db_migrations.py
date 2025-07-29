# =============================================================================
# Basit Soru Bankası - Veritabanı Migrations
# Tablolar: users, questions ve question_options
# =============================================================================

from mysql.connector import Error as MySQLError
from typing import Optional
from app.database.db_connection import DatabaseConnection

class SimpleMigrations:
    """
    Basit soru bankası için veritabanı şemasını oluşturur.
    Tablolar: users, questions ve question_options
    """

    def __init__(self, db_connection: Optional[DatabaseConnection] = None):
        """Sınıfın kurucu metodu."""
        if db_connection:
            self.db: DatabaseConnection = db_connection
            self.own_connection: bool = False
        else:
            self.db: DatabaseConnection = DatabaseConnection()
            self.own_connection: bool = True

    def __del__(self):
        """Destructor - bağlantıyı temizle."""
        if self.own_connection:
            self.db.close()

    def drop_existing_tables(self):
        """Mevcut tabloları temizler."""
        try:
            with self.db as conn:
                print("🧹 Mevcut tablolar temizleniyor...")
                
                # Foreign key constraint'leri devre dışı bırak
                conn.cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
                
                # Mevcut tabloları sil
                tables_to_drop = [
                    'question_options',
                    'questions',
                    'users',
                    'question_tag_relations',
                    'question_tags',
                    'question_media',
                    'user_answers',
                    'quiz_attempts',
                    'user_statistics',
                    'subtopics',
                    'topics',
                    'grade_subjects',
                    'subjects',
                    'grade_levels',
                    'education_levels',
                    'difficulty_levels',
                    'question_types'
                ]
                
                for table in tables_to_drop:
                    try:
                        conn.cursor.execute(f"DROP TABLE IF EXISTS {table}")
                        print(f"   ✅ {table} tablosu silindi")
                    except Exception as e:
                        print(f"   ⚠️  {table} tablosu silinemedi: {e}")
                
                # Foreign key constraint'leri tekrar etkinleştir
                conn.cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
                conn.connection.commit()
                
                print("✅ Tablo temizleme tamamlandı!")
                
        except MySQLError as e:
            print(f"❌ Tablo temizleme hatası: {e}")
            raise

    def create_simple_tables(self):
        """Basit soru bankası tablolarını oluşturur."""
        try:
            with self.db as conn:
                print("📋 Users tablosu oluşturuluyor...")
                
                # Users tablosu
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)
                
                print("📋 Questions tablosu oluşturuluyor...")
                
                # Questions tablosu
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS questions (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        question_text TEXT NOT NULL,
                        explanation TEXT,
                        difficulty ENUM('kolay', 'orta', 'zor') DEFAULT 'orta',
                        is_active BOOLEAN DEFAULT true,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                print("📋 Question options tablosu oluşturuluyor...")
                
                # Question options tablosu
                conn.cursor.execute("""
                    CREATE TABLE IF NOT EXISTS question_options (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        question_id INT NOT NULL,
                        option_text TEXT NOT NULL,
                        is_correct BOOLEAN DEFAULT false,
                        option_letter CHAR(1) NOT NULL,
                        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
                    )
                """)
                
                conn.connection.commit()
                print("✅ Basit tablolar başarıyla oluşturuldu!")
                
        except MySQLError as e:
            print(f"❌ Tablo oluşturma hatası: {e}")
            raise

    def create_sample_questions(self):
        """Örnek soruları ekler."""
        try:
            with self.db as conn:
                print("📝 Örnek sorular ekleniyor...")
                
                # Örnek sorular
                sample_questions = [
                    {
                        'question_text': 'Aşağıdaki sayılardan hangisi en büyüktür?',
                        'explanation': 'Sayıları karşılaştırırken basamak sayısına bakılır. 1250 sayısı 4 basamaklı, diğerleri 3 basamaklıdır.',
                        'difficulty': 'kolay',
                        'options': [
                            ('1250', True, 'A'),
                            ('999', False, 'B'),
                            ('850', False, 'C'),
                            ('750', False, 'D')
                        ]
                    },
                    {
                        'question_text': 'Hangi sayı 1000 ile 2000 arasındadır?',
                        'explanation': '1000 ile 2000 arasındaki sayılar 4 basamaklıdır ve 1 ile başlar.',
                        'difficulty': 'orta',
                        'options': [
                            ('950', False, 'A'),
                            ('1500', True, 'B'),
                            ('2100', False, 'C'),
                            ('800', False, 'D')
                        ]
                    },
                    {
                        'question_text': '1500 sayısının yarısı kaçtır?',
                        'explanation': 'Bir sayının yarısını bulmak için 2\'ye böleriz. 1500 ÷ 2 = 750',
                        'difficulty': 'kolay',
                        'options': [
                            ('500', False, 'A'),
                            ('750', True, 'B'),
                            ('1000', False, 'C'),
                            ('1250', False, 'D')
                        ]
                    },
                    {
                        'question_text': '2000 sayısının çeyreği kaçtır?',
                        'explanation': 'Bir sayının çeyreğini bulmak için 4\'e böleriz. 2000 ÷ 4 = 500',
                        'difficulty': 'orta',
                        'options': [
                            ('400', False, 'A'),
                            ('500', True, 'B'),
                            ('600', False, 'C'),
                            ('800', False, 'D')
                        ]
                    },
                    {
                        'question_text': 'Hangi sayı 5000\'den büyüktür?',
                        'explanation': '5000\'den büyük sayılar 4 basamaklı olabilir ama 5000\'den büyük olmalıdır.',
                        'difficulty': 'zor',
                        'options': [
                            ('4500', False, 'A'),
                            ('5500', True, 'B'),
                            ('4000', False, 'C'),
                            ('3500', False, 'D')
                        ]
                    }
                ]
                
                for question_data in sample_questions:
                    # Ana soru verilerini ekle
                    conn.cursor.execute("""
                        INSERT INTO questions (question_text, explanation, difficulty)
                        VALUES (%s, %s, %s)
                    """, (question_data['question_text'], question_data['explanation'], question_data['difficulty']))
                    
                    question_id = conn.cursor.lastrowid
                    
                    # Seçenekleri ekle
                    for option_text, is_correct, option_letter in question_data['options']:
                        conn.cursor.execute("""
                            INSERT INTO question_options (question_id, option_text, is_correct, option_letter)
                            VALUES (%s, %s, %s, %s)
                        """, (question_id, option_text, is_correct, option_letter))
                
                conn.connection.commit()
                print(f"✅ {len(sample_questions)} örnek soru eklendi!")
                
        except MySQLError as e:
            print(f"❌ Örnek veri ekleme hatası: {e}")
            raise

    def run_migrations(self):
        """Tüm migration işlemlerini çalıştırır."""
        try:
            print("🚀 Basit soru bankası migrations başlatılıyor...")
            print("=" * 50)
            
            # 0. Mevcut tabloları temizle
            self.drop_existing_tables()
            
            # 1. Tabloları oluştur
            self.create_simple_tables()
            
            # 2. Örnek verileri ekle
            self.create_sample_questions()
            
            print("=" * 50)
            print("🎉 Basit soru bankası migrations tamamlandı!")
            print("📊 Oluşturulan tablolar:")
            print("   • users (Kullanıcılar)")
            print("   • questions (Sorular)")
            print("   • question_options (Seçenekler)")
            print("\n💡 Test etmek için: python test_simple_database.py")
            
        except Exception as e:
            print(f"❌ Migration hatası: {e}")
            raise

# =============================================================================
# Eski Migrations sınıfını korumak için alias
# =============================================================================
class Migrations(SimpleMigrations):
    """
    Geriye uyumluluk için eski Migrations sınıfı.
    Artık basit sistem kullanılıyor.
    """
    pass

# =============================================================================
# DOĞRUDAN ÇALIŞTIRMA
# =============================================================================
if __name__ == "__main__":
    migrations = SimpleMigrations()
    migrations.run_migrations()