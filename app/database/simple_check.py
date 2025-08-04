from db_connection import DatabaseConnection

db = DatabaseConnection()

try:
    # Grade 8 kontrolü
    db.cursor.execute("SELECT * FROM grades WHERE level = 8")
    grade_8 = db.cursor.fetchone()
    print(f"Grade 8: {grade_8}")
    
    if grade_8:
        # Türkçe dersi kontrolü
        db.cursor.execute("SELECT * FROM subjects WHERE name = 'Türkçe' AND grade_id = %s", (grade_8['id'],))
        turkish = db.cursor.fetchone()
        print(f"Türkçe dersi: {turkish}")
        
        if turkish:
            # Verbals unit kontrolü
            db.cursor.execute("SELECT * FROM units WHERE name = 'verbals' AND subject_id = %s", (turkish['id'],))
            verbals = db.cursor.fetchone()
            print(f"Verbals unit: {verbals}")
            
            if verbals:
                # Participles topic kontrolü
                db.cursor.execute("SELECT * FROM topics WHERE name = 'participles' AND unit_id = %s", (verbals['id'],))
                participles = db.cursor.fetchone()
                print(f"Participles topic: {participles}")
            else:
                print("Verbals unit bulunamadı")
        else:
            print("Türkçe dersi bulunamadı")
    else:
        print("Grade 8 bulunamadı")

except Exception as e:
    print(f"Hata: {e}")

finally:
    db.close() 