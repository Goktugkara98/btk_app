# =============================================================================
# DATABASE DATA CHECKER
# =============================================================================
# Bu script, veritabanındaki mevcut verileri kontrol eder.
# =============================================================================

from db_connection import DatabaseConnection

def check_database_data():
    """
    Veritabanındaki mevcut verileri kontrol eder.
    """
    db = DatabaseConnection()
    
    try:
        print("🔍 Veritabanı Verileri Kontrol Ediliyor...")
        print("="*60)
        
        # Grades kontrolü
        print("\n📚 GRADES:")
        db.cursor.execute("SELECT * FROM grades")
        grades = db.cursor.fetchall()
        for grade in grades:
            print(f"   ID: {grade['id']}, Level: {grade['level']}, Name: {grade['name']}")
        
        # Subjects kontrolü
        print("\n📖 SUBJECTS:")
        db.cursor.execute("SELECT s.*, g.level as grade_level FROM subjects s JOIN grades g ON s.grade_id = g.id")
        subjects = db.cursor.fetchall()
        for subject in subjects:
            print(f"   ID: {subject['id']}, Name: {subject['name']}, Code: {subject['code']}, Grade: {subject['grade_level']}")
        
        # Units kontrolü
        print("\n📋 UNITS:")
        db.cursor.execute("SELECT u.*, s.name as subject_name FROM units u JOIN subjects s ON u.subject_id = s.id")
        units = db.cursor.fetchall()
        for unit in units:
            print(f"   ID: {unit['id']}, Name: {unit['name']}, Subject: {unit['subject_name']}")
        
        # Topics kontrolü
        print("\n📝 TOPICS:")
        db.cursor.execute("SELECT t.*, u.name as unit_name FROM topics t JOIN units u ON t.unit_id = u.id")
        topics = db.cursor.fetchall()
        for topic in topics:
            print(f"   ID: {topic['id']}, Name: {topic['name']}, Unit: {topic['unit_name']}")
        
        # Özel arama - JSON'daki verilerle eşleşen var mı?
        print("\n🔍 JSON VERİLERİ İLE EŞLEŞME ARAMA:")
        print("   JSON'da: Grade 8, Subject: turkish, Unit: verbals, Topic: participles")
        
        # Grade 8 kontrolü
        db.cursor.execute("SELECT * FROM grades WHERE level = 8")
        grade_8 = db.cursor.fetchone()
        if grade_8:
            print(f"   ✅ Grade 8 bulundu: ID {grade_8['id']}")
            
            # Turkish subject kontrolü
            db.cursor.execute("SELECT * FROM subjects WHERE name = 'turkish' AND grade_id = %s", (grade_8['id'],))
            turkish_subject = db.cursor.fetchone()
            if turkish_subject:
                print(f"   ✅ Turkish subject bulundu: ID {turkish_subject['id']}")
                
                # Verbals unit kontrolü
                db.cursor.execute("SELECT * FROM units WHERE name = 'verbals' AND subject_id = %s", (turkish_subject['id'],))
                verbals_unit = db.cursor.fetchone()
                if verbals_unit:
                    print(f"   ✅ Verbals unit bulundu: ID {verbals_unit['id']}")
                    
                    # Participles topic kontrolü
                    db.cursor.execute("SELECT * FROM topics WHERE name = 'participles' AND unit_id = %s", (verbals_unit['id'],))
                    participles_topic = db.cursor.fetchone()
                    if participles_topic:
                        print(f"   ✅ Participles topic bulundu: ID {participles_topic['id']}")
                    else:
                        print("   ❌ Participles topic bulunamadı")
                else:
                    print("   ❌ Verbals unit bulunamadı")
            else:
                print("   ❌ Turkish subject bulunamadı")
        else:
            print("   ❌ Grade 8 bulunamadı")
        
    except Exception as e:
        print(f"❌ Veritabanı kontrol hatası: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_database_data() 