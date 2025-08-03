# Database Module - SQL File Based Structure

## 📁 Dosya Yapısı

```
app/database/
├── db_connection.py          # Veritabanı bağlantı yönetimi
├── db_migrations.py          # Migration sistemi (SQL dosya tabanlı)
├── user_repository.py        # Kullanıcı veri erişim katmanı
├── schemas/
│   └── __init__.py          # SQL dosya yolları
└── sql_schemas/
    ├── grades.sql           # Sınıflar tablosu
    ├── subjects.sql         # Dersler tablosu
    ├── topics.sql           # Konular tablosu
    ├── questions.sql        # Sorular tablosu
    ├── question_options.sql # Soru seçenekleri tablosu
    └── users.sql           # Kullanıcılar tablosu
```

## 🚀 Kullanım

### 1. Migration Çalıştırma

```python
from app.database.db_connection import DatabaseConnection
from app.database.db_migrations import DatabaseMigrations

# Bağlantı oluştur
db_connection = DatabaseConnection()
migrations = DatabaseMigrations(db_connection)

# Migration'ları çalıştır
migrations.run_migrations()
```

### 2. Tabloları Yeniden Oluşturma

```python
# Tüm verileri sil ve yeniden oluştur
migrations.force_recreate()
```

### 3. Tablo Bilgilerini Alma

```python
# Tablo kayıt sayılarını al
table_counts = migrations.get_table_info()
print(table_counts)
```

## 📊 Veritabanı Yapısı

### Hiyerarşi
```
grades (Sınıflar)
    ↓
subjects (Dersler)
    ↓
topics (Konular)
    ↓
questions (Sorular)
    ↓
question_options (Soru Seçenekleri)

users (Kullanıcılar) - Bağımsız tablo
```

### Tablo Detayları

#### grades (Sınıflar)
- `id`: Birincil anahtar
- `name`: Sınıf adı (örn: "1. Sınıf")
- `level`: Sınıf seviyesi (1-12)
- `description`: Açıklama
- `is_active`: Aktiflik durumu

#### subjects (Dersler)
- `id`: Birincil anahtar
- `grade_id`: Sınıf referansı (grades.id)
- `name`: Ders adı (örn: "Matematik")
- `description`: Açıklama
- `is_active`: Aktiflik durumu

#### topics (Konular)
- `id`: Birincil anahtar
- `subject_id`: Ders referansı (subjects.id)
- `name`: Konu adı (örn: "Kesirler")
- `description`: Açıklama
- `is_active`: Aktiflik durumu

#### questions (Sorular)
- `id`: Birincil anahtar
- `topic_id`: Konu referansı (topics.id)
- `question_text`: Soru metni
- `question_type`: Soru tipi (multiple_choice, true_false, fill_blank)
- `difficulty_level`: Zorluk seviyesi (easy, medium, hard)
- `explanation`: Açıklama
- `is_active`: Aktiflik durumu

#### question_options (Soru Seçenekleri)
- `id`: Birincil anahtar
- `question_id`: Soru referansı (questions.id)
- `option_text`: Seçenek metni
- `is_correct`: Doğru seçenek mi?
- `order_index`: Sıralama

#### users (Kullanıcılar)
- `id`: Birincil anahtar
- `username`: Kullanıcı adı
- `email`: E-posta
- `password_hash`: Şifre hash'i
- `first_name`: Ad
- `last_name`: Soyad
- `avatar_path`: Avatar dosya yolu
- `is_active`: Aktiflik durumu
- `is_admin`: Admin mi?

## 🔧 Özellikler

### SQL Dosya Tabanlı Migration
- Her tablo için ayrı SQL dosyası
- Otomatik dosya okuma ve çalıştırma
- Foreign key bağımlılıklarına göre sıralı oluşturma
- Hata yönetimi ve geri bildirim

### Veritabanı Bağlantısı
- Context manager desteği (`with` bloğu)
- Otomatik bağlantı yönetimi
- Hata durumunda rollback
- Başarılı durumda commit

### Veri Bütünlüğü
- Foreign key constraint'ler
- CASCADE DELETE
- Unique key'ler
- NOT NULL constraint'ler

## 📝 Örnek Kullanım

### Migration Test Etme
```bash
python test_db_structure.py
```

### Veritabanı Bağlantısı
```python
from app.database.db_connection import DatabaseConnection

# Bağlantı oluştur
db = DatabaseConnection()

# Kullan
with db as conn:
    conn.cursor.execute("SELECT * FROM grades")
    grades = conn.cursor.fetchall()
    print(grades)
```

### Repository Kullanımı
```python
from app.database.user_repository import UserRepository

# Repository oluştur
user_repo = UserRepository()

# Kullanıcı ekle
user_data = {
    'username': 'test_user',
    'email': 'test@example.com',
    'password_hash': 'hashed_password',
    'first_name': 'Test',
    'last_name': 'User'
}
user_id = user_repo.create_user(user_data)
```

## ⚠️ Önemli Notlar

1. **SQL Dosyaları**: Migration sistemi SQL dosyalarını okur ve çalıştırır
2. **Sıralama**: Tablolar foreign key bağımlılıklarına göre sıralı oluşturulur
3. **Veri Korunması**: `ON DUPLICATE KEY UPDATE` ile mevcut veriler korunur
4. **Hata Yönetimi**: Dosya bulunamazsa veya SQL hatası olursa detaylı hata mesajı verilir
5. **Bağlantı Yönetimi**: Context manager ile otomatik bağlantı yönetimi

## 🛠️ Sorun Giderme

### SQL Dosyası Bulunamadı
```
❌ SQL dosyası bulunamadı: app/database/sql_schemas/grades.sql
```
**Çözüm**: SQL dosyalarının doğru konumda olduğundan emin olun.

### Foreign Key Hatası
```
❌ SQL hatası: Cannot add foreign key constraint
```
**Çözüm**: Tabloların doğru sırada oluşturulduğundan emin olun.

### Bağlantı Hatası
```
❌ Veritabanı bağlantı hatası: Access denied
```
**Çözüm**: Veritabanı bağlantı bilgilerini kontrol edin.

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. SQL dosyalarının varlığını kontrol edin
2. Veritabanı bağlantı bilgilerini doğrulayın
3. Migration log'larını inceleyin
4. Test scriptini çalıştırın 