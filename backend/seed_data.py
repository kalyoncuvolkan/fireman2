#!/usr/bin/env python3
"""
Seed script to populate the database with sample data
Usage: python3 seed_data.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import bcrypt
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://admin:admin123@localhost:27017/')
db_name = os.environ.get('DB_NAME', 'yenibionluk')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    print("🗑️  Temizleniyor: Mevcut veriler siliniyor...")
    # Clear existing data
    await db.users.delete_many({})
    await db.stations.delete_many({})
    await db.vehicles.delete_many({})
    await db.services.delete_many({})
    await db.fault_types.delete_many({})
    await db.faults.delete_many({})
    await db.assignments.delete_many({})
    await db.requests.delete_many({})
    await db.notifications.delete_many({})

    print("👥 Kullanıcılar oluşturuluyor...")

    # Create managers
    managers = [
        {
            "id": str(uuid.uuid4()),
            "email": "amir1@itfaiye.gov.tr",
            "password": hash_password("amir123"),
            "name": "Ahmet Yılmaz",
            "role": "manager",
            "phone": "+90 532 111 2233",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "amir2@itfaiye.gov.tr",
            "password": hash_password("amir123"),
            "name": "Mehmet Demir",
            "role": "manager",
            "phone": "+90 532 222 3344",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    await db.users.insert_many(managers)
    print(f"  ✅ {len(managers)} amir oluşturuldu")
    print(f"     📧 Email: amir1@itfaiye.gov.tr / Şifre: amir123")
    print(f"     📧 Email: amir2@itfaiye.gov.tr / Şifre: amir123")

    print("\n🏢 İstasyonlar oluşturuluyor...")

    # Create stations
    stations = [
        {
            "id": str(uuid.uuid4()),
            "name": "Ankara İtfaiye Merkez İstasyonu",
            "address": "Ulus, Ankara",
            "phone": "+90 312 123 4567",
            "internal_number": "1001",
            "latitude": 39.9334,
            "longitude": 32.8597,
            "manager_id": managers[0]["id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Çankaya İtfaiye İstasyonu",
            "address": "Çankaya, Ankara",
            "phone": "+90 312 234 5678",
            "internal_number": "1002",
            "latitude": 39.9180,
            "longitude": 32.8628,
            "manager_id": managers[0]["id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Keçiören İtfaiye İstasyonu",
            "address": "Keçiören, Ankara",
            "phone": "+90 312 345 6789",
            "internal_number": "1003",
            "latitude": 39.9696,
            "longitude": 32.8629,
            "manager_id": managers[1]["id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Yenimahalle İtfaiye İstasyonu",
            "address": "Yenimahalle, Ankara",
            "phone": "+90 312 456 7890",
            "internal_number": "1004",
            "latitude": 39.9489,
            "longitude": 32.7960,
            "manager_id": managers[1]["id"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    await db.stations.insert_many(stations)
    print(f"  ✅ {len(stations)} istasyon oluşturuldu")

    print("\n🚗 Sürücüler oluşturuluyor...")

    # Create drivers
    drivers = [
        {
            "id": str(uuid.uuid4()),
            "email": "ali.kaya@itfaiye.gov.tr",
            "password": hash_password("surucu123"),
            "name": "Ali Kaya",
            "role": "driver",
            "station_id": stations[0]["id"],
            "sicil_no": "2024001",
            "phone": "+90 532 111 0001",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "veli.ozturk@itfaiye.gov.tr",
            "password": hash_password("surucu123"),
            "name": "Veli Öztürk",
            "role": "driver",
            "station_id": stations[0]["id"],
            "sicil_no": "2024002",
            "phone": "+90 532 111 0002",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "hasan.celik@itfaiye.gov.tr",
            "password": hash_password("surucu123"),
            "name": "Hasan Çelik",
            "role": "driver",
            "station_id": stations[1]["id"],
            "sicil_no": "2024003",
            "phone": "+90 532 111 0003",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "huseyin.arslan@itfaiye.gov.tr",
            "password": hash_password("surucu123"),
            "name": "Hüseyin Arslan",
            "role": "driver",
            "station_id": stations[1]["id"],
            "sicil_no": "2024004",
            "phone": "+90 532 111 0004",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "mustafa.yilmaz@itfaiye.gov.tr",
            "password": hash_password("surucu123"),
            "name": "Mustafa Yılmaz",
            "role": "driver",
            "station_id": stations[2]["id"],
            "sicil_no": "2024005",
            "phone": "+90 532 111 0005",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "ismail.sahin@itfaiye.gov.tr",
            "password": hash_password("surucu123"),
            "name": "İsmail Şahin",
            "role": "driver",
            "station_id": stations[3]["id"],
            "sicil_no": "2024006",
            "phone": "+90 532 111 0006",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    await db.users.insert_many(drivers)
    print(f"  ✅ {len(drivers)} sürücü oluşturuldu")
    print(f"     📧 Tüm sürücüler için şifre: surucu123")

    print("\n🚒 Araçlar oluşturuluyor...")

    # Create vehicles
    today = datetime.now(timezone.utc)
    vehicles = [
        {
            "id": str(uuid.uuid4()),
            "plate": "06 AA 1001",
            "brand": "Mercedes",
            "model": "Atego 1529",
            "year": 2020,
            "vehicle_type": "tanker",
            "station_id": stations[0]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=120)).isoformat(),
            "inspection_expiry": (today + timedelta(days=90)).isoformat(),
            "kasko_expiry": (today + timedelta(days=150)).isoformat(),
            "assigned_driver_id": drivers[0]["id"],
            "current_km": 45000,
            "last_oil_change_km": 43000,
            "next_oil_change_km": 53000,
            "equipment": [
                {"name": "Yangın Hortumu", "serial_number": "HRT-2024-001", "quantity": 4},
                {"name": "Yangın Söndürme Tüpü", "serial_number": "TUP-2024-001", "quantity": 6}
            ],
            "photos": [],
            "notes": "Düzenli bakımda, sorun yok",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 AA 1002",
            "brand": "MAN",
            "model": "TGM 18.340",
            "year": 2019,
            "vehicle_type": "ladder",
            "station_id": stations[0]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=200)).isoformat(),
            "inspection_expiry": (today + timedelta(days=180)).isoformat(),
            "kasko_expiry": (today + timedelta(days=220)).isoformat(),
            "assigned_driver_id": drivers[1]["id"],
            "current_km": 67000,
            "last_oil_change_km": 65000,
            "next_oil_change_km": 75000,
            "equipment": [
                {"name": "Hidrolik Merdiven", "serial_number": "MRD-2024-001", "quantity": 1},
                {"name": "Kurtarma İpi", "serial_number": "IP-2024-001", "quantity": 2}
            ],
            "photos": [],
            "notes": "30 metre merdiven kapasitesi",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 BB 2001",
            "brand": "Iveco",
            "model": "Eurocargo 150E",
            "year": 2021,
            "vehicle_type": "tanker",
            "station_id": stations[1]["id"],
            "status": "faulty",
            "insurance_expiry": (today + timedelta(days=300)).isoformat(),
            "inspection_expiry": (today + timedelta(days=280)).isoformat(),
            "kasko_expiry": (today + timedelta(days=320)).isoformat(),
            "assigned_driver_id": drivers[2]["id"],
            "current_km": 32000,
            "last_oil_change_km": 30000,
            "next_oil_change_km": 40000,
            "equipment": [
                {"name": "Su Pompası", "serial_number": "PMP-2024-001", "quantity": 1},
                {"name": "Yangın Hortumu", "serial_number": "HRT-2024-002", "quantity": 6}
            ],
            "photos": [],
            "notes": "Motor arızası mevcut",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 BB 2002",
            "brand": "Ford",
            "model": "Cargo 2530",
            "year": 2018,
            "vehicle_type": "rescue",
            "station_id": stations[1]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=60)).isoformat(),
            "inspection_expiry": (today + timedelta(days=45)).isoformat(),
            "kasko_expiry": (today + timedelta(days=80)).isoformat(),
            "assigned_driver_id": drivers[3]["id"],
            "current_km": 89000,
            "last_oil_change_km": 87000,
            "next_oil_change_km": 97000,
            "equipment": [
                {"name": "Kurtarma Seti", "serial_number": "KRT-2024-001", "quantity": 1},
                {"name": "İlk Yardım Çantası", "serial_number": "ILK-2024-001", "quantity": 2}
            ],
            "photos": [],
            "notes": "Sigortası yakında dolacak",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 CC 3001",
            "brand": "Mercedes",
            "model": "Sprinter 519",
            "year": 2022,
            "vehicle_type": "service",
            "station_id": stations[2]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=350)).isoformat(),
            "inspection_expiry": (today + timedelta(days=330)).isoformat(),
            "kasko_expiry": (today + timedelta(days=365)).isoformat(),
            "assigned_driver_id": drivers[4]["id"],
            "current_km": 15000,
            "last_oil_change_km": 10000,
            "next_oil_change_km": 20000,
            "equipment": [
                {"name": "Taşınabilir Söndürücü", "serial_number": "SND-2024-001", "quantity": 4}
            ],
            "photos": [],
            "notes": "Yeni araç, mükemmel durumda",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 CC 3002",
            "brand": "Volvo",
            "model": "FL 240",
            "year": 2020,
            "vehicle_type": "snorkel",
            "station_id": stations[2]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=210)).isoformat(),
            "inspection_expiry": (today + timedelta(days=190)).isoformat(),
            "kasko_expiry": (today + timedelta(days=230)).isoformat(),
            "current_km": 54000,
            "last_oil_change_km": 52000,
            "next_oil_change_km": 62000,
            "equipment": [
                {"name": "Hidrolik Platform", "serial_number": "PLT-2024-001", "quantity": 1}
            ],
            "photos": [],
            "notes": "25 metre yükseklik kapasitesi",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 DD 4001",
            "brand": "Scania",
            "model": "P320",
            "year": 2017,
            "vehicle_type": "tanker",
            "station_id": stations[3]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=140)).isoformat(),
            "inspection_expiry": (today + timedelta(days=120)).isoformat(),
            "kasko_expiry": (today + timedelta(days=160)).isoformat(),
            "assigned_driver_id": drivers[5]["id"],
            "current_km": 112000,
            "last_oil_change_km": 110000,
            "next_oil_change_km": 120000,
            "equipment": [
                {"name": "Yangın Hortumu", "serial_number": "HRT-2024-003", "quantity": 5},
                {"name": "Su Tank", "serial_number": "TNK-2024-001", "quantity": 1}
            ],
            "photos": [],
            "notes": "Yüksek kilometreli, yakında muayene",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "plate": "06 DD 4002",
            "brand": "MAN",
            "model": "TGA 26.320",
            "year": 2021,
            "vehicle_type": "terrain",
            "station_id": stations[3]["id"],
            "status": "active",
            "insurance_expiry": (today + timedelta(days=270)).isoformat(),
            "inspection_expiry": (today + timedelta(days=250)).isoformat(),
            "kasko_expiry": (today + timedelta(days=290)).isoformat(),
            "current_km": 28000,
            "last_oil_change_km": 25000,
            "next_oil_change_km": 35000,
            "equipment": [
                {"name": "Arazi Ekipmanları", "serial_number": "ARZ-2024-001", "quantity": 1}
            ],
            "photos": [],
            "notes": "Ormanlık alanlara müdahale için",
            "created_at": today.isoformat()
        }
    ]

    await db.vehicles.insert_many(vehicles)
    print(f"  ✅ {len(vehicles)} araç oluşturuldu")

    print("\n🔧 Servisler oluşturuluyor...")

    # Create services
    services = [
        {
            "id": str(uuid.uuid4()),
            "name": "Ankara Ağır Vasıta Servisi",
            "address": "Sincan, Ankara",
            "phone": "+90 312 567 8901",
            "email": "info@ankaraagirvasita.com",
            "specialization": "Motor ve şanzıman",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Mercedes Yetkili Servisi",
            "address": "Macunköy, Ankara",
            "phone": "+90 312 678 9012",
            "email": "servis@mercedes-ankara.com",
            "specialization": "Mercedes araçlar",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hidrolik Sistem Tamiri",
            "address": "Ostim, Ankara",
            "phone": "+90 312 789 0123",
            "email": "info@hidroliksistem.com",
            "specialization": "Hidrolik sistemler",
            "created_at": today.isoformat()
        }
    ]

    await db.services.insert_many(services)
    print(f"  ✅ {len(services)} servis oluşturuldu")

    print("\n🔍 Arıza tipleri oluşturuluyor...")

    # Create fault types
    fault_types = [
        {
            "id": str(uuid.uuid4()),
            "name": "Motor Arızası",
            "description": "Motor ile ilgili arızalar",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Şanzıman Arızası",
            "description": "Vites ve şanzıman problemleri",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fren Sistemi Arızası",
            "description": "Fren sistemi ile ilgili sorunlar",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Elektrik Arızası",
            "description": "Elektrik ve elektronik arızalar",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Hidrolik Sistem Arızası",
            "description": "Hidrolik merdiven/platform arızaları",
            "created_at": today.isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Pompası Arızası",
            "description": "Su pompası problemleri",
            "created_at": today.isoformat()
        }
    ]

    await db.fault_types.insert_many(fault_types)
    print(f"  ✅ {len(fault_types)} arıza tipi oluşturuldu")

    print("\n⚠️  Arızalar oluşturuluyor...")

    # Create faults
    faults = [
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[2]["id"],  # 06 BB 2001 (faulty status)
            "reported_by": drivers[2]["id"],
            "fault_type_id": fault_types[0]["id"],
            "description": "Motor çalışırken anormal ses çıkarıyor. Güç kaybı var.",
            "status": "in_progress",
            "priority": "high",
            "service_id": services[1]["id"],
            "created_at": (today - timedelta(days=3)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[3]["id"],  # 06 BB 2002
            "reported_by": drivers[3]["id"],
            "fault_type_id": fault_types[2]["id"],
            "description": "Fren pedalında sertlik var. Kontrol edilmeli.",
            "status": "resolved",
            "priority": "high",
            "service_id": services[0]["id"],
            "resolution_notes": "Fren balataları değiştirildi, hidrolik sistem kontrol edildi.",
            "resolved_at": (today - timedelta(days=1)).isoformat(),
            "created_at": (today - timedelta(days=5)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[0]["id"],  # 06 AA 1001
            "reported_by": drivers[0]["id"],
            "fault_type_id": fault_types[3]["id"],
            "description": "Ön farlar zaman zaman yanıp sönüyor.",
            "status": "pending",
            "priority": "normal",
            "created_at": (today - timedelta(days=2)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[1]["id"],  # 06 AA 1002
            "reported_by": drivers[1]["id"],
            "fault_type_id": fault_types[4]["id"],
            "description": "Hidrolik merdiven sistemi yavaş çalışıyor.",
            "status": "pending",
            "priority": "high",
            "service_id": services[2]["id"],
            "created_at": (today - timedelta(days=1)).isoformat()
        }
    ]

    await db.faults.insert_many(faults)
    print(f"  ✅ {len(faults)} arıza kaydı oluşturuldu")

    print("\n📋 Görevlendirmeler oluşturuluyor...")

    # Create assignments
    assignments = [
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[0]["id"],
            "driver_id": drivers[0]["id"],
            "assigned_by": managers[0]["id"],
            "start_date": (today - timedelta(days=10)).isoformat(),
            "mission_type": "Yangın Söndürme",
            "location": "Ulus, Ankara",
            "notes": "Konut yangını müdahalesi",
            "created_at": (today - timedelta(days=10)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[1]["id"],
            "driver_id": drivers[1]["id"],
            "assigned_by": managers[0]["id"],
            "start_date": (today - timedelta(days=7)).isoformat(),
            "mission_type": "Kurtarma",
            "location": "Kızılay, Ankara",
            "notes": "Yüksek binada mahsur kalan kedi kurtarma",
            "created_at": (today - timedelta(days=7)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "vehicle_id": vehicles[4]["id"],
            "driver_id": drivers[4]["id"],
            "assigned_by": managers[1]["id"],
            "start_date": today.isoformat(),
            "mission_type": "Rutin Devriye",
            "location": "Keçiören, Ankara",
            "notes": "Günlük devriye görevi",
            "created_at": today.isoformat()
        }
    ]

    await db.assignments.insert_many(assignments)
    print(f"  ✅ {len(assignments)} görevlendirme oluşturuldu")

    print("\n🔔 Bildirimler oluşturuluyor...")

    # Create notifications for managers about faults
    notifications = []
    for manager in managers:
        notifications.append({
            "id": str(uuid.uuid4()),
            "user_id": manager["id"],
            "title": "Yeni Arıza Bildirimi",
            "message": f"06 BB 2001 plakalı araçta motor arızası bildirildi",
            "type": "fault",
            "read": False,
            "related_id": faults[0]["id"],
            "created_at": (today - timedelta(days=3)).isoformat()
        })
        notifications.append({
            "id": str(uuid.uuid4()),
            "user_id": manager["id"],
            "title": "Arıza Çözüldü",
            "message": f"06 BB 2002 plakalı araçtaki fren arızası giderildi",
            "type": "fault",
            "read": False,
            "related_id": faults[1]["id"],
            "created_at": (today - timedelta(days=1)).isoformat()
        })

    await db.notifications.insert_many(notifications)
    print(f"  ✅ {len(notifications)} bildirim oluşturuldu")

    client.close()

    print("\n" + "="*60)
    print("✅ SEED İŞLEMİ TAMAMLANDI!")
    print("="*60)
    print("\n📊 ÖZET:")
    print(f"  • {len(managers)} Amir")
    print(f"  • {len(drivers)} Sürücü")
    print(f"  • {len(stations)} İstasyon")
    print(f"  • {len(vehicles)} Araç")
    print(f"  • {len(services)} Servis")
    print(f"  • {len(fault_types)} Arıza Tipi")
    print(f"  • {len(faults)} Arıza Kaydı")
    print(f"  • {len(assignments)} Görevlendirme")
    print(f"  • {len(notifications)} Bildirim")

    print("\n🔑 GİRİŞ BİLGİLERİ:")
    print("\n  👤 Amirler:")
    print("     📧 amir1@itfaiye.gov.tr / Şifre: amir123")
    print("     📧 amir2@itfaiye.gov.tr / Şifre: amir123")
    print("\n  👤 Sürücüler:")
    print("     📧 ali.kaya@itfaiye.gov.tr / Şifre: surucu123")
    print("     📧 veli.ozturk@itfaiye.gov.tr / Şifre: surucu123")
    print("     📧 hasan.celik@itfaiye.gov.tr / Şifre: surucu123")
    print("     📧 (ve diğer 3 sürücü için aynı şifre)")

    print("\n🌐 UYGULAMA:")
    print("     http://localhost:3000")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(seed_database())
