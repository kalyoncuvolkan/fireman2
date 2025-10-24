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
import { Droplet, Wrench, AlertTriangle } from 'lucide-react';

const Maintenance = ({ user, onLogout }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState({
    last_oil_change_date: '',
    last_oil_change_km: '',
    next_oil_change_date: '',
    next_oil_change_km: '',
    current_km: ''
  });
  const [inspectionData, setInspectionData] = useState({
    inspection_expiry: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      toast.error('Araçlar yüklenemedi');
    }
    setLoading(false);
  };

  const handleOilChangeUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/vehicles/${selectedVehicle.id}`, maintenanceData);
      toast.success('Yağ bakımı kaydı güncellendi');
      setSelectedVehicle(null);
      setMaintenanceData({
        last_oil_change_date: '',
        last_oil_change_km: '',
        next_oil_change_date: '',
        next_oil_change_km: '',
        current_km: ''
      });
      fetchVehicles();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleInspectionUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/vehicles/${selectedVehicle.id}`, inspectionData);
      toast.success('Muayene tarihi güncellendi');
      setSelectedVehicle(null);
      setInspectionData({ inspection_expiry: '' });
      fetchVehicles();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const checkOilChangeDue = (vehicle) => {
    if (!vehicle.next_oil_change_date) return false;
    const dueDate = new Date(vehicle.next_oil_change_date);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return dueDate <= thirtyDays;
  };

  const checkInspectionDue = (vehicle) => {
    if (!vehicle.inspection_expiry) return false;
    const expiryDate = new Date(vehicle.inspection_expiry);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expiryDate <= thirtyDays;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const oilChangeDueVehicles = vehicles.filter(v => checkOilChangeDue(v));
  const inspectionDueVehicles = vehicles.filter(v => checkInspectionDue(v));

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="maintenance-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bakım Yönetimi</h1>
          <p className="text-gray-600 mt-1">Yağ bakımı ve muayene takibi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-2 border-orange-300">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <Droplet className="w-5 h-5 mr-2" />
                Yağ Bakımı Yaklaşan ({oilChangeDueVehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {oilChangeDueVehicles.length > 0 ? (
                <div className="space-y-3">
                  {oilChangeDueVehicles.map(vehicle => (
                    <div key={vehicle.id} className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{vehicle.plate}</h3>
                          <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        <Droplet className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Sonraki Bakım:</span> {formatDate(vehicle.next_oil_change_date)}
                        </p>
                        {vehicle.next_oil_change_km && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Bakım KM:</span> {vehicle.next_oil_change_km.toLocaleString()} KM
                          </p>
                        )}
                        {vehicle.current_km && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Mevcut KM:</span> {vehicle.current_km.toLocaleString()} KM
                          </p>
                        )}
                      </div>
                      {user.role === 'manager' && (
                        <Button
                          size="sm"
                          className="w-full bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setMaintenanceData({
                              last_oil_change_date: new Date().toISOString().split('T')[0],
                              last_oil_change_km: vehicle.current_km || 0,
                              next_oil_change_date: '',
                              next_oil_change_km: '',
                              current_km: vehicle.current_km || 0
                            });
                          }}
                          data-testid={`update-oil-${vehicle.id}`}
                        >
                          Yağ Bakımı Yapıldı
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Yağ bakımı yaklaşan araç yok</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-300">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <Wrench className="w-5 h-5 mr-2" />
                Muayene Yaklaşan ({inspectionDueVehicles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspectionDueVehicles.length > 0 ? (
                <div className="space-y-3">
                  {inspectionDueVehicles.map(vehicle => (
                    <div key={vehicle.id} className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{vehicle.plate}</h3>
                          <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                        </div>
                        <Wrench className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-1 mb-3">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Muayene Bitiş:</span> {formatDate(vehicle.inspection_expiry)}
                        </p>
                      </div>
                      {user.role === 'manager' && (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setInspectionData({
                              inspection_expiry: vehicle.inspection_expiry || ''
                            });
                          }}
                          data-testid={`update-inspection-${vehicle.id}`}
                        >
                          Muayene Güncelle
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Muayene yaklaşan araç yok</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Vehicles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tüm Araçlar - Bakım Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Plaka</th>
                    <th className="text-left p-3">Araç</th>
                    <th className="text-left p-3">Son Yağ Bakımı</th>
                    <th className="text-left p-3">Sonraki Yağ Bakımı</th>
                    <th className="text-left p-3">Muayene Bitiş</th>
                    <th className="text-left p-3">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle => {
                    const oilDue = checkOilChangeDue(vehicle);
                    const inspectionDue = checkInspectionDue(vehicle);
                    
                    return (
                      <tr key={vehicle.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold">{vehicle.plate}</td>
                        <td className="p-3">{vehicle.brand} {vehicle.model}</td>
                        <td className="p-3">
                          {vehicle.last_oil_change_date ? (
                            <div>
                              <div className="text-sm">{formatDate(vehicle.last_oil_change_date)}</div>
                              {vehicle.last_oil_change_km && (
                                <div className="text-xs text-gray-600">{vehicle.last_oil_change_km.toLocaleString()} KM</div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          {vehicle.next_oil_change_date ? (
                            <div>
                              <div className={`text-sm ${oilDue ? 'text-orange-600 font-bold' : ''}`}>
                                {formatDate(vehicle.next_oil_change_date)}
                              </div>
                              {vehicle.next_oil_change_km && (
                                <div className="text-xs text-gray-600">{vehicle.next_oil_change_km.toLocaleString()} KM</div>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-3">
                          <span className={`text-sm ${inspectionDue ? 'text-blue-600 font-bold' : ''}`}>
                            {formatDate(vehicle.inspection_expiry)}
                          </span>
                        </td>
                        <td className="p-3">
                          {(oilDue || inspectionDue) && (
                            <div className="flex items-center space-x-2">
                              {oilDue && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                                  Yağ
                                </span>
                              )}
                              {inspectionDue && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  Muayene
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Oil Change Update Dialog */}
      {selectedVehicle && maintenanceData.last_oil_change_date && (
        <Dialog open={!!selectedVehicle && !!maintenanceData.last_oil_change_date} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yağ Bakımı Güncelle - {selectedVehicle.plate}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleOilChangeUpdate} className="space-y-4">
              <div>
                <Label htmlFor="current_km">Mevcut KM</Label>
                <Input
                  id="current_km"
                  type="number"
                  value={maintenanceData.current_km}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, current_km: e.target.value })}
                  required
                  data-testid="current-km-input"
                />
              </div>
              <div>
                <Label htmlFor="last_oil_date">Son Yağ Bakımı Tarihi</Label>
                <Input
                  id="last_oil_date"
                  type="date"
                  value={maintenanceData.last_oil_change_date}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, last_oil_change_date: e.target.value })}
                  required
                  data-testid="last-oil-date-input"
                />
              </div>
              <div>
                <Label htmlFor="last_oil_km">Son Yağ Bakımı KM</Label>
                <Input
                  id="last_oil_km"
                  type="number"
                  value={maintenanceData.last_oil_change_km}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, last_oil_change_km: e.target.value })}
                  required
                  data-testid="last-oil-km-input"
                />
              </div>
              <div>
                <Label htmlFor="next_oil_date">Sonraki Yağ Bakımı Tarihi</Label>
                <Input
                  id="next_oil_date"
                  type="date"
                  value={maintenanceData.next_oil_change_date}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, next_oil_change_date: e.target.value })}
                  required
                  data-testid="next-oil-date-input"
                />
              </div>
              <div>
                <Label htmlFor="next_oil_km">Sonraki Yağ Bakımı KM</Label>
                <Input
                  id="next_oil_km"
                  type="number"
                  value={maintenanceData.next_oil_change_km}
                  onChange={(e) => setMaintenanceData({ ...maintenanceData, next_oil_change_km: e.target.value })}
                  required
                  data-testid="next-oil-km-input"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-orange-700" data-testid="submit-oil-update">
                Güncelle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Inspection Update Dialog */}
      {selectedVehicle && inspectionData.inspection_expiry !== undefined && !maintenanceData.last_oil_change_date && (
        <Dialog open={!!selectedVehicle && inspectionData.inspection_expiry !== undefined} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Muayene Güncelle - {selectedVehicle.plate}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInspectionUpdate} className="space-y-4">
              <div>
                <Label htmlFor="inspection_expiry">Yeni Muayene Bitiş Tarihi</Label>
                <Input
                  id="inspection_expiry"
                  type="date"
                  value={inspectionData.inspection_expiry}
                  onChange={(e) => setInspectionData({ inspection_expiry: e.target.value })}
                  required
                  data-testid="inspection-expiry-input"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ Muayene tarihini güncelledikten sonra araç muayene listesinden kalkacaktır.
                </p>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700" data-testid="submit-inspection-update">
                Güncelle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Maintenance;
