from flask import Blueprint, request, jsonify, render_template
from ..services import NewsEditorService
from ..database import DatabaseConnection, NewsEditorRepository

# Blueprint oluştur
news_editor_bp = Blueprint('news_editor', __name__, 
                          url_prefix='/news-editor',
                          template_folder='../templates',
                          static_folder='../static')

# Database ve service instance'larını oluştur
db_connection = DatabaseConnection()
repository = NewsEditorRepository(db_connection)
service = NewsEditorService(repository)


@news_editor_bp.route('/')
def index():
    """Ana sayfa"""
    try:
        # İstatistikleri al
        stats_result = service.get_statistics()
        stats = stats_result.get('stats', {}) if stats_result['success'] else {}
        
        return render_template('news_editor.html', stats=stats)
    except Exception as e:
        return render_template('news_editor.html', stats={})


@news_editor_bp.route('/process', methods=['POST'])
def process_news():
    """Haber metnini işler"""
    try:
        original_news = request.form.get('original_news', '').strip()
        
        if not original_news:
            return jsonify({
                'success': False,
                'error': 'Orijinal haber metni gerekli'
            }), 400
        
        # Service katmanını kullan
        result = service.process_news_text(original_news)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'İşleme hatası: {str(e)}'
        }), 500


@news_editor_bp.route('/send-to-gemini', methods=['POST'])
def send_to_gemini():
    """Prompt'u Gemini'ye gönderir"""
    try:
        news_id = request.form.get('news_id', '').strip()
        processed_prompt = request.form.get('processed_prompt', '').strip()
        
        if not news_id or not processed_prompt:
            return jsonify({
                'success': False,
                'error': 'News ID ve processed prompt gerekli'
            }), 400
        
        # Service katmanını kullan
        result = service.send_to_gemini(news_id, processed_prompt)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Gemini gönderme hatası: {str(e)}'
        }), 500


@news_editor_bp.route('/history')
def get_history():
    """Haber geçmişini getirir"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        
        # Service katmanını kullan
        result = service.get_news_history(page, limit)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Geçmiş getirme hatası: {str(e)}'
        }), 500


@news_editor_bp.route('/search')
def search_news():
    """Haber arama yapar"""
    try:
        search_term = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if not search_term:
            return jsonify({
                'success': False,
                'error': 'Arama terimi gerekli'
            }), 400
        
        # Service katmanını kullan
        result = service.search_news(search_term, limit)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Arama hatası: {str(e)}'
        }), 500


@news_editor_bp.route('/history/<news_id>')
def get_news_detail(news_id):
    """Haber detayını getirir"""
    try:
        # Service katmanını kullan
        result = service.get_news_detail(news_id)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Detay getirme hatası: {str(e)}'
        }), 500


@news_editor_bp.route('/history/<news_id>', methods=['DELETE'])
def delete_news(news_id):
    """Haber kaydını siler"""
    try:
        print(f"DELETE request for news_id: {news_id}")
        
        # Service katmanını kullan
        result = service.delete_news(news_id)
        
        print(f"Delete result: {result}")
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        print(f"Delete exception: {e}")
        return jsonify({
            'success': False,
            'error': f'Silme hatası: {str(e)}'
        }), 500


@news_editor_bp.route('/stats')
def get_stats():
    """İstatistikleri getirir"""
    try:
        # Service katmanını kullan
        result = service.get_statistics()
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'İstatistik getirme hatası: {str(e)}'
        }), 500 