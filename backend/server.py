from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'ankara-itfaiye-secret-key-2025')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24
MANAGER_REGISTER_PASSWORD = "hbt17975"

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    DRIVER = "driver"
    MANAGER = "manager"

class VehicleStatus(str, Enum):
    ACTIVE = "active"
    FAULTY = "faulty"
    ACCIDENT = "accident"

class VehicleType(str, Enum):
    LADDER = "ladder"  # Merdiven
    TANKER = "tanker"  # Tanker
    SNORKEL = "snorkel"  # Şnorkel
    TERRAIN = "terrain"  # Arazöz
    RESCUE = "rescue"  # Kurtarma
    SERVICE = "service"  # Hizmet
    MACHINERY = "machinery"  # İş Makinası

class FaultStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"

class RequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    station_id: Optional[str] = None
    sicil_no: Optional[str] = None
    phone: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    station_id: Optional[str] = None
    sicil_no: Optional[str] = None
    phone: Optional[str] = None
    manager_password: Optional[str] = None  # For manager registration

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Station(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    phone: str
    internal_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    manager_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StationCreate(BaseModel):
    name: str
    address: str
    phone: str
    internal_number: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    manager_id: Optional[str] = None

class Equipment(BaseModel):
    name: str
    serial_number: str
    quantity: int = 1

class MaintenanceRecord(BaseModel):
    date: str
    km: int
    type: str  # oil_change, inspection, repair
    notes: Optional[str] = None
    next_maintenance_date: Optional[str] = None
    next_maintenance_km: Optional[int] = None

class AccidentRecord(BaseModel):
    date: str
    location: str
    driver_id: str
    description: str
    photos: List[str] = []

class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plate: str
    brand: str
    model: str
    year: int
    vehicle_type: VehicleType
    station_id: str
    status: VehicleStatus = VehicleStatus.ACTIVE
    insurance_expiry: Optional[str] = None
    inspection_expiry: Optional[str] = None
    kasko_expiry: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    current_km: Optional[int] = None
    last_oil_change_date: Optional[str] = None
    last_oil_change_km: Optional[int] = None
    next_oil_change_date: Optional[str] = None
    next_oil_change_km: Optional[int] = None
    equipment: List[Equipment] = []
    accident_records: List[AccidentRecord] = []
    photos: List[str] = []
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCreate(BaseModel):
    plate: str
    brand: str
    model: str
    year: int
    vehicle_type: VehicleType
    station_id: str
    status: VehicleStatus = VehicleStatus.ACTIVE
    insurance_expiry: Optional[str] = None
    inspection_expiry: Optional[str] = None
    kasko_expiry: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    current_km: Optional[int] = None
    last_oil_change_date: Optional[str] = None
    last_oil_change_km: Optional[int] = None
    next_oil_change_date: Optional[str] = None
    next_oil_change_km: Optional[int] = None
    notes: Optional[str] = None

class VehicleUpdate(BaseModel):
    plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vehicle_type: Optional[VehicleType] = None
    station_id: Optional[str] = None
    status: Optional[VehicleStatus] = None
    insurance_expiry: Optional[str] = None
    inspection_expiry: Optional[str] = None
    kasko_expiry: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    current_km: Optional[int] = None
    last_oil_change_date: Optional[str] = None
    last_oil_change_km: Optional[int] = None
    next_oil_change_date: Optional[str] = None
    next_oil_change_km: Optional[int] = None
    notes: Optional[str] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    phone: str
    email: Optional[str] = None
    specialization: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ServiceCreate(BaseModel):
    name: str
    address: str
    phone: str
    email: Optional[str] = None
    specialization: Optional[str] = None

class FaultType(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FaultTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None

class Fault(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    reported_by: str
    fault_type_id: Optional[str] = None
    description: str
    status: FaultStatus = FaultStatus.PENDING
    priority: str = "normal"
    service_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FaultCreate(BaseModel):
    vehicle_id: str
    fault_type_id: Optional[str] = None
    description: str
    priority: str = "normal"
    service_id: Optional[str] = None

class FaultUpdate(BaseModel):
    status: Optional[FaultStatus] = None
    resolution_notes: Optional[str] = None
    priority: Optional[str] = None
    service_id: Optional[str] = None

class Request(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requested_by: str
    target_manager_id: str
    title: str
    description: str
    status: RequestStatus = RequestStatus.PENDING
    response: Optional[str] = None
    responded_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class RequestCreate(BaseModel):
    target_manager_id: str
    title: str
    description: str

class RequestUpdate(BaseModel):
    status: RequestStatus
    response: Optional[str] = None

class Assignment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    driver_id: str
    assigned_by: str
    start_date: str
    end_date: Optional[str] = None
    mission_type: str
    location: str
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AssignmentCreate(BaseModel):
    vehicle_id: str
    driver_id: str
    start_date: str
    end_date: Optional[str] = None
    mission_type: str
    location: str
    notes: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str
    read: bool = False
    related_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DashboardStats(BaseModel):
    total_vehicles: int
    active_vehicles: int
    faulty_vehicles: int
    accident_vehicles: int
    pending_faults: int
    expiring_soon: int
    oil_change_due_soon: int
    total_stations: int
    total_drivers: int

class FaultReportConfig(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    include_driver_info: bool = True
    include_vehicle_info: bool = True
    include_station_info: bool = True
    include_service_info: bool = True
    include_resolution: bool = True
    date_format: str = "dd/mm/yyyy"
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FaultReportConfigUpdate(BaseModel):
    include_driver_info: Optional[bool] = None
    include_vehicle_info: Optional[bool] = None
    include_station_info: Optional[bool] = None
    include_service_info: Optional[bool] = None
    include_resolution: Optional[bool] = None
    date_format: Optional[str] = None

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Geçersiz token")

async def require_manager(user: dict = Depends(get_current_user)):
    if user['role'] != 'manager':
        raise HTTPException(status_code=403, detail="Bu işlem için amir yetkisi gereklidir")
    return user

# Routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check manager password if registering as manager
    if user_data.role == UserRole.MANAGER:
        if not user_data.manager_password or user_data.manager_password != MANAGER_REGISTER_PASSWORD:
            raise HTTPException(status_code=403, detail="Amir kaydı için geçerli şifre gereklidir")
    
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_dict = user_data.model_dump(exclude={'password', 'manager_password'})
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    doc['password'] = hashed_password
    
    await db.users.insert_one(doc)
    
    # Create token
    token = create_token(user_obj.id, user_obj.role)
    
    return {
        "token": token,
        "user": user_obj.model_dump()
    }

@api_router.post("/auth/login")
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    
    token = create_token(user['id'], user['role'])
    user_data = {k: v for k, v in user.items() if k != 'password'}
    
    return {
        "token": token,
        "user": user_data
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != 'password'}

# Stations
@api_router.post("/stations", response_model=Station)
async def create_station(station: StationCreate, user: dict = Depends(require_manager)):
    station_obj = Station(**station.model_dump())
    doc = station_obj.model_dump()
    await db.stations.insert_one(doc)
    return station_obj

@api_router.get("/stations", response_model=List[Station])
async def get_stations(user: dict = Depends(get_current_user)):
    stations = await db.stations.find({}, {"_id": 0}).to_list(1000)
    return stations

@api_router.get("/stations/{station_id}", response_model=Station)
async def get_station(station_id: str, user: dict = Depends(get_current_user)):
    station = await db.stations.find_one({"id": station_id}, {"_id": 0})
    if not station:
        raise HTTPException(status_code=404, detail="İstasyon bulunamadı")
    return station

# Vehicles
@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate, user: dict = Depends(require_manager)):
    vehicle_obj = Vehicle(**vehicle.model_dump())
    doc = vehicle_obj.model_dump()
    await db.vehicles.insert_one(doc)
    return vehicle_obj

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(
    station_id: Optional[str] = None,
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if station_id:
        query['station_id'] = station_id
    if status:
        query['status'] = status
    if vehicle_type:
        query['vehicle_type'] = vehicle_type
    
    # If driver, only show vehicles from their station
    if user['role'] == 'driver' and user.get('station_id'):
        query['station_id'] = user['station_id']
    
    vehicles = await db.vehicles.find(query, {"_id": 0}).to_list(1000)
    return vehicles

@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str, user: dict = Depends(get_current_user)):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    return vehicle

@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(
    vehicle_id: str,
    vehicle_update: VehicleUpdate,
    user: dict = Depends(require_manager)
):
    update_data = {k: v for k, v in vehicle_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri bulunamadı")
    
    result = await db.vehicles.update_one({"id": vehicle_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return vehicle

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, user: dict = Depends(require_manager)):
    result = await db.vehicles.delete_one({"id": vehicle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    return {"message": "Araç silindi"}

@api_router.post("/vehicles/{vehicle_id}/equipment")
async def add_vehicle_equipment(
    vehicle_id: str,
    equipment: Equipment,
    user: dict = Depends(require_manager)
):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    equipment_list = vehicle.get('equipment', [])
    equipment_list.append(equipment.model_dump())
    
    await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": {"equipment": equipment_list}}
    )
    return {"message": "Ekipman eklendi"}

@api_router.post("/vehicles/{vehicle_id}/accident")
async def add_accident_record(
    vehicle_id: str,
    accident: AccidentRecord,
    user: dict = Depends(require_manager)
):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Araç bulunamadı")
    
    accident_records = vehicle.get('accident_records', [])
    accident_records.append(accident.model_dump())
    
    await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": {
            "accident_records": accident_records,
            "status": "accident"
        }}
    )
    return {"message": "Kaza kaydı eklendi"}

# Services
@api_router.post("/services", response_model=Service)
async def create_service(service: ServiceCreate, user: dict = Depends(require_manager)):
    service_obj = Service(**service.model_dump())
    doc = service_obj.model_dump()
    await db.services.insert_one(doc)
    return service_obj

@api_router.get("/services", response_model=List[Service])
async def get_services(user: dict = Depends(get_current_user)):
    services = await db.services.find({}, {"_id": 0}).to_list(1000)
    return services

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, user: dict = Depends(require_manager)):
    result = await db.services.delete_one({"id": service_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Servis bulunamadı")
    return {"message": "Servis silindi"}

# Fault Types
@api_router.post("/fault-types", response_model=FaultType)
async def create_fault_type(fault_type: FaultTypeCreate, user: dict = Depends(require_manager)):
    fault_type_obj = FaultType(**fault_type.model_dump())
    doc = fault_type_obj.model_dump()
    await db.fault_types.insert_one(doc)
    return fault_type_obj

@api_router.get("/fault-types", response_model=List[FaultType])
async def get_fault_types(user: dict = Depends(get_current_user)):
    fault_types = await db.fault_types.find({}, {"_id": 0}).to_list(1000)
    return fault_types

@api_router.delete("/fault-types/{fault_type_id}")
async def delete_fault_type(fault_type_id: str, user: dict = Depends(require_manager)):
    result = await db.fault_types.delete_one({"id": fault_type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Arıza tipi bulunamadı")
    return {"message": "Arıza tipi silindi"}

# Faults
@api_router.post("/faults", response_model=Fault)
async def create_fault(fault: FaultCreate, user: dict = Depends(get_current_user)):
    fault_data = fault.model_dump()
    fault_data['reported_by'] = user['id']
    fault_obj = Fault(**fault_data)
    doc = fault_obj.model_dump()
    await db.faults.insert_one(doc)
    
    # Update vehicle status
    await db.vehicles.update_one(
        {"id": fault.vehicle_id},
        {"$set": {"status": "faulty"}}
    )
    
    # Create notification for managers
    managers = await db.users.find({"role": "manager"}, {"_id": 0}).to_list(1000)
    vehicle = await db.vehicles.find_one({"id": fault.vehicle_id}, {"_id": 0})
    
    for manager in managers:
        notif = Notification(
            user_id=manager['id'],
            title="Yeni Arıza Bildirimi",
            message=f"{vehicle.get('plate', 'Bilinmeyen')} plakalı araçta {user['name']} tarafından arıza bildirildi",
            type="fault",
            related_id=fault_obj.id
        )
        await db.notifications.insert_one(notif.model_dump())
    
    return fault_obj

@api_router.get("/faults", response_model=List[Fault])
async def get_faults(
    vehicle_id: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if vehicle_id:
        query['vehicle_id'] = vehicle_id
    if status:
        query['status'] = status
    
    # Date filtering
    if start_date or end_date:
        query['created_at'] = {}
        if start_date:
            query['created_at']['$gte'] = start_date
        if end_date:
            query['created_at']['$lte'] = end_date
    
    faults = await db.faults.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return faults

@api_router.put("/faults/{fault_id}", response_model=Fault)
async def update_fault(
    fault_id: str,
    fault_update: FaultUpdate,
    user: dict = Depends(require_manager)
):
    update_data = {k: v for k, v in fault_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri bulunamadı")
    
    if fault_update.status == FaultStatus.RESOLVED:
        update_data['resolved_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.faults.update_one({"id": fault_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Arıza kaydı bulunamadı")
    
    fault = await db.faults.find_one({"id": fault_id}, {"_id": 0})
    
    # If resolved, update vehicle status back to active
    if fault_update.status == FaultStatus.RESOLVED:
        await db.vehicles.update_one(
            {"id": fault['vehicle_id']},
            {"$set": {"status": "active"}}
        )
    
    return fault

@api_router.get("/faults/statistics/top-faults")
async def get_top_faults(user: dict = Depends(require_manager)):
    """Get most common fault types"""
    faults = await db.faults.find({"fault_type_id": {"$ne": None}}, {"_id": 0}).to_list(10000)
    
    fault_counts = {}
    for fault in faults:
        fault_type_id = fault.get('fault_type_id')
        if fault_type_id:
            fault_counts[fault_type_id] = fault_counts.get(fault_type_id, 0) + 1
    
    # Get fault type details
    top_faults = []
    for fault_type_id, count in sorted(fault_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        fault_type = await db.fault_types.find_one({"id": fault_type_id}, {"_id": 0})
        if fault_type:
            top_faults.append({
                "fault_type": fault_type['name'],
                "count": count
            })
    
    return top_faults

@api_router.get("/faults/statistics/top-groups")
async def get_top_fault_groups(user: dict = Depends(require_manager)):
    """Get vehicle types with most faults"""
    faults = await db.faults.find({}, {"_id": 0}).to_list(10000)
    
    vehicle_type_counts = {}
    for fault in faults:
        vehicle = await db.vehicles.find_one({"id": fault['vehicle_id']}, {"_id": 0})
        if vehicle:
            vehicle_type = vehicle.get('vehicle_type', 'unknown')
            vehicle_type_counts[vehicle_type] = vehicle_type_counts.get(vehicle_type, 0) + 1
    
    type_names = {
        'ladder': 'Merdiven',
        'tanker': 'Tanker',
        'snorkel': 'Şnorkel',
        'terrain': 'Arazöz',
        'rescue': 'Kurtarma',
        'service': 'Hizmet',
        'machinery': 'İş Makinası'
    }
    
    top_groups = []
    for vehicle_type, count in sorted(vehicle_type_counts.items(), key=lambda x: x[1], reverse=True):
        top_groups.append({
            "vehicle_type": type_names.get(vehicle_type, vehicle_type),
            "count": count
        })
    
    return top_groups

@api_router.get("/faults/statistics/top-stations")
async def get_top_fault_stations(user: dict = Depends(require_manager)):
    """Get stations with most faults"""
    faults = await db.faults.find({}, {"_id": 0}).to_list(10000)
    
    station_counts = {}
    for fault in faults:
        vehicle = await db.vehicles.find_one({"id": fault['vehicle_id']}, {"_id": 0})
        if vehicle:
            station_id = vehicle.get('station_id')
            if station_id:
                station_counts[station_id] = station_counts.get(station_id, 0) + 1
    
    # Get station details
    top_stations = []
    for station_id, count in sorted(station_counts.items(), key=lambda x: x[1], reverse=True):
        station = await db.stations.find_one({"id": station_id}, {"_id": 0})
        if station:
            top_stations.append({
                "station_name": station['name'],
                "count": count
            })
    
    return top_stations

# Fault Report Config
@api_router.get("/fault-report-config")
async def get_fault_report_config(user: dict = Depends(require_manager)):
    config = await db.fault_report_config.find_one({}, {"_id": 0})
    if not config:
        # Create default config
        default_config = FaultReportConfig()
        await db.fault_report_config.insert_one(default_config.model_dump())
        return default_config
    return config

@api_router.put("/fault-report-config")
async def update_fault_report_config(
    config_update: FaultReportConfigUpdate,
    user: dict = Depends(require_manager)
):
    update_data = {k: v for k, v in config_update.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    config = await db.fault_report_config.find_one({}, {"_id": 0})
    if not config:
        default_config = FaultReportConfig(**update_data)
        await db.fault_report_config.insert_one(default_config.model_dump())
        return default_config
    
    await db.fault_report_config.update_one({}, {"$set": update_data})
    updated_config = await db.fault_report_config.find_one({}, {"_id": 0})
    return updated_config

# Requests
@api_router.post("/requests", response_model=Request)
async def create_request(request: RequestCreate, user: dict = Depends(get_current_user)):
    request_data = request.model_dump()
    request_data['requested_by'] = user['id']
    request_obj = Request(**request_data)
    doc = request_obj.model_dump()
    await db.requests.insert_one(doc)
    
    # Create notification for target manager
    notif = Notification(
        user_id=request.target_manager_id,
        title="Yeni Talep",
        message=f"{user['name']} tarafından yeni bir talep gönderildi: {request.title}",
        type="request",
        related_id=request_obj.id
    )
    await db.notifications.insert_one(notif.model_dump())
    
    return request_obj

@api_router.get("/requests", response_model=List[Request])
async def get_requests(user: dict = Depends(get_current_user)):
    if user['role'] == 'manager':
        requests = await db.requests.find(
            {"target_manager_id": user['id']},
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
    else:
        requests = await db.requests.find(
            {"requested_by": user['id']},
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
    return requests

@api_router.put("/requests/{request_id}", response_model=Request)
async def update_request(
    request_id: str,
    request_update: RequestUpdate,
    user: dict = Depends(require_manager)
):
    update_data = request_update.model_dump()
    update_data['responded_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.requests.update_one({"id": request_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Talep bulunamadı")
    
    request_obj = await db.requests.find_one({"id": request_id}, {"_id": 0})
    
    # Notify requester
    notif = Notification(
        user_id=request_obj['requested_by'],
        title="Talebiniz Yanıtlandı",
        message=f"Talebiniz {request_update.status.value} durumuna güncellendi",
        type="request",
        related_id=request_id
    )
    await db.notifications.insert_one(notif.model_dump())
    
    return request_obj

# Assignments
@api_router.post("/assignments", response_model=Assignment)
async def create_assignment(assignment: AssignmentCreate, user: dict = Depends(require_manager)):
    assignment_data = assignment.model_dump()
    assignment_data['assigned_by'] = user['id']
    assignment_obj = Assignment(**assignment_data)
    doc = assignment_obj.model_dump()
    await db.assignments.insert_one(doc)
    
    # Create notification for driver
    driver = await db.users.find_one({"id": assignment.driver_id}, {"_id": 0})
    if driver:
        notif = Notification(
            user_id=driver['id'],
            title="Yeni Görevlendirme",
            message=f"{assignment.mission_type} görevine atandınız",
            type="assignment",
            related_id=assignment_obj.id
        )
        await db.notifications.insert_one(notif.model_dump())
    
    return assignment_obj

@api_router.get("/assignments", response_model=List[Assignment])
async def get_assignments(
    vehicle_id: Optional[str] = None,
    driver_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if vehicle_id:
        query['vehicle_id'] = vehicle_id
    if driver_id:
        query['driver_id'] = driver_id
    
    # If driver, only show their assignments
    if user['role'] == 'driver':
        query['driver_id'] = user['id']
    
    assignments = await db.assignments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return assignments

# Notifications
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": user['id']},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": user['id']},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Bildirim bulunamadı")
    return {"message": "Bildirim okundu olarak işaretlendi"}

# Dashboard
@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    query = {}
    if user['role'] == 'driver' and user.get('station_id'):
        query['station_id'] = user['station_id']
    
    total_vehicles = await db.vehicles.count_documents(query)
    active_vehicles = await db.vehicles.count_documents({**query, "status": "active"})
    faulty_vehicles = await db.vehicles.count_documents({**query, "status": "faulty"})
    accident_vehicles = await db.vehicles.count_documents({**query, "status": "accident"})
    pending_faults = await db.faults.count_documents({"status": "pending"})
    
    # Count vehicles with expiring documents (within 30 days)
    thirty_days = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    expiring = await db.vehicles.find(query, {"_id": 0}).to_list(1000)
    expiring_soon = sum(1 for v in expiring if (
        (v.get('insurance_expiry') and v['insurance_expiry'] <= thirty_days) or
        (v.get('inspection_expiry') and v['inspection_expiry'] <= thirty_days) or
        (v.get('kasko_expiry') and v['kasko_expiry'] <= thirty_days)
    ))
    
    # Count vehicles with oil change due soon
    oil_change_due_soon = sum(1 for v in expiring if (
        v.get('next_oil_change_date') and v['next_oil_change_date'] <= thirty_days
    ))
    
    total_stations = await db.stations.count_documents({})
    total_drivers = await db.users.count_documents({"role": "driver"})
    
    return DashboardStats(
        total_vehicles=total_vehicles,
        active_vehicles=active_vehicles,
        faulty_vehicles=faulty_vehicles,
        accident_vehicles=accident_vehicles,
        pending_faults=pending_faults,
        expiring_soon=expiring_soon,
        oil_change_due_soon=oil_change_due_soon,
        total_stations=total_stations,
        total_drivers=total_drivers
    )

# Get managers (for drivers to send requests)
@api_router.get("/managers", response_model=List[User])
async def get_managers(user: dict = Depends(get_current_user)):
    managers = await db.users.find({"role": "manager"}, {"_id": 0, "password": 0}).to_list(1000)
    return managers

# Users management (for managers)
@api_router.get("/users", response_model=List[User])
async def get_users(user: dict = Depends(require_manager)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, user: dict = Depends(require_manager)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {"message": "Kullanıcı silindi"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
