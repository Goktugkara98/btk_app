# Question Loader Modülü

Bu modül, JSON formatındaki question dosyalarını veritabanına yüklemek için kullanılır.

## 📁 Dosya Yapısı

```
app/database/
├── question_loader.py          # Ana question yükleme modülü
├── load_questions.py           # CLI script
├── test_question_loader.py     # Test scripti
└── README_question_loader.md   # Bu dosya
```

## 🚀 Kullanım

### 1. Temel Kullanım

```python
from app.database.question_loader import QuestionLoader

# QuestionLoader'ı başlat
loader = QuestionLoader()

# Tek dosya yükle
success, total = loader.process_question_file("path/to/question.json")

# Tüm dosyaları yükle
results = loader.process_all_question_files()

# Bağlantıyı kapat
loader.close()
```

### 2. CLI Kullanımı

```bash
# Tüm question dosyalarını yükle
python app/database/load_questions.py

# Belirli bir dosyayı yükle
python app/database/load_questions.py --file app/data/question_banks/grade_8/turkish/verbals/participle.json

# Belirli bir dizindeki dosyaları yükle
python app/database/load_questions.py --dir app/data/question_banks/grade_8/turkish

# Verbose mod ile yükle
python app/database/load_questions.py --verbose

# Dry run (test modu)
python app/database/load_questions.py --dry-run
```

### 3. Test Etme

```bash
# Test scriptini çalıştır
python app/database/test_question_loader.py
```

## 📋 JSON Dosya Formatı

Question JSON dosyaları aşağıdaki formatta olmalıdır:

```json
{
  "metadata": {
    "grade": 8,
    "subject": "turkish",
    "unit": "verbals",
    "topic": "participles",
    "topicName": "Sıfat-fiil",
    "totalQuestions": 30,
    "difficultyLevels": {
      "easy": 10,
      "medium": 10,
      "hard": 10
    }
  },
  "questions": [
    {
      "id": "8_turkish_verbals_participles_easy_001",
      "questionText": "Soru metni buraya...",
      "questionType": "multiple_choice",
      "difficulty": "easy",
      "options": [
        {
          "id": "A",
          "text": "Seçenek A",
          "isCorrect": false,
          "explanation": "Açıklama..."
        },
        {
          "id": "B",
          "text": "Seçenek B",
          "isCorrect": true,
          "explanation": "Açıklama..."
        }
      ],
      "correctAnswer": "B",
      "explanation": "Genel açıklama..."
    }
  ]
}
```

## 🔧 Gereksinimler

### Veritabanı Yapısı

Question yükleme işlemi için aşağıdaki tablolar mevcut olmalıdır:

1. **grades** - Sınıf seviyeleri
2. **subjects** - Dersler
3. **units** - Üniteler
4. **topics** - Konular
5. **questions** - Sorular
6. **question_options** - Soru seçenekleri

### Veritabanı Bağlantısı

Veritabanı bağlantı bilgileri environment variables ile sağlanır:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=btk_app
DB_PORT=3306
```

## 📊 Çıktı Formatı

### Başarılı İşlem

```
📝 app/data/question_banks/grade_8/turkish/verbals/participle.json dosyası işleniyor...
   Grade: 8, Subject: turkish, Unit: verbals, Topic: participles
   Topic ID: 15
   Question sayısı: 30
   ✅ Question 1 eklendi (ID: 101)
   ✅ Question 2 eklendi (ID: 102)
   ...
📊 Sonuç: 30/30 question başarıyla eklendi
```

### Hata Durumu

```
❌ Topic bulunamadı: app/data/question_banks/grade_8/turkish/verbals/participle.json
⚠️  Topic bulunamadı: Grade 8, turkish, verbals, participles
```

## 🛠️ Özellikler

- **Otomatik Topic Eşleştirme**: JSON metadata'sındaki bilgilere göre veritabanındaki topic'i otomatik bulur
- **Batch İşleme**: Birden fazla dosyayı tek seferde işleyebilir
- **Hata Yönetimi**: Detaylı hata mesajları ve rollback işlemleri
- **CLI Desteği**: Komut satırından kolay kullanım
- **Test Desteği**: Kapsamlı test scriptleri

## 🔍 Sorun Giderme

### Topic Bulunamadı Hatası

Bu hata, JSON dosyasındaki metadata ile veritabanındaki topic bilgilerinin eşleşmemesinden kaynaklanır.

**Çözüm:**
1. Veritabanında ilgili grade, subject, unit ve topic'in mevcut olduğunu kontrol edin
2. JSON metadata'sındaki değerlerin veritabanındaki değerlerle tam eşleştiğini kontrol edin
3. Büyük/küçük harf duyarlılığına dikkat edin

### Veritabanı Bağlantı Hatası

**Çözüm:**
1. Environment variables'ların doğru ayarlandığını kontrol edin
2. MySQL servisinin çalıştığını kontrol edin
3. Veritabanı kullanıcısının gerekli yetkilere sahip olduğunu kontrol edin

### JSON Format Hatası

**Çözüm:**
1. JSON dosyasının geçerli JSON formatında olduğunu kontrol edin
2. Gerekli alanların (metadata, questions) mevcut olduğunu kontrol edin
3. Question formatının doğru olduğunu kontrol edin

## 📝 Örnek Kullanım Senaryoları

### Senaryo 1: Yeni Question Seti Ekleme

```bash
# 1. JSON dosyasını hazırla
# 2. Dosyayı test et
python app/database/test_question_loader.py

# 3. Dosyayı yükle
python app/database/load_questions.py --file path/to/new_questions.json
```

### Senaryo 2: Toplu Question Yükleme

```bash
# Tüm question dosyalarını yükle
python app/database/load_questions.py --verbose
```

### Senaryo 3: Belirli Bir Dersin Question'larını Yükleme

```bash
# Sadece Türkçe dersi question'larını yükle
python app/database/load_questions.py --dir app/data/question_banks/grade_8/turkish
```

## 🤝 Katkıda Bulunma

1. Yeni özellikler için issue açın
2. Pull request gönderin
3. Test scriptlerini güncelleyin
4. README'yi güncelleyin 