# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, quiz session iş mantığını yöneten QuizSessionService sınıfını
# içerir. Quiz oturumları, soru seçimi ve sonuç hesaplama işlemlerini yönetir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. QUIZSESSIONSERVICE SINIFI
#   4.1. Başlatma (Initialization)
#     4.1.1. __init__(self)
#   4.2. Quiz Session Yönetimi
#     4.2.1. start_quiz_session(self, user_id, quiz_config)
#     4.2.2. get_session_info(self, session_id)
#     4.2.3. submit_answer(self, session_id, question_id, answer_data)
#     4.2.4. complete_session(self, session_id)
#   4.3. Soru ve Cevap İşlemleri
#     4.3.1. get_session_questions(self, session_id)
#     4.3.2. calculate_answer_result(self, question_id, user_answer_id)
#     4.3.3. calculate_session_results(self, session_id)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
import time

from app.database.quiz_session_repository import QuizSessionRepository

# =============================================================================
# 4.0. QUIZSESSIONSERVICE SINIFI
# =============================================================================
class QuizSessionService:
    """
    Quiz session iş mantığını yönetir.
    """

    # -------------------------------------------------------------------------
    # 4.1. Başlatma (Initialization)
    # -------------------------------------------------------------------------
    def __init__(self):
        """4.1.1. Servisin kurucu metodu."""
        self.session_repo = QuizSessionRepository()

    # -------------------------------------------------------------------------
    # 4.2. Quiz Session Yönetimi
    # -------------------------------------------------------------------------
    def start_quiz_session(self, user_id: int, quiz_config: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """4.2.1. Yeni bir quiz session başlatır."""
        try:
            # Gerekli alanları kontrol et - sadece grade_id ve subject_id zorunlu
            required_fields = ['grade_id', 'subject_id']
            for field in required_fields:
                if field not in quiz_config:
                    return False, {'error': f'Missing required field: {field}'}

            # Session verilerini hazırla
            session_data = {
                'user_id': user_id,
                'grade_id': quiz_config['grade_id'],
                'subject_id': quiz_config['subject_id'],
                'unit_id': quiz_config.get('unit_id'),
                'topic_id': quiz_config.get('topic_id'),  # Artık opsiyonel
                'difficulty_level': quiz_config.get('difficulty_level', 'random'),
                'timer_enabled': quiz_config.get('timer_enabled', True),
                'timer_duration': quiz_config.get('timer_duration', 30),
                'quiz_mode': quiz_config.get('quiz_mode', 'educational'),
                'question_count': quiz_config.get('question_count', 10)
            }

            # Session'ı veritabanında oluştur
            success, session_db_id = self.session_repo.create_session(session_data)
            if not success:
                return False, {'error': 'Failed to create session'}

            # Rasgele soruları seç - topic_id None ise subject_id kullan
            topic_id = quiz_config.get('topic_id')
            if topic_id is None:
                # Topic seçilmemişse, subject'e göre soru seç
                questions = self.session_repo.get_random_questions_by_subject(
                    subject_id=quiz_config['subject_id'],
                    difficulty=quiz_config.get('difficulty_level', 'random'),
                    count=quiz_config.get('question_count', 10)
                )
            else:
                # Topic seçilmişse, topic'e göre soru seç
                questions = self.session_repo.get_random_questions(
                    topic_id=topic_id,
                    difficulty=quiz_config.get('difficulty_level', 'random'),
                    count=quiz_config.get('question_count', 10)
                )

            if not questions:
                return False, {'error': 'No questions available for the selected criteria'}

            # Session'a soruları ekle
            if not self.session_repo.add_session_questions(session_db_id, questions):
                return False, {'error': 'Failed to add questions to session'}

            # Session bilgilerini getir
            session_info = self.session_repo.get_session_by_id(session_db_id)
            if not session_info:
                return False, {'error': 'Failed to retrieve session info'}

            return True, {
                'session_id': session_info['session_id'],
                'session_db_id': session_db_id,
                'questions_count': len(questions),
                'timer_duration': session_data['timer_duration'],
                'quiz_mode': session_data['quiz_mode']
            }

        except Exception as e:
            print(f"❌ Quiz session başlatma hatası: {e}")
            import traceback
            traceback.print_exc()
            return False, {'error': f'Internal server error: {str(e)}'}

    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """4.2.2. Session bilgilerini getirir."""
        try:
            session = self.session_repo.get_session(session_id)
            if not session:
                return None

            # Session'daki soruları getir
            questions = self.session_repo.get_session_questions(session['id'])
            
            return {
                'session': session,
                'questions': questions,
                'total_questions': len(questions),
                'answered_questions': len([q for q in questions if q['user_answer_option_id'] is not None])
            }

        except Exception as e:
            print(f"❌ Session bilgileri getirme hatası: {e}")
            return None

    def submit_answer(self, session_id: str, question_id: int, answer_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """4.2.3. Soru cevabını gönderir ve sonucu hesaplar."""
        try:
            # Session'ı getir
            session = self.session_repo.get_session(session_id)
            if not session:
                return False, {'error': 'Session not found'}

            if session['status'] != 'active':
                return False, {'error': 'Session is not active'}

            # Cevap sonucunu hesapla
            answer_result = self.calculate_answer_result(question_id, answer_data.get('user_answer_option_id'))
            
            # Cevap verilerini hazırla
            answer_update_data = {
                'user_answer_option_id': answer_data.get('user_answer_option_id'),
                'is_correct': answer_result['is_correct'],
                'points_earned': answer_result['points_earned'],
                'time_spent_seconds': answer_data.get('time_spent_seconds', 0)
            }

            # Cevabı güncelle
            if not self.session_repo.update_answer(session['id'], question_id, answer_update_data):
                return False, {'error': 'Failed to update answer'}

            return True, {
                'is_correct': answer_result['is_correct'],
                'points_earned': answer_result['points_earned'],
                'correct_answer': answer_result['correct_answer']
            }

        except Exception as e:
            print(f"❌ Cevap gönderme hatası: {e}")
            return False, {'error': 'Internal server error'}

    def complete_session(self, session_id: str) -> Tuple[bool, Dict[str, Any]]:
        """4.2.4. Session'ı tamamlar ve sonuçları hesaplar."""
        try:
            # Session sonuçlarını hesapla
            results = self.calculate_session_results(session_id)
            if not results:
                return False, {'error': 'Failed to calculate results'}

            # Session'ı tamamla
            if not self.session_repo.complete_session(session_id, results):
                return False, {'error': 'Failed to complete session'}

            return True, results

        except Exception as e:
            print(f"❌ Session tamamlama hatası: {e}")
            return False, {'error': 'Internal server error'}

    # -------------------------------------------------------------------------
    # 4.3. Soru ve Cevap İşlemleri
    # -------------------------------------------------------------------------
    def get_session_questions(self, session_id: str) -> List[Dict[str, Any]]:
        """4.3.1. Session'daki soruları getirir."""
        try:
            session = self.session_repo.get_session(session_id)
            if not session:
                return []

            questions = self.session_repo.get_session_questions(session['id'])
            return questions

        except Exception as e:
            print(f"❌ Session soruları getirme hatası: {e}")
            return []

    def get_question_options(self, question_id: int) -> List[Dict[str, Any]]:
        """4.3.1b. Soru seçeneklerini getirir."""
        try:
            options = self.session_repo.get_question_options(question_id)
            return options
        except Exception as e:
            print(f"❌ Soru seçenekleri getirme hatası: {e}")
            return []

    def get_question_details(self, question_id: int) -> Optional[Dict[str, Any]]:
        """4.3.1c. Soru detaylarını (açıklama dahil) getirir."""
        try:
            details = self.session_repo.get_question_details(question_id)
            return details
        except Exception as e:
            print(f"❌ Soru detayları getirme hatası: {e}")
            return None

    def calculate_answer_result(self, question_id: int, user_answer_id: Optional[int]) -> Dict[str, Any]:
        """4.3.2. Cevap sonucunu hesaplar."""
        try:
            # Doğru cevabı bul
            correct_answer = self.session_repo.get_correct_answer(question_id)
            if not correct_answer:
                return {
                    'is_correct': False,
                    'points_earned': 0,
                    'correct_answer': None
                }

            # Kullanıcının cevabını kontrol et
            is_correct = user_answer_id == correct_answer['id'] if user_answer_id else False
            
            # Puan hesapla
            points_earned = correct_answer['points'] if is_correct else 0

            return {
                'is_correct': is_correct,
                'points_earned': points_earned,
                'correct_answer': correct_answer['name']
            }

        except Exception as e:
            print(f"❌ Cevap sonucu hesaplama hatası: {e}")
            return {
                'is_correct': False,
                'points_earned': 0,
                'correct_answer': None
            }

    def calculate_session_results(self, session_id: str) -> Optional[Dict[str, Any]]:
        """4.3.3. Session sonuçlarını hesaplar."""
        try:
            # Session sonuçlarını getir
            results = self.session_repo.get_session_results(session_id)
            if not results:
                return None

            session = results['session']
            questions = results['questions']

            # İstatistikleri hesapla
            total_questions = len(questions)
            answered_questions = len([q for q in questions if q['user_answer_option_id'] is not None])
            correct_answers = len([q for q in questions if q['is_correct']])
            total_score = sum([q['points_earned'] for q in questions])
            max_possible_score = sum([q['points'] for q in questions])

            # Tamamlanma süresini hesapla
            if session['start_time'] and session['end_time']:
                completion_time = (session['end_time'] - session['start_time']).total_seconds()
            else:
                completion_time = 0

            return {
                'total_score': total_score,
                'max_possible_score': max_possible_score,
                'correct_answers': correct_answers,
                'total_questions': total_questions,
                'answered_questions': answered_questions,
                'completion_time_seconds': int(completion_time),
                'percentage': round((total_score / max_possible_score * 100) if max_possible_score > 0 else 0, 2)
            }

        except Exception as e:
            print(f"❌ Session sonuçları hesaplama hatası: {e}")
            return None 