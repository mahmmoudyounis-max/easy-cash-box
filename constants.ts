
import { User, UserRole } from './types';

export const STORAGE_KEYS = {
  SHIFTS: 'mohaseb_shifts_data',
  CURRENT_USER: 'mohaseb_current_user',
  USERS: 'mohaseb_users_list'
};

// Default admin for first time initialization
export const DEFAULT_ADMIN_USER: User = { 
  id: '1', 
  username: 'admin', 
  name: 'المدير العام', 
  password: '123', 
  role: UserRole.ADMIN 
};
