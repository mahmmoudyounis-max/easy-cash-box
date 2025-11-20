import React, { useEffect, useState } from 'react';
import { TrendingUp, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { getStats } from '../services/dataService';

const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setStats(getStats());
  }, []);

  if (!stats) return <div>جاري التحميل...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">لوحة المعلومات</h2>
        <p className="text-gray-500">نظرة عامة على الأداء المالي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={`${stats.totalSales.toLocaleString()} ر.س`} 
          icon={TrendingUp} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="إجمالي الكاش" 
          value={`${stats.totalCash.toLocaleString()} ر.س`} 
          icon={Banknote} 
          colorClass="bg-emerald-100 text-emerald-600" 
        />
        <StatCard 
          title="مبيعات الشبكة" 
          value={`${stats.totalCard.toLocaleString()} ر.س`} 
          icon={CreditCard} 
          colorClass="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          title="إجمالي العجز المسجل" 
          value={`${stats.totalShortage.toLocaleString()} ر.س`} 
          icon={AlertCircle} 
          colorClass="bg-red-100 text-red-600" 
        />
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="max-w-2xl">
          <h3 className="text-2xl font-bold mb-2">مرحباً بك في نظام سهل</h3>
          <p className="opacity-90 mb-6">
            تذكر دائماً التأكد من عد النقود بدقة قبل إغلاق الوردية. النظام يقوم بحساب الفوارق تلقائياً ويستخدم الذكاء الاصطناعي لتحليل الأداء.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;