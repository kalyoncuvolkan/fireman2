# 🚒 Ankara İtfaiye Araç Takip Sistemi

Modern ve kullanıcı dostu bir itfaiye araç yönetim sistemi. İtfaiye araçlarının, sürücülerin, istasyonların ve arızaların takibini kolaylaştıran full-stack web uygulaması.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Gereksinimler](#-gereksinimler)
- [Kurulum](#-kurulum)
- [Örnek Verilerle Başlama](#-örnek-verilerle-başlama)
- [Kullanım](#-kullanım)
- [Yapılandırma](#-yapılandırma)
- [API Dokümantasyonu](#-api-dokümantasyonu)

## ✨ Özellikler

### 👥 Kullanıcı Yönetimi
- Amir ve Sürücü rolleri
- JWT tabanlı güvenli kimlik doğrulama
- Rol bazlı yetkilendirme

### 🚒 Araç Yönetimi
- Kapsamlı araç bilgileri (plaka, marka, model, tip)
- Araç durumu takibi (Aktif, Arızalı, Kaza)
- Kilometre ve bakım takibi
- Sigorta, muayene, kasko son kullanma tarihleri
- Araç ekipman yönetimi
- Sürücü atamaları

### 🏢 İstasyon Yönetimi
- Birden fazla istasyon desteği
- Konum bilgileri (enlem/boylam)
- İstasyon yöneticisi atamaları

### ⚠️ Arıza Yönetimi
- Arıza bildirimi ve takibi
- Arıza tipi kategorileri
- Öncelik seviyeleri
- Servis atamaları
- Arıza durumu takibi (Beklemede, Devam Ediyor, Çözüldü)

### 📋 Görevlendirme Sistemi
- Araç ve sürücü görevlendirmeleri
- Görev tipi tanımlamaları
- Görev lokasyon takibi

### 🔔 Bildirim Sistemi
- Gerçek zamanlı bildirimler
- Arıza ve görev bildirimleri

### 📊 İstatistikler ve Raporlama
- Dashboard görünümü
- Araç istatistikleri
- Arıza analizleri

## 🛠 Teknoloji Stack

### Backend
- **FastAPI** - Modern, hızlı Python web framework
- **Motor** - Async MongoDB driver
- **MongoDB** - NoSQL veritabanı
- **PyJWT** - JWT token yönetimi
- **Uvicorn** - ASGI server
- **Pydantic** - Veri validasyonu

### Frontend
- **React 19** - UI library
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP istekleri
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Modern UI komponet kütüphanesi
- **Radix UI** - Erişilebilir UI primitives
- **Lucide React** - İkon kütüphanesi
- **Sonner** - Toast bildirimleri

## 📦 Gereksinimler

- **Python** 3.10+
- **Node.js** 18+ ve Yarn
- **MongoDB** 5.0+
- **Docker** (opsiyonel, MongoDB için)

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/kalyoncuvolkan/yenibionluk.git
cd yenibionluk
```

### 2. MongoDB Kurulumu

#### Docker ile (Önerilen):

```bash
docker run -d \
  --name yenibionluk-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:latest
```

#### Manuel Kurulum:
MongoDB'yi [resmi websitesinden](https://www.mongodb.com/try/download/community) indirin ve kurun.

### 3. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluşturun (opsiyonel ama önerilen)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# .env dosyası oluşturun
cat > .env << EOF
MONGO_URL=mongodb://admin:admin123@localhost:27017/
DB_NAME=yenibionluk
JWT_SECRET=ankara-itfaiye-secret-key-2025
CORS_ORIGINS=*
EOF

# Backend'i başlatın
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Backend şu adreste çalışacak: `http://localhost:8001`

### 4. Frontend Kurulumu

```bash
cd ../frontend

# Bağımlılıkları yükleyin
yarn install

# .env dosyası oluşturun
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Frontend'i başlatın
yarn start
```

Frontend şu adreste çalışacak: `http://localhost:3000`

## 📊 Örnek Verilerle Başlama

Sistemi örnek verilerle doldurmak için:

```bash
cd backend
python3 seed_data.py
```

Bu script şunları oluşturur:
- ✅ 2 Amir (Yönetici)
- ✅ 6 Sürücü
- ✅ 4 İtfaiye İstasyonu (Merkez, Çankaya, Keçiören, Yenimahalle)
- ✅ 8 İtfaiye Aracı (Tanker, Merdiven, Kurtarma, Servis, Şnorkel, Arazöz)
- ✅ 3 Servis Firması
- ✅ 6 Arıza Tipi
- ✅ 4 Arıza Kaydı
- ✅ 3 Görevlendirme
- ✅ 4 Bildirim

### 🔑 Test Kullanıcıları

#### Amir Hesapları:
- 📧 `amir1@itfaiye.gov.tr` / 🔒 `amir123`
- 📧 `amir2@itfaiye.gov.tr` / 🔒 `amir123`

#### Sürücü Hesapları:
- 📧 `ali.kaya@itfaiye.gov.tr` / 🔒 `surucu123`
- 📧 `veli.ozturk@itfaiye.gov.tr` / 🔒 `surucu123`
- 📧 `hasan.celik@itfaiye.gov.tr` / 🔒 `surucu123`
- 📧 `huseyin.arslan@itfaiye.gov.tr` / 🔒 `surucu123`
- 📧 `mustafa.yilmaz@itfaiye.gov.tr` / 🔒 `surucu123`
- 📧 `ismail.sahin@itfaiye.gov.tr` / 🔒 `surucu123`

## 💻 Kullanım

### Giriş Yapma

1. Tarayıcınızda `http://localhost:3000` adresini açın
2. Yukarıdaki test kullanıcı bilgilerinden birini kullanın
3. Dashboard'a yönlendirileceksiniz

### Amir Yetkisi ile:
- ✅ Tüm araçları görüntüleme ve yönetme
- ✅ Kullanıcı ekleme/düzenleme
- ✅ İstasyon yönetimi
- ✅ Arıza onaylama ve servis atama
- ✅ Görevlendirme yapma
- ✅ İstatistikleri görüntüleme

### Sürücü Yetkisi ile:
- ✅ Atanan araçları görüntüleme
- ✅ Arıza bildirimi yapma
- ✅ Görevleri görüntüleme
- ✅ Profil güncelleme

## ⚙️ Yapılandırma

### Backend (.env)

```env
MONGO_URL=mongodb://admin:admin123@localhost:27017/
DB_NAME=yenibionluk
JWT_SECRET=your-secret-key-here
CORS_ORIGINS=*
```

### Frontend (.env)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Dış IP Yapılandırması

Sistemi dış IP'den erişilebilir yapmak için:

1. **Port Yönlendirme:**
   - Frontend: `5558` → `3000`
   - Backend: `5559` → `8001`

2. **Frontend .env Güncelleme:**
   ```env
   REACT_APP_BACKEND_URL=http://YOUR_EXTERNAL_IP:5559
   ```

3. **Frontend'i Yeniden Başlatma:**
   ```bash
   cd frontend
   yarn start
   ```

## 📚 API Dokümantasyonu

Backend çalıştırıldıktan sonra:

- **Swagger UI:** `http://localhost:8001/docs`
- **ReDoc:** `http://localhost:8001/redoc`

### Ana API Endpoint'leri

#### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `GET /api/auth/me` - Mevcut kullanıcı bilgisi

#### Araçlar
- `GET /api/vehicles` - Tüm araçları listele
- `GET /api/vehicles/{id}` - Araç detayı
- `POST /api/vehicles` - Yeni araç ekle
- `PUT /api/vehicles/{id}` - Araç güncelle
- `DELETE /api/vehicles/{id}` - Araç sil

#### Arızalar
- `GET /api/faults` - Arızaları listele
- `POST /api/faults` - Arıza bildirimi
- `PUT /api/faults/{id}` - Arıza güncelle
- `PUT /api/faults/{id}/resolve` - Arızayı çöz

#### İstasyonlar
- `GET /api/stations` - İstasyonları listele
- `POST /api/stations` - Yeni istasyon ekle
- `PUT /api/stations/{id}` - İstasyon güncelle

#### Kullanıcılar
- `GET /api/users` - Kullanıcıları listele
- `GET /api/users/{id}` - Kullanıcı detayı
- `PUT /api/users/{id}` - Kullanıcı güncelle

## 🗂 Proje Yapısı

```
yenibionluk/
├── backend/
│   ├── server.py          # Ana FastAPI uygulaması
│   ├── seed_data.py       # Örnek veri oluşturma scripti
│   ├── requirements.txt   # Python bağımlılıkları
│   └── .env              # Backend yapılandırması
│
├── frontend/
│   ├── src/
│   │   ├── components/   # UI bileşenleri
│   │   ├── pages/        # Sayfa bileşenleri
│   │   ├── App.js        # Ana React bileşeni
│   │   └── App.css       # Global stiller
│   ├── package.json      # Node bağımlılıkları
│   └── .env             # Frontend yapılandırması
│
└── README.md            # Bu dosya
```

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası

```bash
# MongoDB container'ın çalıştığından emin olun
docker ps | grep mongo

# Container'ı yeniden başlatın
docker restart yenibionluk-mongodb
```

### Frontend Backend'e Bağlanamıyor

1. Backend'in çalıştığından emin olun: `http://localhost:8001/docs`
2. `.env` dosyasındaki `REACT_APP_BACKEND_URL` değerini kontrol edin
3. Frontend'i yeniden başlatın (`.env` değişiklikleri için gerekli)

### Port Zaten Kullanımda

```bash
# Port 8001'i kullanan process'i bulun
lsof -ti :8001

# Process'i sonlandırın
lsof -ti :8001 | xargs kill -9

# Port 3000 için
lsof -ti :3000 | xargs kill -9
```

## 📝 Lisans

Bu proje özel kullanım içindir.

## 👤 İletişim

Sorularınız için: [GitHub Issues](https://github.com/kalyoncuvolkan/yenibionluk/issues)

---

**Not:** Bu sistem Ankara İtfaiye için geliştirilmiş bir araç takip ve yönetim sistemidir.
