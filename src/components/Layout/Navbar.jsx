import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      try {
        setIsLoggingOut(true);
        await logout();
      } catch (error) {
        console.error('Error durante logout:', error);
        alert('Error al cerrar sesión. Intente nuevamente.');
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <nav className={`bg-white/10 backdrop-blur-lg border-b border-white/20 px-4 py-3 flex items-center justify-between relative z-50 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
      {/* Left side - Menu button and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-white font-semibold">Sistema Cooperativa</h1>
        </div>
      </div>

      {/* Right side - User menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-white text-sm font-medium">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-emerald-200 text-xs">
              {user?.is_staff ? 'Administrador' : 'Usuario'}
            </p>
          </div>

          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-white/20">
                  <p className="text-white text-sm font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-emerald-200 text-xs">{user?.username}</p>
                </div>

                <button className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Configuración</span>
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-2 text-white hover:bg-red-500/20 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;