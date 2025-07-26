# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, veritabanı şemasının (tabloların) oluşturulması ve yönetilmesi
# için gerekli geçiş işlemlerini yürüten `Migrations` sınıfını içerir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# 4.0. MIGRATIONS SINIFI
#   4.1. Başlatma ve Bağlantı Sahipliği
#     4.1.1. __init__(self, db_connection)
#   4.2. Dahili Bağlantı Yönetimi
#     4.2.1. _ensure_connection(self)
#     4.2.2. _close_if_owned(self)
#   4.3. Geçiş Metotları (Migration Methods)
#     4.3.1. create_users_table(self)
#   4.4. Ana Geçiş Yöneticisi
#     4.4.1. run_migrations(self)
# 5.0. DOĞRUDAN ÇALIŞTIRMA BLOĞU
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER
# =============================================================================
from mysql.connector import Error as MySQLError
from typing import Optional
from app.database.db_connection import DatabaseConnection

# =============================================================================
# 4.0. MIGRATIONS SINIFI
# =============================================================================
class Migrations:
    """
    Veritabanı şemasını (tabloları) oluşturmak için geçiş işlemlerini yürütür.
    """

    # -------------------------------------------------------------------------
    # 4.1. Başlatma ve Bağlantı Sahipliği
    # -------------------------------------------------------------------------
    def __init__(self, db_connection: Optional[DatabaseConnection] = None):
        """4.1.1. Sınıfın kurucu metodu. Harici veya dahili bağlantı kullanır."""
        if db_connection:
            self.db: DatabaseConnection = db_connection
            self.own_connection: bool = False
        else:
            self.db: DatabaseConnection = DatabaseConnection()
            self.own_connection: bool = True

    # -------------------------------------------------------------------------
    # 4.2. Dahili Bağlantı Yönetimi
    # -------------------------------------------------------------------------
    def _ensure_connection(self):
        """4.2.1. Veritabanı bağlantısı kapalıysa yeniden kurar."""
        self.db._ensure_connection()

    def _close_if_owned(self):
        """4.2.2. Eğer bağlantı bu sınıf tarafından oluşturulduysa kapatır."""
        if self.own_connection:
            self.db.close()

    # -------------------------------------------------------------------------
    # 4.3. Geçiş Metotları (Migration Methods)
    # -------------------------------------------------------------------------
    def create_users_table(self):
        """4.3.1. `users` tablosunu oluşturur veya var olduğunu doğrular."""
        self._ensure_connection()
        try:
            with self.db as conn: # Context manager kullanımı
                query = """
                    CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        password VARCHAR(255) NOT NULL
                    )
                """
                conn.cursor.execute(query)
                conn.connection.commit()
        except MySQLError:
            raise

    # -------------------------------------------------------------------------
    # 4.4. Ana Geçiş Yöneticisi
    # -------------------------------------------------------------------------
    def run_migrations(self):
        """4.4.1. Proje için gerekli olan tüm tabloları oluşturur."""
        try:
            print("Veritabanı geçişleri başlatılıyor...")
            self.create_users_table()
            print("- 'users' tablosu başarıyla oluşturuldu veya zaten mevcut.")
            # Gelecekte eklenecek diğer tablo oluşturma fonksiyonları buraya çağrılabilir.
            # self.create_another_table()
            print("Tüm geçişler başarıyla tamamlandı.")
        except MySQLError as e:
            print(f"Geçiş sırasında bir hata oluştu: {e}")
            raise
        finally:
            self._close_if_owned()

# =============================================================================
# 5.0. DOĞRUDAN ÇALIŞTIRMA BLOĞU
# =============================================================================
if __name__ == '__main__':
    migrations = Migrations()
    migrations.run_migrations()