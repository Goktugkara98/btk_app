from flask import Blueprint

api_bp = Blueprint('api', __name__)

# Import routes after creating blueprint to avoid circular imports
from app.routes.api import routes
