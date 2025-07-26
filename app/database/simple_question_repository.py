# =============================================================================
# Basit Soru Bankası Repository
# Sadece 2 tablo ile çalışır: questions ve question_options
# =============================================================================

from mysql.connector import Error as MySQLError
from typing import Optional, Dict, List, Any
from app.database.db_connection import DatabaseConnection

class SimpleQuestionRepository:
    """
    Basit soru bankası işlemleri için repository sınıfı.
    Sadece questions ve question_options tablolarını kullanır.
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

    # =============================================================================
    # SORU İŞLEMLERİ
    # =============================================================================

    def get_all_questions(self) -> List[Dict[str, Any]]:
        """Tüm soruları seçenekleriyle birlikte getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        q.id,
                        q.question_text,
                        q.explanation,
                        q.difficulty,
                        q.is_active,
                        q.created_at
                    FROM questions q
                    WHERE q.is_active = true
                    ORDER BY q.id
                """
                conn.cursor.execute(query)
                questions = conn.cursor.fetchall()
                
                # Her soru için seçenekleri getir
                for question in questions:
                    question['options'] = self.get_question_options(question['id'])
                
                return questions
        except MySQLError as e:
            print(f"Sorular getirilirken hata: {e}")
            return []

    def get_question_by_id(self, question_id: int) -> Optional[Dict[str, Any]]:
        """ID'ye göre soruyu seçenekleriyle birlikte getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        id, question_text, explanation, difficulty, is_active, created_at
                    FROM questions 
                    WHERE id = %s AND is_active = true
                """
                conn.cursor.execute(query, (question_id,))
                question = conn.cursor.fetchone()
                
                if question:
                    question['options'] = self.get_question_options(question_id)
                
                return question
        except MySQLError as e:
            print(f"Soru getirilirken hata: {e}")
            return None

    def get_questions_by_difficulty(self, difficulty: str) -> List[Dict[str, Any]]:
        """Zorluk seviyesine göre soruları getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        id, question_text, explanation, difficulty, is_active, created_at
                    FROM questions 
                    WHERE difficulty = %s AND is_active = true
                    ORDER BY id
                """
                conn.cursor.execute(query, (difficulty,))
                questions = conn.cursor.fetchall()
                
                # Her soru için seçenekleri getir
                for question in questions:
                    question['options'] = self.get_question_options(question['id'])
                
                return questions
        except MySQLError as e:
            print(f"Sorular getirilirken hata: {e}")
            return []

    def create_question(self, question_data: Dict[str, Any]) -> Optional[int]:
        """Yeni soru oluşturur."""
        try:
            with self.db as conn:
                # Ana soru verilerini ekle
                query = """
                    INSERT INTO questions (question_text, explanation, difficulty)
                    VALUES (%s, %s, %s)
                """
                params = (
                    question_data['question_text'],
                    question_data.get('explanation'),
                    question_data.get('difficulty', 'orta')
                )
                
                conn.cursor.execute(query, params)
                question_id = conn.cursor.lastrowid
                
                # Seçenekleri ekle
                if 'options' in question_data:
                    for option in question_data['options']:
                        option_query = """
                            INSERT INTO question_options (question_id, option_text, is_correct, option_letter)
                            VALUES (%s, %s, %s, %s)
                        """
                        option_params = (
                            question_id,
                            option['text'],
                            option['is_correct'],
                            option['letter']
                        )
                        conn.cursor.execute(option_query, option_params)
                
                conn.connection.commit()
                return question_id
        except MySQLError as e:
            print(f"Soru oluşturulurken hata: {e}")
            return None

    def update_question(self, question_id: int, question_data: Dict[str, Any]) -> bool:
        """Soruyu günceller."""
        try:
            with self.db as conn:
                # Ana soru verilerini güncelle
                query = """
                    UPDATE questions SET
                        question_text = %s,
                        explanation = %s,
                        difficulty = %s
                    WHERE id = %s
                """
                params = (
                    question_data['question_text'],
                    question_data.get('explanation'),
                    question_data.get('difficulty', 'orta'),
                    question_id
                )
                
                conn.cursor.execute(query, params)
                
                # Seçenekleri güncelle (önce sil, sonra ekle)
                if 'options' in question_data:
                    # Mevcut seçenekleri sil
                    conn.cursor.execute("DELETE FROM question_options WHERE question_id = %s", (question_id,))
                    
                    # Yeni seçenekleri ekle
                    for option in question_data['options']:
                        option_query = """
                            INSERT INTO question_options (question_id, option_text, is_correct, option_letter)
                            VALUES (%s, %s, %s, %s)
                        """
                        option_params = (
                            question_id,
                            option['text'],
                            option['is_correct'],
                            option['letter']
                        )
                        conn.cursor.execute(option_query, option_params)
                
                conn.connection.commit()
                return True
        except MySQLError as e:
            print(f"Soru güncellenirken hata: {e}")
            return False

    def delete_question(self, question_id: int) -> bool:
        """Soruyu siler (soft delete)."""
        try:
            with self.db as conn:
                query = "UPDATE questions SET is_active = false WHERE id = %s"
                conn.cursor.execute(query, (question_id,))
                conn.connection.commit()
                return True
        except MySQLError as e:
            print(f"Soru silinirken hata: {e}")
            return False

    def get_question_options(self, question_id: int) -> List[Dict[str, Any]]:
        """Soru seçeneklerini getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT id, option_text, is_correct, option_letter
                    FROM question_options 
                    WHERE question_id = %s 
                    ORDER BY option_letter
                """
                conn.cursor.execute(query, (question_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Soru seçenekleri getirilirken hata: {e}")
            return []

    # =============================================================================
    # QUIZ İŞLEMLERİ
    # =============================================================================

    def get_random_questions(self, count: int = 10, difficulty: Optional[str] = None) -> List[Dict[str, Any]]:
        """Rastgele sorular getirir."""
        try:
            with self.db as conn:
                if difficulty:
                    query = """
                        SELECT id, question_text, explanation, difficulty
                        FROM questions 
                        WHERE is_active = true AND difficulty = %s
                        ORDER BY RAND()
                        LIMIT %s
                    """
                    conn.cursor.execute(query, (difficulty, count))
                else:
                    query = """
                        SELECT id, question_text, explanation, difficulty
                        FROM questions 
                        WHERE is_active = true
                        ORDER BY RAND()
                        LIMIT %s
                    """
                    conn.cursor.execute(query, (count,))
                
                questions = conn.cursor.fetchall()
                
                # Her soru için seçenekleri getir
                for question in questions:
                    question['options'] = self.get_question_options(question['id'])
                
                return questions
        except MySQLError as e:
            print(f"Rastgele sorular getirilirken hata: {e}")
            return []

    def get_question_count(self) -> Dict[str, int]:
        """Soru sayılarını getirir."""
        try:
            with self.db as conn:
                # Toplam soru sayısı
                conn.cursor.execute("SELECT COUNT(*) FROM questions WHERE is_active = true")
                total = conn.cursor.fetchone()['COUNT(*)']
                
                # Zorluk seviyesine göre soru sayıları
                conn.cursor.execute("""
                    SELECT difficulty, COUNT(*) as count
                    FROM questions 
                    WHERE is_active = true
                    GROUP BY difficulty
                """)
                difficulty_counts = conn.cursor.fetchall()
                
                result = {'total': total}
                for item in difficulty_counts:
                    result[item['difficulty']] = item['count']
                
                return result
        except MySQLError as e:
            print(f"Soru sayıları getirilirken hata: {e}")
            return {'total': 0}

    # =============================================================================
    # YARDIMCI METOTLAR
    # =============================================================================

    def validate_question_data(self, question_data: Dict[str, Any]) -> bool:
        """Soru verilerini doğrular."""
        required_fields = ['question_text', 'options']
        
        # Gerekli alanları kontrol et
        for field in required_fields:
            if field not in question_data:
                print(f"Eksik alan: {field}")
                return False
        
        # Seçenekleri kontrol et
        options = question_data['options']
        if len(options) != 4:
            print("Soru 4 seçenekli olmalıdır")
            return False
        
        # Doğru cevap sayısını kontrol et
        correct_count = sum(1 for option in options if option.get('is_correct', False))
        if correct_count != 1:
            print("Sadece 1 doğru cevap olmalıdır")
            return False
        
        # Seçenek harflerini kontrol et
        letters = [option.get('letter', '').upper() for option in options]
        expected_letters = ['A', 'B', 'C', 'D']
        if letters != expected_letters:
            print("Seçenek harfleri A, B, C, D olmalıdır")
            return False
        
        return True

    def create_sample_question(self) -> Optional[int]:
        """Örnek soru oluşturur."""
        sample_data = {
            'question_text': 'Aşağıdaki sayılardan hangisi en büyüktür?',
            'explanation': 'Sayıları karşılaştırırken basamak sayısına bakılır.',
            'difficulty': 'kolay',
            'options': [
                {'text': '1250', 'is_correct': True, 'letter': 'A'},
                {'text': '999', 'is_correct': False, 'letter': 'B'},
                {'text': '850', 'is_correct': False, 'letter': 'C'},
                {'text': '750', 'is_correct': False, 'letter': 'D'}
            ]
        }
        
        if self.validate_question_data(sample_data):
            return self.create_question(sample_data)
        return None 