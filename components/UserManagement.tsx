
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, ShieldAlert, Database, Download, Upload, Cloud } from 'lucide-react';
import { User, UserRole } from '../types';
import { getUsers, addUser, deleteUser, createBackup, restoreBackup } from '../services/dataService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: UserRole.CASHIER
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      setError('جميع الحقول مطلوبة');
      return;
    }

    try {
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role as UserRole
      };
      
      addUser(newUser);
      setSuccess('تم إضافة الموظف بنجاح');
      setFormData({ name: '', username: '', password: '', role: UserRole.CASHIER });
      loadUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        deleteUser(id);
        loadUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleExport = async () => {
    try {
      const jsonString = createBackup();
      const fileName = `sahl_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      // Helper function to handle fallback download
      const triggerDownload = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setSuccess('تم تحميل الملف. يرجى رفعه إلى Google Drive يدوياً للحفظ السحابي.');
        setTimeout(() => setSuccess(''), 5000);
      };

      // Try Web Share API first (Works great on Mobile to save directly to Drive/Files)
      if (navigator.share && navigator.canShare) {
        const file = new File([jsonString], fileName, { type: 'application/json' });
        const shareData = {
          files: [file],
          title: 'نسخة احتياطية - نظام سهل',
          text: 'ملف قاعدة البيانات لنظام سهل للكاشير'
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            setSuccess('تمت المشاركة بنجاح');
            setTimeout(() => setSuccess(''), 3000);
          } catch (err: any) {
            if (err.name !== 'AbortError') {
               // If share fails (and wasn't cancelled by user), fallback to download
               triggerDownload();
            }
          }
        } else {
            triggerDownload();
        }
      } else {
        triggerDownload();
      }

    } catch (err) {
      setError('فشل إنشاء النسخة الاحتياطية');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('تحذير: استيراد نسخة احتياطية سيقوم بمسح جميع البيانات الحالية واستبدالها بالبيانات الجديدة. هل أنت متأكد؟')) {
        e.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const content = event.target?.result as string;
            restoreBackup(content);
            alert('تم استعادة البيانات بنجاح. سيتم إعادة تحميل الصفحة.');
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
            e.target.value = ''; // Reset input
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="w-8 h-8 text-emerald-600" />
          إدارة الموظفين والبيانات
        </h2>
        <p className="text-gray-500">إضافة وحذف حسابات الموظفين، والنسخ الاحتياطي السحابي</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add User Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            إضافة موظف جديد
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="مثال: محمد أحمد"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">اسم المستخدم (للدخول)</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="user1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="*****"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">الصلاحية</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value={UserRole.CASHIER}>كاشير (موظف)</option>
                <option value={UserRole.ADMIN}>مدير (كامل الصلاحيات)</option>
              </select>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">{error}</div>}
            {success && <div className="text-emerald-600 text-sm bg-emerald-50 p-2 rounded text-center">{success}</div>}

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-md"
            >
              حفظ الموظف
            </button>
          </form>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            قائمة الموظفين الحاليين
          </h3>

          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">اسم المستخدم</th>
                  <th className="px-4 py-3">الصلاحية</th>
                  <th className="px-4 py-3">كلمة المرور</th>
                  <th className="px-4 py-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500">{user.password}</td>
                    <td className="px-4 py-3 text-center">
                      {user.username !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      {user.username === 'admin' && (
                        <ShieldAlert className="w-5 h-5 text-gray-300 mx-auto" title="لا يمكن حذف المدير الرئيسي" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-xs rounded-lg flex items-start gap-2">
            <Shield className="w-5 h-5 flex-shrink-0" />
            <p>
              ملاحظة أمنية: البيانات محفوظة محلياً على هذا الجهاز فقط في المتصفح.
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5" />
            النسخ الاحتياطي والاستعادة
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Cloud className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-800">تصدير وحفظ في Google Drive</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    اضغط لتصدير قاعدة البيانات. على الجوال، اختر <strong>Google Drive</strong> من القائمة لحفظه سحابياً.
                </p>
                <button 
                    onClick={handleExport}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-bold flex items-center justify-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    تصدير / حفظ نسخة
                </button>
            </div>

            <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-gray-800">استيراد البيانات</h4>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    استرجع البيانات باختيار الملف الذي قمت بحفظه سابقاً. <span className="text-red-500 font-bold">تحذير: سيستبدل البيانات الحالية.</span>
                </p>
                <label className="block w-full cursor-pointer">
                    <input 
                        type="file" 
                        accept=".json"
                        onChange={handleImport}
                        className="hidden" 
                    />
                    <div className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-bold text-center shadow-sm flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        اختر ملف النسخة الاحتياطية
                    </div>
                </label>
            </div>
         </div>
      </div>
    </div>
  );
};

export default UserManagement;

