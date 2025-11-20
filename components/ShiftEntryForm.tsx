
import React, { useState, useEffect } from 'react';
import { Calculator, Save, RefreshCw, FileText, BrainCircuit, MonitorCheck } from 'lucide-react';
import { User, ShiftData } from '../types';
import { saveShift } from '../services/dataService';
import { analyzeShift } from '../services/geminiService';

interface ShiftEntryFormProps {
  currentUser: User;
  onSuccess: () => void;
}

const ShiftEntryForm: React.FC<ShiftEntryFormProps> = ({ currentUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    startingCash: 0,
    cashSales: 0,
    cardSales: 0,
    transferSales: 0,
    expenses: 0,
    actualCash: 0,
    externalSystemData: 0,
    notes: '',
    expensesNote: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Calculations
  const expectedCash = formData.startingCash + formData.cashSales - formData.expenses;
  const discrepancy = formData.actualCash - expectedCash;
  const totalRevenue = formData.cashSales + formData.cardSales + formData.transferSales;
  
  // External Matching Calculation (Cash Sales + Card Sales vs Nazeel)
  const systemTotal = formData.cashSales + formData.cardSales;
  const nazeelAmount = formData.externalSystemData || 0;
  // Logic requested: 
  // If Nazeel > Total -> Deficit
  // If Nazeel < Total -> Surplus
  // We calculate (Total - Nazeel). 
  // If result is negative (e.g. 900 - 1000 = -100), it implies Nazeel is higher -> Deficit.
  // If result is positive (e.g. 1100 - 1000 = +100), it implies Total is higher -> Surplus.
  const matchDiff = systemTotal - nazeelAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' || name === 'expensesNote' ? value : Number(value) || 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newShift: ShiftData = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString(),
      startTime: new Date().setHours(new Date().getHours() - 8).toString(), // Mock start time
      endTime: new Date().toISOString(),
      ...formData,
      expectedCash,
      discrepancy,
    };

    // AI Analysis Step
    try {
        const analysis = await analyzeShift(newShift);
        newShift.aiAnalysis = analysis;
        setAnalysisResult(analysis);
    } catch (err) {
        console.error("AI Analysis failed");
    }

    saveShift(newShift);
    
    // Wait a moment if AI generated something to show user, else redirect immediately
    if (!analysisResult) {
        setTimeout(onSuccess, 1500);
    } else {
        setIsSubmitting(false); // Keep form open to show result
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إغلاق الوردية</h2>
          <p className="text-gray-500 text-sm">أدخل بيانات المبيعات والعهدة لإغلاق الصندوق</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Revenues */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            الإيرادات والمبيعات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">مبيعات الكاش</label>
              <div className="relative">
                <input
                  type="number"
                  name="cashSales"
                  value={formData.cashSales || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-left"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ر.س</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">الشبكة (بطاقة)</label>
              <div className="relative">
                <input
                  type="number"
                  name="cardSales"
                  value={formData.cardSales || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-left"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ر.س</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">تحويل بنكي</label>
              <div className="relative">
                <input
                  type="number"
                  name="transferSales"
                  value={formData.transferSales || ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-left"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
                <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ر.س</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center text-blue-800">
            <span className="font-medium">إجمالي الإيرادات (الكل)</span>
            <span className="font-bold text-xl">{totalRevenue.toLocaleString()} ر.س</span>
          </div>
        </div>

        {/* Section 1.5: External System Matching */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            <MonitorCheck className="w-5 h-5" />
            مطابقة برنامج نزيل
          </h3>
          <p className="text-sm text-gray-500 mb-4">أدخل الرقم من برنامج نزيل لمطابقته مع مبيعات الكاش والشبكة المسجلة أعلاه.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">رقم برنامج نزيل</label>
                <div className="relative">
                    <input
                    type="number"
                    name="externalSystemData"
                    value={formData.externalSystemData || ''}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all text-left"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    />
                     <span className="absolute left-4 top-3.5 text-gray-400 text-sm">ر.س</span>
                </div>
             </div>

             <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>المسجل (كاش + شبكة):</span>
                    <span className="font-bold">{systemTotal.toFixed(2)}</span>
                </div>
                <div className="h-px bg-gray-300 my-2"></div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">الحالة:</span>
                    
                    {formData.externalSystemData > 0 ? (
                         matchDiff === 0 ? (
                             <span className="flex items-center gap-1 text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full">
                                 ✅ متطابق
                             </span>
                         ) : (
                             <span className={`flex items-center gap-1 font-bold px-3 py-1 rounded-full ${matchDiff > 0 ? 'text-blue-600 bg-blue-100' : 'text-red-600 bg-red-100'}`}>
                                 {matchDiff > 0 
                                    ? `زيادة (+${Math.abs(matchDiff).toFixed(2)})` 
                                    : `عجز (-${Math.abs(matchDiff).toFixed(2)})`
                                 }
                             </span>
                         )
                    ) : (
                        <span className="text-gray-400 text-sm">في انتظار الإدخال...</span>
                    )}
                </div>
             </div>
          </div>
        </div>

        {/* Section 2: Cash Flow */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
            حركة الصندوق
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">رصيد بداية المدة (العهدة)</label>
              <input
                type="number"
                name="startingCash"
                value={formData.startingCash || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">مصروفات / سحوبات</label>
              <input
                type="number"
                name="expenses"
                value={formData.expenses || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">بيان المصروفات (اختياري)</label>
              <input
                type="text"
                name="expensesNote"
                value={formData.expensesNote}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                placeholder="مثال: شراء مياه، دفع للمورد..."
              />
            </div>
          </div>
        </div>

        {/* Section 3: Closing & Calculation */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
            الجرد الفعلي
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">الكاش الفعلي (بعد العد)</label>
                <input
                  type="number"
                  name="actualCash"
                  value={formData.actualCash || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-4 text-2xl font-bold text-center bg-white border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-emerald-700"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">ملاحظات الوردية</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none resize-none"
                  placeholder="أي ملاحظات هامة للإدارة..."
                ></textarea>
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-4">ملخص الإغلاق</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                        <span>رصيد البداية:</span>
                        <span>{formData.startingCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                        <span>+ مبيعات كاش:</span>
                        <span>{formData.cashSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                        <span>- مصروفات:</span>
                        <span>({formData.expenses.toFixed(2)})</span>
                    </div>
                    <div className="h-px bg-slate-300 my-2"></div>
                    <div className="flex justify-between font-bold text-slate-800 text-base">
                        <span>الكاش المتوقع:</span>
                        <span>{expectedCash.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-emerald-700 text-base">
                        <span>الكاش الفعلي:</span>
                        <span>{formData.actualCash.toFixed(2)}</span>
                    </div>
                    
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 justify-center font-bold text-lg ${
                        discrepancy === 0 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : discrepancy > 0 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        {discrepancy === 0 && <span>✅ متطابق</span>}
                        {discrepancy > 0 && <span> زيادة: +{discrepancy.toFixed(2)}</span>}
                        {discrepancy < 0 && <span> عجز: {discrepancy.toFixed(2)}</span>}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Result */}
        {analysisResult && (
            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl animate-fade-in">
                <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
                    <BrainCircuit className="w-6 h-6" />
                    <h3>تحليل الذكاء الاصطناعي</h3>
                </div>
                <div className="prose prose-sm text-indigo-900 whitespace-pre-line">
                    {analysisResult}
                </div>
                <div className="mt-4 flex justify-end">
                     <button 
                        type="button" 
                        onClick={onSuccess}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                     >
                        تأكيد وإنهاء
                     </button>
                </div>
            </div>
        )}

        {!analysisResult && (
            <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all
                ${isSubmitting 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-500/30 hover:-translate-y-1'
                }`}
            >
            {isSubmitting ? (
                <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                جاري الحفظ والتحليل...
                </>
            ) : (
                <>
                <Save className="w-6 h-6" />
                حفظ وإغلاق الوردية
                </>
            )}
            </button>
        )}
      </form>
    </div>
  );
};

export default ShiftEntryForm;
