
import React from 'react';
import { LayoutDashboard, PlusCircle, History, LogOut, Wallet, Users, HelpCircle } from 'lucide-react';
import { ViewState, User, UserRole } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  onOpenHelp: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, currentView, onChangeView, onLogout, onOpenHelp }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'لوحة المعلومات', icon: LayoutDashboard },
    { id: 'NEW_SHIFT', label: 'إغلاق وردية', icon: PlusCircle },
    { id: 'HISTORY', label: 'سجل الورديات', icon: History },
  ];

  // Add User Management only for Admins
  if (currentUser.role === UserRole.ADMIN) {
    menuItems.push({ id: 'USERS', label: 'إدارة الموظفين', icon: Users });
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-800 text-white h-screen sticky top-0 shadow-xl">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        <div className="bg-emerald-500 p-2 rounded-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">نظام سهل</h1>
          <p className="text-xs text-slate-400">لإدارة الكاشير</p>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
            <button
                key={item.id}
                onClick={() => onChangeView(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
            </button>
            );
        })}
      </div>

      <div className="p-4 space-y-2">
        <button 
            onClick={onOpenHelp}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors text-sm"
        >
            <HelpCircle className="w-5 h-5" />
            <span>طريقة الاستخدام</span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-lg font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400">{currentUser.role}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
