from flask import Blueprint

pages_bp = Blueprint('pages', __name__)

# Import routes after creating blueprint to avoid circular imports
from app.routes.pages import routes
