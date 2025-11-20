
import React, { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { getUsers, addUser, isSystemInitialized } from '../services/dataService';
import { User as UserType, UserRole } from '../types';

interface LoginFormProps {
  onLogin: (user: UserType) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  // Determine initial mode based on system state
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Setup State
  const [setupData, setSetupData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    // Check if system has users
    const initialized = isSystemInitialized();
    setIsSetupMode(!initialized);
    setLoading(false);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupData.password !== setupData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    if (setupData.password.length < 3) {
      setError('كلمة المرور يجب أن تكون 3 أحرف على الأقل');
      return;
    }

    try {
      const newAdmin: UserType = {
        id: Date.now().toString(),
        name: setupData.name,
        username: setupData.username,
        password: setupData.password,
        role: UserRole.ADMIN
      };
      
      addUser(newAdmin);
      onLogin(newAdmin); // Auto login after setup
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-500">
        
        {/* Header Section */}
        <div className={`p-8 text-center transition-colors duration-500 ${isSetupMode ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-inner">
            {isSetupMode ? <Store className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl font-bold text-white">
            {isSetupMode ? 'إعداد النظام' : 'تسجيل الدخول'}
          </h1>
          <p className="text-white/80 mt-2 text-sm">
            {isSetupMode ? 'مرحباً بك! لنقم بإنشاء حساب المدير الأول' : 'نظام سهل لإدارة الكاشير والورديات'}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 text-red-500 text-sm bg-red-50 border border-red-100 p-3 rounded-lg text-center flex items-center justify-center gap-2 animate-pulse">
              <ShieldCheck className="w-4 h-4" />
              {error}
            </div>
          )}

          {isSetupMode ? (
            /* SETUP FORM */
            <form onSubmit={handleSetupSubmit} className="space-y-5 animate-fade-in">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل (للمدير)</label>
                <input 
                  type="text" 
                  required
                  value={setupData.name}
                  onChange={(e) => setSetupData({...setupData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="مثال: عبد الله محمد"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
                <input 
                  type="text" 
                  required
                  value={setupData.username}
                  onChange={(e) => setSetupData({...setupData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="admin"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
                    <input 
                    type="password" 
                    required
                    value={setupData.password}
                    onChange={(e) => setSetupData({...setupData, password: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="****"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد الكلمة</label>
                    <input 
                    type="password" 
                    required
                    value={setupData.confirmPassword}
                    onChange={(e) => setSetupData({...setupData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="****"
                    />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 mt-4"
              >
                <span>إنشاء الحساب وبدء الاستخدام</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المستخدم</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                  <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
              >
                دخول
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Footer Note */}
      <div className="fixed bottom-4 text-slate-500 text-xs text-center w-full px-4">
         <p>{isSetupMode 
            ? 'يتم حفظ البيانات محلياً على هذا الجهاز. هذا الحساب سيكون له صلاحيات المدير الكاملة.' 
            : 'لإدارة الموظفين أو إنشاء حسابات إضافية، يرجى الدخول بحساب مدير.'}
         </p>
      </div>
    </div>
  );
};

export default LoginForm;
