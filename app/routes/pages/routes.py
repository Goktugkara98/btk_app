from flask import Blueprint, render_template, send_from_directory
import os

# Create the blueprint
pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/app/data/<filename>')
def serve_data(filename):
    """Serve data files from app/data directory."""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    return send_from_directory(data_dir, filename)

@pages_bp.route('/')
def index():
    """Render the home page."""
    return render_template('index.html', title='Home')

@pages_bp.route('/about')
def about():
    """Render the about page."""
    return render_template('about.html', title='About')

@pages_bp.route('/contact')
def contact():
    """Render the contact page."""
    return render_template('contact.html', title='Contact')


@pages_bp.route('/quiz')
def quiz():
    """Render the quiz page."""
    return render_template('quiz_screen.html', title='Quiz')

@pages_bp.route('/quiz/results')
def quiz_results():
    """Render the quiz results page."""
    return render_template('quiz_results.html', title='Quiz Sonuçları')


@pages_bp.route('/login')
def login():
    """Render the login page."""
    return render_template('login.html', title='Login')

@pages_bp.route('/register')
def register():
    """Render the register page."""
    return render_template('register.html', title='Register')
