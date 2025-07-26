# 🗄️ Eğitim Soru Bankası - Veritabanı Sistemi

Bu dokümantasyon, eğitim soru bankası sisteminin veritabanı yapısını ve kullanımını açıklar.

## 📋 İçindekiler

- [Genel Bakış](#genel-bakış)
- [Veritabanı Şeması](#veritabanı-şeması)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Örnekleri](#api-örnekleri)
- [Test](#test)

## 🎯 Genel Bakış

Sistem, eğitim odaklı bir soru bankası için tasarlanmış kapsamlı bir veritabanı yapısı içerir:

- **Eğitim Hiyerarşisi**: İlkokul → Sınıf → Ders → Konu → Alt Konu → Soru
- **Soru Yönetimi**: Çoktan seçmeli sorular, seçenekler, açıklamalar
- **Quiz Sistemi**: Dinamik quiz oluşturma, deneme takibi, sonuç analizi
- **İstatistikler**: Soru zorluk analizi, kullanıcı performansı

## 🏗️ Veritabanı Şeması

### Ana Tablolar

#### 1. Eğitim Hiyerarşisi
```sql
education_levels     -- İlkokul, Ortaokul, Lise, Üniversite
grade_levels         -- 1. Sınıf, 2. Sınıf, 5. Sınıf, 9. Sınıf...
subjects             -- Matematik, Türkçe, Fen Bilgisi, Sosyal Bilgiler
topics               -- Sayılar, Geometri, Cebir, Dilbilgisi
subtopics            -- Doğal Sayılar, Kesirler, Üçgenler, Fiiller
```

#### 2. Soru Bankası
```sql
questions            -- Ana soru tablosu
question_options     -- Soru seçenekleri (A, B, C, D)
question_types       -- Çoktan seçmeli, Doğru-Yanlış, Boşluk doldurma
difficulty_levels    -- Kolay, Orta, Zor, Çok Zor
question_tags        -- Etiketler (Temel, Kritik, Sınav, vb.)
question_media       -- Resim, video, ses dosyaları
```

#### 3. Quiz Sistemi
```sql
quiz_attempts        -- Quiz denemeleri
user_answers         -- Kullanıcı cevapları
user_statistics      -- Kullanıcı istatistikleri
```

### İlişkiler

```
education_levels (1) → (N) grade_levels
grade_levels (N) ←→ (N) subjects (grade_subjects tablosu üzerinden)
subjects (1) → (N) topics
topics (1) → (N) subtopics
questions (N) → (1) grade_levels, subjects, topics, subtopics
questions (1) → (N) question_options
```

## 🚀 Kurulum

### 1. Veritabanı Bağlantısı

`.env` dosyasında veritabanı ayarlarını yapılandırın:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=btk_app
DB_PORT=3306
```

### 2. Migration'ları Çalıştırın

```bash
# Migration'ları çalıştır
python app/database/db_migrations.py

# Veya test scriptini kullanın
python test_database.py
```

### 3. Test Edin

```bash
python test_database.py
```

## 📚 Kullanım

### QuestionRepository

Soru bankası işlemleri için:

```python
from app.database.question_repository import QuestionRepository

repo = QuestionRepository()

# Eğitim seviyelerini getir
education_levels = repo.get_education_levels()

# 5. sınıf derslerini getir
subjects = repo.get_subjects(5)

# Matematik konularını getir
topics = repo.get_topics(1)  # Matematik ID'si

# Soruları filtrele
questions = repo.get_questions({
    'grade_level_id': 5,
    'subject_id': 1,
    'difficulty_level_id': 1,
    'limit': 10
})

# Soru oluştur
question_data = {
    'grade_level_id': 5,
    'subject_id': 1,
    'topic_id': 1,
    'subtopic_id': 1,
    'question_type_id': 1,
    'difficulty_level_id': 1,
    'question_text': 'Aşağıdaki sayılardan hangisi en büyüktür?',
    'explanation': 'Sayıları karşılaştırırken basamak sayısına bakılır.',
    'options': [
        {'text': '1250', 'is_correct': True, 'letter': 'A'},
        {'text': '999', 'is_correct': False, 'letter': 'B'},
        {'text': '850', 'is_correct': False, 'letter': 'C'},
        {'text': '750', 'is_correct': False, 'letter': 'D'}
    ]
}

question_id = repo.create_question(question_data)
```

### QuizRepository

Quiz oluşturma ve yönetimi için:

```python
from app.database.quiz_repository import QuizRepository

repo = QuizRepository()

# Quiz oluştur
filters = {
    'grade_level_id': 5,      # 5. sınıf
    'subject_id': 1,          # Matematik
    'difficulty_level_id': 1  # Kolay
}

settings = {
    'question_count': 10,
    'shuffle_questions': True,
    'shuffle_options': True,
    'time_limit': 600  # 10 dakika
}

result = repo.create_quiz_from_filters(filters, settings)

if result['success']:
    quiz_data = result['quiz_data']
    print(f"Quiz oluşturuldu: {quiz_data['settings']['question_count']} soru")
```

## 🔌 API Örnekleri

### Eğitim Hiyerarşisi API

```python
# Eğitim seviyeleri
GET /api/education-levels

# Sınıf seviyeleri
GET /api/education-levels/{id}/grade-levels

# Dersler
GET /api/grade-levels/{id}/subjects

# Konular
GET /api/subjects/{id}/topics

# Alt konular
GET /api/topics/{id}/subtopics
```

### Soru API

```python
# Soruları listele
GET /api/questions?grade_level_id=5&subject_id=1&limit=10

# Soru detayı
GET /api/questions/{id}

# Soru oluştur
POST /api/questions
{
    "grade_level_id": 5,
    "subject_id": 1,
    "topic_id": 1,
    "subtopic_id": 1,
    "question_type_id": 1,
    "difficulty_level_id": 1,
    "question_text": "Soru metni...",
    "explanation": "Açıklama...",
    "options": [...]
}

# Soru güncelle
PUT /api/questions/{id}

# Soru sil
DELETE /api/questions/{id}
```

### Quiz API

```python
# Quiz oluştur
POST /api/quiz/create
{
    "filters": {
        "grade_level_id": 5,
        "subject_id": 1,
        "difficulty_level_id": 1
    },
    "settings": {
        "question_count": 10,
        "shuffle_questions": true,
        "time_limit": 600
    }
}

# Quiz başlat
POST /api/quiz/start
{
    "user_id": 1,
    "quiz_data": {...}
}

# Cevap kaydet
POST /api/quiz/answer
{
    "attempt_id": 1,
    "question_id": 1,
    "selected_options": [1, 3],
    "time_taken": 45
}

# Quiz bitir
POST /api/quiz/finish
{
    "attempt_id": 1,
    "total_score": 85,
    "total_time": 450
}
```

## 🧪 Test

### Test Scripti Çalıştırma

```bash
python test_database.py
```

### Manuel Test

```python
# Veritabanı bağlantısını test et
from app.database.db_connection import DatabaseConnection

db = DatabaseConnection()
with db as conn:
    conn.cursor.execute("SELECT 1")
    print("Bağlantı başarılı!")

# Migration'ları çalıştır
from app.database.db_migrations import Migrations

migrations = Migrations()
migrations.run_migrations()

# Repository'leri test et
from app.database.question_repository import QuestionRepository

repo = QuestionRepository()
questions = repo.get_questions({'limit': 5})
print(f"{len(questions)} soru bulundu")
```

## 📊 Veritabanı İstatistikleri

### Örnek Sorgular

```sql
-- En zor sorular
SELECT 
    q.question_text,
    dl.name as difficulty,
    q.total_attempts,
    ROUND((q.correct_attempts / q.total_attempts) * 100, 2) as success_rate
FROM questions q
JOIN difficulty_levels dl ON q.difficulty_level_id = dl.id
WHERE q.total_attempts > 10
ORDER BY success_rate ASC
LIMIT 10;

-- Kullanıcı performansı
SELECT 
    u.username,
    us.total_attempts,
    us.best_score,
    us.average_score,
    us.total_time_taken
FROM user_statistics us
JOIN users u ON us.user_id = u.id
ORDER BY us.average_score DESC;

-- Ders bazında soru dağılımı
SELECT 
    s.name as subject,
    COUNT(q.id) as question_count,
    AVG(q.average_time_taken) as avg_time
FROM questions q
JOIN subjects s ON q.subject_id = s.id
GROUP BY s.id, s.name
ORDER BY question_count DESC;
```

## 🔧 Bakım ve Optimizasyon

### İndeksler

Performans için aşağıdaki indeksler otomatik oluşturulur:

```sql
-- Soru filtreleme için
CREATE INDEX idx_questions_grade ON questions(grade_level_id);
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level_id);

-- Quiz denemeleri için
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_completed ON quiz_attempts(completed_at);
```

### Yedekleme

```bash
# Veritabanı yedeği al
mysqldump -u root -p btk_app > backup_$(date +%Y%m%d_%H%M%S).sql

# Yedeği geri yükle
mysql -u root -p btk_app < backup_file.sql
```

## 🐛 Sorun Giderme

### Yaygın Hatalar

1. **Bağlantı Hatası**
   ```
   Error: Can't connect to MySQL server
   ```
   - Veritabanı servisinin çalıştığından emin olun
   - `.env` dosyasındaki bağlantı bilgilerini kontrol edin

2. **Tablo Bulunamadı**
   ```
   Error: Table 'btk_app.questions' doesn't exist
   ```
   - Migration'ları çalıştırın: `python app/database/db_migrations.py`

3. **Foreign Key Hatası**
   ```
   Error: Cannot add or update a child row
   ```
   - Referans edilen tabloda ilgili kaydın var olduğundan emin olun

### Log Dosyaları

Hata ayıklama için log dosyalarını kontrol edin:

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='database.log'
)
```

## 📞 Destek

Sorunlarınız için:

1. Test scriptini çalıştırın: `python test_database.py`
2. Log dosyalarını kontrol edin
3. Veritabanı bağlantısını test edin
4. Migration'ları yeniden çalıştırın

---

**Not**: Bu veritabanı sistemi MySQL için optimize edilmiştir. PostgreSQL kullanıyorsanız bazı SQL sözdizimi değişiklikleri gerekebilir. 