# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, tüm servis sınıflarını birleştiren ana servis modülüdür.
# Diğer servis modüllerini import eder ve merkezi erişim sağlar.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. SERVİS SINIFLARI İMPORT
# 5.0. SERVİS FABRİKASI (SERVICE FACTORY)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from typing import Dict, Any, Optional

# =============================================================================
# 4.0. SERVİS SINIFLARI İMPORT
# =============================================================================

# User Service
try:
    from .user_service import UserService
except ImportError as e:
    print(f"Warning: Could not import UserService: {e}")
    UserService = None

# Quiz Service
try:
    from .quiz_service import QuizService
except ImportError as e:
    print(f"Warning: Could not import QuizService: {e}")
    QuizService = None

# System Service
try:
    from .system_service import SystemService
except ImportError as e:
    print(f"Warning: Could not import SystemService: {e}")
    SystemService = None

# =============================================================================
# 5.0. SERVİS FABRİKASI (SERVICE FACTORY)
# =============================================================================

class ServiceFactory:
    """
    Servis sınıflarını yöneten fabrika sınıfı.
    Tüm servislerin merkezi erişim noktasıdır.
    """
    
    def __init__(self):
        """Servis fabrikasını başlatır."""
        self._services = {}
        self._initialize_services()
    
    def _initialize_services(self):
        """Tüm servisleri başlatır."""
        try:
            if UserService:
                self._services['user'] = UserService()
                print("✅ UserService başlatıldı")
            
            if QuizService:
                self._services['quiz'] = QuizService()
                print("✅ QuizService başlatıldı")
            
            if SystemService:
                self._services['system'] = SystemService()
                print("✅ SystemService başlatıldı")
                
        except Exception as e:
            print(f"❌ Servis başlatma hatası: {e}")
    
    def get_service(self, service_name: str) -> Optional[Any]:
        """
        Belirtilen servisi döndürür.
        
        Args:
            service_name (str): Servis adı ('user', 'quiz', 'system')
            
        Returns:
            Service instance or None if not found
        """
        return self._services.get(service_name)
    
    def get_user_service(self) -> Optional[UserService]:
        """UserService'i döndürür."""
        return self.get_service('user')
    
    def get_quiz_service(self) -> Optional[QuizService]:
        """QuizService'i döndürür."""
        return self.get_service('quiz')
    
    def get_system_service(self) -> Optional[SystemService]:
        """SystemService'i döndürür."""
        return self.get_service('system')
    
    def get_all_services(self) -> Dict[str, Any]:
        """Tüm servisleri döndürür."""
        return self._services.copy()
    
    def is_service_available(self, service_name: str) -> bool:
        """Belirtilen servisin mevcut olup olmadığını kontrol eder."""
        return service_name in self._services

# Global service factory instance
service_factory = ServiceFactory()

# Convenience functions for direct access
def get_user_service() -> Optional[UserService]:
    """UserService'e kolay erişim."""
    return service_factory.get_user_service()

def get_quiz_service() -> Optional[QuizService]:
    """QuizService'e kolay erişim."""
    return service_factory.get_quiz_service()

def get_system_service() -> Optional[SystemService]:
    """SystemService'e kolay erişim."""
    return service_factory.get_system_service()

# =============================================================================
# DOĞRUDAN ÇALIŞTIRMA
# =============================================================================
if __name__ == "__main__":
    print("🚀 Servis fabrikası test ediliyor...")
    
    # Test service availability
    print(f"UserService mevcut: {service_factory.is_service_available('user')}")
    print(f"QuizService mevcut: {service_factory.is_service_available('quiz')}")
    print(f"SystemService mevcut: {service_factory.is_service_available('system')}")
    
    # Test service instances
    user_service = get_user_service()
    quiz_service = get_quiz_service()
    system_service = get_system_service()
    
    if user_service:
        print("✅ UserService başarıyla alındı")
    if quiz_service:
        print("✅ QuizService başarıyla alındı")
    if system_service:
        print("✅ SystemService başarıyla alındı")
    
    print("🎉 Servis fabrikası test tamamlandı!")
