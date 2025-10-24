import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Truck, AlertTriangle, CheckCircle, XCircle, FileWarning, Building2, Users, TrendingUp } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchVehicles();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      toast.error('İstatistikler yüklenemedi');
    }
    setLoading(false);
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Araçlar yüklenemedi');
    }
  };

  const getOilChangeDueVehicles = () => {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return vehicles.filter(v => {
      if (!v.next_oil_change_date) return false;
      const dueDate = new Date(v.next_oil_change_date);
      return dueDate <= thirtyDays;
    });
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

  const statCards = [
    {
      title: 'Toplam Araç',
      value: stats?.total_vehicles || 0,
      icon: Truck,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Aktif Araçlar',
      value: stats?.active_vehicles || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Arızalı Araçlar',
      value: stats?.faulty_vehicles || 0,
      icon: AlertTriangle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Kazalı Araçlar',
      value: stats?.accident_vehicles || 0,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      title: 'Bekleyen Arızalar',
      value: stats?.pending_faults || 0,
      icon: FileWarning,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Süre Dolacaklar',
      value: stats?.expiring_soon || 0,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Yağ Bakımı Yaklaşan',
      value: stats?.oil_change_due_soon || 0,
      icon: FileWarning,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    }
  ];

  if (user.role === 'manager') {
    statCards.push(
      {
        title: 'Toplam İstasyon',
        value: stats?.total_stations || 0,
        icon: Building2,
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
        iconColor: 'text-indigo-600'
      },
      {
        title: 'Toplam Şoför',
        value: stats?.total_drivers || 0,
        icon: Users,
        color: 'from-pink-500 to-pink-600',
        bgColor: 'bg-pink-50',
        iconColor: 'text-pink-600'
      }
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="dashboard">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Ankara İtfaiyesi Araç Takip Sistemi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-hover" data-testid={`stat-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2" data-testid={`stat-value-${index}`}>{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-xl`}>
                      <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Hoş Geldiniz, {user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">Rol</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {user.role === 'manager' ? 'Amir' : 'Şoför'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">E-posta</span>
                  <span className="text-sm font-semibold text-gray-900">{user.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover gradient-red">
            <CardHeader>
              <CardTitle>Hızlı İstatistikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Araç Kullanım Oranı</span>
                  <span className="text-lg font-bold text-gray-900">
                    {stats?.total_vehicles > 0
                      ? Math.round((stats.active_vehicles / stats.total_vehicles) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${stats?.total_vehicles > 0
                        ? (stats.active_vehicles / stats.total_vehicles) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Muayene Yaklaşan Araçlar */}
        {vehicles.filter(v => {
          if (!v.inspection_expiry) return false;
          const expiryDate = new Date(v.inspection_expiry);
          const thirtyDays = new Date();
          thirtyDays.setDate(thirtyDays.getDate() + 30);
          return expiryDate <= thirtyDays;
        }).length > 0 && (
          <Card className="border-2 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6" />
                <span>MUAYENE YAKLAŞAN ARAÇLAR ({vehicles.filter(v => {
                  if (!v.inspection_expiry) return false;
                  const expiryDate = new Date(v.inspection_expiry);
                  const thirtyDays = new Date();
                  thirtyDays.setDate(thirtyDays.getDate() + 30);
                  return expiryDate <= thirtyDays;
                }).length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.filter(v => {
                  if (!v.inspection_expiry) return false;
                  const expiryDate = new Date(v.inspection_expiry);
                  const thirtyDays = new Date();
                  thirtyDays.setDate(thirtyDays.getDate() + 30);
                  return expiryDate <= thirtyDays;
                }).map(vehicle => (
                  <div key={vehicle.id} className="bg-white border-2 border-blue-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{vehicle.plate}</h3>
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{vehicle.brand} {vehicle.model}</p>
                    <div className="bg-blue-100 rounded p-2">
                      <p className="text-xs text-blue-800 font-medium">Muayene Bitiş:</p>
                      <p className="text-sm font-bold text-blue-900">
                        {new Date(vehicle.inspection_expiry).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;