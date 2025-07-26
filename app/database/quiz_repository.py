# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, quiz oluşturma ve yönetimi için `QuizRepository` sınıfını içerir.
# Quiz oluşturma, soru seçimi, quiz denemeleri ve sonuçları yönetir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# 4.0. QUIZREPOSITORY SINIFI
#   4.1. Başlatma (Initialization)
#     4.1.1. __init__(self, db_connection)
#   4.2. Quiz Oluşturma
#     4.2.1. create_quiz_from_filters(self, filters, settings)
#     4.2.2. get_random_questions(self, filters, count)
#     4.2.3. create_quiz_session(self, user_id, quiz_data)
#   4.3. Quiz Denemeleri
#     4.3.1. start_quiz_attempt(self, user_id, quiz_id)
#     4.3.2. save_quiz_answer(self, attempt_id, question_id, selected_options, time_taken)
#     4.3.3. finish_quiz_attempt(self, attempt_id, total_score, total_time)
#     4.3.4. get_quiz_attempt(self, attempt_id)
#     4.3.5. get_user_attempts(self, user_id, quiz_id)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# =============================================================================
import random
from mysql.connector import Error as MySQLError
from typing import Optional, Dict, List, Any, Tuple
from app.database.db_connection import DatabaseConnection

# =============================================================================
# 4.0. QUIZREPOSITORY SINIFI
# =============================================================================
class QuizRepository:
    """
    Quiz oluşturma ve yönetimi için repository sınıfı.
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
    # 4.2. Quiz Oluşturma
    # -------------------------------------------------------------------------
    def create_quiz_from_filters(self, filters: Dict[str, Any], settings: Dict[str, Any]) -> Dict[str, Any]:
        """4.2.1. Filtrelere göre quiz oluşturur."""
        try:
            # Quiz ayarlarını al
            question_count = settings.get('question_count', 10)
            shuffle_questions = settings.get('shuffle_questions', True)
            shuffle_options = settings.get('shuffle_options', True)
            time_limit = settings.get('time_limit', 600)  # 10 dakika
            
            # Soruları getir
            questions = self.get_random_questions(filters, question_count)
            
            if not questions:
                return {
                    'success': False,
                    'message': 'Belirtilen kriterlere uygun soru bulunamadı.'
                }
            
            # Quiz verilerini hazırla
            quiz_data = {
                'questions': questions,
                'settings': {
                    'question_count': len(questions),
                    'shuffle_questions': shuffle_questions,
                    'shuffle_options': shuffle_options,
                    'time_limit': time_limit,
                    'total_points': sum(q['final_points'] for q in questions)
                },
                'metadata': {
                    'grade_level': questions[0]['grade_level'] if questions else '',
                    'subject': questions[0]['subject'] if questions else '',
                    'topic': questions[0]['topic'] if questions else '',
                    'difficulty': self._get_average_difficulty(questions)
                }
            }
            
            # Soruları karıştır
            if shuffle_questions:
                random.shuffle(quiz_data['questions'])
            
            # Seçenekleri karıştır
            if shuffle_options:
                for question in quiz_data['questions']:
                    if 'options' in question:
                        random.shuffle(question['options'])
            
            return {
                'success': True,
                'quiz_data': quiz_data
            }
            
        except Exception as e:
            print(f"Quiz oluşturulurken hata: {e}")
            return {
                'success': False,
                'message': 'Quiz oluşturulurken bir hata oluştu.'
            }

    def get_random_questions(self, filters: Dict[str, Any], count: int) -> List[Dict[str, Any]]:
        """4.2.2. Filtrelere göre rastgele sorular getirir."""
        try:
            with self.db as conn:
                # Temel sorgu
                query = """
                    SELECT 
                        q.id, q.question_text, q.explanation, q.base_points, q.time_limit,
                        el.name as education_level, gl.name as grade_level,
                        s.name as subject, t.name as topic, st.name as subtopic,
                        qt.name as question_type, dl.name as difficulty_level,
                        dl.color as difficulty_color, dl.points_multiplier,
                        (q.base_points * dl.points_multiplier) as final_points
                    FROM questions q
                    JOIN grade_levels gl ON q.grade_level_id = gl.id
                    JOIN education_levels el ON gl.education_level_id = el.id
                    JOIN subjects s ON q.subject_id = s.id
                    JOIN topics t ON q.topic_id = t.id
                    JOIN subtopics st ON q.subtopic_id = st.id
                    JOIN question_types qt ON q.question_type_id = qt.id
                    JOIN difficulty_levels dl ON q.difficulty_level_id = dl.id
                    WHERE q.is_active = true AND q.is_approved = true
                """
                
                params = []
                
                # Filtreleri uygula
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
                
                # Rastgele sıralama
                query += " ORDER BY RAND()"
                
                # Limit
                query += " LIMIT %s"
                params.append(count)
                
                conn.cursor.execute(query, params)
                questions = conn.cursor.fetchall()
                
                # Her soru için seçenekleri getir
                for question in questions:
                    question['options'] = self._get_question_options(question['id'])
                
                return questions
                
        except MySQLError as e:
            print(f"Rastgele sorular getirilirken hata: {e}")
            return []

    def _get_question_options(self, question_id: int) -> List[Dict[str, Any]]:
        """Soru seçeneklerini getirir."""
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

    def _get_average_difficulty(self, questions: List[Dict[str, Any]]) -> str:
        """Soruların ortalama zorluğunu hesaplar."""
        if not questions:
            return 'Orta'
        
        difficulty_scores = {
            'Kolay': 1,
            'Orta': 2,
            'Zor': 3,
            'Çok Zor': 4
        }
        
        total_score = sum(difficulty_scores.get(q['difficulty_level'], 2) for q in questions)
        avg_score = total_score / len(questions)
        
        if avg_score <= 1.5:
            return 'Kolay'
        elif avg_score <= 2.5:
            return 'Orta'
        elif avg_score <= 3.5:
            return 'Zor'
        else:
            return 'Çok Zor'

    # -------------------------------------------------------------------------
    # 4.3. Quiz Denemeleri
    # -------------------------------------------------------------------------
    def start_quiz_attempt(self, user_id: int, quiz_data: Dict[str, Any]) -> Optional[int]:
        """4.3.1. Quiz denemesini başlatır."""
        try:
            with self.db as conn:
                # Quiz denemesi kaydı oluştur
                query = """
                    INSERT INTO quiz_attempts (
                        user_id, started_at, max_score
                    ) VALUES (%s, NOW(), %s)
                """
                max_score = quiz_data['settings']['total_points']
                conn.cursor.execute(query, (user_id, max_score))
                attempt_id = conn.cursor.lastrowid
                
                conn.connection.commit()
                return attempt_id
        except MySQLError as e:
            print(f"Quiz denemesi başlatılırken hata: {e}")
            return None

    def save_quiz_answer(self, attempt_id: int, question_id: int, 
                        selected_options: List[int], time_taken: int) -> bool:
        """4.3.2. Quiz cevabını kaydeder."""
        try:
            with self.db as conn:
                # Doğru cevabı kontrol et
                correct_options = self._get_correct_options(question_id)
                is_correct = set(selected_options) == set(correct_options)
                
                # Cevabı kaydet
                query = """
                    INSERT INTO user_answers (
                        attempt_id, question_id, selected_options, 
                        is_correct, time_taken, answered_at
                    ) VALUES (%s, %s, %s, %s, %s, NOW())
                """
                
                # JSON formatında seçenekleri kaydet
                import json
                selected_options_json = json.dumps(selected_options)
                
                conn.cursor.execute(query, (
                    attempt_id, question_id, selected_options_json, 
                    is_correct, time_taken
                ))
                
                # Soru istatistiklerini güncelle
                self._update_question_stats(question_id, is_correct, time_taken)
                
                conn.connection.commit()
                return True
        except MySQLError as e:
            print(f"Quiz cevabı kaydedilirken hata: {e}")
            return False

    def finish_quiz_attempt(self, attempt_id: int, total_score: int, total_time: int) -> bool:
        """4.3.3. Quiz denemesini tamamlar."""
        try:
            with self.db as conn:
                # Quiz denemesini güncelle
                query = """
                    UPDATE quiz_attempts SET
                        completed_at = NOW(),
                        score = %s,
                        time_taken = %s,
                        percentage = (%s / max_score) * 100,
                        is_passed = (%s / max_score) * 100 >= 70
                    WHERE id = %s
                """
                conn.cursor.execute(query, (total_score, total_time, total_score, total_score, attempt_id))
                conn.connection.commit()
                return True
        except MySQLError as e:
            print(f"Quiz denemesi tamamlanırken hata: {e}")
            return False

    def get_quiz_attempt(self, attempt_id: int) -> Optional[Dict[str, Any]]:
        """4.3.4. Quiz denemesini getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        qa.*, u.username, u.full_name
                    FROM quiz_attempts qa
                    JOIN users u ON qa.user_id = u.id
                    WHERE qa.id = %s
                """
                conn.cursor.execute(query, (attempt_id,))
                attempt = conn.cursor.fetchone()
                
                if attempt:
                    # Kullanıcı cevaplarını getir
                    attempt['answers'] = self._get_attempt_answers(attempt_id)
                
                return attempt
        except MySQLError as e:
            print(f"Quiz denemesi getirilirken hata: {e}")
            return None

    def get_user_attempts(self, user_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """4.3.5. Kullanıcının quiz denemelerini getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        id, started_at, completed_at, score, max_score, 
                        percentage, time_taken, is_passed
                    FROM quiz_attempts 
                    WHERE user_id = %s 
                    ORDER BY started_at DESC 
                    LIMIT %s
                """
                conn.cursor.execute(query, (user_id, limit))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Kullanıcı denemeleri getirilirken hata: {e}")
            return []

    def _get_correct_options(self, question_id: int) -> List[int]:
        """Soru için doğru seçeneklerin ID'lerini getirir."""
        try:
            with self.db as conn:
                query = "SELECT id FROM question_options WHERE question_id = %s AND is_correct = true"
                conn.cursor.execute(query, (question_id,))
                return [row['id'] for row in conn.cursor.fetchall()]
        except MySQLError as e:
            print(f"Doğru seçenekler getirilirken hata: {e}")
            return []

    def _update_question_stats(self, question_id: int, is_correct: bool, time_taken: int) -> bool:
        """Soru istatistiklerini günceller."""
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
                return True
        except MySQLError as e:
            print(f"Soru istatistikleri güncellenirken hata: {e}")
            return False

    def _get_attempt_answers(self, attempt_id: int) -> List[Dict[str, Any]]:
        """Quiz denemesi cevaplarını getirir."""
        try:
            with self.db as conn:
                query = """
                    SELECT 
                        ua.*, q.question_text, q.explanation
                    FROM user_answers ua
                    JOIN questions q ON ua.question_id = q.id
                    WHERE ua.attempt_id = %s
                    ORDER BY ua.answered_at
                """
                conn.cursor.execute(query, (attempt_id,))
                return conn.cursor.fetchall()
        except MySQLError as e:
            print(f"Deneme cevapları getirilirken hata: {e}")
            return [] 