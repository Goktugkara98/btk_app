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
#     4.2.3. register_user(self, register_data)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from app.database.user_repository import UserRepository
from werkzeug.security import generate_password_hash, check_password_hash
from typing import Dict, Any, List, Tuple, Optional
import re

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
            users = self.user_repo.get_all_users()
            formatted_users = [{
                'id': user.get('id'),
                'username': user.get('username'),
                'email': user.get('email'),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            } for user in users]
            return formatted_users
        except Exception as e:
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
        password = user_data['password']

        try:
            # 2. Kullanıcı adı veya e-posta zaten var mı kontrol et
            username_exists, email_exists = self.user_repo.check_username_or_email_exists(username, email)
            
            if username_exists:
                return False, {'message': 'Bu kullanıcı adı zaten kullanılıyor'}
            if email_exists:
                return False, {'message': 'Bu e-posta adresi zaten kullanılıyor'}

            # 3. Şifreyi hash'le
            password_hash = generate_password_hash(password)

            # 4. Yeni kullanıcıyı oluştur
            new_user_id = self.user_repo.create_user(username, email, password_hash)

            if not new_user_id:
                return False, {'message': 'Kullanıcı oluşturulurken bir hata oluştu'}

            # 5. Başarılı sonuç dön
            created_user = self.user_repo.get_user_by_id(new_user_id)
            return True, {
                'id': created_user.get('id'),
                'username': created_user.get('username'),
                'email': created_user.get('email')
            }

        except Exception as e:
            print(f"Error in create_new_user service: {e}")
            return False, {'message': 'Beklenmeyen bir hata oluştu'}

    def register_user(self, register_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        4.2.3. Register form verilerini işler ve yeni kullanıcı oluşturur.
        Register form'da name (username), email, password, password2 alanları bulunur.
        """
        # 1. Form verilerini kontrol et
        username = register_data.get('name', '').strip()
        email = register_data.get('email', '').strip()
        password = register_data.get('password', '')
        password2 = register_data.get('password2', '')

        # 2. Gerekli alanların kontrolü
        if not username:
            return False, {'message': 'Kullanıcı adı gereklidir'}
        if not email:
            return False, {'message': 'E-posta alanı gereklidir'}
        if not password:
            return False, {'message': 'Şifre alanı gereklidir'}
        if not password2:
            return False, {'message': 'Şifre tekrar alanı gereklidir'}

        # 3. Kullanıcı adı format kontrolü
        username_pattern = r'^[a-zA-Z0-9_]+$'
        if not re.match(username_pattern, username):
            return False, {'message': 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'}
        if len(username) < 3:
            return False, {'message': 'Kullanıcı adı en az 3 karakter olmalıdır'}
        if len(username) > 30:
            return False, {'message': 'Kullanıcı adı en fazla 30 karakter olabilir'}

        # 4. Şifre eşleşme kontrolü
        if password != password2:
            return False, {'message': 'Şifreler eşleşmiyor'}

        # 5. Şifre uzunluk kontrolü
        if len(password) < 6:
            return False, {'message': 'Şifre en az 6 karakter olmalıdır'}

        # 6. Email format kontrolü
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, {'message': 'Geçerli bir e-posta adresi giriniz'}

        # 7. Kullanıcı adı ve email kontrolü
        username_exists, email_exists = self.user_repo.check_username_or_email_exists(username, email)
        
        if username_exists:
            return False, {'message': 'Bu kullanıcı adı zaten kullanılıyor'}
        if email_exists:
            return False, {'message': 'Bu e-posta adresi zaten kullanılıyor'}

        try:
            # 8. Şifreyi hash'le
            password_hash = generate_password_hash(password)

            # 9. Yeni kullanıcıyı oluştur
            new_user_id = self.user_repo.create_user(username, email, password_hash)

            if not new_user_id:
                return False, {'message': 'Kullanıcı oluşturulurken bir hata oluştu'}

            # 10. Başarılı sonuç dön
            created_user = self.user_repo.get_user_by_id(new_user_id)
            return True, {
                'id': created_user.get('id'),
                'username': created_user.get('username'),
                'email': created_user.get('email')
            }

        except Exception as e:
            print(f"Error in register_user service: {e}")
            return False, {'message': 'Beklenmeyen bir hata oluştu'}

    def login_user(self, login_data: Dict[str, Any]) -> Tuple[bool, Dict[str, Any]]:
        """
        4.2.4. Login form verilerini işler ve kullanıcı girişini gerçekleştirir.
        Login form'da email ve password alanları bulunur.
        """
        # 1. Form verilerini kontrol et
        email = login_data.get('email', '').strip()
        password = login_data.get('password', '')

        # 2. Gerekli alanların kontrolü
        if not email:
            return False, {'message': 'E-posta alanı gereklidir'}
        if not password:
            return False, {'message': 'Şifre alanı gereklidir'}

        # 3. Email format kontrolü
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return False, {'message': 'Geçerli bir e-posta adresi giriniz'}

        try:
            # 4. Kullanıcıyı e-posta ile bul
            user = self.user_repo.get_user_by_email(email)
            
            if not user:
                return False, {'message': 'E-posta veya şifre hatalı'}

            # 5. Şifre kontrolü
            if not check_password_hash(user.get('password'), password):
                return False, {'message': 'E-posta veya şifre hatalı'}

            # 6. Başarılı giriş - kullanıcı bilgilerini döndür (şifre hariç)
            return True, {
                'id': user.get('id'),
                'username': user.get('username'),
                'email': user.get('email'),
                'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
            }

        except Exception as e:
            print(f"Error in login_user service: {e}")
            return False, {'message': 'Beklenmeyen bir hata oluştu'}

