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
from flask import Blueprint, render_template, session, redirect, url_for

# Create the quiz pages blueprint
quiz_bp = Blueprint('quiz', __name__)

# =============================================================================
# 4.0. QUIZ SAYFA ROTALARI (QUIZ PAGE ROUTES)
# =============================================================================

# -------------------------------------------------------------------------
# 4.1. Quiz Sayfaları
# -------------------------------------------------------------------------

@quiz_bp.route('/quiz')
def quiz():
    """4.1.1. Quiz sayfasını render eder."""
    return render_template('quiz_screen.html', title='Quiz')

@quiz_bp.route('/quiz/start')
def quiz_start():
    """4.1.2. Quiz başlatma sayfasını render eder."""
    return render_template('quiz_start.html', title='Quiz Başlat')

@quiz_bp.route('/quiz/session/<session_id>')
def quiz_session(session_id):
    """4.1.3. Quiz oturum sayfasını render eder."""
    # Kullanıcının giriş yapmış olup olmadığını kontrol et
    if not session.get('logged_in'):
        return redirect(url_for('auth.login'))
    
    return render_template('quiz_screen.html', title='Quiz', session_id=session_id)

@quiz_bp.route('/quiz/results')
def quiz_results():
    """4.1.4. Quiz sonuçları sayfasını render eder."""
    return render_template('quiz_results.html', title='Quiz Sonuçları') 