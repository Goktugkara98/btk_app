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
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from flask import jsonify, request
from app.routes.api import api_bp
from app.services.user_service import UserService # YENİ: Servis import edildi
from datetime import datetime

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
    # Bu rota basit olduğu için doğrudan veritabanına erişebilir veya
    # servis üzerinden bir "ping" metodu çağırabilir.
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
        users = user_service.get_all_users() # Servis metodu çağrıldı
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