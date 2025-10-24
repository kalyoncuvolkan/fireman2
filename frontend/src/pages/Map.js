import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Building2, Phone } from 'lucide-react';

const Map = ({ user, onLogout }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await axios.get(`${API}/stations`);
      setStations(response.data);
    } catch (error) {
      toast.error('İstasyonlar yüklenemedi');
    }
    setLoading(false);
  };

  // Ankara merkez koordinatları
  const ankaraCenterLat = 39.9334;
  const ankaraCenterLng = 32.8597;

  const handleStationClick = (station) => {
    setSelectedStation(station);
    if (station.latitude && station.longitude) {
      // Haritada istasyona zoom yap
      const mapElement = document.getElementById('ankara-map');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const getStationMarkerPosition = (station, index) => {
    // Eğer koordinat varsa kullan, yoksa default pozisyon ver
    if (station.latitude && station.longitude) {
      // Ankara haritası 800x600 boyutunda, koordinatları pixel'e çevir
      // Ankara için kabaca: lat 39.7-40.2, lng 32.5-33.2
      const latMin = 39.7, latMax = 40.2;
      const lngMin = 32.5, lngMax = 33.2;
      
      const x = ((station.longitude - lngMin) / (lngMax - lngMin)) * 100;
      const y = ((latMax - station.latitude) / (latMax - latMin)) * 100;
      
      return { left: `${x}%`, top: `${y}%` };
    }
    
    // Default pozisyonlar (coordinate yoksa)
    const positions = [
      { left: '40%', top: '45%' }, // Merkez
      { left: '30%', top: '35%' }, // Keçiören
      { left: '55%', top: '55%' }, // Çankaya
      { left: '45%', top: '30%' },
      { left: '35%', top: '60%' },
      { left: '60%', top: '40%' },
    ];
    return positions[index % positions.length];
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
      <div className="space-y-6 animate-fade-in" data-testid="map-page">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">İstasyon Haritası</h1>
          <p className="text-gray-600 mt-1">Ankara İtfaiyesi istasyonları</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ankara Haritası</CardTitle>
              </CardHeader>
              <CardContent>
                <div id="ankara-map" className="relative w-full bg-gray-100 rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  {/* Basit Ankara Haritası SVG/Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300">
                    {/* Ankara bölgeleri temsili */}
                    <svg className="w-full h-full opacity-20" viewBox="0 0 800 600">
                      <text x="400" y="50" fontSize="48" fontWeight="bold" fill="#333" textAnchor="middle">ANKARA</text>
                      <text x="250" y="200" fontSize="24" fill="#666">Keçiören</text>
                      <text x="450" y="350" fontSize="24" fill="#666">Çankaya</text>
                      <text x="350" y="280" fontSize="24" fill="#666">Yenimahalle</text>
                      <text x="500" y="250" fontSize="24" fill="#666">Etimesgut</text>
                      <text x="300" y="450" fontSize="24" fill="#666">Mamak</text>
                      
                      {/* Ana yollar */}
                      <line x1="100" y1="300" x2="700" y2="300" stroke="#999" strokeWidth="3" opacity="0.3"/>
                      <line x1="400" y1="100" x2="400" y2="550" stroke="#999" strokeWidth="3" opacity="0.3"/>
                    </svg>
                  </div>

                  {/* İstasyon İşaretleri */}
                  {stations.map((station, index) => {
                    const position = getStationMarkerPosition(station, index);
                    const isSelected = selectedStation?.id === station.id;
                    
                    return (
                      <div
                        key={station.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                          isSelected ? 'z-20 scale-125' : 'z-10'
                        }`}
                        style={position}
                        onClick={() => handleStationClick(station)}
                        data-testid={`map-marker-${station.id}`}
                      >
                        <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            isSelected 
                              ? 'bg-red-600 ring-4 ring-red-300' 
                              : 'bg-red-500 hover:bg-red-600'
                          }`}>
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          {isSelected && (
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap border-2 border-red-500">
                              <p className="font-bold text-sm text-gray-900">{station.name}</p>
                              {station.internal_number && (
                                <p className="text-xs text-gray-600">Dahili: {station.internal_number}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Harita İkonları */}
                  <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">İtfaiye İstasyonu</span>
                    </div>
                    <p className="text-xs text-gray-500">Toplam {stations.length} istasyon</p>
                  </div>
                </div>

                {/* Harita Açıklaması */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Harita üzerindeki işaretlere tıklayarak istasyon detaylarını görebilirsiniz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>İstasyon Listesi ({stations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {stations.map((station) => (
                    <div
                      key={station.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedStation?.id === station.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleStationClick(station)}
                      data-testid={`station-list-${station.id}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-red-100 p-2 rounded-lg">
                          <Building2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{station.name}</h3>
                          {station.internal_number && (
                            <p className="text-sm text-gray-600">Dahili: {station.internal_number}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{station.address}</p>
                          <div className="flex items-center space-x-1 mt-2">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <p className="text-xs text-gray-500">{station.phone}</p>
                          </div>
                          {station.latitude && station.longitude && (
                            <p className="text-xs text-blue-600 mt-1">
                              📍 {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Map;
