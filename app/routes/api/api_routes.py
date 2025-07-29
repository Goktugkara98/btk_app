# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, Flask uygulamasının API rotalarını (endpoints) içerir.
# Rotalar, gelen HTTP isteklerini karşılar, ilgili servis katmanı
# metotlarını çağırır ve dönen sonuçları JSON formatında yanıtlar.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. SERVİS BAŞLATMA
# 5.0. API ROTALARI (API ROUTES)
#   5.1. Sistem Durumu Rotası (Health Check)
#     5.1.1. GET /health
#   5.2. Kullanıcı Rotaları (User Routes)
#     5.2.1. GET /users
#     5.2.2. POST /users
#     5.2.3. POST /register
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from flask import Blueprint, jsonify, request, session
from datetime import datetime

# Create the blueprint
api_bp = Blueprint('api', __name__)

# Import services here to avoid circular imports
try:
    from app.services.user_service import UserService
    from app.utils.auth_utils import logout_user
except ImportError as e:
    print(f"Warning: Could not import UserService: {e}")
    UserService = None

# =============================================================================
# 4.0. SERVİS BAŞLATMA
# =============================================================================
# Rotaların kullanacağı servis sınıfından bir örnek oluşturulur.
user_service = UserService()

# =============================================================================
# 5.0. API ROTALARI (API ROUTES)
# =============================================================================

# -------------------------------------------------------------------------
# 5.1. Sistem Durumu Rotası (Health Check)
# -------------------------------------------------------------------------
@api_bp.route('/health', methods=['GET'])
def health_check():
    """5.1.1. API'nin çalışır durumda olduğunu kontrol eder."""
    return jsonify({
        'status': 'success',
        'message': 'API is running',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

# -------------------------------------------------------------------------
# 5.2. Kullanıcı Rotaları (User Routes)
# -------------------------------------------------------------------------
@api_bp.route('/users', methods=['GET'])
def get_users():
    """5.2.1. Tüm kullanıcıları listeler."""
    try:
        users = user_service.get_all_users()
        return jsonify({
            'status': 'success',
            'data': users
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to fetch users',
            'error': str(e)
        }), 500

@api_bp.route('/users', methods=['POST'])
def create_user():
    """5.2.2. Yeni bir kullanıcı oluşturur."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400

    # Tüm iş mantığı servis katmanına devredildi.
    success, result = user_service.create_new_user(data)

    if success:
        return jsonify({
            'status': 'success',
            'message': 'User created successfully',
            'data': result
        }), 201  # 201 Created
    else:
        # Hata mesajı servisten geldiği için doğrudan kullanılır.
        return jsonify({
            'status': 'error',
            'message': result.get('message', 'An error occurred'),
            'details': result
        }), 400  # 400 Bad Request

@api_bp.route('/register', methods=['POST'])
def register():
    """5.2.3. Kullanıcı kayıt işlemini gerçekleştirir."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400

    # Register iş mantığı servis katmanına devredildi.
    success, result = user_service.register_user(data)

    if success:
        return jsonify({
            'status': 'success',
            'message': 'Kayıt başarıyla tamamlandı',
            'data': result
        }), 201  # 201 Created
    else:
        # Hata mesajı servisten geldiği için doğrudan kullanılır.
        return jsonify({
            'status': 'error',
            'message': result.get('message', 'Kayıt işlemi başarısız'),
            'details': result
        }), 400  # 400 Bad Request

@api_bp.route('/login', methods=['POST'])
def login():
    """5.2.4. Kullanıcı giriş işlemini gerçekleştirir."""
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400

    # Login iş mantığı servis katmanına devredildi.
    success, result = user_service.login_user(data)

    if success:
        # Session'a kullanıcı bilgilerini kaydet
        session['logged_in'] = True
        session['user_id'] = result['id']
        session['username'] = result['username']
        session['email'] = result['email']
        
        return jsonify({
            'status': 'success',
            'message': 'Giriş başarılı',
            'data': result
        }), 200  # 200 OK
    else:
        # Hata mesajı servisten geldiği için doğrudan kullanılır.
        return jsonify({
            'status': 'error',
            'message': result.get('message', 'Giriş işlemi başarısız'),
            'details': result
        }), 401  # 401 Unauthorized

@api_bp.route('/logout', methods=['POST'])
def logout():
    """5.2.5. Kullanıcı çıkış işlemini gerçekleştirir."""
    # Session'ı temizle
    logout_user()
    
    return jsonify({
        'status': 'success',
        'message': 'Çıkış başarılı'
    }), 200  # 200 OK

@api_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """5.2.6. Kullanıcının giriş durumunu kontrol eder."""
    if session.get('logged_in'):
        return jsonify({
            'status': 'success',
            'logged_in': True,
            'user': {
                'id': session.get('user_id'),
                'username': session.get('username'),
                'email': session.get('email')
            }
        }), 200
    else:
        return jsonify({
            'status': 'success',
            'logged_in': False
        }), 200