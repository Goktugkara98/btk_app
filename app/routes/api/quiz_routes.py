# =============================================================================
# 1.0. MODÜL BAŞLIĞI VE AÇIKLAMASI
# =============================================================================
# Bu modül, quiz ile ilgili API rotalarını (endpoints) içerir.
# Quiz verileri, sorular, sonuçlar gibi quiz işlemlerini yönetir.
# =============================================================================

# =============================================================================
# 2.0. İÇİNDEKİLER
# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# 4.0. SERVİS BAŞLATMA
# 5.0. QUIZ API ROTALARI (QUIZ API ROUTES)
#   5.1. Quiz Verileri
#     5.1.1. GET /quiz/grades
#     5.1.2. GET /quiz/subjects
#     5.1.3. GET /quiz/topics
#     5.1.4. GET /quiz/data
#   5.2. Quiz İşlemleri
#     5.2.1. POST /quiz/start
#     5.2.2. POST /quiz/submit
#     5.2.3. GET /quiz/results
# =============================================================================

# =============================================================================
# 3.0. GEREKLİ KÜTÜPHANELER VE MODÜLLER
# =============================================================================
from flask import Blueprint, jsonify, request, session
from datetime import datetime

# Create the quiz blueprint
quiz_bp = Blueprint('quiz', __name__)

# Import services here to avoid circular imports
try:
    from app.services import get_quiz_service
    from app.services.auth_service import login_required
    from app.database.db_connection import DatabaseConnection
except ImportError as e:
    print(f"Warning: Could not import services: {e}")
    get_quiz_service = None
    login_required = None
    DatabaseConnection = None

# =============================================================================
# 4.0. SERVİS BAŞLATMA
# =============================================================================
# Servisler endpoint'lerde dinamik olarak alınacak

# =============================================================================
# 5.0. QUIZ API ROTALARI (QUIZ API ROUTES)
# =============================================================================

# -------------------------------------------------------------------------
# 5.1. Quiz Verileri
# -------------------------------------------------------------------------

@quiz_bp.route('/quiz/grades', methods=['GET'])
def get_grades():
    """5.1.1. Tüm sınıfları listeler."""
    try:
        if not DatabaseConnection:
            return jsonify({
                'status': 'error',
                'message': 'Database connection not available'
            }), 500
        
        with DatabaseConnection() as conn:
            conn.cursor.execute("""
                SELECT id, name, level, description 
                FROM grades 
                WHERE is_active = 1 
                ORDER BY level
            """)
            grades = conn.cursor.fetchall()
            
            # Convert to list of dictionaries
            grades_list = []
            for grade in grades:
                grades_list.append({
                    'id': grade['id'],
                    'name': grade['name'],
                    'level': grade['level'],
                    'description': grade['description']
                })
            
            return jsonify({
                'status': 'success',
                'message': 'Grades retrieved successfully',
                'data': grades_list
            }), 200
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve grades',
            'error': str(e)
        }), 500

@quiz_bp.route('/quiz/subjects', methods=['GET'])
def get_subjects():
    """5.1.2. Belirli bir sınıfa ait dersleri listeler."""
    grade_id = request.args.get('grade_id', type=int)
    
    if not grade_id:
        return jsonify({
            'status': 'error',
            'message': 'Grade ID is required'
        }), 400
    
    try:
        if not DatabaseConnection:
            return jsonify({
                'status': 'error',
                'message': 'Database connection not available'
            }), 500
        
        with DatabaseConnection() as conn:
            conn.cursor.execute("""
                SELECT s.id, s.name, s.code, s.description, g.name as grade_name
                FROM subjects s 
                JOIN grades g ON s.grade_id = g.id
                WHERE s.grade_id = %s AND s.is_active = 1 
                ORDER BY s.name
            """, (grade_id,))
            subjects = conn.cursor.fetchall()
            
            # Convert to list of dictionaries
            subjects_list = []
            for subject in subjects:
                subjects_list.append({
                    'id': subject['id'],
                    'name': subject['name'],
                    'code': subject['code'],
                    'description': subject['description'],
                    'grade_name': subject['grade_name']
                })
            
            return jsonify({
                'status': 'success',
                'message': 'Subjects retrieved successfully',
                'data': subjects_list
            }), 200
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve subjects',
            'error': str(e)
        }), 500

@quiz_bp.route('/quiz/units', methods=['GET'])
def get_units():
    """5.1.3. Belirli bir derse ait üniteleri listeler."""
    subject_id = request.args.get('subject_id', type=int)
    
    if not subject_id:
        return jsonify({
            'status': 'error',
            'message': 'Subject ID is required'
        }), 400
    
    try:
        if not DatabaseConnection:
            return jsonify({
                'status': 'error',
                'message': 'Database connection not available'
            }), 500
        
        with DatabaseConnection() as conn:
            conn.cursor.execute("""
                SELECT u.id, u.name, u.unit_id, u.description, s.name as subject_name
                FROM units u 
                JOIN subjects s ON u.subject_id = s.id
                WHERE u.subject_id = %s AND u.is_active = 1 
                ORDER BY u.name
            """, (subject_id,))
            units = conn.cursor.fetchall()
            
            # Convert to list of dictionaries
            units_list = []
            for unit in units:
                units_list.append({
                    'id': unit['id'],
                    'name': unit['name'],
                    'unit_id': unit['unit_id'],
                    'description': unit['description'],
                    'subject_name': unit['subject_name']
                })
            
            return jsonify({
                'status': 'success',
                'message': 'Units retrieved successfully',
                'data': units_list
            }), 200
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve units',
            'error': str(e)
        }), 500

@quiz_bp.route('/quiz/topics', methods=['GET'])
def get_topics():
    """5.1.4. Belirli bir üniteye ait konuları listeler."""
    unit_id = request.args.get('unit_id', type=int)
    
    if not unit_id:
        return jsonify({
            'status': 'error',
            'message': 'Unit ID is required'
        }), 400
    
    try:
        if not DatabaseConnection:
            return jsonify({
                'status': 'error',
                'message': 'Database connection not available'
            }), 500
        
        with DatabaseConnection() as conn:
            conn.cursor.execute("""
                SELECT t.id, t.name, t.description, u.name as unit_name
                FROM topics t 
                JOIN units u ON t.unit_id = u.id
                WHERE t.unit_id = %s AND t.is_active = 1 
                ORDER BY t.name
            """, (unit_id,))
            topics = conn.cursor.fetchall()
            
            # Convert to list of dictionaries
            topics_list = []
            for topic in topics:
                topics_list.append({
                    'id': topic['id'],
                    'name': topic['name'],
                    'description': topic['description'],
                    'unit_name': topic['unit_name']
                })
            
            return jsonify({
                'status': 'success',
                'message': 'Topics retrieved successfully',
                'data': topics_list
            }), 200
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve topics',
            'error': str(e)
        }), 500

@quiz_bp.route('/quiz/data', methods=['GET'])
def get_quiz_data():
    """5.1.4. Quiz verilerini döndürür."""
    quiz_service = get_quiz_service()
    if not quiz_service:
        return jsonify({
            'status': 'error',
            'message': 'Quiz service not available'
        }), 500
    
    try:
        quiz_data = quiz_service.get_quiz_data()
        return jsonify({
            'status': 'success',
            'message': 'Quiz data retrieved successfully',
            'data': quiz_data
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve quiz data',
            'error': str(e)
        }), 500

# -------------------------------------------------------------------------
# 5.2. Quiz İşlemleri
# -------------------------------------------------------------------------

@quiz_bp.route('/quiz/start', methods=['POST'])
@login_required
def start_quiz():
    """5.2.1. Yeni bir quiz başlatır."""
    if not session.get('logged_in'):
        return jsonify({'status': 'error', 'message': 'Giriş yapmanız gerekiyor'}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400
    
    # Required fields
    required_fields = ['subject_id', 'topic_id', 'question_count']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    try:
        user_id = session.get('user_id')
        # TODO: Implement quiz start logic
        quiz_session = {
            'id': 'quiz_123',
            'user_id': user_id,
            'subject_id': data['subject_id'],
            'topic_id': data['topic_id'],
            'question_count': data['question_count'],
            'start_time': datetime.now().isoformat(),
            'status': 'active'
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Quiz started successfully',
            'data': quiz_session
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to start quiz',
            'error': str(e)
        }), 500

@quiz_bp.route('/quiz/submit', methods=['POST'])
@login_required
def submit_quiz():
    """5.2.2. Quiz sonuçlarını gönderir."""
    
    data = request.get_json()
    if not data:
        return jsonify({'status': 'error', 'message': 'Invalid JSON'}), 400
    
    # Required fields
    required_fields = ['quiz_id', 'answers']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    try:
        user_id = session.get('user_id')
        # TODO: Implement quiz submission logic
        quiz_result = {
            'quiz_id': data['quiz_id'],
            'user_id': user_id,
            'score': 85,
            'total_questions': len(data['answers']),
            'correct_answers': 17,
            'completion_time': '00:15:30',
            'submitted_at': datetime.now().isoformat()
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Quiz submitted successfully',
            'data': quiz_result
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to submit quiz',
            'error': str(e)
        }), 500

@quiz_bp.route('/quiz/results', methods=['GET'])
@login_required
def get_quiz_results():
    """5.2.3. Kullanıcının quiz sonuçlarını getirir."""
    
    try:
        user_id = session.get('user_id')
        # TODO: Implement quiz results retrieval
        results = [
            {
                'id': 1,
                'quiz_id': 'quiz_123',
                'subject': 'Matematik',
                'topic': 'Sayılar',
                'score': 85,
                'total_questions': 20,
                'correct_answers': 17,
                'completion_time': '00:15:30',
                'completed_at': '2024-01-15T10:30:00'
            },
            {
                'id': 2,
                'quiz_id': 'quiz_124',
                'subject': 'Türkçe',
                'topic': 'Dilbilgisi',
                'score': 90,
                'total_questions': 15,
                'correct_answers': 13,
                'completion_time': '00:12:45',
                'completed_at': '2024-01-14T14:20:00'
            }
        ]
        
        return jsonify({
            'status': 'success',
            'message': 'Quiz results retrieved successfully',
            'data': results
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve quiz results',
            'error': str(e)
        }), 500 