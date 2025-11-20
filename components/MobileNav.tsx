import React from 'react';
import { LayoutDashboard, PlusCircle, History, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface MobileNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView, onLogout }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center p-3">
        <button 
          onClick={() => onChangeView('DASHBOARD')}
          className={`flex flex-col items-center gap-1 ${currentView === 'DASHBOARD' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs">الرئيسية</span>
        </button>
        
        <button 
          onClick={() => onChangeView('NEW_SHIFT')}
          className={`flex flex-col items-center gap-1 ${currentView === 'NEW_SHIFT' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          <PlusCircle size={24} />
          <span className="text-xs">إغلاق</span>
        </button>

        <button 
          onClick={() => onChangeView('HISTORY')}
          className={`flex flex-col items-center gap-1 ${currentView === 'HISTORY' ? 'text-emerald-600' : 'text-gray-400'}`}
        >
          <History size={24} />
          <span className="text-xs">السجل</span>
        </button>

        <button 
          onClick={onLogout}
          className="flex flex-col items-center gap-1 text-red-400"
        >
          <LogOut size={24} />
          <span className="text-xs">خروج</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNav;