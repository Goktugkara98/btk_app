#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Users tablosunu güncellemek için script
"""

from app.database.db_migrations import SimpleMigrations
from app.database.user_repository import UserRepository

def update_users_table():
    """Users tablosunu yeni alanlarla günceller."""
    print("🔄 Users tablosu güncelleniyor...")
    
    try:
        # Migration'ı çalıştır
        migrations = SimpleMigrations()
        migrations.run_migrations()
        
        print("✅ Users tablosu başarıyla güncellendi!")
        print("\n📋 Eklenen yeni alanlar:")
        print("   • first_name (Ad)")
        print("   • last_name (Soyad)")
        print("   • phone (Telefon)")
        print("   • birth_date (Doğum tarihi)")
        print("   • gender (Cinsiyet)")
        print("   • location (Konum)")
        print("   • school (Okul)")
        print("   • grade_level (Sınıf)")
        print("   • bio (Biyografi)")
        print("   • website (Web sitesi)")
        print("   • twitter (Twitter)")
        print("   • linkedin (LinkedIn)")
        print("   • github (GitHub)")
        print("   • avatar_url (Profil fotoğrafı)")
        print("   • is_active (Aktif durum)")
        print("   • last_login (Son giriş)")
        
        # Test için örnek kullanıcı oluştur
        print("\n🧪 Test kullanıcısı oluşturuluyor...")
        user_repo = UserRepository()
        
        # Örnek kullanıcı verisi
        test_user_data = {
            'username': 'test_user',
            'email': 'test@example.com',
            'password': 'hashed_password_123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+90 555 123 4567',
            'birth_date': '2000-01-01',
            'gender': 'male',
            'location': 'İstanbul, Türkiye',
            'school': 'Test Lisesi',
            'grade_level': '12. Sınıf',
            'bio': 'Test kullanıcısı biyografisi',
            'website': 'https://example.com',
            'twitter': '@testuser',
            'linkedin': 'linkedin.com/in/testuser',
            'github': 'github.com/testuser'
        }
        
        # Kullanıcıyı oluştur
        user_id = user_repo.create_user(**test_user_data)
        
        if user_id:
            print(f"✅ Test kullanıcısı oluşturuldu (ID: {user_id})")
            
            # Kullanıcıyı getir ve bilgileri göster
            user = user_repo.get_user_by_id(user_id)
            if user:
                print("\n📋 Test kullanıcısı bilgileri:")
                print(f"   • ID: {user['id']}")
                print(f"   • Kullanıcı Adı: {user['username']}")
                print(f"   • Email: {user['email']}")
                print(f"   • Ad: {user['first_name']}")
                print(f"   • Soyad: {user['last_name']}")
                print(f"   • Telefon: {user['phone']}")
                print(f"   • Doğum Tarihi: {user['birth_date']}")
                print(f"   • Cinsiyet: {user['gender']}")
                print(f"   • Konum: {user['location']}")
                print(f"   • Okul: {user['school']}")
                print(f"   • Sınıf: {user['grade_level']}")
                print(f"   • Biyografi: {user['bio']}")
                print(f"   • Web Sitesi: {user['website']}")
                print(f"   • Twitter: {user['twitter']}")
                print(f"   • LinkedIn: {user['linkedin']}")
                print(f"   • GitHub: {user['github']}")
                print(f"   • Oluşturulma: {user['created_at']}")
                print(f"   • Güncellenme: {user['updated_at']}")
        else:
            print("❌ Test kullanıcısı oluşturulamadı")
            
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False
    
    return True

if __name__ == "__main__":
    update_users_table() 