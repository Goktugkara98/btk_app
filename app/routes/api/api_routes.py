# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, Flask uygulamasının ana API rotalarını (endpoints) içerir.
# Diğer API modüllerini birleştirir ve ana blueprint'i oluşturur.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. BLUEPRINT BİRLEŞTİRME
# 5.0. ANA API ROTALARI (MAIN API ROUTES)
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from flask import Blueprint

# Create the main API blueprint
api_bp = Blueprint('api', __name__)

# =============================================================================
# 4.0. BLUEPRINT BİRLEŞTİRME
# =============================================================================
# Diğer API modüllerinden blueprint'leri import et ve kaydet

# Import user routes
try:
    from .user_routes import user_bp
    api_bp.register_blueprint(user_bp)
    print("✅ User routes registered successfully")
except ImportError as e:
    print(f"⚠️  Warning: Could not import user routes: {e}")

# Import system routes
try:
    from .system_routes import system_bp
    api_bp.register_blueprint(system_bp)
    print("✅ System routes registered successfully")
except ImportError as e:
    print(f"⚠️  Warning: Could not import system routes: {e}")

# Import quiz routes
try:
    from .quiz_routes import quiz_bp
    api_bp.register_blueprint(quiz_bp)
    print("✅ Quiz routes registered successfully")
except ImportError as e:
    print(f"⚠️  Warning: Could not import quiz routes: {e}")

# =============================================================================
# 5.0. ANA API ROTALARI (MAIN API ROUTES)
# =============================================================================
# Bu bölümde sadece ana API seviyesinde olması gereken rotalar bulunur.
# Özel rotalar ilgili modüllerde tanımlanmalıdır.

print("🚀 API routes modularization completed!")
print("📋 Available API modules:")
print("   • User routes (/api/users, /api/register, /api/login, etc.)")
print("   • System routes (/api/health, /api/status, /api/version)")
print("   • Quiz routes (/api/quiz/*)")
