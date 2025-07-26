from flask import Flask, render_template
from config import Config
from app.database.db_connection import DatabaseConnection
from app.database.db_migrations import Migrations
import os

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    template_dir = os.path.abspath('app/templates')
    app = Flask(__name__, template_folder=template_dir)
    app.config.from_object(config_class)
    
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
        migrations = Migrations(db_connection)
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
        app.logger.info("Blueprints registered successfully")
    except ImportError as e:
        app.logger.error(f"Failed to import blueprints: {e}")
        raise
    except Exception as e:
        app.logger.error(f"Failed to register blueprints: {e}")
        raise
    
    # Basic error handler
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('404.html'), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal server error: {error}")
        return render_template('500.html'), 500
    
    # Close database connection when app context is torn down
    @app.teardown_appcontext
    def teardown_db(exception):
        if 'DB_CONNECTION' in app.config and app.config['DB_CONNECTION']:
            try:
                app.config['DB_CONNECTION'].close()
            except Exception as e:
                app.logger.error(f"Error closing database connection: {e}")
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)