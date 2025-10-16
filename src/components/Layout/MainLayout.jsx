import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chatbot from '../Chatbot';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-0 -left-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className="relative min-h-full">
        <Navbar onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className={`p-6 pb-8 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          {children}
        </main>
      </div>

      {/* Chatbot flotante */}
      <Chatbot />
    </div>
  );
};

export default MainLayout;