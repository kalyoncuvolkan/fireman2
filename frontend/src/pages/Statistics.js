import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { BarChart3, TrendingUp } from 'lucide-react';

const Statistics = ({ user, onLogout }) => {
  const [topFaults, setTopFaults] = useState([]);
  const [topGroups, setTopGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [faultsRes, groupsRes] = await Promise.all([
        axios.get(`${API}/faults/statistics/top-faults`),
        axios.get(`${API}/faults/statistics/top-groups`)
      ]);
      setTopFaults(faultsRes.data);
      setTopGroups(groupsRes.data);
    } catch (error) {
      toast.error('İstatistikler yüklenemedi');
    }
    setLoading(false);
  };

  const getMaxCount = (data) => {
    return Math.max(...data.map(item => item.count), 1);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6 animate-fade-in" data-testid="statistics-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Arıza İstatistikleri</h1>
          <p className="text-gray-600 mt-1">Detaylı arıza analizi ve raporları</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>En Çok Çıkan Arızalar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topFaults.length > 0 ? (
                  <div className="space-y-4">
                    {topFaults.map((fault, index) => {
                      const maxCount = getMaxCount(topFaults);
                      const percentage = (fault.count / maxCount) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{fault.fault_type}</span>
                            <span className="text-sm font-bold text-gray-900">{fault.count} adet</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Henüz arıza verisi yok</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <span>En Çok Arıza Veren Araç Grupları</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topGroups.length > 0 ? (
                  <div className="space-y-4">
                    {topGroups.map((group, index) => {
                      const maxCount = getMaxCount(topGroups);
                      const percentage = (group.count / maxCount) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{group.vehicle_type}</span>
                            <span className="text-sm font-bold text-gray-900">{group.count} arıza</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Henüz veri yok</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Statistics;