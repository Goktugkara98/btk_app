# =============================================================================
# QUESTION LOADER TEST SCRIPT
# =============================================================================
# Bu script, QuestionLoader modülünü test etmek için kullanılır.
# =============================================================================

import sys
import os
from pathlib import Path

# Proje kök dizinini Python path'ine ekle
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from app.database.question_loader import QuestionLoader

def test_question_loader():
    """
    QuestionLoader modülünü test eder.
    """
    print("🧪 QuestionLoader Test Başlıyor...")
    print("="*60)
    
    # Test dosyası yolu
    test_file = "app/data/question_banks/grade_8/turkish/verbals/participle.json"
    
    # Dosyanın varlığını kontrol et
    if not Path(test_file).exists():
        print(f"❌ Test dosyası bulunamadı: {test_file}")
        return False
    
    print(f"✅ Test dosyası bulundu: {test_file}")
    
    # QuestionLoader'ı başlat
    try:
        loader = QuestionLoader()
        print("✅ QuestionLoader başarıyla başlatıldı")
    except Exception as e:
        print(f"❌ QuestionLoader başlatılamadı: {e}")
        return False
    
    try:
        # Dosyayı yükle
        print(f"\n📝 Test dosyası yükleniyor: {test_file}")
        data = loader.load_question_file(test_file)
        
        if not data:
            print("❌ Dosya yüklenemedi")
            return False
        
        print("✅ Dosya başarıyla yüklendi")
        
        # Metadata kontrolü
        metadata = data.get('metadata', {})
        print(f"\n📊 Metadata:")
        print(f"   Grade: {metadata.get('grade')}")
        print(f"   Subject: {metadata.get('subject')}")
        print(f"   Unit: {metadata.get('unit')}")
        print(f"   Topic: {metadata.get('topic')}")
        print(f"   Total Questions: {metadata.get('totalQuestions')}")
        
        # Questions kontrolü
        questions = data.get('questions', [])
        print(f"\n📝 Questions:")
        print(f"   Toplam question sayısı: {len(questions)}")
        
        if questions:
            first_question = questions[0]
            print(f"   İlk question ID: {first_question.get('id')}")
            print(f"   İlk question text: {first_question.get('questionText', '')[:50]}...")
            print(f"   İlk question difficulty: {first_question.get('difficulty')}")
            print(f"   İlk question type: {first_question.get('questionType')}")
            
            # Options kontrolü
            options = first_question.get('options', [])
            print(f"   İlk question options sayısı: {len(options)}")
            
            for option in options:
                print(f"     {option.get('id')}: {option.get('text', '')[:30]}... (Correct: {option.get('isCorrect')})")
        
        # Topic ID sorgulama testi
        print(f"\n🔍 Topic ID sorgulanıyor...")
        topic_id = loader.get_topic_id(
            metadata.get('grade'),
            metadata.get('subject'),
            metadata.get('unit'),
            metadata.get('topic')
        )
        
        if topic_id:
            print(f"✅ Topic ID bulundu: {topic_id}")
        else:
            print("⚠️  Topic ID bulunamadı (veritabanında ilgili topic olmayabilir)")
        
        print("\n✅ Tüm testler başarıyla tamamlandı!")
        return True
        
    except Exception as e:
        print(f"❌ Test sırasında hata: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        loader.close()

def test_question_insertion():
    """
    Question ekleme işlemini test eder (dry run).
    """
    print("\n🧪 Question Ekleme Testi (Dry Run)...")
    print("="*60)
    
    test_file = "app/data/question_banks/grade_8/turkish/verbals/participle.json"
    
    if not Path(test_file).exists():
        print(f"❌ Test dosyası bulunamadı: {test_file}")
        return False
    
    try:
        loader = QuestionLoader()
        
        # Dosyayı işle
        success, total = loader.process_question_file(test_file)
        
        print(f"\n📊 Ekleme Test Sonucu:")
        print(f"   Başarılı: {success}")
        print(f"   Toplam: {total}")
        print(f"   Başarı oranı: {(success/total*100):.1f}%" if total > 0 else "N/A")
        
        if success > 0:
            print("✅ Question ekleme testi başarılı!")
            return True
        else:
            print("⚠️  Hiç question eklenemedi (veritabanı bağlantısı veya topic sorunu olabilir)")
            return False
            
    except Exception as e:
        print(f"❌ Ekleme testi sırasında hata: {e}")
        return False
    finally:
        loader.close()

def main():
    """
    Ana test fonksiyonu.
    """
    print("🚀 QuestionLoader Modül Testleri")
    print("="*60)
    
    # Test 1: Temel yükleme testi
    test1_result = test_question_loader()
    
    # Test 2: Ekleme testi
    test2_result = test_question_insertion()
    
    # Sonuç özeti
    print("\n" + "="*60)
    print("TEST SONUÇLARI")
    print("="*60)
    print(f"Temel Yükleme Testi: {'✅ BAŞARILI' if test1_result else '❌ BAŞARISIZ'}")
    print(f"Ekleme Testi: {'✅ BAŞARILI' if test2_result else '❌ BAŞARISIZ'}")
    
    if test1_result and test2_result:
        print("\n🎉 Tüm testler başarıyla geçti!")
        return 0
    else:
        print("\n⚠️  Bazı testler başarısız oldu.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 