from flask import render_template
from app.routes.pages import pages_bp

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
