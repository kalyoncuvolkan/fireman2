import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Truck, ArrowLeft, AlertCircle, FileText, History, Edit, Trash2 } from 'lucide-react';

const VehicleDetail = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [station, setStation] = useState(null);
  const [faults, setFaults] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFaultDialog, setShowFaultDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAccidentDialog, setShowAccidentDialog] = useState(false);
  const [editData, setEditData] = useState({});
  const [faultTypes, setFaultTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [newFault, setNewFault] = useState({
    description: '',
    priority: 'normal',
    fault_type_id: ''
  });
  const [accidentData, setAccidentData] = useState({
    date: new Date().toISOString().split('T')[0],
    location: '',
    driver_id: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const requests = [
        axios.get(`${API}/vehicles/${id}`),
        axios.get(`${API}/faults`, { params: { vehicle_id: id } }),
        axios.get(`${API}/assignments`, { params: { vehicle_id: id } }),
        axios.get(`${API}/fault-types`)
      ];

      if (user.role === 'manager') {
        requests.push(axios.get(`${API}/users`));
      }

      const responses = await Promise.all(requests);
      
      setVehicle(responses[0].data);
      setEditData(responses[0].data);
      setFaults(responses[1].data);
      setAssignments(responses[2].data);
      setFaultTypes(responses[3].data);
      if (responses[4]) setUsers(responses[4].data.filter(u => u.role === 'driver'));
      
      if (responses[0].data.station_id) {
        const stationRes = await axios.get(`${API}/stations/${responses[0].data.station_id}`);
        setStation(stationRes.data);
      }
    } catch (error) {
      toast.error('Araç bilgileri yüklenemedi');
      navigate('/vehicles');
    }
    setLoading(false);
  };

  const handleReportFault = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/faults`, {
        vehicle_id: id,
        ...newFault
      });
      toast.success('Arıza başarıyla bildirildi');
      setShowFaultDialog(false);
      setNewFault({ description: '', priority: 'normal', fault_type_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Arıza bildirilemedi');
    }
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    
    // If status changed to accident, show accident dialog
    if (editData.status === 'accident' && vehicle.status !== 'accident') {
      setShowEditDialog(false);
      setShowAccidentDialog(true);
      return;
    }
    
    try {
      await axios.put(`${API}/vehicles/${id}`, editData);
      toast.success('Araç bilgileri güncellendi');
      setShowEditDialog(false);
      fetchData();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleAddAccident = async (e) => {
    e.preventDefault();
    try {
      // First add accident record
      await axios.post(`${API}/vehicles/${id}/accident`, accidentData);
      
      // Then update vehicle status
      await axios.put(`${API}/vehicles/${id}`, { status: 'accident' });
      
      toast.success('Kaza kaydı eklendi');
      setShowAccidentDialog(false);
      setAccidentData({
        date: new Date().toISOString().split('T')[0],
        location: '',
        driver_id: '',
        description: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Kaza kaydı eklenemedi');
    }
  };

  const handleDeleteVehicle = async () => {
    if (!window.confirm('Bu araçı silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API}/vehicles/${id}`);
      toast.success('Araç silindi');
      navigate('/vehicles');
    } catch (error) {
      toast.error('Araç silinemedi');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: 'Faal',
      faulty: 'Arızalı',
      accident: 'Kazalı'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      low: 'Düşük',
      normal: 'Normal',
      high: 'Yüksek',
      urgent: 'Acil'
    };
    return priorityMap[priority] || priority;
  };

  const checkExpiring = (date) => {
    if (!date) return false;
    const expiryDate = new Date(date);
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return expiryDate <= thirtyDays;
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="vehicle-detail-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/vehicles')}
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{vehicle?.plate}</h1>
              <p className="text-gray-600 mt-1">{vehicle?.brand} {vehicle?.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={showFaultDialog} onOpenChange={setShowFaultDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-orange-600 border-orange-600" data-testid="report-fault-button">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Arıza Bildir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Arıza Bildir</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReportFault} className="space-y-4">
                  <div>
                    <Label htmlFor="fault_type">Arıza Tipi</Label>
                    <select
                      id="fault_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newFault.fault_type_id}
                      onChange={(e) => setNewFault({ ...newFault, fault_type_id: e.target.value })}
                      data-testid="fault-type-select"
                    >
                      <option value="">Arıza Tipi Seçin</option>
                      {faultTypes.map(ft => (
                        <option key={ft.id} value={ft.id}>{ft.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Arıza Açıklaması</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={newFault.description}
                      onChange={(e) => setNewFault({ ...newFault, description: e.target.value })}
                      required
                      data-testid="fault-description-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Öncelik</Label>
                    <select
                      id="priority"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newFault.priority}
                      onChange={(e) => setNewFault({ ...newFault, priority: e.target.value })}
                      data-testid="fault-priority-select"
                    >
                      <option value="low">Düşük</option>
                      <option value="normal">Normal</option>
                      <option value="high">Yüksek</option>
                      <option value="urgent">Acil</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-orange-600 to-orange-700" data-testid="submit-fault-button">
                    Bildir
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {user.role === 'manager' && (
              <>
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" data-testid="edit-vehicle-button">
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Araç Bilgilerini Düzenle</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateVehicle} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Plaka</Label>
                          <Input
                            value={editData.plate || ''}
                            onChange={(e) => setEditData({ ...editData, plate: e.target.value })}
                            data-testid="edit-plate-input"
                          />
                        </div>
                        <div>
                          <Label>Durum</Label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={editData.status}
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                            data-testid="edit-status-select"
                          >
                            <option value="active">Faal</option>
                            <option value="faulty">Arızalı</option>
                            <option value="accident">Kazalı</option>
                          </select>
                        </div>
                        <div>
                          <Label>Sigorta Bitiş</Label>
                          <Input
                            type="date"
                            value={editData.insurance_expiry || ''}
                            onChange={(e) => setEditData({ ...editData, insurance_expiry: e.target.value })}
                            data-testid="edit-insurance-input"
                          />
                        </div>
                        <div>
                          <Label>Muayene Bitiş</Label>
                          <Input
                            type="date"
                            value={editData.inspection_expiry || ''}
                            onChange={(e) => setEditData({ ...editData, inspection_expiry: e.target.value })}
                            data-testid="edit-inspection-input"
                          />
                        </div>
                        <div>
                          <Label>Kasko Bitiş</Label>
                          <Input
                            type="date"
                            value={editData.kasko_expiry || ''}
                            onChange={(e) => setEditData({ ...editData, kasko_expiry: e.target.value })}
                            data-testid="edit-kasko-input"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-edit-button">
                        Güncelle
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={handleDeleteVehicle}
                  data-testid="delete-vehicle-button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Araç Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plaka</span>
                <span className="text-sm font-semibold">{vehicle?.plate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Marka</span>
                <span className="text-sm font-semibold">{vehicle?.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Model</span>
                <span className="text-sm font-semibold">{vehicle?.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Yıl</span>
                <span className="text-sm font-semibold">{vehicle?.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Durum</span>
                <span className={`status-badge ${vehicle?.status === 'active' ? 'status-active' : vehicle?.status === 'faulty' ? 'status-faulty' : 'status-accident'}`}>
                  {getStatusText(vehicle?.status)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">İstasyon</span>
                <span className="text-sm font-semibold">{station?.name || '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Belge Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${checkExpiring(vehicle?.insurance_expiry) ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Sigorta Bitiş</p>
                  <p className="font-semibold text-gray-900">{formatDate(vehicle?.insurance_expiry)}</p>
                  {checkExpiring(vehicle?.insurance_expiry) && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Süre doluyor!
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-lg ${checkExpiring(vehicle?.inspection_expiry) ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Muayene Bitiş</p>
                  <p className="font-semibold text-gray-900">{formatDate(vehicle?.inspection_expiry)}</p>
                  {checkExpiring(vehicle?.inspection_expiry) && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Süre doluyor!
                    </p>
                  )}
                </div>
                <div className={`p-4 rounded-lg ${checkExpiring(vehicle?.kasko_expiry) ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Kasko Bitiş</p>
                  <p className="font-semibold text-gray-900">{formatDate(vehicle?.kasko_expiry)}</p>
                  {checkExpiring(vehicle?.kasko_expiry) && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Süre doluyor!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Arıza Geçmişi ({faults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faults.length > 0 ? (
              <div className="space-y-3">
                {faults.map((fault) => (
                  <div key={fault.id} className="border border-gray-200 rounded-lg p-4" data-testid={`fault-item-${fault.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          fault.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          fault.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {fault.status === 'pending' ? 'Bekliyor' : fault.status === 'in_progress' ? 'İşlemde' : 'Çözüldü'}
                        </span>
                        <span className="ml-2 text-xs text-gray-600">
                          {getPriorityText(fault.priority)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(fault.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{fault.description}</p>
                    {fault.resolution_notes && (
                      <p className="text-sm text-green-600 mt-2">
                        <strong>Çözüm:</strong> {fault.resolution_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Henüz arıza kaydı yok</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Görevlendirme Geçmişi ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4" data-testid={`assignment-item-${assignment.id}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{assignment.mission_type}</p>
                        <p className="text-sm text-gray-600">{assignment.location}</p>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(assignment.start_date)}</span>
                    </div>
                    {assignment.notes && (
                      <p className="text-sm text-gray-700 mt-2">{assignment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Henüz görevlendirme kaydı yok</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VehicleDetail;