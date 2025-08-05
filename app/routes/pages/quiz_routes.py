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
# @login_required  # Temporarily disabled for testing
def quiz_results():
    """4.1.4. Quiz sonuçları sayfasını render eder."""
    session_id = request.args.get('session_id')
    return render_template('quiz_results.html', title='Quiz Sonuçları', session_id=session_id)

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
            
            # Mevcut sınıfları kontrol et
            conn.cursor.execute("SELECT id, name FROM grades WHERE is_active = 1")
            grades = conn.cursor.fetchall()
            print(f"📚 Mevcut sınıflar: {[g['name'] for g in grades]}")
            
            # 8. sınıf ID'sini bul
            conn.cursor.execute("SELECT id FROM grades WHERE name = '8. Sınıf' AND is_active = 1")
            grade_result = conn.cursor.fetchone()
            if not grade_result:
                # Eğer 8. sınıf yoksa, ilk sınıfı kullan
                conn.cursor.execute("SELECT id FROM grades WHERE is_active = 1 LIMIT 1")
                grade_result = conn.cursor.fetchone()
                if not grade_result:
                    return "Hiç sınıf bulunamadı", 404
                grade_id = grade_result['id']
                print(f"⚠️ 8. Sınıf bulunamadı, ilk sınıf kullanılıyor: {grade_id}")
            else:
                grade_id = grade_result['id']
                print(f"✅ 8. Sınıf bulundu, ID: {grade_id}")
            
            # Mevcut dersleri kontrol et
            conn.cursor.execute("SELECT id, name FROM subjects WHERE grade_id = %s AND is_active = 1", (grade_id,))
            subjects = conn.cursor.fetchall()
            print(f"📖 Mevcut dersler: {[s['name'] for s in subjects]}")
            
            # Türkçe dersi ID'sini bul
            conn.cursor.execute("SELECT id FROM subjects WHERE name = 'Türkçe' AND grade_id = %s AND is_active = 1", (grade_id,))
            subject_result = conn.cursor.fetchone()
            if not subject_result:
                # Eğer Türkçe yoksa, ilk dersi kullan
                conn.cursor.execute("SELECT id FROM subjects WHERE grade_id = %s AND is_active = 1 LIMIT 1", (grade_id,))
                subject_result = conn.cursor.fetchone()
                if not subject_result:
                    return "Hiç ders bulunamadı", 404
                subject_id = subject_result['id']
                print(f"⚠️ Türkçe dersi bulunamadı, ilk ders kullanılıyor: {subject_id}")
            else:
                subject_id = subject_result['id']
                print(f"✅ Türkçe dersi bulundu, ID: {subject_id}")
            
            # Mevcut üniteleri kontrol et
            conn.cursor.execute("SELECT id, name FROM units WHERE subject_id = %s AND is_active = 1", (subject_id,))
            units = conn.cursor.fetchall()
            print(f"📚 Mevcut üniteler: {[u['name'] for u in units]}")
            
            # Fiilimsiler ünitesi ID'sini bul
            conn.cursor.execute("SELECT id FROM units WHERE name = 'Fiilimsiler' AND subject_id = %s AND is_active = 1", (subject_id,))
            unit_result = conn.cursor.fetchone()
            if not unit_result:
                # Eğer Fiilimsiler yoksa, ilk üniteyi kullan
                conn.cursor.execute("SELECT id FROM units WHERE subject_id = %s AND is_active = 1 LIMIT 1", (subject_id,))
                unit_result = conn.cursor.fetchone()
                if not unit_result:
                    return "Hiç ünite bulunamadı", 404
                unit_id = unit_result['id']
                print(f"⚠️ Fiilimsiler ünitesi bulunamadı, ilk ünite kullanılıyor: {unit_id}")
            else:
                unit_id = unit_result['id']
                print(f"✅ Fiilimsiler ünitesi bulundu, ID: {unit_id}")
            
            # Mevcut konuları kontrol et
            conn.cursor.execute("SELECT id, name FROM topics WHERE unit_id = %s AND is_active = 1", (unit_id,))
            topics = conn.cursor.fetchall()
            print(f"📝 Mevcut konular: {[t['name'] for t in topics]}")
            
            # Sıfat-fiil konusu ID'sini bul
            conn.cursor.execute("SELECT id FROM topics WHERE name = 'Sıfat-fiil' AND unit_id = %s AND is_active = 1", (unit_id,))
            topic_result = conn.cursor.fetchone()
            if not topic_result:
                # Eğer Sıfat-fiil yoksa, ilk konuyu kullan
                conn.cursor.execute("SELECT id FROM topics WHERE unit_id = %s AND is_active = 1 LIMIT 1", (unit_id,))
                topic_result = conn.cursor.fetchone()
                if not topic_result:
                    return "Hiç konu bulunamadı", 404
                topic_id = topic_result['id']
                print(f"⚠️ Sıfat-fiil konusu bulunamadı, ilk konu kullanılıyor: {topic_id}")
            else:
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
        
        # Önce soruların var olup olmadığını kontrol et
        with DatabaseConnection() as conn:
            conn.cursor.execute("""
                SELECT COUNT(*) as count FROM questions q
                JOIN topics t ON q.topic_id = t.id
                WHERE t.id = %s AND q.is_active = 1
            """, (topic_id,))
            question_count = conn.cursor.fetchone()['count']
            print(f"📊 Bu konu için {question_count} soru bulundu")
            
            if question_count == 0:
                # Eğer bu konuda soru yoksa, tüm konulardan soru sayısını kontrol et
                conn.cursor.execute("""
                    SELECT COUNT(*) as count FROM questions q
                    JOIN topics t ON q.topic_id = t.id
                    JOIN units u ON t.unit_id = u.id
                    WHERE u.id = %s AND q.is_active = 1
                """, (unit_id,))
                unit_question_count = conn.cursor.fetchone()['count']
                print(f"📊 Bu ünite için toplam {unit_question_count} soru bulundu")
                
                if unit_question_count == 0:
                    return "Bu konu ve ünite için hiç soru bulunamadı. Lütfen önce soru verilerini yükleyin.", 404
        
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
        import traceback
        traceback.print_exc()
        return f"Otomatik quiz başlatma hatası: {str(e)}", 500

@quiz_bp.route('/quiz/test-db')
def test_database():
    """4.1.6. Veritabanı bağlantısını test eder."""
    try:
        from app.database.db_connection import DatabaseConnection
        
        with DatabaseConnection() as conn:
            # Test basic connection
            conn.cursor.execute("SELECT 1 as test")
            result = conn.cursor.fetchone()
            
            if result and result['test'] == 1:
                return "✅ Database connection successful", 200
            else:
                return "❌ Database connection failed", 500
                
    except Exception as e:
        return f"❌ Database test error: {str(e)}", 500

@quiz_bp.route('/quiz/init-db')
def initialize_database():
    """4.1.7. Veritabanını manuel olarak başlatır."""
    try:
        from app.database.db_connection import DatabaseConnection
        from app.database.db_migrations import DatabaseMigrations
        from app.database.quiz_data_loader import QuestionLoader
        
        # Run migrations
        db_connection = DatabaseConnection()
        migrations = DatabaseMigrations(db_connection)
        migrations.run_migrations()
        
        # Load question data
        question_loader = QuestionLoader(db_connection=db_connection)
        results = question_loader.process_all_question_files()
        
        total_success = 0
        total_questions = 0
        for filename, (success, total) in results.items():
            total_success += success
            total_questions += total
        
        return f"✅ Database initialized successfully. Loaded {total_success}/{total_questions} questions.", 200
                
    except Exception as e:
        import traceback
        traceback.print_exc()
        return f"❌ Database initialization error: {str(e)}", 500 