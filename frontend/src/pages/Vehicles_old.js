import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Truck, Plus, Search, Filter, AlertCircle } from 'lucide-react';

const Vehicles = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStation, setFilterStation] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    station_id: '',
    status: 'active',
    insurance_expiry: '',
    inspection_expiry: '',
    kasko_expiry: ''
  });

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterStation]);

  const fetchData = async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterStation !== 'all') params.station_id = filterStation;

      const [vehiclesRes, stationsRes] = await Promise.all([
        axios.get(`${API}/vehicles`, { params }),
        axios.get(`${API}/stations`)
      ]);
      setVehicles(vehiclesRes.data);
      setStations(stationsRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    }
    setLoading(false);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/vehicles`, newVehicle);
      toast.success('Araç başarıyla eklendi');
      setShowAddDialog(false);
      setNewVehicle({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        station_id: '',
        status: 'active',
        insurance_expiry: '',
        inspection_expiry: '',
        kasko_expiry: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Araç eklenemedi');
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: 'Faal',
      faulty: 'Arızalı',
      accident: 'Kazalı'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      active: 'status-active',
      faulty: 'status-faulty',
      accident: 'status-accident'
    };
    return classMap[status] || '';
  };

  const checkExpiring = (date) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expiryDate <= thirtyDays;
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="vehicles-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Araçlar</h1>
            <p className="text-gray-600 mt-1">Tüm araçları yönetin ve takip edin</p>
          </div>
          {user.role === 'manager' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-vehicle-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Araç Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni Araç Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddVehicle} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plate">Plaka</Label>
                      <Input
                        id="plate"
                        value={newVehicle.plate}
                        onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                        required
                        data-testid="vehicle-plate-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Marka</Label>
                      <Input
                        id="brand"
                        value={newVehicle.brand}
                        onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                        required
                        data-testid="vehicle-brand-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                        required
                        data-testid="vehicle-model-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Yıl</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                        required
                        data-testid="vehicle-year-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="station">İstasyon</Label>
                      <select
                        id="station"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newVehicle.station_id}
                        onChange={(e) => setNewVehicle({ ...newVehicle, station_id: e.target.value })}
                        required
                        data-testid="vehicle-station-select"
                      >
                        <option value="">İstasyon Seçin</option>
                        {stations.map(station => (
                          <option key={station.id} value={station.id}>{station.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="status">Durum</Label>
                      <select
                        id="status"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={newVehicle.status}
                        onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                        data-testid="vehicle-status-select"
                      >
                        <option value="active">Faal</option>
                        <option value="faulty">Arızalı</option>
                        <option value="accident">Kazalı</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="insurance">Sigorta Bitiş</Label>
                      <Input
                        id="insurance"
                        type="date"
                        value={newVehicle.insurance_expiry}
                        onChange={(e) => setNewVehicle({ ...newVehicle, insurance_expiry: e.target.value })}
                        data-testid="vehicle-insurance-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inspection">Muayene Bitiş</Label>
                      <Input
                        id="inspection"
                        type="date"
                        value={newVehicle.inspection_expiry}
                        onChange={(e) => setNewVehicle({ ...newVehicle, inspection_expiry: e.target.value })}
                        data-testid="vehicle-inspection-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="kasko">Kasko Bitiş</Label>
                      <Input
                        id="kasko"
                        type="date"
                        value={newVehicle.kasko_expiry}
                        onChange={(e) => setNewVehicle({ ...newVehicle, kasko_expiry: e.target.value })}
                        data-testid="vehicle-kasko-input"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-vehicle-button">
                    Araç Ekle
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Araç ara (plaka, marka, model)..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="search-vehicles-input"
                />
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  data-testid="filter-status-select"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Faal</option>
                  <option value="faulty">Arızalı</option>
                  <option value="accident">Kazalı</option>
                </select>
              </div>
              <div>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filterStation}
                  onChange={(e) => setFilterStation(e.target.value)}
                  data-testid="filter-station-select"
                >
                  <option value="all">Tüm İstasyonlar</option>
                  {stations.map(station => (
                    <option key={station.id} value={station.id}>{station.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => {
              const station = stations.find(s => s.id === vehicle.station_id);
              const hasExpiring = checkExpiring(vehicle.insurance_expiry) || 
                                 checkExpiring(vehicle.inspection_expiry) || 
                                 checkExpiring(vehicle.kasko_expiry);
              
              return (
                <Card
                  key={vehicle.id}
                  className="card-hover cursor-pointer"
                  onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  data-testid={`vehicle-card-${vehicle.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-3 rounded-lg">
                          <Truck className="w-6 h-6 text-gray-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{vehicle.plate}</h3>
                          <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                        </div>
                      </div>
                      {hasExpiring && (
                        <AlertCircle className="w-5 h-5 text-orange-500" data-testid="expiring-warning" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Durum</span>
                        <span className={`status-badge ${getStatusClass(vehicle.status)}`}>
                          {getStatusText(vehicle.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">İstasyon</span>
                        <span className="text-sm font-medium text-gray-900">{station?.name || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Yıl</span>
                        <span className="text-sm font-medium text-gray-900">{vehicle.year}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && filteredVehicles.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Araç bulunamadı</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Vehicles;