import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users as UsersIcon, Trash2, Mail, User } from 'lucide-react';

const Users = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi');
    }
    setLoading(false);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API}/users/${userId}`);
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      toast.error('Kullanıcı silinemedi');
    }
  };

  const getRoleBadge = (role) => {
    return role === 'manager' ? (
      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">Amir</span>
    ) : (
      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">Şoför</span>
    );
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="users-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-600 mt-1">Tüm sistem kullanıcıları</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <Card key={u.id} className="card-hover" data-testid={`user-card-${u.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <User className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{u.name}</h3>
                        {getRoleBadge(u.role)}
                      </div>
                    </div>
                    {u.id !== user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600"
                        onClick={() => handleDeleteUser(u.id)}
                        data-testid={`delete-user-${u.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-700">{u.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Kullanıcı bulunamadı</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Users;