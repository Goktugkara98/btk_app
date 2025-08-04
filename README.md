# 🎓 BTK Uygulaması

Modern web teknolojileri ile geliştirilmiş, eğitim odaklı quiz uygulaması. Flask framework'ü kullanılarak geliştirilmiş, modüler yapıda ve ölçeklenebilir bir eğitim platformu.

## 📋 İçindekiler

- [🚀 Özellikler](#-özellikler)
- [🏗️ Teknoloji Stack'i](#️-teknoloji-stacki)
- [📁 Proje Yapısı](#-proje-yapısı)
- [⚙️ Kurulum](#️-kurulum)
- [🔧 Konfigürasyon](#-konfigürasyon)
- [🚀 Çalıştırma](#-çalıştırma)
- [📊 Veritabanı](#-veritabanı)
- [🔧 API Dokümantasyonu](#-api-dokümantasyonu)
- [🧪 Test](#-test)
- [📦 Deployment](#-deployment)
- [🤝 Katkıda Bulunma](#-katkıda-bulunma)
- [📄 Lisans](#-lisans)

## 🚀 Özellikler

### 🎯 **Temel Özellikler**
- ✅ **Kullanıcı Yönetimi**: Kayıt, giriş, profil yönetimi
- ✅ **Quiz Sistemi**: Dinamik soru yükleme ve puanlama
- ✅ **Konu Bazlı Öğrenme**: Sınıf, ders, ünite ve konu organizasyonu
- ✅ **Gerçek Zamanlı İlerleme**: Quiz sırasında anlık takip
- ✅ **Sonuç Analizi**: Detaylı performans raporları
- ✅ **Responsive Tasarım**: Mobil uyumlu arayüz

### 🔧 **Teknik Özellikler**
- ✅ **Modüler Mimari**: Blueprint tabanlı yapı
- ✅ **Service Layer**: İş mantığı ayrımı
- ✅ **Veritabanı Migrasyonu**: Otomatik tablo oluşturma
- ✅ **Güvenlik**: JWT token, şifre hashleme, CSRF koruması
- ✅ **Hata Yönetimi**: Kapsamlı error handling
- ✅ **Logging**: Detaylı log sistemi

### 📊 **Eğitim Özellikleri**
- ✅ **Çoklu Zorluk Seviyesi**: Kolay, orta, zor
- ✅ **Soru Tipleri**: Çoktan seçmeli sorular
- ✅ **Açıklamalı Cevaplar**: Öğrenme için detaylı açıklamalar
- ✅ **İstatistikler**: Kullanıcı performans analizi
- ✅ **Konu Bazlı Filtreleme**: Hedefli öğrenme

## 🏗️ Teknoloji Stack'i

### **Backend**
- **Flask 2.3.3** - Web framework
- **Python 3.8+** - Programlama dili
- **MySQL 8.0+** - Veritabanı
- **mysql-connector-python** - Veritabanı bağlantısı

### **Frontend**
- **HTML5/CSS3** - Yapı ve stil
- **JavaScript (ES6+)** - Dinamik etkileşim
- **Bootstrap** - Responsive tasarım
- **GSAP** - Animasyonlar

### **Araçlar**
- **python-dotenv** - Ortam değişkenleri
- **psutil** - Sistem monitörü
- **Werkzeug** - WSGI utilities
- **Jinja2** - Template engine

## 📁 Proje Yapısı

```
btk_app/
├── README.md                    # Bu dosya
├── main.py                      # Flask uygulaması giriş noktası
├── config.py                    # Konfigürasyon ayarları
├── requirements.txt             # Python bağımlılıkları
├── .env_example                 # Ortam değişkenleri örneği
├── DATABASE_STRUCTURE.md        # Veritabanı yapısı dokümantasyonu
│
├── app/                         # Ana uygulama klasörü
│   ├── __init__.py             # Uygulama başlatıcı
│   │
│   ├── database/               # Veritabanı modülü
│   │   ├── README.md           # Veritabanı dokümantasyonu
│   │   ├── db_connection.py    # Veritabanı bağlantısı
│   │   ├── db_migrations.py    # Tablo oluşturma
│   │   ├── quiz_data_loader.py  # Quiz veri yükleme
│   │   ├── curriculum_data_loader.py # Müfredat veri yükleme
│   │   ├── user_repository.py  # Kullanıcı repository
│   │   └── schemas/            # Veritabanı şemaları
│   │       ├── grades_schema.py
│   │       ├── subjects_schema.py
│   │       ├── units_schema.py
│   │       ├── topics_schema.py
│   │       ├── questions_schema.py
│   │       ├── question_options_schema.py
│   │       └── users_schema.py
│   │
│   ├── routes/                 # Route modülü
│   │   ├── README.md           # Routes dokümantasyonu
│   │   ├── __init__.py         # Route başlatıcı
│   │   ├── api/                # API rotaları
│   │   │   ├── api_routes.py   # Ana API blueprint
│   │   │   ├── user_routes.py  # Kullanıcı API
│   │   │   ├── quiz_routes.py  # Quiz API
│   │   │   └── system_routes.py # Sistem API
│   │   └── pages/              # Sayfa rotaları
│   │       ├── routes.py       # Ana sayfa blueprint
│   │       ├── main_routes.py  # Ana sayfa rotaları
│   │       ├── auth_routes.py  # Kimlik doğrulama
│   │       ├── quiz_routes.py  # Quiz sayfa rotaları
│   │       └── user_routes.py  # Kullanıcı sayfa rotaları
│   │
│   ├── services/               # Servis modülü
│   │   ├── README.md           # Services dokümantasyonu
│   │   ├── __init__.py         # Servis başlatıcı
│   │   ├── services.py         # Servis fabrikası
│   │   ├── user_service.py     # Kullanıcı servisi
│   │   ├── quiz_service.py     # Quiz servisi
│   │   └── system_service.py   # Sistem servisi
│   │
│   ├── static/                 # Statik dosyalar
│   │   ├── css/                # Stil dosyaları
│   │   │   ├── base.css        # Temel stiller
│   │   │   ├── components/     # Bileşen stilleri
│   │   │   ├── index/          # Ana sayfa stilleri
│   │   │   ├── login/          # Giriş sayfası stilleri
│   │   │   ├── quiz/           # Quiz sayfası stilleri
│   │   │   ├── profile/        # Profil sayfası stilleri
│   │   │   └── register/       # Kayıt sayfası stilleri
│   │   ├── js/                 # JavaScript dosyaları
│   │   │   ├── main.js         # Ana JavaScript
│   │   │   ├── components/     # Bileşen scriptleri
│   │   │   ├── index/          # Ana sayfa scriptleri
│   │   │   ├── login/          # Giriş sayfası scriptleri
│   │   │   ├── quiz/           # Quiz scriptleri
│   │   │   ├── profile/        # Profil scriptleri
│   │   │   ├── register/       # Kayıt scriptleri
│   │   │   └── utils/          # Yardımcı fonksiyonlar
│   │   ├── uploads/            # Yüklenen dosyalar
│   │   │   └── avatars/        # Kullanıcı avatarları
│   │   ├── favicon.ico         # Site ikonu
│   │   └── favicon.svg         # SVG site ikonu
│   │
│   ├── templates/              # HTML şablonları
│   │   ├── base.html           # Temel şablon
│   │   ├── index.html          # Ana sayfa
│   │   ├── login.html          # Giriş sayfası
│   │   ├── register.html       # Kayıt sayfası
│   │   ├── profile.html        # Profil sayfası
│   │   ├── quiz_start.html     # Quiz başlatma
│   │   ├── quiz_screen.html    # Quiz ekranı
│   │   └── quiz_results.html   # Quiz sonuçları
│   │
│   ├── data/                   # Veri dosyaları
│   │   ├── curriculum_structure/ # Müfredat yapısı
│   │   │   ├── grade_8.json    # 8. sınıf müfredatı
│   │   │   └── grade_9.json    # 9. sınıf müfredatı
│   │   ├── quiz_banks/         # Soru bankaları
│   │   │   ├── grade_8/        # 8. sınıf soruları
│   │   │   │   └── turkish/    # Türkçe soruları
│   │   │   │       └── verbals/ # Fiilimsiler
│   │   │   │           └── participle.json
│   │   │   └── template.json   # Soru şablonu
│   │   ├── demo-scenarios.json # Demo senaryoları
│   │   ├── hero-questions.json # Ana sayfa soruları
│   │   └── quiz-data.json      # Quiz verileri
│   │
│   └── utils/                  # Yardımcı modüller
│
└── instance/                   # Instance klasörü (Flask)
```

## ⚙️ Kurulum

### **Gereksinimler**
- Python 3.8 veya üzeri
- MySQL 8.0 veya üzeri
- Git

### **1. Projeyi İndirin**
```bash
git clone https://github.com/your-username/btk_app.git
cd btk_app
```

### **2. Sanal Ortam Oluşturun**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### **3. Bağımlılıkları Yükleyin**
```bash
pip install -r requirements.txt
```

### **4. Veritabanını Hazırlayın**
```sql
-- MySQL'de yeni veritabanı oluşturun
CREATE DATABASE btk_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'btk_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON btk_app.* TO 'btk_user'@'localhost';
FLUSH PRIVILEGES;
```

## 🔧 Konfigürasyon

### **1. Ortam Değişkenleri**
`.env_example` dosyasını `.env` olarak kopyalayın ve düzenleyin:

```bash
# .env dosyası
DB_HOST=localhost
DB_USER=btk_user
DB_PASSWORD=your_password
DB_NAME=btk_app
DB_PORT=3306

# Uygulama Konfigürasyonu
SECRET_KEY=your-secret-key-here
FLASK_DEBUG=True
```

### **2. Veritabanı Ayarları**
`config.py` dosyasında veritabanı ayarlarını kontrol edin:

```python
MYSQL_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', ''),
    'database': os.environ.get('MYSQL_DB', 'btk_app'),
    'port': int(os.environ.get('MYSQL_PORT', 3306)),
    'charset': 'utf8mb4',
    'use_unicode': True,
    'autocommit': True
}
```

## 🚀 Çalıştırma

### **Geliştirme Modu**
```bash
# Sanal ortamı aktifleştirin
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Uygulamayı çalıştırın
python main.py
```

### **Production Modu**
```bash
# Production konfigürasyonu ile
export FLASK_ENV=production
python main.py
```

### **Erişim**
- **Web Arayüzü**: http://localhost:5000
- **API Endpoint'leri**: http://localhost:5000/api

## 📊 Veritabanı

### **Otomatik Kurulum**
Uygulama ilk çalıştırıldığında:
1. Veritabanı tabloları otomatik oluşturulur
2. Örnek veriler yüklenir
3. Soru bankaları otomatik yüklenir

### **Manuel Veri Yükleme**
```bash
# Soru verilerini manuel yüklemek için
python -m app.database.quiz_data_cli
```

### **Veritabanı Yapısı**
Detaylı veritabanı yapısı için: [DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)

## 🔧 API Dokümantasyonu

### **Kullanıcı API'leri**
```http
POST /api/register          # Kullanıcı kaydı
POST /api/login             # Kullanıcı girişi
GET  /api/users/profile     # Profil bilgileri
PUT  /api/users/profile     # Profil güncelleme
```

### **Quiz API'leri**
```http
GET  /api/quiz/topics       # Konu listesi
POST /api/quiz/start        # Quiz başlatma
GET  /api/quiz/questions    # Soru listesi
POST /api/quiz/submit       # Quiz gönderme
GET  /api/quiz/results      # Sonuçlar
```

### **Sistem API'leri**
```http
GET /api/health             # Sistem sağlığı
GET /api/status             # Sistem durumu
GET /api/version            # Uygulama versiyonu
```

Detaylı API dokümantasyonu için: [app/routes/README.md](app/routes/README.md)

## 🧪 Test

### **Unit Testler**
```bash
# Test klasöründe testleri çalıştırın
python -m pytest tests/
```

### **Manuel Test**
```bash
# Uygulamayı test modunda çalıştırın
export FLASK_ENV=testing
python main.py
```

### **API Testleri**
```bash
# API endpoint'lerini test edin
curl http://localhost:5000/api/health
curl http://localhost:5000/api/quiz/topics
```

## 📦 Deployment

### **Production Sunucusu**
```bash
# Gunicorn ile production sunucusu
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

### **Docker Deployment**
```dockerfile
# Dockerfile örneği
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "main.py"]
```

### **Environment Variables**
Production ortamında gerekli değişkenler:
```bash
SECRET_KEY=your-production-secret-key
FLASK_ENV=production
MYSQL_HOST=your-db-host
MYSQL_USER=your-db-user
MYSQL_PASSWORD=your-db-password
MYSQL_DB=your-db-name
```

## 🔒 Güvenlik

### **Uygulanan Güvenlik Önlemleri**
- ✅ **JWT Token Authentication**
- ✅ **Password Hashing (bcrypt)**
- ✅ **CSRF Protection**
- ✅ **SQL Injection Prevention**
- ✅ **XSS Protection**
- ✅ **Input Validation**
- ✅ **Session Management**

### **Güvenlik Kontrol Listesi**
- [ ] SECRET_KEY production'da değiştirildi
- [ ] Veritabanı şifresi güçlü
- [ ] HTTPS kullanılıyor
- [ ] Firewall yapılandırıldı
- [ ] Log dosyaları güvenli

## 🐛 Sorun Giderme

### **Yaygın Sorunlar**

#### **Veritabanı Bağlantı Hatası**
```bash
# Veritabanı servisini kontrol edin
sudo systemctl status mysql

# Bağlantı ayarlarını kontrol edin
python -c "from app.database.db_connection import DatabaseConnection; db = DatabaseConnection(); print('Bağlantı başarılı')"
```

#### **Port Çakışması**
```bash
# Port 5000'i kullanan işlemleri kontrol edin
netstat -tulpn | grep :5000

# Farklı port kullanın
export FLASK_RUN_PORT=5001
python main.py
```

#### **Import Hatası**
```bash
# Python path'ini kontrol edin
export PYTHONPATH="${PYTHONPATH}:/path/to/btk_app"

# Sanal ortamı yeniden aktifleştirin
deactivate
source venv/bin/activate
```

### **Log Dosyaları**
```bash
# Flask loglarını kontrol edin
tail -f logs/flask.log

# Veritabanı loglarını kontrol edin
tail -f logs/database.log
```

## 🤝 Katkıda Bulunma

### **Geliştirme Süreci**
1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### **Kod Standartları**
- PEP 8 Python kod standartları
- Type hints kullanımı
- Docstring'ler zorunlu
- Unit testler yazılmalı

### **Commit Mesajları**
```
feat: yeni özellik eklendi
fix: hata düzeltildi
docs: dokümantasyon güncellendi
style: kod formatı düzeltildi
refactor: kod yeniden düzenlendi
test: test eklendi
chore: bakım işlemleri
```

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- **Proje Sahibi**: Göktuğ KARA
- **Email**: ferdigoktugkara@gmail.com
- **GitHub**: https://github.com/goktugkara98


**Son Güncelleme**: 2025-01-27  
**Versiyon**: 2.0.0  
**Durum**: Developement