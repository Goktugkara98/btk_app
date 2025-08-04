from db_connection import DatabaseConnection

db = DatabaseConnection()

try:
    # Türkçe dersine ait unit'leri listele
    db.cursor.execute("""
        SELECT u.* FROM units u 
        JOIN subjects s ON u.subject_id = s.id 
        WHERE s.name = 'Türkçe'
    """)
    units = db.cursor.fetchall()
    
    print("Türkçe dersine ait unit'ler:")
    for unit in units:
        print(f"  ID: {unit['id']}, Name: {unit['name']}")
        
    if not units:
        print("Türkçe dersine ait hiç unit bulunamadı!")

except Exception as e:
    print(f"Hata: {e}")

finally:
    db.close() 