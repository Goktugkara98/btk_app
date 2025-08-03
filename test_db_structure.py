#!/usr/bin/env python3
# =============================================================================
# Database Structure Test Script
# =============================================================================
# Bu script, veritabanı yapısını test etmek için kullanılır.
# SQL dosya tabanlı migration sistemini test eder.
# =============================================================================

import sys
import os

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.db_connection import DatabaseConnection
from app.database.db_migrations import DatabaseMigrations

def test_database_structure():
    """Veritabanı yapısını test eder."""
    try:
        print("🧪 Veritabanı yapısı test ediliyor...")
        print("=" * 60)
        
        # Veritabanı bağlantısı oluştur
        db_connection = DatabaseConnection()
        migrations = DatabaseMigrations(db_connection)
        
        # Migration'ları çalıştır
        migrations.run_migrations()
        
        # Tablo kayıt sayılarını göster
        table_counts = migrations.get_table_info()
        print(f"\n📊 Tablo kayıt sayıları:")
        for table_name, count in table_counts.items():
            print(f"   • {table_name}: {count} kayıt")
        
        # Tablo yapılarını kontrol et
        with db_connection as conn:
            tables = ['grades', 'subjects', 'topics', 'questions', 'question_options', 'users']
            
            for table in tables:
                try:
                    conn.cursor.execute(f"DESCRIBE {table}")
                    columns = conn.cursor.fetchall()
                    print(f"\n📋 {table} tablosu yapısı:")
                    for column in columns:
                        print(f"   • {column['Field']} - {column['Type']}")
                except Exception as e:
                    print(f"   ❌ {table} tablosu kontrol edilemedi: {e}")
        
        print("\n" + "=" * 60)
        print("🎉 Veritabanı yapısı testi başarılı!")
        return True
        
    except Exception as e:
        print(f"❌ Test hatası: {e}")
        return False
    finally:
        if 'db_connection' in locals():
            db_connection.close()

if __name__ == "__main__":
    success = test_database_structure()
    sys.exit(0 if success else 1) 