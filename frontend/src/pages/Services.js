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
import { Wrench, Plus, Phone, Mail, MapPin, Trash2 } from 'lucide-react';

const Services = ({ user, onLogout }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    specialization: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Servisler yüklenemedi');
    }
    setLoading(false);
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/services`, newService);
      toast.success('Servis başarıyla eklendi');
      setShowAddDialog(false);
      setNewService({ name: '', address: '', phone: '', email: '', specialization: '' });
      fetchServices();
    } catch (error) {
      toast.error('Servis eklenemedi');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Bu servisi silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API}/services/${serviceId}`);
      toast.success('Servis silindi');
      fetchServices();
    } catch (error) {
      toast.error('Servis silinemedi');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="services-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Servisler</h1>
            <p className="text-gray-600 mt-1">Özel servis listesi</p>
          </div>
          {user.role === 'manager' && (
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-service-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Servis Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yeni Servis Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Servis Adı</Label>
                    <Input
                      id="name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      required
                      data-testid="service-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Uzmanlık</Label>
                    <select
                      id="specialization"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={newService.specialization}
                      onChange={(e) => setNewService({ ...newService, specialization: e.target.value })}
                      data-testid="service-specialization-select"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Motor">Motor</option>
                      <option value="Elektrik">Elektrik</option>
                      <option value="Kaporta">Kaporta</option>
                      <option value="Genel">Genel Bakım</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={newService.address}
                      onChange={(e) => setNewService({ ...newService, address: e.target.value })}
                      required
                      data-testid="service-address-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={newService.phone}
                      onChange={(e) => setNewService({ ...newService, phone: e.target.value })}
                      required
                      data-testid="service-phone-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newService.email}
                      onChange={(e) => setNewService({ ...newService, email: e.target.value })}
                      data-testid="service-email-input"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-service-button">
                    Servis Ekle
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
            {services.map((service) => (
              <Card key={service.id} className="card-hover" data-testid={`service-card-${service.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Wrench className="w-5 h-5 text-blue-600" />
                      </div>
                      <span>{service.name}</span>
                    </div>
                    {user.role === 'manager' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600"
                        onClick={() => handleDeleteService(service.id)}
                        data-testid={`delete-service-${service.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.specialization && (
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {service.specialization}
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                    <p className="text-sm text-gray-700">{service.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">{service.phone}</p>
                  </div>
                  {service.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">{service.email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && services.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz servis bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Services;