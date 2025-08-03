# Veritabanı Yapısı (Database Structure)

## 📊 Tablo Hiyerarşisi

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

## 🗂️ Tablo Detayları

### 1. grades (Sınıflar)
- **Amaç**: Eğitim seviyelerini (1. sınıf, 2. sınıf, vb.) tanımlar
- **Anahtar Alanlar**:
  - `id`: Birincil anahtar
  - `name`: Sınıf adı (örn: "1. Sınıf")
  - `level`: Sınıf seviyesi (1-12)
  - `description`: Açıklama
  - `is_active`: Aktiflik durumu

### 2. subjects (Dersler)
- **Amaç**: Her sınıf için dersleri tanımlar
- **Anahtar Alanlar**:
  - `id`: Birincil anahtar
  - `grade_id`: Sınıf referansı (grades.id)
  - `name`: Ders adı (örn: "Matematik")
  - `description`: Açıklama
  - `is_active`: Aktiflik durumu

### 3. topics (Konular)
- **Amaç**: Her ders için konuları tanımlar
- **Anahtar Alanlar**:
  - `id`: Birincil anahtar
  - `subject_id`: Ders referansı (subjects.id)
  - `name`: Konu adı (örn: "Kesirler")
  - `description`: Açıklama
  - `is_active`: Aktiflik durumu

### 4. questions (Sorular)
- **Amaç**: Her konu için soruları tanımlar
- **Anahtar Alanlar**:
  - `id`: Birincil anahtar
  - `topic_id`: Konu referansı (topics.id)
  - `question_text`: Soru metni
  - `question_type`: Soru tipi (multiple_choice, true_false, fill_blank)
  - `difficulty_level`: Zorluk seviyesi (easy, medium, hard)
  - `explanation`: Açıklama
  - `is_active`: Aktiflik durumu

### 5. question_options (Soru Seçenekleri)
- **Amaç**: Her soru için seçenekleri tanımlar
- **Anahtar Alanlar**:
  - `id`: Birincil anahtar
  - `question_id`: Soru referansı (questions.id)
  - `option_text`: Seçenek metni
  - `is_correct`: Doğru seçenek mi?
  - `order_index`: Sıralama

### 6. users (Kullanıcılar)
- **Amaç**: Sistem kullanıcılarını tanımlar
- **Anahtar Alanlar**:
  - `id`: Birincil anahtar
  - `username`: Kullanıcı adı
  - `email`: E-posta
  - `password_hash`: Şifre hash'i
  - `is_active`: Aktiflik durumu

## 🔗 İlişkiler

- **grades** → **subjects**: Bir sınıfın birden fazla dersi olabilir
- **subjects** → **topics**: Bir dersin birden fazla konusu olabilir
- **topics** → **questions**: Bir konunun birden fazla sorusu olabilir
- **questions** → **question_options**: Bir sorunun birden fazla seçeneği olabilir

## 🚀 Kullanım

### Veritabanını Oluşturma
```python
from app.database.db_connection import DatabaseConnection
from app.database.db_migrations import DatabaseMigrations

# Bağlantı oluştur
db_connection = DatabaseConnection()
migrations = DatabaseMigrations(db_connection)

# Migration'ları çalıştır
migrations.run_migrations()
```

### Tabloları Yeniden Oluşturma
```python
# Tüm verileri sil ve yeniden oluştur
migrations.force_recreate()
```

### Test Etme
```bash
python test_db_structure.py
```

## 📝 Örnek Veriler

Sistem otomatik olarak aşağıdaki sınıfları ekler:
- 1. Sınıf - 12. Sınıf (İlkokul, Ortaokul, Lise)

## 🔧 Yapılandırma

Veritabanı bağlantı bilgileri environment variables ile yapılandırılır:
- `DB_HOST`: Veritabanı sunucusu (varsayılan: localhost)
- `DB_USER`: Kullanıcı adı (varsayılan: root)
- `DB_PASSWORD`: Şifre (varsayılan: boş)
- `DB_NAME`: Veritabanı adı (varsayılan: btk_app)
- `DB_PORT`: Port (varsayılan: 3306) 