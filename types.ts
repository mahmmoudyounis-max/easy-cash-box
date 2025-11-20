
export enum UserRole {
  ADMIN = 'مدير',
  CASHIER = 'كاشير'
}

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string; // In a real app, this would be hashed
  role: UserRole;
}

export interface ShiftData {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO string
  startTime: string;
  endTime: string;
  
  // Opening
  startingCash: number;

  // Revenues
  cashSales: number;
  cardSales: number; // Network/Span
  transferSales: number; // Bank Transfer
  
  // External System Matching
  externalSystemData?: number; // Total Sales recorded in external software

  // Expenses/Withdrawals
  expenses: number;
  expensesNote?: string;

  // Closing
  expectedCash: number; // Calculated
  actualCash: number; // Counted
  discrepancy: number; // actual - expected

  notes: string;
  aiAnalysis?: string; // Analysis from Gemini
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'NEW_SHIFT' | 'HISTORY' | 'USERS';
