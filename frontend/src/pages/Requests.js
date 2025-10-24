import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MessageSquare, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

const Requests = ({ user, onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newRequest, setNewRequest] = useState({
    target_manager_id: '',
    title: '',
    description: ''
  });
  const [response, setResponse] = useState({ status: '', response: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const requestsRes = await axios.get(`${API}/requests`);
      setRequests(requestsRes.data);
      
      if (user.role === 'driver') {
        const usersRes = await axios.get(`${API}/users`);
        setManagers(usersRes.data.filter(u => u.role === 'manager'));
      }
    } catch (error) {
      toast.error('Veriler yüklenemedi');
    }
    setLoading(false);
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/requests`, newRequest);
      toast.success('Talep gönderildi');
      setShowAddDialog(false);
      setNewRequest({ target_manager_id: '', title: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Talep gönderilemedi');
    }
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/requests/${selectedRequest.id}`, response);
      toast.success('Talep yanıtlandı');
      setSelectedRequest(null);
      setResponse({ status: '', response: '' });
      fetchData();
    } catch (error) {
      toast.error('Yanıt gönderilemedi');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Bekliyor',
      approved: 'Onaylandı',
      rejected: 'Reddedildi'
    };
    return statusMap[status] || status;
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

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="requests-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Talepler</h1>
            <p className="text-gray-600 mt-1">
              {user.role === 'manager' ? 'Size gelen talepler' : 'Gönderdiğiniz talepler'}
            </p>
          </div>
          {user.role === 'driver' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-request-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Talep Gönder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Talep</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div>
                    <Label htmlFor="manager">Amir Seçin</Label>
                    <select
                      id="manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newRequest.target_manager_id}
                      onChange={(e) => setNewRequest({ ...newRequest, target_manager_id: e.target.value })}
                      required
                      data-testid="request-manager-select"
                    >
                      <option value="">Amir Seçiniz</option>
                      {managers.map(manager => (
                        <option key={manager.id} value={manager.id}>{manager.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="title">Talep Başlığı</Label>
                    <Input
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                      required
                      data-testid="request-title-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                      required
                      data-testid="request-description-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-request-button">
                    Talep Gönder
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
            {requests.length > 0 ? (
              requests.map((request) => (
                <Card key={request.id} className="card-hover" data-testid={`request-card-${request.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(request.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">{request.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusText(request.status)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{request.description}</p>
                          {request.response && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">Yanıt:</p>
                              <p className="text-sm text-gray-700">{request.response}</p>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                            <span>Tarih: {formatDate(request.created_at)}</span>
                            {request.responded_at && (
                              <span>Yanıtlandı: {formatDate(request.responded_at)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {user.role === 'manager' && request.status === 'pending' && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setResponse({ status: '', response: '' });
                          }}
                          data-testid={`respond-request-${request.id}`}
                        >
                          Yanıtla
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz talep bulunmuyor</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Talebi Yanıtla</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateRequest} className="space-y-4">
              <div>
                <Label htmlFor="status">Durum</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={response.status}
                  onChange={(e) => setResponse({ ...response, status: e.target.value })}
                  required
                  data-testid="response-status-select"
                >
                  <option value="">Seçiniz</option>
                  <option value="approved">Onayla</option>
                  <option value="rejected">Reddet</option>
                </select>
              </div>
              <div>
                <Label htmlFor="response">Yanıt</Label>
                <Textarea
                  id="response"
                  rows={4}
                  value={response.response}
                  onChange={(e) => setResponse({ ...response, response: e.target.value })}
                  placeholder="Yanıtınızı yazın..."
                  data-testid="response-text-input"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-response-button">
                Yanıtla
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default Requests;