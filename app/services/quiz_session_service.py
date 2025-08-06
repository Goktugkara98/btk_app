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

            # Session ID oluştur
            import uuid
            session_id = str(uuid.uuid4())
            
            # Session verilerini hazırla
            session_data = {
                'session_id': session_id,
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
            print(f"🔧 Session verileri: {session_data}")
            success, session_db_id = self.session_repo.create_session(session_data)
            if not success:
                print(f"❌ Session oluşturulamadı. Session DB ID: {session_db_id}")
                return False, {'error': 'Failed to create session'}
            print(f"✅ Session oluşturuldu. Session DB ID: {session_db_id}")

            # Rasgele soruları seç - topic_id None ise subject_id kullan
            topic_id = quiz_config.get('topic_id')
            print(f"🔍 Soru seçimi - Topic ID: {topic_id}, Subject ID: {quiz_config['subject_id']}")
            
            if topic_id is None:
                # Topic seçilmemişse, subject'e göre soru seç
                print(f"📚 Subject'e göre soru seçiliyor...")
                questions = self.session_repo.get_random_questions_by_subject(
                    subject_id=quiz_config['subject_id'],
                    difficulty=quiz_config.get('difficulty_level', 'random'),
                    count=quiz_config.get('question_count', 10)
                )
            else:
                # Topic seçilmişse, topic'e göre soru seç
                print(f"📚 Topic'e göre soru seçiliyor...")
                questions = self.session_repo.get_random_questions(
                    topic_id=topic_id,
                    difficulty=quiz_config.get('difficulty_level', 'random'),
                    count=quiz_config.get('question_count', 10)
                )
            
            print(f"📊 Seçilen soru sayısı: {len(questions) if questions else 0}")

            if not questions:
                print(f"❌ Seçilen kriterler için soru bulunamadı. Topic ID: {topic_id}, Subject ID: {quiz_config['subject_id']}")
                return False, {'error': 'No questions available for the selected criteria'}

            # Session'a soruları ekle
            if not self.session_repo.add_session_questions(session_db_id, questions):
                return False, {'error': 'Failed to add questions to session'}

            # Session bilgilerini getir
            print(f"🔍 Session bilgileri getiriliyor... Session DB ID: {session_db_id}")
            session_info = self.session_repo.get_session_by_id(session_db_id)
            if not session_info:
                print(f"❌ Session bilgileri getirilemedi. Session DB ID: {session_db_id}")
                return False, {'error': 'Failed to retrieve session info'}
            print(f"✅ Session bilgileri getirildi. Session ID: {session_info.get('session_id', 'N/A')}")

            result_data = {
                'session_id': session_info['session_id'],
                'session_db_id': session_db_id,
                'questions_count': len(questions),
                'timer_duration': session_data['timer_duration'],
                'quiz_mode': session_data['quiz_mode']
            }
            print(f"✅ Quiz session başarıyla oluşturuldu. Result: {result_data}")
            return True, result_data

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
            # Puan hesaplama session_results'da yapılacak, burada sadece doğru/yanlış kaydediyoruz
            answer_update_data = {
                'user_answer_option_id': answer_data.get('user_answer_option_id'),
                'is_correct': answer_result['is_correct'],
                'points_earned': 0,  # Puan hesaplama session_results'da yapılacak
                'time_spent_seconds': answer_data.get('time_spent_seconds', 0)
            }

            # Cevabı güncelle
            if not self.session_repo.update_answer(session['id'], question_id, answer_update_data):
                return False, {'error': 'Failed to update answer'}

            return True, {
                'is_correct': answer_result['is_correct'],
                'points_earned': 0,  # Puan hesaplama session_results'da yapılacak
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

            # Session'ı tamamla - eski format için uyumlu veri hazırla
            session_completion_data = {
                'total_score': int(results.get('totalScore', 0)),  # Puanı tam sayıya çevir
                'correct_answers': results.get('correctAnswers', 0),
                'completion_time_seconds': results.get('completionTime', 0)
            }
            
            if not self.session_repo.complete_session(session_id, session_completion_data):
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
            
            # Puan hesaplama artık session_results'da yapılıyor
            # Burada sadece doğru/yanlış kontrolü yapıyoruz
            points_earned = 0  # Puan hesaplama session_results'da yapılacak

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
            
            # Puan hesaplama: Her soru 100/toplam_soru puanına sahip
            points_per_question = 100 / total_questions if total_questions > 0 else 0
            total_score = correct_answers * points_per_question
            max_possible_score = 100  # Toplam 100 puan

            # Tamamlanma süresini hesapla
            if session['start_time'] and session['end_time']:
                completion_time = (session['end_time'] - session['start_time']).total_seconds()
            else:
                completion_time = 0

            # Başarı yüzdesi hesapla
            score_percentage = round(total_score, 2)  # Zaten yüzde olarak hesaplandı
            correct_percentage = round((correct_answers / total_questions * 100) if total_questions > 0 else 0, 2)

            # Ders bazlı analiz
            subjects_analysis = {}
            difficulty_analysis = {'easy': 0, 'medium': 0, 'hard': 0}
            
            # Soru detaylarını hazırla
            questions_details = []
            for i, question in enumerate(questions):
                # Soru durumunu belirle
                if question['user_answer_option_id'] is None:
                    status = 'skipped'
                elif question['is_correct']:
                    status = 'correct'
                else:
                    status = 'incorrect'
                
                # Soru detaylarını al
                question_details = self.get_question_details(question['question_id'])
                
                # Ders analizi için
                subject_name = question_details.get('subject_name') if question_details else question.get('subject_name', 'Bilinmeyen')
                topic_name = question_details.get('topic_name') if question_details else question.get('topic_name', 'Bilinmeyen')
                difficulty = question_details.get('difficulty_level') if question_details else question.get('difficulty_level', 'medium')
                
                if subject_name and subject_name != 'Bilinmeyen':
                    if subject_name not in subjects_analysis:
                        subjects_analysis[subject_name] = {'total': 0, 'correct': 0}
                    subjects_analysis[subject_name]['total'] += 1
                    if status == 'correct':
                        subjects_analysis[subject_name]['correct'] += 1
                
                # Zorluk analizi için
                if difficulty in difficulty_analysis:
                    difficulty_analysis[difficulty] += 1
                
                # Cevap bilgilerini al
                user_answer_text = question.get('user_answer_text', 'Cevaplanmadı')
                correct_answer_text = question.get('correct_answer_text', 'Bilinmiyor')
                explanation = question_details.get('description', 'Açıklama bulunamadı') if question_details else 'Açıklama bulunamadı'
                
                # Eğer session_results'dan gelen veriler yoksa, ayrı ayrı al
                if user_answer_text == 'Cevaplanmadı' and question['user_answer_option_id'] is not None:
                    user_answer = self.session_repo.get_answer_option_text(question['user_answer_option_id'])
                    user_answer_text = user_answer if user_answer else 'Bilinmiyor'
                
                if correct_answer_text == 'Bilinmiyor':
                    correct_answer = self.session_repo.get_correct_answer(question['question_id'])
                    if correct_answer:
                        correct_answer_text = correct_answer.get('name', 'Bilinmiyor')
                
                # Soru detayları
                question_detail = {
                    'text': question.get('question_text', 'Soru metni bulunamadı'),
                    'subject': subject_name or 'Bilinmeyen',
                    'topic': topic_name or 'Bilinmeyen',
                    'difficulty': difficulty or 'medium',
                    'status': status,
                    'timeSpent': question.get('time_spent', 0),
                    'userAnswer': user_answer_text,
                    'correctAnswer': correct_answer_text,
                    'explanation': explanation
                }
                questions_details.append(question_detail)

            # Ders yüzdelerini hesapla
            subjects_percentages = {}
            for subject, data in subjects_analysis.items():
                percentage = round((data['correct'] / data['total'] * 100) if data['total'] > 0 else 0, 2)
                subjects_percentages[subject] = percentage

            # Zorluk yüzdelerini hesapla
            difficulty_percentages = {}
            for difficulty, count in difficulty_analysis.items():
                if count > 0:
                    difficulty_percentages[difficulty] = round((count / total_questions * 100), 2)
                else:
                    difficulty_percentages[difficulty] = 0

            # Kişisel öneriler
            recommendations = self._generate_recommendations(
                score_percentage, correct_percentage, subjects_percentages, difficulty_percentages
            )

            return {
                # Temel istatistikler
                'totalScore': total_score,
                'scorePercentage': score_percentage,
                'correctAnswers': correct_answers,
                'correctPercentage': correct_percentage,
                'totalQuestions': total_questions,
                'answeredQuestions': answered_questions,
                'completionTime': int(completion_time),
                
                # Sıralama bilgileri (mock data)
                'rank': 3,
                'percentile': 10,
                
                # Detaylı analizler
                'questions': questions_details,
                'subjects': subjects_percentages,
                'difficulty': difficulty_percentages,
                'recommendations': recommendations,
                
                # Ek bilgiler
                'sessionInfo': {
                    'sessionId': session_id,
                    'startTime': session.get('start_time'),
                    'endTime': session.get('end_time'),
                    'quizMode': session.get('quiz_mode', 'educational')
                }
            }

        except Exception as e:
            print(f"❌ Session sonuçları hesaplama hatası: {e}")
            return None

    def _generate_recommendations(self, score_percentage: float, correct_percentage: float, 
                                subjects_percentages: Dict[str, float], 
                                difficulty_percentages: Dict[str, float]) -> List[Dict[str, Any]]:
        """Kişisel öneriler oluşturur."""
        recommendations = []
        
        # Genel performans önerisi
        if score_percentage < 60:
            recommendations.append({
                'icon': 'bi-exclamation-triangle',
                'title': 'Daha Fazla Çalışma Gerekli',
                'description': f'%{score_percentage} başarı oranınızı artırmak için daha fazla pratik yapmanızı öneriyoruz.',
                'actionText': 'Tekrar Çalış',
                'actionUrl': '/quiz/start?mode=practice'
            })
        elif score_percentage >= 85:
            recommendations.append({
                'icon': 'bi-star',
                'title': 'Mükemmel Performans!',
                'description': f'%{score_percentage} başarı oranınızla harika bir iş çıkardınız. Bu seviyeyi koruyun!',
                'actionText': 'Daha Zor Sorular',
                'actionUrl': '/quiz/start?difficulty=hard'
            })
        
        # En zayıf ders önerisi
        weakest_subject = min(subjects_percentages.items(), key=lambda x: x[1])
        if weakest_subject[1] < 70:
            recommendations.append({
                'icon': 'bi-book',
                'title': f'{weakest_subject[0]} Konularını Tekrar Et',
                'description': f'{weakest_subject[0]} dersinde %{weakest_subject[1]} başarı oranınız var. Bu konuyu tekrar çalışmanızı öneriyoruz.',
                'actionText': f'{weakest_subject[0]} Çalış',
                'actionUrl': f'/quiz/start?subject={weakest_subject[0].lower()}'
            })
        
        # Zorluk seviyesi önerisi
        if difficulty_percentages.get('hard', 0) > 50:
            recommendations.append({
                'icon': 'bi-lightning',
                'title': 'Zor Sorularda Başarılısınız',
                'description': 'Zor sorularda iyi performans gösteriyorsunuz. Bu yeteneğinizi geliştirmeye devam edin.',
                'actionText': 'Daha Zor Sorular',
                'actionUrl': '/quiz/start?difficulty=hard'
            })
        
        # En az 3 öneri olmasını sağla
        while len(recommendations) < 3:
            recommendations.append({
                'icon': 'bi-graph-up',
                'title': 'Sürekli Gelişim',
                'description': 'Düzenli pratik yaparak performansınızı artırabilirsiniz.',
                'actionText': 'Yeni Quiz Başlat',
                'actionUrl': '/quiz/start'
            })
        
        return recommendations[:3]  # En fazla 3 öneri döndür
    
    def update_session_timer(self, session_id: str, remaining_time_seconds: int) -> bool:
        """4.2.4. Session timer'ını günceller."""
        try:
            # Session'ın var olup olmadığını kontrol et
            session_info = self.get_session_info(session_id)
            if not session_info:
                return False
            
            # Timer'ı güncelle
            success = self.session_repo.update_session_timer(session_id, remaining_time_seconds)
            return success
            
        except Exception as e:
            print(f"❌ Timer update error: {e}")
            return False 