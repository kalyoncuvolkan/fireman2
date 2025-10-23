import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MapPin, Plus, Calendar, User } from 'lucide-react';

const Assignments = ({ user, onLogout }) => {
  const [assignments, setAssignments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    vehicle_id: '',
    driver_id: '',
    start_date: '',
    end_date: '',
    mission_type: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requests = [
        axios.get(`${API}/assignments`),
        axios.get(`${API}/vehicles`)
      ];
      
      if (user.role === 'manager') {
        requests.push(axios.get(`${API}/users`));
      }

      const responses = await Promise.all(requests);
      setAssignments(responses[0].data);
      setVehicles(responses[1].data);
      if (responses[2]) {
        setUsers(responses[2].data.filter(u => u.role === 'driver'));
      }
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    }
    setLoading(false);
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/assignments`, newAssignment);
      toast.success('Görevlendirme başarıyla oluşturuldu');
      setShowAddDialog(false);
      setNewAssignment({
        vehicle_id: '',
        driver_id: '',
        start_date: '',
        end_date: '',
        mission_type: '',
        location: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Görevlendirme oluşturulamadı');
    }
  };

  const getVehicle = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getDriver = (driverId) => {
    return users.find(u => u.id === driverId);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="assignments-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Görevlendirmeler</h1>
            <p className="text-gray-600 mt-1">Araç ve şoför görevlendirmeleri</p>
          </div>
          {user.role === 'manager' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-assignment-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Görevlendirme Oluştur
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Yeni Görevlendirme</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddAssignment} className="space-y-4">
                  <div>
                    <Label htmlFor="vehicle">Araç</Label>
                    <select
                      id="vehicle"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newAssignment.vehicle_id}
                      onChange={(e) => setNewAssignment({ ...newAssignment, vehicle_id: e.target.value })}
                      required
                      data-testid="assignment-vehicle-select"
                    >
                      <option value="">Araç Seçin</option>
                      {vehicles.filter(v => v.status === 'active').map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.brand} {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="driver">Şoför</Label>
                    <select
                      id="driver"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newAssignment.driver_id}
                      onChange={(e) => setNewAssignment({ ...newAssignment, driver_id: e.target.value })}
                      required
                      data-testid="assignment-driver-select"
                    >
                      <option value="">Şoför Seçin</option>
                      {users.map(driver => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Başlangıç Tarihi</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={newAssignment.start_date}
                        onChange={(e) => setNewAssignment({ ...newAssignment, start_date: e.target.value })}
                        required
                        data-testid="assignment-start-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">Bitiş Tarihi</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={newAssignment.end_date}
                        onChange={(e) => setNewAssignment({ ...newAssignment, end_date: e.target.value })}
                        data-testid="assignment-end-date"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="mission_type">Görev Tipi</Label>
                    <Input
                      id="mission_type"
                      value={newAssignment.mission_type}
                      onChange={(e) => setNewAssignment({ ...newAssignment, mission_type: e.target.value })}
                      placeholder="örn: Yangın Müdahale, Tatbikat, Bakım"
                      required
                      data-testid="assignment-mission-type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Lokasyon</Label>
                    <Input
                      id="location"
                      value={newAssignment.location}
                      onChange={(e) => setNewAssignment({ ...newAssignment, location: e.target.value })}
                      required
                      data-testid="assignment-location"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={newAssignment.notes}
                      onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                      placeholder="Ek bilgiler..."
                      data-testid="assignment-notes"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-assignment-button">
                    Görevlendirme Oluştur
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
          <div className="space-y-4">
            {assignments.length > 0 ? (
              assignments.map((assignment) => {
                const vehicle = getVehicle(assignment.vehicle_id);
                const driver = getDriver(assignment.driver_id);
                
                return (
                  <Card key={assignment.id} className="card-hover" data-testid={`assignment-card-${assignment.id}`}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="bg-red-100 p-2 rounded-lg">
                              <MapPin className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{assignment.mission_type}</p>
                              <p className="text-sm text-gray-600">{assignment.location}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">Tarih</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(assignment.start_date)}
                                {assignment.end_date && ` - ${formatDate(assignment.end_date)}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Araç</p>
                            <p className="text-sm font-medium text-gray-900">
                              {vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Bilinmeyen'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Şoför</p>
                            <p className="text-sm font-medium text-gray-900">
                              {driver ? driver.name : 'Bilinmeyen'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {assignment.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-700">{assignment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz görevlendirme bulunmuyor</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Assignments;