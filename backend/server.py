from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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

class FaultStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: UserRole
    station_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: UserRole
    station_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Station(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    phone: str
    manager_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class StationCreate(BaseModel):
    name: str
    address: str
    phone: str
    manager_id: Optional[str] = None

class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plate: str
    brand: str
    model: str
    year: int
    station_id: str
    status: VehicleStatus = VehicleStatus.ACTIVE
    insurance_expiry: Optional[str] = None
    inspection_expiry: Optional[str] = None
    kasko_expiry: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCreate(BaseModel):
    plate: str
    brand: str
    model: str
    year: int
    station_id: str
    status: VehicleStatus = VehicleStatus.ACTIVE
    insurance_expiry: Optional[str] = None
    inspection_expiry: Optional[str] = None
    kasko_expiry: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    notes: Optional[str] = None

class VehicleUpdate(BaseModel):
    plate: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    station_id: Optional[str] = None
    status: Optional[VehicleStatus] = None
    insurance_expiry: Optional[str] = None
    inspection_expiry: Optional[str] = None
    kasko_expiry: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    notes: Optional[str] = None

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    address: str
    phone: str
    email: Optional[str] = None
    specialization: Optional[str] = None  # Motor, Elektrik, Kaporta, Genel
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ServiceCreate(BaseModel):
    name: str
    address: str
    phone: str
    email: Optional[str] = None
    specialization: Optional[str] = None

class Fault(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    reported_by: str
    description: str
    status: FaultStatus = FaultStatus.PENDING
    priority: str = "normal"  # low, normal, high, urgent
    service_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class FaultCreate(BaseModel):
    vehicle_id: str
    description: str
    priority: str = "normal"
    service_id: Optional[str] = None

class FaultUpdate(BaseModel):
    status: Optional[FaultStatus] = None
    resolution_notes: Optional[str] = None
    priority: Optional[str] = None
    service_id: Optional[str] = None

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
    type: str  # fault, expiry, assignment
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
    total_stations: int
    total_drivers: int

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
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_dict = user_data.model_dump(exclude={'password'})
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
    user: dict = Depends(get_current_user)
):
    query = {}
    if station_id:
        query['station_id'] = station_id
    if status:
        query['status'] = status
    
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
            message=f"{vehicle.get('plate', 'Bilinmeyen')} plakalı araçta arıza bildirildi",
            type="fault",
            related_id=fault_obj.id
        )
        await db.notifications.insert_one(notif.model_dump())
    
    return fault_obj

@api_router.get("/faults", response_model=List[Fault])
async def get_faults(
    vehicle_id: Optional[str] = None,
    status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if vehicle_id:
        query['vehicle_id'] = vehicle_id
    if status:
        query['status'] = status
    
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
    
    total_stations = await db.stations.count_documents({})
    total_drivers = await db.users.count_documents({"role": "driver"})
    
    return DashboardStats(
        total_vehicles=total_vehicles,
        active_vehicles=active_vehicles,
        faulty_vehicles=faulty_vehicles,
        accident_vehicles=accident_vehicles,
        pending_faults=pending_faults,
        expiring_soon=expiring_soon,
        total_stations=total_stations,
        total_drivers=total_drivers
    )

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