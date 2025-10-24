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
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

const FaultTypes = ({ user, onLogout }) => {
  const [faultTypes, setFaultTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFaultType, setNewFaultType] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchFaultTypes();
  }, []);

  const fetchFaultTypes = async () => {
    try {
      const response = await axios.get(`${API}/fault-types`);
      setFaultTypes(response.data);
    } catch (error) {
      toast.error('Arıza tipleri yüklenemedi');
    }
    setLoading(false);
  };

  const handleAddFaultType = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/fault-types`, newFaultType);
      toast.success('Arıza tipi eklendi');
      setShowAddDialog(false);
      setNewFaultType({ name: '', description: '' });
      fetchFaultTypes();
    } catch (error) {
      toast.error('Arıza tipi eklenemedi');
    }
  };

  const handleDeleteFaultType = async (faultTypeId) => {
    if (!window.confirm('Bu arıza tipini silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API}/fault-types/${faultTypeId}`);
      toast.success('Arıza tipi silindi');
      fetchFaultTypes();
    } catch (error) {
      toast.error('Arıza tipi silinemedi');
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="fault-types-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Arıza Tipleri</h1>
            <p className="text-gray-600 mt-1">Arıza tipi listesini yönetin</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-fault-type-button">
                <Plus className="w-4 h-4 mr-2" />
                Arıza Tipi Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Arıza Tipi</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddFaultType} className="space-y-4">
                <div>
                  <Label htmlFor="name">Arıza Adı</Label>
                  <Input
                    id="name"
                    value={newFaultType.name}
                    onChange={(e) => setNewFaultType({ ...newFaultType, name: e.target.value })}
                    required
                    placeholder="örn: Motor Arızası"
                    data-testid="fault-type-name-input"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Açıklama</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={newFaultType.description}
                    onChange={(e) => setNewFaultType({ ...newFaultType, description: e.target.value })}
                    placeholder="Arıza hakkında açıklama..."
                    data-testid="fault-type-description-input"
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-700" data-testid="submit-fault-type-button">
                  Ekle
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faultTypes.map((faultType) => (
              <Card key={faultType.id} className="card-hover" data-testid={`fault-type-card-${faultType.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span>{faultType.name}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600"
                      onClick={() => handleDeleteFaultType(faultType.id)}
                      data-testid={`delete-fault-type-${faultType.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                {faultType.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600">{faultType.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {!loading && faultTypes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Henüz arıza tipi bulunmuyor</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FaultTypes;