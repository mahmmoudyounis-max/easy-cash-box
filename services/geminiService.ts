import { GoogleGenAI } from "@google/genai";
import { ShiftData } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeShift = async (shift: ShiftData): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "الخدمة غير متوفرة (مفتاح API مفقود).";

  const prompt = `
    أنت مساعد محاسبي ذكي. قم بتحليل بيانات إغلاق الوردية التالية واكتب تقريرًا موجزًا واحترافيًا باللغة العربية للمدير.
    
    البيانات:
    - الموظف: ${shift.userName}
    - التاريخ: ${new Date(shift.date).toLocaleDateString('ar-EG')}
    - مبيعات الكاش: ${shift.cashSales}
    - مبيعات الشبكة (البطاقة): ${shift.cardSales}
    - التحويلات البنكية: ${shift.transferSales}
    - المصروفات النثرية: ${shift.expenses}
    - العجز/الزيادة في الصندوق: ${shift.discrepancy}
    - ملاحظات الموظف: ${shift.notes || 'لا يوجد'}

    المطلوب:
    1. ملخص سريع للأداء المالي.
    2. إذا كان هناك عجز أو زيادة (Discrepancy != 0)، قدم نصيحة أو تنبيهًا بأسلوب مهذب.
    3. تنسيق النص بشكل فقرات قصيرة وواضحة.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "لم يتم إنشاء تحليل.";
  } catch (error) {
    console.error("Error analyzing shift:", error);
    return "حدث خطأ أثناء تحليل البيانات.";
  }
};