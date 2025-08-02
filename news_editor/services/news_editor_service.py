import os
import hashlib
import requests
from ..database import NewsEditorRepository


class NewsEditorService:
    """Haber editörü iş mantığını yöneten service sınıfı"""
    
    def __init__(self, repository: NewsEditorRepository):
        self.repository = repository
    
    def process_news_text(self, original_news: str) -> dict:
        """Haber metnini işler ve prompt oluşturur"""
        try:
            # Prompt.txt dosyasını oku
            prompt_template = self._read_prompt_template()
            
            # İstatistikleri hesapla
            char_count = len(original_news)
            word_count = len(original_news.split())
            line_count = len(original_news.split('\n'))
            
            # News ID oluştur
            news_id = self._generate_news_id(original_news)
            
            # Prompt'u oluştur
            updated_prompt = prompt_template.replace("ORİJİNAL HABER:", f"ORİJİNAL HABER:\n{original_news}")
            
            # Veritabanına kaydet
            success = self.repository.save_news(
                news_id=news_id,
                original_news=original_news,
                processed_prompt=updated_prompt,
                char_count=char_count,
                word_count=word_count,
                line_count=line_count
            )
            
            if not success:
                raise Exception("Veritabanına kaydetme başarısız")
            
            return {
                'success': True,
                'news_id': news_id,
                'updated_prompt': updated_prompt,
                'char_count': char_count,
                'word_count': word_count,
                'line_count': line_count
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_to_gemini(self, news_id: str, processed_prompt: str) -> dict:
        """Prompt'u Gemini'ye gönderir"""
        try:
            print(f"Service: Sending to Gemini for news_id: {news_id}")
            
            # Gemini API key'ini al
            gemini_api_key = os.getenv('GEMINI_API_KEY', '')
            if not gemini_api_key:
                raise Exception("Gemini API key bulunamadı")
            
            print(f"Service: Gemini API key found: {len(gemini_api_key) > 0}")
            
            # Gemini API'ye istek gönder
            gemini_response = self._call_gemini_api(gemini_api_key, processed_prompt)
            print(f"Service: Gemini response received, length: {len(gemini_response) if gemini_response else 0}")
            
            # Yanıtı veritabanına kaydet
            success = self.repository.save_gemini_response(news_id, gemini_response)
            print(f"Service: Save result: {success}")
            
            if not success:
                raise Exception("Gemini yanıtı kaydedilemedi")
            
            return {
                'success': True,
                'gemini_response': gemini_response
            }
            
        except Exception as e:
            print(f"Service: Exception in send_to_gemini: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_news_history(self, page: int = 1, limit: int = 10) -> dict:
        """Haber geçmişini getirir"""
        try:
            history = self.repository.get_all_news(page, limit)
            return {
                'success': True,
                'history': history
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def search_news(self, search_term: str, limit: int = 10) -> dict:
        """Haber arama yapar"""
        try:
            results = self.repository.search_news(search_term, limit)
            return {
                'success': True,
                'results': results
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_news_detail(self, news_id: str) -> dict:
        """Haber detayını getirir"""
        try:
            news = self.repository.get_news_by_id(news_id)
            if not news:
                raise Exception("Haber bulunamadı")
            
            return {
                'success': True,
                'news': news
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_news(self, news_id: str) -> dict:
        """Haber kaydını siler"""
        try:
            print(f"Service: Deleting news_id: {news_id}")
            
            success = self.repository.delete_news(news_id)
            print(f"Service: Repository delete result: {success}")
            
            if not success:
                raise Exception("Haber silinemedi")
            
            return {
                'success': True,
                'message': 'Haber başarıyla silindi'
            }
        except Exception as e:
            print(f"Service: Delete exception: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_statistics(self) -> dict:
        """İstatistikleri getirir"""
        try:
            stats = self.repository.get_statistics()
            return {
                'success': True,
                'stats': stats
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _read_prompt_template(self) -> str:
        """Prompt.txt dosyasını okur"""
        try:
            with open('prompt.txt', 'r', encoding='utf-8') as file:
                return file.read()
        except FileNotFoundError:
            raise Exception("prompt.txt dosyası bulunamadı")
        except Exception as e:
            raise Exception(f"Prompt dosyası okuma hatası: {e}")
    
    def _generate_news_id(self, text: str) -> str:
        """Metin için benzersiz ID oluşturur"""
        # Metnin ilk 50 karakterini al ve hash oluştur
        text_sample = text[:50] if len(text) > 50 else text
        hash_object = hashlib.md5(text_sample.encode())
        return f"news_{hash_object.hexdigest()[:8]}"
    
    def _call_gemini_api(self, api_key: str, prompt: str) -> str:
        """Gemini API'ye istek gönderir"""
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={api_key}"
            
            headers = {
                'Content-Type': 'application/json'
            }
            
            data = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            
            # Gemini yanıtını çıkar
            if 'candidates' in result and len(result['candidates']) > 0:
                candidate = result['candidates'][0]
                if 'content' in candidate and 'parts' in candidate['content']:
                    parts = candidate['content']['parts']
                    if len(parts) > 0 and 'text' in parts[0]:
                        return parts[0]['text']
            
            raise Exception("Gemini yanıtı alınamadı")
            
        except requests.exceptions.Timeout:
            raise Exception("Gemini API timeout hatası: İstek 60 saniye içinde tamamlanamadı")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Gemini API bağlantı hatası: {e}")
        except Exception as e:
            raise Exception(f"Gemini API hatası: {e}") 