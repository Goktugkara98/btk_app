from .connection import DatabaseConnection


class NewsEditorRepository:
    """Haber editörü veritabanı işlemlerini yöneten repository sınıfı"""
    
    def __init__(self, db_connection: DatabaseConnection):
        self.db_connection = db_connection
    
    def save_news(self, news_id: str, original_news: str, processed_prompt: str, 
                  char_count: int, word_count: int, line_count: int) -> bool:
        """Yeni haber kaydını veritabanına kaydeder"""
        try:
            with self.db_connection as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = """
                INSERT INTO news_editor_history 
                (news_id, original_news, processed_prompt, char_count, word_count, line_count)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                original_news = VALUES(original_news),
                processed_prompt = VALUES(processed_prompt),
                char_count = VALUES(char_count),
                word_count = VALUES(word_count),
                line_count = VALUES(line_count),
                updated_at = CURRENT_TIMESTAMP
                """
                
                cursor.execute(query, (news_id, original_news, processed_prompt, 
                                     char_count, word_count, line_count))
                conn.commit()
                cursor.close()
                return True
                
        except Exception as e:
            print(f"Veritabanı kaydetme hatası: {e}")
            return False
    
    def get_news_by_id(self, news_id: str) -> dict:
        """ID'ye göre haber kaydını getirir"""
        try:
            with self.db_connection as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = "SELECT * FROM news_editor_history WHERE news_id = %s"
                cursor.execute(query, (news_id,))
                result = cursor.fetchone()
                cursor.close()
                
                return result
                
        except Exception as e:
            print(f"Veritabanı getirme hatası: {e}")
            return None
    
    def get_all_news(self, page: int = 1, limit: int = 10) -> list:
        """Tüm haber kayıtlarını sayfalı olarak getirir"""
        try:
            with self.db_connection as conn:
                cursor = conn.cursor(dictionary=True)
                
                offset = (page - 1) * limit
                query = """
                SELECT * FROM news_editor_history 
                ORDER BY created_at DESC 
                LIMIT %s OFFSET %s
                """
                
                cursor.execute(query, (limit, offset))
                results = cursor.fetchall()
                cursor.close()
                
                return results
                
        except Exception as e:
            print(f"Veritabanı listeleme hatası: {e}")
            return []
    
    def search_news(self, search_term: str, limit: int = 10) -> list:
        """Haber içeriğinde arama yapar"""
        try:
            with self.db_connection as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = """
                SELECT * FROM news_editor_history 
                WHERE original_news LIKE %s OR processed_prompt LIKE %s
                ORDER BY created_at DESC 
                LIMIT %s
                """
                
                search_pattern = f"%{search_term}%"
                cursor.execute(query, (search_pattern, search_pattern, limit))
                results = cursor.fetchall()
                cursor.close()
                
                return results
                
        except Exception as e:
            print(f"Veritabanı arama hatası: {e}")
            return []
    
    def delete_news(self, news_id: str) -> bool:
        """Haber kaydını siler"""
        try:
            print(f"Repository: Deleting news_id: {news_id}")
            
            with self.db_connection as conn:
                cursor = conn.cursor()
                
                query = "DELETE FROM news_editor_history WHERE news_id = %s"
                cursor.execute(query, (news_id,))
                conn.commit()
                
                row_count = cursor.rowcount
                print(f"Repository: Rows affected: {row_count}")
                
                cursor.close()
                
                return row_count > 0
                
        except Exception as e:
            print(f"Veritabanı silme hatası: {e}")
            return False
    
    def save_gemini_response(self, news_id: str, gemini_response: str) -> bool:
        """Gemini yanıtını kaydeder"""
        try:
            print(f"Repository: Saving Gemini response for news_id: {news_id}")
            print(f"Repository: Response length: {len(gemini_response) if gemini_response else 0}")
            
            with self.db_connection as conn:
                cursor = conn.cursor()
                
                # Önce haberin var olup olmadığını kontrol et
                check_query = "SELECT news_id FROM news_editor_history WHERE news_id = %s"
                cursor.execute(check_query, (news_id,))
                existing_news = cursor.fetchone()
                
                if not existing_news:
                    print(f"Repository: News not found with ID: {news_id}")
                    return False
                
                query = """
                UPDATE news_editor_history 
                SET gemini_response = %s, gemini_sent_at = CURRENT_TIMESTAMP
                WHERE news_id = %s
                """
                
                cursor.execute(query, (gemini_response, news_id))
                conn.commit()
                
                row_count = cursor.rowcount
                print(f"Repository: Rows affected: {row_count}")
                
                cursor.close()
                
                return row_count > 0
                
        except Exception as e:
            print(f"Gemini yanıtı kaydetme hatası: {e}")
            print(f"Repository: Exception details: {type(e).__name__}")
            return False
    
    def get_statistics(self) -> dict:
        """İstatistikleri getirir"""
        try:
            with self.db_connection as conn:
                cursor = conn.cursor(dictionary=True)
                
                # Toplam kayıt sayısı
                cursor.execute("SELECT COUNT(*) as total FROM news_editor_history")
                total_records = cursor.fetchone()['total']
                
                # Bugünkü kayıt sayısı
                cursor.execute("SELECT COUNT(*) as today FROM news_editor_history WHERE DATE(created_at) = CURDATE()")
                today_count = cursor.fetchone()['today']
                
                # Ortalama karakter sayısı
                cursor.execute("SELECT AVG(char_count) as avg_chars FROM news_editor_history")
                avg_chars_result = cursor.fetchone()['avg_chars']
                avg_chars = int(avg_chars_result) if avg_chars_result else 0
                
                cursor.close()
                
                return {
                    'total_records': total_records,
                    'today_count': today_count,
                    'avg_chars': avg_chars
                }
                
        except Exception as e:
            print(f"İstatistik getirme hatası: {e}")
            return {
                'total_records': 0,
                'today_count': 0,
                'avg_chars': 0
            } 