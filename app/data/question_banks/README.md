# Question Banks - Soru Bankaları

Bu klasör, tüm soru bankalarını içerir. Her soru bankası, belirli bir konu için hazırlanmış soruları içerir.

## 📁 Klasör Yapısı

```
question_banks/
├── template.json                    # Şablon dosya
├── README.md                        # Bu dosya
├── grade_8/
│   ├── turkish/
│   │   ├── verbals/
│   │   │   ├── participle.json      # Sıfat-fiil soruları
│   │   │   ├── gerund.json          # Zarf-fiil soruları
│   │   │   └── infinitive.json      # İsim-fiil soruları
│   │   └── ...
│   ├── mathematics/
│   └── science/
├── grade_9/
└── ...
```

## 🎯 ID Formatı

Soru ID'leri şu formatta olmalıdır:
```
grade_subject_unit_topic_questionNumber
```

**Örnekler:**
- `8_turkish_verbals_participles_001`
- `9_mathematics_algebra_equations_001`
- `8_science_physics_mechanics_001`

## 📝 Yeni Soru Bankası Oluşturma

1. **Klasör Yapısını Oluşturun:**
   ```
   grade_X/subject_name/unit_name/topic_name.json
   ```

2. **Template'i Kopyalayın:**
   ```bash
   cp template.json grade_X/subject_name/unit_name/topic_name.json
   ```

3. **Metadata'yı Güncelleyin:**
   ```json
   {
     "metadata": {
       "grade": 8,
       "subject": "turkish",
       "unit": "verbals",
       "topic": "participles",
       "topicName": "Sıfat-fiil",
       "totalQuestions": 0,
       "difficultyLevels": {
         "easy": 0,
         "medium": 0,
         "hard": 0
       }
     }
   }
   ```

4. **Soruları Ekleyin:**
   - Her soru için benzersiz ID kullanın
   - Zorluk seviyelerini belirtin (easy, medium, hard)
   - Her seçenek için açıklama ekleyin
   - Tag'ler ekleyin

## 🔧 Soru Tipleri

Şu anda desteklenen soru tipi:
- **multiple_choice**: Çoktan seçmeli sorular

## 📊 İstatistikler

Her soru bankası otomatik olarak şu istatistikleri tutar:
- `totalAttempts`: Toplam deneme sayısı
- `correctAnswers`: Doğru cevap sayısı
- `averageScore`: Ortalama puan
- `mostMissedQuestion`: En çok yanlış yapılan soru
- `averageTimePerQuestion`: Soru başına ortalama süre

## 🏷️ Tag Sistemi

Soruları kategorize etmek için tag'ler kullanın:
- Konu adı: `sıfat-fiil`, `denklemler`, `fizik`
- Zorluk: `temel`, `orta`, `zor`
- Özel durumlar: `anlam bozukluğu`, `paragraf`, `grafik`

## ⚠️ Önemli Notlar

1. **ID Benzersizliği**: Her soru ID'si benzersiz olmalıdır
2. **Zorluk Seviyeleri**: Easy, medium, hard kategorilerini dengeli kullanın
3. **Açıklamalar**: Her seçenek için açıklama ekleyin
4. **Puanlar**: Zorluk seviyesine göre puan verin (10, 15, 20)
5. **Tarih Bilgileri**: createdAt ve updatedAt alanlarını güncel tutun

## 📋 Örnek Kullanım

```json
{
  "id": "8_turkish_verbals_participles_001",
  "questionText": "Aşağıdaki cümlelerden hangisinde sıfat-fiil kullanılmıştır?",
  "questionType": "multiple_choice",
  "difficulty": "easy",
  "options": [
    {
      "id": "A",
      "text": "Koşarak eve gitti.",
      "isCorrect": false,
      "explanation": "Bu cümlede 'koşarak' zarf-fiil kullanılmıştır."
    }
  ],
  "correctAnswer": "B",
  "explanation": "Sıfat-fiil açıklaması...",
  "tags": ["sıfat-fiil", "fiilimsiler", "temel"],
  "points": 10
}
``` 