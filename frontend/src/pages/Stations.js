import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Building2, Plus, MapPin, Phone, Truck } from 'lucide-react';

const Stations = ({ user, onLogout }) => {
  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStation, setNewStation] = useState({
    name: '',
    address: '',
    phone: '',
    internal_number: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [stationsRes, vehiclesRes] = await Promise.all([
        axios.get(`${API}/stations`),
        axios.get(`${API}/vehicles`)
      ]);
      setStations(stationsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    }
    setLoading(false);
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/stations`, newStation);
      toast.success('İstasyon başarıyla eklendi');
      setShowAddDialog(false);
      setNewStation({ name: '', address: '', phone: '', internal_number: '', latitude: '', longitude: '' });
      fetchData();
    } catch (error) {
      toast.error('İstasyon eklenemedi');
    }
  };

  const getStationVehicles = (stationId) => {
    return vehicles.filter(v => v.station_id === stationId);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="stations-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">İstasyonlar</h1>
            <p className="text-gray-600 mt-1">Tüm itfaiye istasyonları</p>
          </div>
          {user.role === 'manager' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-station-button">
                  <Plus className="w-4 h-4 mr-2" />
                  İstasyon Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni İstasyon Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStation} className="space-y-4">
                  <div>
                    <Label htmlFor="name">İstasyon Adı</Label>
                    <Input
                      id="name"
                      value={newStation.name}
                      onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                      required
                      data-testid="station-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={newStation.address}
                      onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                      required
                      data-testid="station-address-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={newStation.phone}
                        onChange={(e) => setNewStation({ ...newStation, phone: e.target.value })}
                        required
                        data-testid="station-phone-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="internal_number">Dahili Numara</Label>
                      <Input
                        id="internal_number"
                        value={newStation.internal_number}
                        onChange={(e) => setNewStation({ ...newStation, internal_number: e.target.value })}
                        data-testid="station-internal-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Enlem (Latitude)</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={newStation.latitude}
                        onChange={(e) => setNewStation({ ...newStation, latitude: parseFloat(e.target.value) })}
                        placeholder="örn: 39.9334"
                        data-testid="station-latitude-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Boylam (Longitude)</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={newStation.longitude}
                        onChange={(e) => setNewStation({ ...newStation, longitude: parseFloat(e.target.value) })}
                        placeholder="örn: 32.8597"
                        data-testid="station-longitude-input"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-station-button">
                    İstasyon Ekle
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map((station) => {
              const stationVehicles = getStationVehicles(station.id);
              const activeVehicles = stationVehicles.filter(v => v.status === 'active').length;
              
              return (
                <Card key={station.id} className="card-hover" data-testid={`station-card-${station.id}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Building2 className="w-5 h-5 text-red-600" />
                      </div>
                      <span>{station.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                      <p className="text-sm text-gray-700">{station.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">{station.phone}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Toplam Araç</span>
                        </div>
                        <span className="font-bold text-gray-900">{stationVehicles.length}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">Aktif Araç</span>
                        <span className="font-bold text-green-600">{activeVehicles}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && stations.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz istasyon bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Stations;