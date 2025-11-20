
import React, { useEffect, useState } from 'react';
import { FileText, User as UserIcon, Calendar, ArrowDown, ArrowUp, Minus, Printer, Filter, Search, X } from 'lucide-react';
import { ShiftData, User } from '../types';
import { getShifts, getUsers } from '../services/dataService';

const ShiftHistory: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftData[]>([]);
  const [filteredShifts, setFilteredShifts] = useState<ShiftData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    setShifts(getShifts());
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    let result = [...shifts];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter(s => new Date(s.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(s => new Date(s.date) <= end);
    }

    if (selectedUser !== 'all') {
      result = result.filter(s => s.userId === selectedUser);
    }

    setFilteredShifts(result);
  }, [shifts, startDate, endDate, selectedUser]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedUser('all');
  };

  const handlePrintShift = (shift: ShiftData) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const systemTotal = shift.cashSales + shift.cardSales;
    const nazeelAmount = shift.externalSystemData || 0;
    // Logic: 
    // If Nazeel > Total -> Deficit (Red)
    // If Nazeel < Total -> Surplus (Blue)
    const matchDiff = systemTotal - nazeelAmount; 

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <title>تقرير وردية - ${shift.userName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Cairo', sans-serif; background: #fff; color: #333; -webkit-print-color-adjust: exact; font-size: 13px; }
          .container { width: 100%; max-width: 210mm; margin: 0 auto; padding: 5px; }
          
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
          .header h1 { margin: 0; font-size: 20px; color: #000; }
          .header p { margin: 2px 0 0; color: #666; font-size: 12px; }

          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
          .info-box { background: #f9fafb; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 2px; }
          .info-label { font-weight: bold; color: #555; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; }
          th { background-color: #f1f5f9; font-weight: bold; color: #1e293b; }
          td.amount { font-weight: bold; text-align: left; direction: ltr; }
          tr:nth-child(even) { background-color: #f8fafc; }

          .section-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; color: #0f172a; border-right: 3px solid #059669; padding-right: 8px; }
          
          .total-row { background-color: #e2e8f0 !important; font-weight: bold; font-size: 13px; }
          .status-success { color: #059669; }
          .status-danger { color: #dc2626; }
          .status-warning { color: #2563eb; } /* Changed to Blue for Surplus */

          .signatures { margin-top: 40px; display: flex; justify-content: flex-end; padding: 0 30px; }
          .sig-line { width: 180px; border-top: 1px solid #000; text-align: center; padding-top: 5px; font-weight: bold; font-size: 12px; }

          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>تقرير إغلاق وردية مفصل</h1>
            <p>نظام سهل لإدارة الكاشير</p>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <div class="info-row"><span class="info-label">الموظف:</span> <span>${shift.userName}</span></div>
              <div class="info-row"><span class="info-label">رقم الوردية:</span> <span>#${shift.id.slice(-6)}</span></div>
            </div>
            <div class="info-box">
              <div class="info-row"><span class="info-label">التاريخ:</span> <span>${new Date(shift.date).toLocaleDateString('ar-EG')}</span></div>
              <div class="info-row"><span class="info-label">وقت الإغلاق:</span> <span>${new Date(shift.endTime).toLocaleTimeString('ar-EG')}</span></div>
            </div>
          </div>

          <div class="section-title">تفاصيل الإيرادات</div>
          <table>
            <thead>
              <tr>
                <th>نوع الإيراد</th>
                <th style="text-align:left">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>مبيعات الكاش (نقدية)</td>
                <td class="amount">${shift.cashSales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>مبيعات الشبكة (بطاقة)</td>
                <td class="amount">${shift.cardSales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>تحويلات بنكية</td>
                <td class="amount">${shift.transferSales.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>إجمالي الإيرادات</td>
                <td class="amount">${(shift.cashSales + shift.cardSales + shift.transferSales).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">مطابقة برنامج نزيل</div>
          <table>
             <thead>
                <tr>
                    <th>البيان</th>
                    <th>القيمة</th>
                    <th>الفارق</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                    <td>إجمالي الكاش والشبكة (داخلي)</td>
                    <td class="amount">${systemTotal.toFixed(2)}</td>
                    <td rowspan="2" style="vertical-align: middle; text-align: center; font-weight: bold;">
                        ${matchDiff === 0 
                            ? '<span class="status-success">✅ متطابق</span>' 
                            : matchDiff > 0 
                                ? `<span class="status-warning">زيادة (+${Math.abs(matchDiff).toFixed(2)})</span>`
                                : `<span class="status-danger">عجز (-${Math.abs(matchDiff).toFixed(2)})</span>`
                        }
                    </td>
                </tr>
                <tr>
                    <td>رقم برنامج نزيل</td>
                    <td class="amount">${nazeelAmount.toFixed(2)}</td>
                </tr>
             </tbody>
          </table>

          <div class="section-title">حركة الصندوق (الجرد النقدي)</div>
          <table>
            <thead>
              <tr>
                <th>العملية</th>
                <th style="text-align:left">القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>رصيد بداية المدة</td>
                <td class="amount">${shift.startingCash.toFixed(2)}</td>
              </tr>
              <tr>
                <td>+ إضافة مبيعات الكاش</td>
                <td class="amount">${shift.cashSales.toFixed(2)}</td>
              </tr>
              <tr>
                <td>- المصروفات ${shift.expensesNote ? `(${shift.expensesNote})` : ''}</td>
                <td class="amount text-red-600">(${shift.expenses.toFixed(2)})</td>
              </tr>
              <tr style="background: #f0fdf4;">
                <td>= الرصيد المتوقع في الدرج</td>
                <td class="amount">${shift.expectedCash.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td>الجرد الفعلي (العد)</td>
                <td class="amount">${shift.actualCash.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align:center; font-weight:bold; padding: 15px;">
                   حالة العجز / الزيادة: 
                   <span class="${shift.discrepancy === 0 ? 'status-success' : shift.discrepancy > 0 ? 'status-warning' : 'status-danger'}">
                     ${shift.discrepancy === 0 ? 'صندوق مطابق (0.00)' : shift.discrepancy > 0 ? `زيادة (+${shift.discrepancy.toFixed(2)})` : `عجز (${shift.discrepancy.toFixed(2)})`}
                   </span>
                </td>
              </tr>
            </tbody>
          </table>

          ${shift.notes ? `
            <div class="section-title">ملاحظات الموظف</div>
            <div style="border: 1px dashed #ccc; padding: 10px; border-radius: 4px; margin-bottom: 20px;">
              ${shift.notes}
            </div>
          ` : ''}

          <div class="signatures">
            <div class="sig-line">توقيع الموظف</div>
          </div>
        </div>
        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Summary Calculations
  const totalFilteredSales = filteredShifts.reduce((sum, s) => sum + s.cashSales + s.cardSales + s.transferSales, 0);
  const totalFilteredShortage = filteredShifts.reduce((acc, curr) => (curr.discrepancy < 0 ? acc + Math.abs(curr.discrepancy) : acc), 0);
  const totalFilteredExcess = filteredShifts.reduce((acc, curr) => (curr.discrepancy > 0 ? acc + curr.discrepancy : acc), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">تقارير الورديات</h2>
          <p className="text-gray-500">السجل التاريخي والتقارير المخصصة</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-gray-500 font-medium">{filteredShifts.length} وردية</span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-semibold">
          <Filter className="w-5 h-5" />
          <span>تصفية التقارير</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-500 mb-1">من تاريخ</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">إلى تاريخ</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">الموظف</label>
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">الكل</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="مسح الفلتر"
             >
                <X className="w-4 h-4" />
                <span className="hidden md:inline">مسح</span>
             </button>
          </div>
        </div>

        {/* Summary Report Box */}
        {(startDate || endDate || selectedUser !== 'all') && (
            <div className="mt-6 pt-4 border-t border-gray-100 bg-blue-50/50 -mx-5 -mb-5 p-5 rounded-b-xl flex flex-wrap gap-6 justify-around">
                <div className="text-center">
                    <span className="block text-xs text-gray-500 uppercase tracking-wider">إجمالي المبيعات</span>
                    <span className="text-xl font-bold text-blue-700">{totalFilteredSales.toLocaleString()} ر.س</span>
                </div>
                <div className="text-center">
                    <span className="block text-xs text-gray-500 uppercase tracking-wider">إجمالي العجز</span>
                    <span className="text-xl font-bold text-red-600">{totalFilteredShortage.toLocaleString()} ر.س</span>
                </div>
                <div className="text-center">
                    <span className="block text-xs text-gray-500 uppercase tracking-wider">إجمالي الزيادة</span>
                    <span className="text-xl font-bold text-emerald-600">{totalFilteredExcess.toLocaleString()} ر.س</span>
                </div>
            </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredShifts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                لا توجد ورديات مطابقة لخيارات البحث
            </div>
        ) : (
            filteredShifts.map((shift) => (
            <div key={shift.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                {new Date(shift.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                <span className="text-xs font-normal px-2 py-1 bg-gray-100 rounded-full text-gray-500">
                                    {new Date(shift.endTime).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <UserIcon className="w-3 h-3" />
                                <span>{shift.userName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handlePrintShift(shift)}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                                title="طباعة التقرير"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">طباعة (A4)</span>
                            </button>

                            <div className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1
                            ${shift.discrepancy === 0 ? 'bg-emerald-50 text-emerald-600' : 
                                shift.discrepancy > 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                            }`}>
                            {shift.discrepancy === 0 ? <Minus className="w-4 h-4" /> : 
                                shift.discrepancy > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                            }
                            {shift.discrepancy === 0 ? 'مطابق' : Math.abs(shift.discrepancy).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-50 text-sm">
                        <div>
                        <span className="block text-gray-400 text-xs mb-1">مبيعات الكاش</span>
                        <span className="font-semibold text-gray-700">{shift.cashSales.toFixed(2)}</span>
                        </div>
                        <div>
                        <span className="block text-gray-400 text-xs mb-1">مبيعات الشبكة</span>
                        <span className="font-semibold text-gray-700">{shift.cardSales.toFixed(2)}</span>
                        </div>
                        <div>
                        <span className="block text-gray-400 text-xs mb-1">مطابقة نزيل</span>
                        <span className={`font-semibold ${(shift.externalSystemData || 0) - (shift.cashSales + shift.cardSales) === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {shift.externalSystemData ? ((shift.externalSystemData || 0) - (shift.cashSales + shift.cardSales) === 0 ? 'مطابق' : 'فارق') : '-'}
                        </span>
                        </div>
                        <div>
                        <span className="block text-gray-400 text-xs mb-1">الرصيد الفعلي</span>
                        <span className="font-semibold text-emerald-600">{shift.actualCash.toFixed(2)}</span>
                        </div>
                    </div>

                    {shift.aiAnalysis && (
                        <div className="mt-4 bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 leading-relaxed">
                            <strong className="block mb-1 text-indigo-900">ملخص الذكاء الاصطناعي:</strong>
                            {shift.aiAnalysis}
                        </div>
                    )}
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ShiftHistory;
