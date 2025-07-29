# =============================================================================
# AUTHENTICATION UTILITIES
# =============================================================================
# Bu modül, kullanıcı kimlik doğrulama ile ilgili yardımcı fonksiyonları içerir.
# Session kontrolü, login durumu kontrolü gibi işlemler burada yapılır.
# =============================================================================

from functools import wraps
from flask import session, redirect, url_for, jsonify, request

def login_required(f):
    """
    Decorator: Kullanıcının giriş yapmış olmasını zorunlu kılar.
    Giriş yapmamış kullanıcıları login sayfasına yönlendirir.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            # AJAX istekleri için JSON yanıt
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'status': 'error',
                    'message': 'Giriş yapmanız gerekiyor',
                    'redirect': '/login'
                }), 401
            # Normal sayfa istekleri için redirect
            return redirect(url_for('pages.login'))
        return f(*args, **kwargs)
    return decorated_function

def get_current_user():
    """
    Session'dan mevcut kullanıcı bilgilerini döndürür.
    Kullanıcı giriş yapmamışsa None döner.
    """
    if session.get('logged_in'):
        return {
            'id': session.get('user_id'),
            'username': session.get('username'),
            'email': session.get('email')
        }
    return None

def is_logged_in():
    """
    Kullanıcının giriş yapıp yapmadığını kontrol eder.
    """
    return session.get('logged_in', False)

def logout_user():
    """
    Kullanıcıyı çıkış yapar (session'ı temizler).
    """
    session.clear() 