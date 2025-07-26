# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, soru bankası veritabanı işlemlerini yönetmek için
# `QuestionRepository` sınıfını içerir. Soru ekleme, güncelleme, silme
# ve sorgulama işlemlerini merkezileştirir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# 4.0. QUESTIONREPOSITORY SINIFI
#   4.1. Başlatma (Initialization)
#     4.1.1. __init__(self, db_connection)
#   4.2. Eğitim Hiyerarşisi Metotları
#     4.2.1. get_education_levels(self)
#     4.2.2. get_grade_levels(self, education_level_id)
#     4.2.3. get_subjects(self, grade_level_id)
#     4.2.4. get_topics(self, subject_id)
#     4.2.5. get_subtopics(self, topic_id)
#   4.3. Soru İşlemleri
#     4.3.1. get_questions(self, filters)
#     4.3.2. get_question_by_id(self, question_id)
#     4.3.3. create_question(self, question_data)
#     4.3.4. update_question(self, question_id, question_data)
#     4.3.5. delete_question(self, question_id)
#     4.3.6. get_question_options(self, question_id)
#     4.3.7. get_question_with_options(self, question_id)
#   4.4. İstatistik Metotları
#     4.4.1. get_question_stats(self, question_id)
#     4.4.2. update_question_stats(self, question_id, is_correct, time_taken)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# =============================================================================
from mysql.connector import Error as MySQLError
from typing import Optional, Dict, List, Any, Tuple
from app.database.db_connection import DatabaseConnection

# =============================================================================
# 4.0. QUESTIONREPOSITORY SINIFI
# =============================================================================
class QuestionRepository:
    """
    Soru bankası veritabanı işlemlerini yöneten repository sınıfı.
    """

    # -------------------------------------------------------------------------
    # 4.1. Başlatma (Initialization)
    # -------------------------------------------------------------------------
    def __init__(self, db_connection: Optional[DatabaseConnection] = None):
        """4.1.1. Sınıfın kurucu metodu."""
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

    # -------------------------------------------------------------------------
    # 4.2. Eğitim Hiyerarşisi Metotları
    # -------------------------------------------------------------------------
    def get_education_levels(self) -> List[Dict[str, Any]]:
        """4.2.1. Tüm eğitim seviyelerini getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT id, name, short_name, description, is_active, sort_order
                    FROM education_levels 
                    WHERE is_active = true 
                    ORDER BY sort_order, name
                """
                conn.cursor.execute(query)
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Eğitim seviyeleri getirilirken hata: {e}")
            return []

    def get_grade_levels(self, education_level_id: int) -> List[Dict[str, Any]]:
        """4.2.2. Belirli eğitim seviyesindeki sınıfları getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT id, name, short_name, description, is_active, sort_order
                    FROM grade_levels 
                    WHERE education_level_id = %s AND is_active = true 
                    ORDER BY sort_order, name
                """
                conn.cursor.execute(query, (education_level_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Sınıf seviyeleri getirilirken hata: {e}")
            return []

    def get_subjects(self, grade_level_id: int) -> List[Dict[str, Any]]:
        """4.2.3. Belirli sınıftaki dersleri getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT s.id, s.name, s.short_name, s.description, s.icon, s.color, s.sort_order
                    FROM subjects s
                    JOIN grade_subjects gs ON s.id = gs.subject_id
                    WHERE gs.grade_level_id = %s AND s.is_active = true AND gs.is_active = true
                    ORDER BY s.sort_order, s.name
                """
                conn.cursor.execute(query, (grade_level_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Dersler getirilirken hata: {e}")
            return []

    def get_topics(self, subject_id: int) -> List[Dict[str, Any]]:
        """4.2.4. Belirli dersin konularını getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT id, name, description, is_active, sort_order
                    FROM topics 
                    WHERE subject_id = %s AND is_active = true 
                    ORDER BY sort_order, name
                """
                conn.cursor.execute(query, (subject_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Konular getirilirken hata: {e}")
            return []

    def get_subtopics(self, topic_id: int) -> List[Dict[str, Any]]:
        """4.2.5. Belirli konunun alt konularını getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT id, name, description, is_active, sort_order
                    FROM subtopics 
                    WHERE topic_id = %s AND is_active = true 
                    ORDER BY sort_order, name
                """
                conn.cursor.execute(query, (topic_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Alt konular getirilirken hata: {e}")
            return []

    # -------------------------------------------------------------------------
    # 4.3. Soru İşlemleri
    # -------------------------------------------------------------------------
    def get_questions(self, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """4.3.1. Filtrelere göre soruları getirir."""
        try:
            with self.db as conn:
                # Temel sorgu
                query = """
                    SELECT 
                        q.id, q.question_text, q.explanation, q.base_points, q.time_limit,
                        q.is_active, q.is_approved, q.is_featured,
                        q.total_attempts, q.correct_attempts, q.average_time_taken,
                        el.name as education_level, gl.name as grade_level,
                        s.name as subject, t.name as topic, st.name as subtopic,
                        qt.name as question_type, dl.name as difficulty_level,
                        dl.color as difficulty_color, dl.points_multiplier,
                        CASE 
                            WHEN q.total_attempts > 0 
                            THEN ROUND((q.correct_attempts / q.total_attempts) * 100, 2)
                            ELSE 0 
                        END as success_rate,
                        (q.base_points * dl.points_multiplier) as final_points
                    FROM questions q
                    JOIN grade_levels gl ON q.grade_level_id = gl.id
                    JOIN education_levels el ON gl.education_level_id = el.id
                    JOIN subjects s ON q.subject_id = s.id
                    JOIN topics t ON q.topic_id = t.id
                    JOIN subtopics st ON q.subtopic_id = st.id
                    JOIN question_types qt ON q.question_type_id = qt.id
                    JOIN difficulty_levels dl ON q.difficulty_level_id = dl.id
                    WHERE q.is_active = true
                """
                
                params = []
                
                # Filtreleri uygula
                if filters:
                    if filters.get('grade_level_id'):
                        query += " AND q.grade_level_id = %s"
                        params.append(filters['grade_level_id'])
                    
                    if filters.get('subject_id'):
                        query += " AND q.subject_id = %s"
                        params.append(filters['subject_id'])
                    
                    if filters.get('topic_id'):
                        query += " AND q.topic_id = %s"
                        params.append(filters['topic_id'])
                    
                    if filters.get('subtopic_id'):
                        query += " AND q.subtopic_id = %s"
                        params.append(filters['subtopic_id'])
                    
                    if filters.get('difficulty_level_id'):
                        query += " AND q.difficulty_level_id = %s"
                        params.append(filters['difficulty_level_id'])
                    
                    if filters.get('question_type_id'):
                        query += " AND q.question_type_id = %s"
                        params.append(filters['question_type_id'])
                    
                    if filters.get('is_approved') is not None:
                        query += " AND q.is_approved = %s"
                        params.append(filters['is_approved'])
                    
                    if filters.get('limit'):
                        query += " LIMIT %s"
                        params.append(filters['limit'])
                
                query += " ORDER BY q.created_at DESC"
                
                conn.cursor.execute(query, params)
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Sorular getirilirken hata: {e}")
            return []

    def get_question_by_id(self, question_id: int) -> Optional[Dict[str, Any]]:
        """4.3.2. ID'ye göre soruyu getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        q.*, el.name as education_level, gl.name as grade_level,
                        s.name as subject, t.name as topic, st.name as subtopic,
                        qt.name as question_type, dl.name as difficulty_level
                    FROM questions q
                    JOIN grade_levels gl ON q.grade_level_id = gl.id
                    JOIN education_levels el ON gl.education_level_id = el.id
                    JOIN subjects s ON q.subject_id = s.id
                    JOIN topics t ON q.topic_id = t.id
                    JOIN subtopics st ON q.subtopic_id = st.id
                    JOIN question_types qt ON q.question_type_id = qt.id
                    JOIN difficulty_levels dl ON q.difficulty_level_id = dl.id
                    WHERE q.id = %s
                """
                conn.cursor.execute(query, (question_id,))
                result = conn.cursor.fetchone()
                return result
        except MySQLError as e:
            print(f"Soru getirilirken hata: {e}")
            return None

    def create_question(self, question_data: Dict[str, Any]) -> Optional[int]:
        """4.3.3. Yeni soru oluşturur."""
        try:
            with self.db as conn:
                # Ana soru verilerini ekle
                query = """
                    INSERT INTO questions (
                        grade_level_id, subject_id, topic_id, subtopic_id,
                        question_type_id, difficulty_level_id, question_text,
                        explanation, base_points, time_limit, created_by
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (
                    question_data['grade_level_id'],
                    question_data['subject_id'],
                    question_data['topic_id'],
                    question_data['subtopic_id'],
                    question_data['question_type_id'],
                    question_data['difficulty_level_id'],
                    question_data['question_text'],
                    question_data.get('explanation'),
                    question_data.get('base_points', 10),
                    question_data.get('time_limit', 60),
                    question_data.get('created_by')
                )
                
                conn.cursor.execute(query, params)
                question_id = conn.cursor.lastrowid
                
                # Seçenekleri ekle
                if 'options' in question_data:
                    for option in question_data['options']:
                        option_query = """
                            INSERT INTO question_options (
                                question_id, option_text, is_correct, option_letter, sort_order
                            ) VALUES (%s, %s, %s, %s, %s)
                        """
                        option_params = (
                            question_id,
                            option['text'],
                            option['is_correct'],
                            option['letter'],
                            option.get('sort_order', 0)
                        )
                        conn.cursor.execute(option_query, option_params)
                
                conn.connection.commit()
                return question_id
        except MySQLError as e:
            print(f"Soru oluşturulurken hata: {e}")
            return None

    def update_question(self, question_id: int, question_data: Dict[str, Any]) -> bool:
        """4.3.4. Soruyu günceller."""
        try:
            with self.db as conn:
                # Ana soru verilerini güncelle
                query = """
                    UPDATE questions SET
                        grade_level_id = %s, subject_id = %s, topic_id = %s, subtopic_id = %s,
                        question_type_id = %s, difficulty_level_id = %s, question_text = %s,
                        explanation = %s, base_points = %s, time_limit = %s,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """
                params = (
                    question_data['grade_level_id'],
                    question_data['subject_id'],
                    question_data['topic_id'],
                    question_data['subtopic_id'],
                    question_data['question_type_id'],
                    question_data['difficulty_level_id'],
                    question_data['question_text'],
                    question_data.get('explanation'),
                    question_data.get('base_points', 10),
                    question_data.get('time_limit', 60),
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
                            INSERT INTO question_options (
                                question_id, option_text, is_correct, option_letter, sort_order
                            ) VALUES (%s, %s, %s, %s, %s)
                        """
                        option_params = (
                            question_id,
                            option['text'],
                            option['is_correct'],
                            option['letter'],
                            option.get('sort_order', 0)
                        )
                        conn.cursor.execute(option_query, option_params)
                
                conn.connection.commit()
                return True
        except MySQLError as e:
            print(f"Soru güncellenirken hata: {e}")
            return False

    def delete_question(self, question_id: int) -> bool:
        """4.3.5. Soruyu siler (soft delete)."""
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
        """4.3.6. Sorunun seçeneklerini getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT id, option_text, is_correct, option_letter, sort_order
                    FROM question_options 
                    WHERE question_id = %s 
                    ORDER BY sort_order, option_letter
                """
                conn.cursor.execute(query, (question_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Soru seçenekleri getirilirken hata: {e}")
            return []

    def get_question_with_options(self, question_id: int) -> Optional[Dict[str, Any]]:
        """4.3.7. Soruyu seçenekleriyle birlikte getirir."""
        question = self.get_question_by_id(question_id)
        if question:
            question['options'] = self.get_question_options(question_id)
        return question

    # -------------------------------------------------------------------------
    # 4.4. İstatistik Metotları
    # -------------------------------------------------------------------------
    def get_question_stats(self, question_id: int) -> Dict[str, Any]:
        """4.4.1. Sorunun istatistiklerini getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        total_attempts, correct_attempts, average_time_taken,
                        CASE 
                            WHEN total_attempts > 0 
                            THEN ROUND((correct_attempts / total_attempts) * 100, 2)
                            ELSE 0 
                        END as success_rate
                    FROM questions 
                    WHERE id = %s
                """
                conn.cursor.execute(query, (question_id,))
                result = conn.cursor.fetchone()
                return result if result else {}
        except MySQLError as e:
            print(f"Soru istatistikleri getirilirken hata: {e}")
            return {}

    def update_question_stats(self, question_id: int, is_correct: bool, time_taken: int) -> bool:
        """4.4.2. Soru istatistiklerini günceller."""
        try:
            with self.db as conn:
                query = """
                    UPDATE questions SET
                        total_attempts = total_attempts + 1,
                        correct_attempts = correct_attempts + %s,
                        average_time_taken = (
                            (average_time_taken * total_attempts + %s) / (total_attempts + 1)
                        )
                    WHERE id = %s
                """
                correct_increment = 1 if is_correct else 0
                conn.cursor.execute(query, (correct_increment, time_taken, question_id))
                conn.connection.commit()
                return True
        except MySQLError as e:
            print(f"Soru istatistikleri güncellenirken hata: {e}")
            return False 