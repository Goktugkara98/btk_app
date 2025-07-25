# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, kullanıcılarla ilgili iş mantığını yöneten UserService sınıfını
# içerir. API rotaları ile veritabanı işlemleri (repository) arasında bir
# köprü görevi görür. Veri doğrulama ve işleme gibi operasyonlar burada
# gerçekleştirilir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. USERSERVICE SINIFI
#   4.1. Başlatma (Initialization)
#     4.1.1. __init__(self)
#   4.2. Kullanıcı İş Mantığı Metotları
#     4.2.1. get_all_users(self)
#     4.2.2. create_new_user(self, user_data)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from app.database.user_repository import UserRepository # Önceki adımdan UserRepository
from typing import Dict, Any, List, Tuple, Optional

# =============================================================================
# 4.0. USERSERVICE SINIFI
# =============================================================================
class UserService:
    """
    Kullanıcılarla ilgili iş mantığını yönetir.
    """

    # -------------------------------------------------------------------------
    # 4.1. Başlatma (Initialization)
    # -------------------------------------------------------------------------
    def __init__(self):
        """4.1.1. Servisin kurucu metodu. Gerekli repository'leri başlatır."""
        self.user_repo = UserRepository()

    # -------------------------------------------------------------------------
    # 4.2. Kullanıcı İş Mantığı Metotları
    # -------------------------------------------------------------------------
    def get_all_users(self) -> List[Dict[str, Any]]:
        """4.2.1. Tüm kullanıcıları alır ve API için uygun formata dönüştürür."""
        try:
            users = self.user_repo.get_all_users() # Depo metodunu çağırır
            formatted_users = [{
                'id': user.get('id'),
                'username': user.get('username'),
                'email': user.get('email'),
                'is_active': user.get('is_active', True),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            } for user in users]
            return formatted_users
        except Exception as e:
            # Hata durumunda boş liste veya hata fırlatılabilir.
            # Burada loglama yapmak önemlidir.
            print(f"Error in get_all_users service: {e}")
            return []

    def create_new_user(self, user_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        4.2.2. Yeni bir kullanıcı oluşturmak için iş mantığını çalıştırır.
        Doğrulama, kontrol ve oluşturma işlemlerini içerir.
        Dönüş Değeri: (başarı_durumu, sonuç_veya_hata_mesajı)
        """
        # 1. Gerekli alanların kontrolü
        required_fields = ['username', 'email', 'password']
        missing_fields = [field for field in required_fields if not user_data.get(field)]
        if missing_fields:
            return False, {'message': 'Missing required fields', 'missing': missing_fields}

        username = user_data['username']
        email = user_data['email']
        password = user_data['password'] # Gerçekte bu şifre burada hash'lenmelidir.

        try:
            # 2. Kullanıcı adı veya e-posta zaten var mı kontrol et
            if self.user_repo.get_user_by_username(username):
                return False, {'message': 'Username already exists'}
            if self.user_repo.get_user_by_email(email):
                return False, {'message': 'Email already exists'}

            # 3. Yeni kullanıcıyı oluştur
            # Şifreyi hash'leme işlemi burada yapılmalıdır. Örn:
            # from werkzeug.security import generate_password_hash
            # password_hash = generate_password_hash(password)
            new_user_id = self.user_repo.create_user(username, email, password) # password_hash

            if not new_user_id:
                return False, {'message': 'Failed to create user in database'}

            # 4. Başarılı sonuç dön
            created_user = self.user_repo.get_user_by_id(new_user_id)
            return True, {
                'id': created_user.get('id'),
                'username': created_user.get('username'),
                'email': created_user.get('email')
            }

        except Exception as e:
            print(f"Error in create_new_user service: {e}")
            return False, {'message': 'An unexpected error occurred'}