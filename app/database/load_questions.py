# =============================================================================
# QUESTION LOADER CLI SCRIPT
# =============================================================================
# Bu script, question JSON dosyalarını veritabanına yüklemek için kullanılır.
# =============================================================================

import sys
import os
import argparse
from pathlib import Path

# Proje kök dizinini Python path'ine ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.question_loader import QuestionLoader

def main():
    """
    Ana fonksiyon - CLI argümanlarını işler ve question yükleme işlemini başlatır.
    """
    parser = argparse.ArgumentParser(
        description="Question JSON dosyalarını veritabanına yükler",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Örnekler:
  # Tüm question dosyalarını yükle
  python load_questions.py

  # Belirli bir dosyayı yükle
  python load_questions.py --file app/data/question_banks/grade_8/turkish/verbals/participle.json

  # Belirli bir dizindeki dosyaları yükle
  python load_questions.py --dir app/data/question_banks/grade_8/turkish

  # Verbose mod ile yükle
  python load_questions.py --verbose
        """
    )
    
    parser.add_argument(
        '--file',
        type=str,
        help='Yüklenecek belirli bir JSON dosyasının yolu'
    )
    
    parser.add_argument(
        '--dir',
        type=str,
        help='Yüklenecek dosyaların bulunduğu dizin'
    )
    
    parser.add_argument(
        '--data-dir',
        type=str,
        default='app/data/question_banks',
        help='Question dosyalarının varsayılan dizini (varsayılan: app/data/question_banks)'
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Detaylı çıktı göster'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Gerçek veritabanı işlemi yapmadan test et'
    )
    
    args = parser.parse_args()
    
    # QuestionLoader'ı başlat
    loader = QuestionLoader(args.data_dir)
    
    try:
        if args.dry_run:
            print("🔍 DRY RUN MODU - Gerçek veritabanı işlemi yapılmayacak")
            print("="*60)
        
        if args.file:
            # Tek dosya yükle
            file_path = Path(args.file)
            if not file_path.exists():
                print(f"❌ Dosya bulunamadı: {file_path}")
                return 1
            
            print(f"📁 Tek dosya yükleniyor: {file_path}")
            success, total = loader.process_question_file(str(file_path))
            print(f"\n📊 Sonuç: {success}/{total} question başarıyla eklendi")
            
        elif args.dir:
            # Belirli dizindeki dosyaları yükle
            dir_path = Path(args.dir)
            if not dir_path.exists():
                print(f"❌ Dizin bulunamadı: {dir_path}")
                return 1
            
            print(f"📁 Dizin yükleniyor: {dir_path}")
            json_files = list(dir_path.rglob("*.json"))
            
            if not json_files:
                print(f"❌ JSON dosyası bulunamadı: {dir_path}")
                return 1
            
            total_success = 0
            total_questions = 0
            
            for file_path in json_files:
                success, total = loader.process_question_file(str(file_path))
                total_success += success
                total_questions += total
            
            print(f"\n📊 Dizin Sonucu: {total_success}/{total_questions} question başarıyla eklendi")
            
        else:
            # Tüm dosyaları yükle
            print("📁 Tüm question dosyaları yükleniyor...")
            results = loader.process_all_question_files()
            
            # Sonuçları özetle
            total_success = 0
            total_questions = 0
            
            print("\n" + "="*60)
            print("SONUÇ ÖZETİ")
            print("="*60)
            
            for filename, (success, total) in results.items():
                print(f"{filename}: {success}/{total} question eklendi")
                total_success += success
                total_questions += total
            
            print(f"\n📊 Toplam: {total_success}/{total_questions} question başarıyla eklendi")
        
        return 0
        
    except KeyboardInterrupt:
        print("\n⚠️  İşlem kullanıcı tarafından durduruldu")
        return 1
    except Exception as e:
        print(f"❌ Genel hata: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1
    finally:
        loader.close()

if __name__ == "__main__":
    sys.exit(main()) 