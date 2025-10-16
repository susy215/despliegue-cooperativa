import React, { useState } from 'react';
import { Eye, EyeOff, Building2, Shield, User, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 transform hover:scale-[1.01] transition-all duration-300">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Cooperativa Agrícola</h1>
            <p className="text-emerald-100/80 text-sm">Sistema de Gestión Cooperativa</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/80 text-white rounded-lg px-4 py-3 text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium block">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/60" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="Ingrese su usuario"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-300/60" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-300/60 hover:text-emerald-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-400 focus:ring-2"
                />
                <span className="text-white/80">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-emerald-200 hover:text-white transition-colors text-sm"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !formData.username || !formData.password}
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-emerald-100/60 text-xs">
              © 2025 Sistema de Gestión Cooperativa. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default LoginPage;