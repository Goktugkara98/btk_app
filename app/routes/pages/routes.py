from flask import Blueprint, render_template

# Create the blueprint
pages_bp = Blueprint('pages', __name__)

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
