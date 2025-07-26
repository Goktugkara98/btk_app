from flask import Blueprint

# Import the blueprint from api_routes.py
from .api_routes import api_bp

# This makes the blueprint available when importing from app.routes.api
__all__ = ['api_bp']
