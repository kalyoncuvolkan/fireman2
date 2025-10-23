import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Faults = ({ user, onLogout }) => {
  const [faults, setFaults] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFault, setSelectedFault] = useState(null);
  const [resolution, setResolution] = useState({ status: '', resolution_notes: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [faultsRes, vehiclesRes] = await Promise.all([
        axios.get(`${API}/faults`),
        axios.get(`${API}/vehicles`)
      ]);
      setFaults(faultsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    }
    setLoading(false);
  };

  const handleUpdateFault = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/faults/${selectedFault.id}`, resolution);
      toast.success('Arıza durumu güncellendi');
      setSelectedFault(null);
      setResolution({ status: '', resolution_notes: '' });
      fetchData();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const getVehicle = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Bekliyor',
      in_progress: 'İşlemde',
      resolved: 'Çözüldü'
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

  const getPriorityColor = (priority) => {
    const colorMap = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  const pendingFaults = faults.filter(f => f.status === 'pending');
  const inProgressFaults = faults.filter(f => f.status === 'in_progress');
  const resolvedFaults = faults.filter(f => f.status === 'resolved');

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="faults-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arıza Yönetimi</h1>
          <p className="text-gray-600 mt-1">Tüm arıza bildirimleri ve takibi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingFaults.length}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-xl">
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">İşlemde</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{inProgressFaults.length}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Çözüldü</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{resolvedFaults.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {faults.length > 0 ? (
              faults.map((fault) => {
                const vehicle = getVehicle(fault.vehicle_id);
                return (
                  <Card key={fault.id} className="card-hover" data-testid={`fault-card-${fault.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">
                            {getStatusIcon(fault.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-lg text-gray-900">
                                {vehicle?.plate || 'Bilinmeyen Araç'}
                              </h3>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(fault.priority)}`}>
                                {getPriorityText(fault.priority)}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                fault.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                fault.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getStatusText(fault.status)}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-2">{fault.description}</p>
                            {fault.resolution_notes && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                                <p className="text-sm font-medium text-green-900 mb-1">Çözüm:</p>
                                <p className="text-sm text-green-700">{fault.resolution_notes}</p>
                              </div>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                              <span>Bildirim: {formatDate(fault.created_at)}</span>
                              {fault.resolved_at && (
                                <span>Çözüm: {formatDate(fault.resolved_at)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {user.role === 'manager' && fault.status !== 'resolved' && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedFault(fault);
                              setResolution({ status: fault.status, resolution_notes: fault.resolution_notes || '' });
                            }}
                            data-testid={`update-fault-${fault.id}`}
                          >
                            Güncelle
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz arıza kaydı bulunmuyor</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {selectedFault && (
        <Dialog open={!!selectedFault} onOpenChange={() => setSelectedFault(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Arıza Durumunu Güncelle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateFault} className="space-y-4">
              <div>
                <Label htmlFor="status">Durum</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={resolution.status}
                  onChange={(e) => setResolution({ ...resolution, status: e.target.value })}
                  required
                  data-testid="update-status-select"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="resolved">Çözüldü</option>
                </select>
              </div>
              <div>
                <Label htmlFor="resolution_notes">Çözüm Notları</Label>
                <Textarea
                  id="resolution_notes"
                  rows={4}
                  value={resolution.resolution_notes}
                  onChange={(e) => setResolution({ ...resolution, resolution_notes: e.target.value })}
                  placeholder="Yapılan işlemler ve çözüm detayları..."
                  data-testid="resolution-notes-input"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-update-button">
                Güncelle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Faults;