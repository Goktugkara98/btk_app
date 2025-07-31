#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Users tablosunu güncellemek için script
"""

from app.database.db_migrations import SimpleMigrations
from app.database.user_repository import UserRepository
from werkzeug.security import generate_password_hash

def update_users_table():
    """Users tablosunu yeni alanlarla günceller."""
    print("🔄 Users tablosu güncelleniyor...")
    
    try:
        # Migration'ı çalıştır
        migrations = SimpleMigrations()
        
        # Önce mevcut tabloları temizle
        print("🧹 Mevcut tablolar temizleniyor...")
        migrations.drop_existing_tables()
        
        # Sonra yeni tabloları oluştur
        migrations.run_migrations()
        
        print("✅ Users tablosu başarıyla güncellendi!")
        print("\n📋 Güncellenen alanlar:")
        print("   • username (Kullanıcı adı)")
        print("   • email (E-posta)")
        print("   • hashed_password (Şifrelenmiş şifre)")
        print("   • first_name (Ad)")
        print("   • last_name (Soyad)")
        print("   • phone (Telefon)")
        print("   • birth_date (Doğum tarihi)")
        print("   • gender (Cinsiyet)")
        print("   • location (Konum)")
        print("   • school (Okul)")
        print("   • grade_level (Kaçıncı sınıf öğrencisi)")
        print("   • bio (Biyografi)")
        
        # Test için örnek kullanıcı oluştur
        print("\n🧪 Test kullanıcısı oluşturuluyor...")
        user_repo = UserRepository()
        
        # Örnek kullanıcı verisi
        test_user_data = {
            'username': 'test_user',
            'email': 'test@example.com',
            'hashed_password': generate_password_hash('test123'),
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+90 555 123 4567',
            'birth_date': '2000-01-01',
            'gender': 'male',
            'location': 'İstanbul, Türkiye',
            'school': 'Test Lisesi',
            'grade_level': '12. Sınıf',
            'bio': 'Test kullanıcısı biyografisi'
        }
        
        # Test kullanıcısını oluştur
        user_id = user_repo.create_user(**test_user_data)
        
        if user_id:
            print(f"✅ Test kullanıcısı başarıyla oluşturuldu! (ID: {user_id})")
            
            # Oluşturulan kullanıcıyı kontrol et
            created_user = user_repo.get_user_by_id(user_id)
            if created_user:
                print(f"📋 Kullanıcı bilgileri:")
                print(f"   • Kullanıcı adı: {created_user['username']}")
                print(f"   • E-posta: {created_user['email']}")
                print(f"   • Ad: {created_user['first_name']}")
                print(f"   • Soyad: {created_user['last_name']}")
                print(f"   • Telefon: {created_user['phone']}")
                print(f"   • Doğum tarihi: {created_user['birth_date']}")
                print(f"   • Cinsiyet: {created_user['gender']}")
                print(f"   • Konum: {created_user['location']}")
                print(f"   • Okul: {created_user['school']}")
                print(f"   • Sınıf: {created_user['grade_level']}")
                print(f"   • Biyografi: {created_user['bio']}")
        else:
            print("❌ Test kullanıcısı oluşturulamadı!")
            
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False
    
    return True

if __name__ == "__main__":
    update_users_table() 