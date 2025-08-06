# =============================================================================
# GEMINI API SERVICE
# =============================================================================
# Bu modül, sadece Gemini AI API ile iletişimi yönetir.
# Saf API client olarak çalışır, business logic içermez.
# =============================================================================

import os
import json
import requests
from typing import Dict, Any, Optional
from datetime import datetime

class GeminiAPIService:
    """
    Gemini AI API ile doğrudan iletişim kuran servis.
    Sadece API call'ları yapar, business logic içermez.
    """
    
    def __init__(self):
        """Gemini API servisini başlatır."""
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        self.is_configured = self._check_configuration()
        
        # Default generation config
        self.default_config = {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.8,
            "maxOutputTokens": 2048,  # Increased from 1024 to allow longer responses
        }
    
    def _check_configuration(self) -> bool:
        """API key konfigürasyonunu kontrol eder."""
        if not self.api_key:
            print("⚠️ GEMINI_API_KEY environment variable not set")
            return False
        
        print("✅ Gemini API configured successfully")
        return True
    
    def is_available(self) -> bool:
        """API servisinin kullanılabilir olup olmadığını kontrol eder."""
        return self.is_configured
    
    def generate_content(self, prompt: str, config: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Gemini API'sine content generation request gönderir.
        
        Args:
            prompt: AI'ya gönderilecek prompt
            config: Generation konfigürasyonu (optional)
            
        Returns:
            AI yanıtı veya None
        """
        if not self.is_configured:
            return None
            
        try:
            # Config'i birleştir
            generation_config = {**self.default_config, **(config or {})}
            
            # Request body'yi hazırla
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": generation_config
            }
            
            # Headers
            headers = {
                "Content-Type": "application/json",
                "x-goog-api-key": self.api_key
            }
            
            # API call yap
            response = requests.post(
                self.base_url,
                headers=headers,
                json=request_body,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"🔍 Gemini API Response: {json.dumps(result, indent=2)}")
                
                # Response'dan text'i çıkar
                if 'candidates' in result and len(result['candidates']) > 0:
                    candidate = result['candidates'][0]
                    
                    # Check if response was truncated due to token limits
                    if 'finishReason' in candidate and candidate['finishReason'] == 'MAX_TOKENS':
                        print("⚠️ Gemini API: Response truncated due to token limits")
                        return "Üzgünüm, yanıtım çok uzun oldu. Lütfen sorunuzu daha kısa tutabilir misiniz?"
                    
                    if 'content' in candidate and 'parts' in candidate['content']:
                        parts = candidate['content']['parts']
                        if len(parts) > 0 and 'text' in parts[0]:
                            return parts[0]['text']
                
                print("⚠️ Gemini API: No content in response")
                return None
                
            else:
                print(f"❌ Gemini API error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("❌ Gemini API timeout")
            return None
        except requests.exceptions.RequestException as e:
            print(f"❌ Gemini API request error: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Gemini API JSON decode error: {e}")
            return None
        except Exception as e:
            print(f"❌ Gemini API unexpected error: {e}")
            return None
    
    def get_service_status(self) -> Dict[str, Any]:
        """API servisinin durumunu döndürür."""
        return {
            'available': self.is_configured,
            'api_key_configured': bool(self.api_key),
            'model': 'gemini-pro',
            'timestamp': datetime.now().isoformat()
        }
    
    def test_connection(self) -> bool:
        """
        API bağlantısını test eder.
        
        Returns:
            Bağlantı başarılı ise True
        """
        test_prompt = "Hello, test message."
        response = self.generate_content(test_prompt)
        print(response)
        return response is not None