
import React from 'react';
import { X, Smartphone, Wifi, Database, Share2, Cloud } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-slate-800 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-6 h-6 text-emerald-400" />
            كيف تستخدم البرنامج وتحفظ بياناتك؟
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              كيف أحفظ نسخة في Google Drive؟
            </h3>
            <p className="text-sm text-blue-700 leading-relaxed mb-2">
              للحفاظ على بياناتك من الضياع، اتبع التالي:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>اذهب إلى <strong>إدارة الموظفين</strong>.</li>
                <li>اضغط <strong>تصدير / حفظ نسخة</strong>.</li>
                <li>إذا كنت تستخدم <strong>الجوال/التابلت</strong>: ستفتح قائمة المشاركة، اختر <strong>Drive</strong> أو <strong>Files</strong> للحفظ السحابي مباشرة.</li>
                <li>إذا كنت تستخدم <strong>الكمبيوتر</strong>: سيتم تحميل الملف، قم بفتح موقع Google Drive واسحب الملف إليه يدوياً.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 border-b pb-2">خطوات نقل العمل لجهاز آخر:</h3>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h4 className="font-bold text-gray-800">تصدير البيانات</h4>
                <p className="text-sm text-gray-500">كما ذكرنا أعلاه، احفظ الملف في جوالك أو أرسله لنفسك.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h4 className="font-bold text-gray-800">استيراد البيانات (في الجهاز الجديد)</h4>
                <p className="text-sm text-gray-500">افتح البرنامج في الجهاز الجديد، سجل الدخول (admin/123 لأول مرة)، اذهب لـ <strong>إدارة الموظفين</strong>، اختر <strong>استيراد البيانات</strong> وحدد الملف الذي حفظته.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Database className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-800 text-sm">نصيحة هامة:</h4>
              <p className="text-xs text-amber-700 mt-1">
                البرنامج يحفظ البيانات في المتصفح. تجنب عمل "مسح بيانات التصفح" (Clear History) للجهاز الرئيسي حتى لا تفقد السجلات.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            فهمت، شكراً
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
