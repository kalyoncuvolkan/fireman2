import { useState } from 'react';
import axios from 'axios';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Truck, ShieldAlert } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'driver',
    sicil_no: '',
    phone: '',
    manager_password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success('Giriş başarılı!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Giriş yapılamadı');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      toast.success('Kayıt başarılı!');
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Kayıt yapılamadı');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 mb-4 shadow-lg">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ankara İtfaiye</h1>
          <p className="text-lg text-gray-600">Araç Takip Sistemi</p>
        </div>

        <Card className="shadow-xl animate-slide-in" data-testid="login-card">
          <CardHeader>
            <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
            <CardDescription>Devam etmek için giriş yapın veya kayıt olun</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" data-testid="login-tab">Giriş Yap</TabsTrigger>
                <TabsTrigger value="register" data-testid="register-tab">Kayıt Ol</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">E-posta</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="ornek@ankara.bel.tr"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Şifre</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    disabled={loading}
                    data-testid="login-submit-button"
                  >
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Ad Soyad</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Ahmet Yılmaz"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      required
                      data-testid="register-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-email">E-posta</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="ornek@ankara.bel.tr"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      data-testid="register-email-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="register-sicil">Sicil No</Label>
                      <Input
                        id="register-sicil"
                        type="text"
                        placeholder="12345"
                        value={registerData.sicil_no}
                        onChange={(e) => setRegisterData({ ...registerData, sicil_no: e.target.value })}
                        required
                        data-testid="register-sicil-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="register-phone">Telefon</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="0532 123 4567"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        required
                        data-testid="register-phone-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="register-password">Şifre</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      data-testid="register-password-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-role">Rol</Label>
                    <select
                      id="register-role"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      value={registerData.role}
                      onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                      data-testid="register-role-select"
                    >
                      <option value="driver">Şoför</option>
                      <option value="manager">Amir</option>
                    </select>
                  </div>
                  {registerData.role === 'manager' && (
                    <div>
                      <Label htmlFor="register-manager-password">Amir Kayıt Şifresi</Label>
                      <Input
                        id="register-manager-password"
                        type="password"
                        placeholder="Amir kayıt şifresi gerekli"
                        value={registerData.manager_password}
                        onChange={(e) => setRegisterData({ ...registerData, manager_password: e.target.value })}
                        required
                        data-testid="register-manager-password-input"
                      />
                      <p className="text-xs text-gray-500 mt-1">Amir olarak kayıt olmak için özel şifre gereklidir</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                    disabled={loading}
                    data-testid="register-submit-button"
                  >
                    {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <ShieldAlert className="inline w-4 h-4 mr-1" />
          Güvenli bağlantı ile korunmaktadır
        </div>
      </div>
    </div>
  );
};

export default Login;