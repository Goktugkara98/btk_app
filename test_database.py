#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Veritabanı bağlantısını ve migration'ları test etmek için script.
"""

import sys
import os

# Proje kök dizinini Python path'ine ekle
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db_connection import DatabaseConnection
from app.database.db_migrations import Migrations
from app.database.question_repository import QuestionRepository
from app.database.quiz_repository import QuizRepository

def test_database_connection():
    """Veritabanı bağlantısını test eder."""
    print("🔌 Veritabanı bağlantısı test ediliyor...")
    
    try:
        db = DatabaseConnection()
        with db as conn:
            conn.cursor.execute("SELECT 1")
            result = conn.cursor.fetchone()
            if result:
                print("✅ Veritabanı bağlantısı başarılı!")
                return True
    except Exception as e:
        print(f"❌ Veritabanı bağlantısı başarısız: {e}")
        return False

def run_migrations():
    """Migration'ları çalıştırır."""
    print("\n🏗️  Veritabanı migration'ları çalıştırılıyor...")
    
    try:
        migrations = Migrations()
        migrations.run_migrations()
        print("✅ Migration'lar başarıyla tamamlandı!")
        return True
    except Exception as e:
        print(f"❌ Migration hatası: {e}")
        return False

def test_question_repository():
    """Soru repository'sini test eder."""
    print("\n📚 Soru repository test ediliyor...")
    
    try:
        repo = QuestionRepository()
        
        # Eğitim seviyelerini getir
        education_levels = repo.get_education_levels()
        print(f"📖 Eğitim seviyeleri: {len(education_levels)} adet")
        for level in education_levels:
            print(f"   - {level['name']} ({level['short_name']})")
        
        # 5. sınıf derslerini getir
        subjects = repo.get_subjects(5)  # 5. sınıf
        print(f"\n📚 5. Sınıf dersleri: {len(subjects)} adet")
        for subject in subjects:
            print(f"   - {subject['name']} ({subject['short_name']}) - {subject['color']}")
        
        # Matematik konularını getir
        topics = repo.get_topics(1)  # Matematik
        print(f"\n📐 Matematik konuları: {len(topics)} adet")
        for topic in topics:
            print(f"   - {topic['name']}")
        
        # Soruları getir
        questions = repo.get_questions({'grade_level_id': 5, 'limit': 5})
        print(f"\n❓ 5. Sınıf soruları: {len(questions)} adet")
        for question in questions:
            print(f"   - {question['question_text'][:50]}... ({question['difficulty_level']})")
        
        return True
    except Exception as e:
        print(f"❌ Soru repository test hatası: {e}")
        return False

def test_quiz_repository():
    """Quiz repository'sini test eder."""
    print("\n🎯 Quiz repository test ediliyor...")
    
    try:
        repo = QuizRepository()
        
        # Quiz oluştur
        filters = {
            'grade_level_id': 5,  # 5. sınıf
            'subject_id': 1,      # Matematik
            'difficulty_level_id': 1  # Kolay
        }
        
        settings = {
            'question_count': 3,
            'shuffle_questions': True,
            'shuffle_options': True,
            'time_limit': 300  # 5 dakika
        }
        
        result = repo.create_quiz_from_filters(filters, settings)
        
        if result['success']:
            quiz_data = result['quiz_data']
            print(f"✅ Quiz oluşturuldu!")
            print(f"   📊 Soru sayısı: {quiz_data['settings']['question_count']}")
            print(f"   🎯 Toplam puan: {quiz_data['settings']['total_points']}")
            print(f"   ⏱️  Süre: {quiz_data['settings']['time_limit']} saniye")
            print(f"   📚 Konu: {quiz_data['metadata']['subject']} - {quiz_data['metadata']['topic']}")
            print(f"   🎚️  Zorluk: {quiz_data['metadata']['difficulty']}")
            
            # İlk soruyu göster
            if quiz_data['questions']:
                first_question = quiz_data['questions'][0]
                print(f"\n📝 İlk soru:")
                print(f"   {first_question['question_text']}")
                print(f"   Seçenekler:")
                for option in first_question.get('options', []):
                    correct_mark = "✅" if option['is_correct'] else "❌"
                    print(f"     {correct_mark} {option['option_letter']}) {option['option_text']}")
        else:
            print(f"❌ Quiz oluşturulamadı: {result['message']}")
        
        return True
    except Exception as e:
        print(f"❌ Quiz repository test hatası: {e}")
        return False

def main():
    """Ana test fonksiyonu."""
    print("🚀 Eğitim Soru Bankası - Veritabanı Test Scripti")
    print("=" * 60)
    
    # Test adımları
    tests = [
        ("Veritabanı Bağlantısı", test_database_connection),
        ("Migration'lar", run_migrations),
        ("Soru Repository", test_question_repository),
        ("Quiz Repository", test_quiz_repository)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test hatası: {e}")
            results.append((test_name, False))
    
    # Sonuçları özetle
    print("\n" + "=" * 60)
    print("📊 TEST SONUÇLARI")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ BAŞARILI" if result else "❌ BAŞARISIZ"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Toplam: {passed}/{total} test başarılı")
    
    if passed == total:
        print("🎉 Tüm testler başarılı! Veritabanı sistemi hazır.")
    else:
        print("⚠️  Bazı testler başarısız. Lütfen hataları kontrol edin.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 