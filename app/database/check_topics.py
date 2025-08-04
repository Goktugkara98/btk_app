from db_connection import DatabaseConnection

db = DatabaseConnection()

try:
    # Fiilimsiler unit'ine ait topic'leri listele
    db.cursor.execute("""
        SELECT t.* FROM topics t 
        JOIN units u ON t.unit_id = u.id 
        WHERE u.name = 'Fiilimsiler'
    """)
    topics = db.cursor.fetchall()
    
    print("Fiilimsiler unit'ine ait topic'ler:")
    for topic in topics:
        print(f"  ID: {topic['id']}, Name: {topic['name']}")
        
    if not topics:
        print("Fiilimsiler unit'ine ait hiç topic bulunamadı!")

except Exception as e:
    print(f"Hata: {e}")

finally:
    db.close() 