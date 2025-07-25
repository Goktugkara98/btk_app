# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, MySQL veritabanı bağlantısını yönetmek için bir sarmalayıcı
# (wrapper) olan `DatabaseConnection` sınıfını içerir. Bağlantı kurma,
# sonlandırma ve bağlantının sürekliliğini sağlama işlemlerini merkezileştirir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# 4.0. MODÜL SEVİYESİ YAPILANDIRMA
# 5.0. DATABASECONNECTION SINIFI
#   5.1. Başlatma (Initialization)
#     5.1.1. __init__(self)
#   5.2. Bağlantı Yönetimi (Connection Management)
#     5.2.1. connect(self)
#     5.2.2. close(self)
#     5.2.3. _ensure_connection(self)
#   5.3. Context Manager Metotları
#     5.3.1. __enter__(self)
#     5.3.2. __exit__(self, exc_type, exc_val, exc_tb)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# =============================================================================
import os
import mysql.connector
from mysql.connector import Error as MySQLError
from typing import Optional, Dict, Any

# =============================================================================
# 4.0. MODÜL SEVİYESİ YAPILANDIRMA
# =============================================================================
# Ortam değişkenlerinden (environment variables) yapılandırmayı yükle
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'btk_app'),
    'port': int(os.getenv('DB_PORT', '3306'))
}

# =============================================================================
# 5.0. DATABASECONNECTION SINIFI
# =============================================================================
class DatabaseConnection:
    """
    MySQL veritabanı bağlantısını yönetmek için bir sarmalayıcı (wrapper) sınıf.
    """

    # -------------------------------------------------------------------------
    # 5.1. Başlatma (Initialization)
    # -------------------------------------------------------------------------
    def __init__(self):
        """5.1.1. Sınıfın kurucu metodu."""
        self.connection: Optional[mysql.connector.MySQLConnection] = None
        self.cursor: Optional[mysql.connector.cursor.MySQLCursor] = None
        self.db_config: Dict[str, Any] = DB_CONFIG
        self.connect()

    # -------------------------------------------------------------------------
    # 5.2. Bağlantı Yönetimi (Connection Management)
    # -------------------------------------------------------------------------
    def connect(self):
        """5.2.1. Yapılandırma dosyasındaki bilgileri kullanarak veritabanına bağlanır."""
        try:
            if self.connection and self.connection.is_connected():
                return
            self.connection = mysql.connector.connect(**self.db_config)
            # cursor'u burada yeniden oluşturmak yerine, gerektiğinde oluşturmak daha güvenlidir.
            # Ancak başlangıçta bir cursor oluşturma mantığı da geçerlidir.
            # self.cursor = self.connection.cursor(dictionary=True) # İsteğe bağlı
        except MySQLError as e:
            # Hata yönetimi burada daha detaylı yapılabilir (logging vb.)
            raise

    def close(self):
        """5.2.2. Veritabanı bağlantısını ve (varsa) cursor'u kapatır."""
        try:
            if self.cursor and not self.cursor.is_closed():
                self.cursor.close()
            if self.connection and self.connection.is_connected():
                self.connection.close()
        except MySQLError:
            # Hata yönetimi
            raise

    def _ensure_connection(self):
        """5.2.3. Bağlantının aktif olup olmadığını kontrol eder. Değilse, yeniden bağlanır."""
        if not self.connection or not self.connection.is_connected():
            self.connect()

    # -------------------------------------------------------------------------
    # 5.3. Context Manager Metotları
    # -------------------------------------------------------------------------
    def __enter__(self):
        """5.3.1. 'with' bloğu için giriş metodu. Bağlantıyı sağlar ve yeni bir cursor döner."""
        self._ensure_connection()
        # Her 'with' bloğu için yeni bir cursor oluşturmak, izolasyon sağlar.
        self.cursor = self.connection.cursor(dictionary=True)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """5.3.2. 'with' bloğundan çıkıldığında cursor'u ve bağlantıyı kapatır."""
        # 'with' bloğu sonunda bağlantıyı kapatmak yerine sadece cursor'u kapatıp
        # commit/rollback yapmak daha performanslı olabilir. Bu yapı, her 'with'
        # bloğunda yeni bağlantı açıp kapatır.
        # Örneğin:
        # if exc_type: self.connection.rollback()
        # else: self.connection.commit()
        # if self.cursor: self.cursor.close()
        self.close()