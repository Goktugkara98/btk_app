from flask import Flask, render_template, session
from config import Config
from app.database.db_connection import DatabaseConnection
from app.database.db_migrations import DatabaseMigrations
import os
import secrets

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    template_dir = os.path.abspath('app/templates')
    static_dir = os.path.abspath('app/static')
    app = Flask(__name__, 
               template_folder=template_dir,
               static_folder=static_dir,
               static_url_path='/static')
    app.config.from_object(config_class)
    
    # Session configuration
    app.secret_key = secrets.token_hex(16)
    app.config['SESSION_TYPE'] = 'filesystem'
    
    # Ensure the instance folder exists
    try:
        os.makedirs(app.instance_path, exist_ok=True)
    except OSError as e:
        app.logger.error(f"Failed to create instance directory: {e}")
    
    # Initialize database
    db_connection = None
    try:
        # Create database connection
        db_connection = DatabaseConnection()
        
        # Run database migrations
        migrations = DatabaseMigrations(db_connection)
        migrations.run_migrations()
        
        # Store the database connection in the app context
        app.config['DB_CONNECTION'] = db_connection
        
        app.logger.info("Database initialized successfully")
    except Exception as e:
        app.logger.error(f"Failed to initialize database: {e}")
        if db_connection:
            db_connection.close()
        raise
    
    # Register blueprints
    try:
        from app.routes import api_bp, pages_bp
        
        app.register_blueprint(api_bp, url_prefix='/api')
        app.register_blueprint(pages_bp)
        app.logger.info("App blueprints registered successfully")
    except ImportError as e:
        app.logger.error(f"Failed to import app blueprints: {e}")
        raise
    except Exception as e:
        app.logger.error(f"Failed to register app blueprints: {e}")
        raise
    
    # Register news editor module
    try:
        from news_editor import news_editor_bp
        
        app.register_blueprint(news_editor_bp)
        app.logger.info("News editor module registered successfully")
    except ImportError as e:
        app.logger.error(f"Failed to import news editor module: {e}")
        # Don't raise here, as the main app should still work without the news editor
    except Exception as e:
        app.logger.error(f"Failed to register news editor module: {e}")
        # Don't raise here, as the main app should still work without the news editor
    
    # Context processor to make session data available in all templates
    @app.context_processor
    def inject_session_data():
        return dict(session=session)
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)