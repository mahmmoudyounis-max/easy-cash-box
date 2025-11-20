
import { ShiftData, User } from '../types';
import { STORAGE_KEYS, DEFAULT_ADMIN_USER } from '../constants';

// --- Shift Management ---

export const getShifts = (): ShiftData[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
  return data ? JSON.parse(data) : [];
};

export const saveShift = (shift: ShiftData): void => {
  const shifts = getShifts();
  const updatedShifts = [shift, ...shifts];
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(updatedShifts));
};

export const getStats = () => {
  const shifts = getShifts();
  const totalSales = shifts.reduce((acc, curr) => acc + curr.cashSales + curr.cardSales + curr.transferSales, 0);
  const totalCash = shifts.reduce((acc, curr) => acc + curr.cashSales, 0);
  const totalCard = shifts.reduce((acc, curr) => acc + curr.cardSales, 0);
  const totalShortage = shifts.reduce((acc, curr) => (curr.discrepancy < 0 ? acc + Math.abs(curr.discrepancy) : acc), 0);
  
  return {
    totalSales,
    totalCash,
    totalCard,
    totalShortage,
    shiftCount: shifts.length
  };
};

// --- User Management ---

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (data) {
    return JSON.parse(data);
  }
  // Initialize with default admin if no users exist
  const initialUsers = [DEFAULT_ADMIN_USER];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  return initialUsers;
};

export const addUser = (newUser: User): void => {
  const users = getUsers();
  // Check if username exists
  if (users.some(u => u.username === newUser.username)) {
    throw new Error('اسم المستخدم موجود بالفعل');
  }
  const updatedUsers = [...users, newUser];
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  // Prevent deleting the last admin
  const userToDelete = users.find(u => u.id === userId);
  if (userToDelete?.username === 'admin') {
    throw new Error('لا يمكن حذف المدير العام الأساسي');
  }
  
  const updatedUsers = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
};

// --- Backup & Restore ---

export const createBackup = (): string => {
  const shifts = localStorage.getItem(STORAGE_KEYS.SHIFTS);
  const users = localStorage.getItem(STORAGE_KEYS.USERS);

  const backupData = {
    shifts: shifts ? JSON.parse(shifts) : [],
    users: users ? JSON.parse(users) : [DEFAULT_ADMIN_USER],
    exportDate: new Date().toISOString(),
    systemVersion: '1.0'
  };

  return JSON.stringify(backupData, null, 2);
};

export const restoreBackup = (jsonString: string): void => {
  try {
    const data = JSON.parse(jsonString);
    
    // Basic validation
    if (!data.users || !Array.isArray(data.users)) {
      throw new Error('ملف غير صالح: بيانات المستخدمين مفقودة');
    }
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(data.shifts || []));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    
  } catch (error) {
    console.error('Restore failed', error);
    throw new Error('فشل استعادة النسخة الاحتياطية. تأكد من أن الملف صحيح ولم يتم التعديل عليه.');
  }
};
