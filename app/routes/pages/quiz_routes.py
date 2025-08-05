# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, quiz ile ilgili sayfa rotalarını (endpoints) içerir.
# Quiz başlatma, quiz ekranı, sonuçlar gibi quiz sayfalarını yönetir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. QUIZ SAYFA ROTALARI (QUIZ PAGE ROUTES)
#   4.1. Quiz Sayfaları
#     4.1.1. GET /quiz
#     4.1.2. GET /quiz/start
#     4.1.3. GET /quiz/session/<session_id>
#     4.1.4. GET /quiz/results
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from flask import Blueprint, render_template, session, redirect, url_for, request

# Import authentication service
try:
    from app.services.auth_service import login_required
except ImportError as e:
    print(f"Warning: Could not import auth_service: {e}")
    login_required = None

# Create the quiz pages blueprint
quiz_bp = Blueprint('quiz', __name__)

# =============================================================================
# 4.0. QUIZ SAYFA ROTALARI (QUIZ PAGE ROUTES)
# =============================================================================

# -------------------------------------------------------------------------
# 4.1. Quiz Sayfaları
# -------------------------------------------------------------------------

@quiz_bp.route('/quiz')
@login_required
def quiz():
    """4.1.1. Quiz sayfasını render eder."""
    return render_template('quiz_screen.html', title='Quiz')

@quiz_bp.route('/quiz/start')
# @login_required  # Temporarily disabled for testing
def quiz_start():
    """4.1.2. Quiz başlatma sayfasını render eder."""
    return render_template('quiz_start.html', title='Quiz Başlat')

@quiz_bp.route('/quiz/session/<session_id>')
# @login_required  # Temporarily disabled for testing
def quiz_session(session_id):
    """4.1.3. Quiz oturum sayfasını render eder."""
    return render_template('quiz_screen.html', title='Quiz', session_id=session_id)

@quiz_bp.route('/quiz/screen')
# @login_required  # Temporarily disabled for testing
def quiz_screen():
    """4.1.3b. Quiz ekranı sayfasını render eder (session_id query parameter ile)."""
    session_id = request.args.get('session_id')
    if not session_id:
        return redirect(url_for('quiz.quiz_start'))
    return render_template('quiz_screen.html', title='Quiz', session_id=session_id)

@quiz_bp.route('/quiz/results')
@login_required
def quiz_results():
    """4.1.4. Quiz sonuçları sayfasını render eder."""
    return render_template('quiz_results.html', title='Quiz Sonuçları')

@quiz_bp.route('/quiz/auto-start')
def quiz_auto_start():
    """4.1.5. Otomatik quiz başlatma - testuser ile 8. sınıf Türkçe sıfat-fiil konusu."""
    try:
        from app.database.db_connection import DatabaseConnection
        from app.database.user_repository import UserRepository
        from app.services.quiz_session_service import QuizSessionService
        import hashlib
        
        # Testuser'ı oluştur veya mevcut olanı bul
        with DatabaseConnection() as conn:
            # Önce testuser'ın var olup olmadığını kontrol et
            conn.cursor.execute("SELECT id FROM users WHERE username = 'testuser'")
            user_result = conn.cursor.fetchone()
            
            if user_result:
                test_user_id = user_result['id']
                print(f"✅ Testuser bulundu, ID: {test_user_id}")
            else:
                # Testuser yoksa oluştur
                print("🆕 Testuser oluşturuluyor...")
                
                # Basit şifre hash'i oluştur
                password_hash = hashlib.sha256("test123".encode()).hexdigest()
                
                # Direkt SQL ile kullanıcı oluştur
                conn.cursor.execute("""
                    INSERT INTO users (username, name_id, email, password_hash, first_name, last_name)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, ('testuser', 'testuser', 'testuser@example.com', password_hash, 'Test', 'User'))
                
                test_user_id = conn.cursor.lastrowid
                conn.connection.commit()
                
                print(f"✅ Testuser oluşturuldu, ID: {test_user_id}")
            
            # 8. sınıf ID'sini bul
            conn.cursor.execute("SELECT id FROM grades WHERE name = '8. Sınıf' AND is_active = 1")
            grade_result = conn.cursor.fetchone()
            if not grade_result:
                return "8. Sınıf bulunamadı", 404
            grade_id = grade_result['id']
            print(f"✅ 8. Sınıf bulundu, ID: {grade_id}")
            
            # Türkçe dersi ID'sini bul
            conn.cursor.execute("SELECT id FROM subjects WHERE name = 'Türkçe' AND grade_id = %s AND is_active = 1", (grade_id,))
            subject_result = conn.cursor.fetchone()
            if not subject_result:
                return "Türkçe dersi bulunamadı", 404
            subject_id = subject_result['id']
            print(f"✅ Türkçe dersi bulundu, ID: {subject_id}")
            
            # Fiilimsiler ünitesi ID'sini bul
            conn.cursor.execute("SELECT id FROM units WHERE name = 'Fiilimsiler' AND subject_id = %s AND is_active = 1", (subject_id,))
            unit_result = conn.cursor.fetchone()
            if not unit_result:
                return "Fiilimsiler ünitesi bulunamadı", 404
            unit_id = unit_result['id']
            print(f"✅ Fiilimsiler ünitesi bulundu, ID: {unit_id}")
            
            # Sıfat-fiil konusu ID'sini bul
            conn.cursor.execute("SELECT id FROM topics WHERE name = 'Sıfat-fiil' AND unit_id = %s AND is_active = 1", (unit_id,))
            topic_result = conn.cursor.fetchone()
            if not topic_result:
                return "Sıfat-fiil konusu bulunamadı", 404
            topic_id = topic_result['id']
            print(f"✅ Sıfat-fiil konusu bulundu, ID: {topic_id}")
        
        # Quiz session oluştur
        quiz_config = {
            'grade_id': grade_id,
            'subject_id': subject_id,
            'unit_id': unit_id,
            'topic_id': topic_id,
            'difficulty_level': 'random',
            'quiz_mode': 'exam',
            'timer_enabled': True,
            'timer_duration': 30,
            'question_count': 5
        }
        
        print(f"🚀 Quiz session oluşturuluyor... Config: {quiz_config}")
        
        session_service = QuizSessionService()
        success, result = session_service.start_quiz_session(test_user_id, quiz_config)
        
        if not success:
            error_msg = result.get('error', 'Bilinmeyen hata')
            print(f"❌ Quiz session oluşturulamadı: {error_msg}")
            return f"Quiz session oluşturulamadı: {error_msg}", 500
        
        # Quiz screen'e yönlendir
        session_id = result['session_id']
        print(f"✅ Quiz session oluşturuldu, Session ID: {session_id}")
        print(f"🔄 Quiz screen'e yönlendiriliyor: /quiz/screen?session_id={session_id}")
        
        return redirect(f'/quiz/screen?session_id={session_id}')
        
    except Exception as e:
        print(f"❌ Otomatik quiz başlatma hatası: {str(e)}")
        return f"Otomatik quiz başlatma hatası: {str(e)}", 500 