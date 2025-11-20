
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ShiftEntryForm from './components/ShiftEntryForm';
import ShiftHistory from './components/ShiftHistory';
import UserManagement from './components/UserManagement';
import HelpModal from './components/HelpModal';
import { User, ViewState } from './types';
import { STORAGE_KEYS } from './constants';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('LOGIN');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    // Check for persisted session
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setCurrentView('DASHBOARD');
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setCurrentView('LOGIN');
  };

  if (!currentUser || currentView === 'LOGIN') {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar for Desktop */}
      <Sidebar 
        currentUser={currentUser} 
        currentView={currentView} 
        onChangeView={setCurrentView}
        onLogout={handleLogout}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-screen">
        {currentView === 'DASHBOARD' && <Dashboard />}
        {currentView === 'NEW_SHIFT' && (
          <ShiftEntryForm 
            currentUser={currentUser} 
            onSuccess={() => setCurrentView('HISTORY')} 
          />
        )}
        {currentView === 'HISTORY' && <ShiftHistory />}
        {currentView === 'USERS' && <UserManagement />}
      </main>

      {/* Mobile Navigation */}
      <MobileNav 
        currentView={currentView} 
        onChangeView={setCurrentView}
        onLogout={handleLogout}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
