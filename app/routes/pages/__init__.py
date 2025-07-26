# Import the blueprint from routes.py
from .routes import pages_bp

# This makes the blueprint available when importing from app.routes.pages
__all__ = ['pages_bp']
