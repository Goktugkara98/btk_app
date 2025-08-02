import mysql.connector
from mysql.connector import Error


class DatabaseConnection:
    """MySQL veritabanı bağlantısını yöneten sınıf"""
    
    def __init__(self, host='localhost', user='root', password='', database='haber_editor'):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
    
    def get_connection(self):
        """Veritabanı bağlantısı alır"""
        try:
            if self.connection is None or not self.connection.is_connected():
                self.connection = mysql.connector.connect(
                    host=self.host,
                    user=self.user,
                    password=self.password,
                    database=self.database,
                    charset='utf8mb4',
                    collation='utf8mb4_unicode_ci'
                )
            return self.connection
        except Error as e:
            raise Exception(f"Veritabanı bağlantı hatası: {e}")
    
    def close_connection(self):
        """Veritabanı bağlantısını kapatır"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def init_database(self):
        """Veritabanını ve tabloları oluşturur"""
        try:
            # Önce veritabanı olmadan bağlan
            temp_connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password
            )
            cursor = temp_connection.cursor()
            
            # Veritabanını oluştur
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            cursor.close()
            temp_connection.close()
            
            # Şimdi veritabanı ile bağlan
            conn = self.get_connection()
            cursor = conn.cursor()
            
            # Tabloyu oluştur
            create_table_query = """
            CREATE TABLE IF NOT EXISTS news_editor_history (
                id INT AUTO_INCREMENT PRIMARY KEY,
                news_id VARCHAR(255) NOT NULL UNIQUE,
                original_news LONGTEXT NOT NULL,
                processed_prompt LONGTEXT NOT NULL,
                char_count INT DEFAULT 0,
                word_count INT DEFAULT 0,
                line_count INT DEFAULT 0,
                gemini_response LONGTEXT NULL,
                gemini_sent_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_news_id (news_id),
                INDEX idx_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            """
            
            cursor.execute(create_table_query)
            conn.commit()
            cursor.close()
            
        except Error as e:
            raise Exception(f"Veritabanı başlatma hatası: {e}")
    
    def __enter__(self):
        """Context manager için giriş"""
        return self.get_connection()
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager için çıkış"""
        self.close_connection() 