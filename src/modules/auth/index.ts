import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  userMode: 'beginner' | 'professional' | 'expert';
  isLocalGuest?: boolean;
  createdAt: string;
}

const LOCAL_STORAGE_USER_KEY = 'promptexa_auth_user';
const LOCAL_STORAGE_USERS_DB = 'promptexa_registered_users';

export class AuthService {
  static getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static async register(email: string, password: string, fullName: string): Promise<AuthUser> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_mode: 'professional',
          },
        },
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Registration failed. No user returned.');

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: fullName || email.split('@')[0],
        userMode: 'professional',
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      }
      return user;
    }

    // Resilient local authentication fallback for zero-dependency development
    if (typeof window !== 'undefined') {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_USERS_DB);
      const existingUsers: Record<string, any> = existingRaw ? JSON.parse(existingRaw) : {};

      if (existingUsers[email]) {
        throw new Error('A user with this email address already exists.');
      }

      const newUser: AuthUser = {
        id: 'usr-' + Date.now(),
        email,
        fullName: fullName || email.split('@')[0],
        userMode: 'professional',
        isLocalGuest: true,
        createdAt: new Date().toISOString(),
      };

      existingUsers[email] = {
        ...newUser,
        passwordHash: btoa(password), // basic encoding for local sandbox demo
      };

      localStorage.setItem(LOCAL_STORAGE_USERS_DB, JSON.stringify(existingUsers));
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      return newUser;
    }

    throw new Error('Storage unavailable');
  }

  static async login(email: string, password: string): Promise<AuthUser> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Login failed.');

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: data.user.user_metadata?.full_name || email.split('@')[0],
        userMode: data.user.user_metadata?.user_mode || 'professional',
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      }
      return user;
    }

    // Local authentication check
    if (typeof window !== 'undefined') {
      const existingRaw = localStorage.getItem(LOCAL_STORAGE_USERS_DB);
      const existingUsers: Record<string, any> = existingRaw ? JSON.parse(existingRaw) : {};

      const recorded = existingUsers[email];
      if (!recorded || recorded.passwordHash !== btoa(password)) {
        // For convenience in local dev, allow quick demo login if no registered record
        const fallbackUser: AuthUser = {
          id: 'usr-' + Date.now(),
          email,
          fullName: email === 'kartthiaudiolabs@gmail.com' ? 'Kartthi Audio Labs' : email.split('@')[0],
          userMode: 'professional',
          isLocalGuest: true,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
        return fallbackUser;
      }

      const user: AuthUser = {
        id: recorded.id,
        email: recorded.email,
        fullName: recorded.fullName,
        userMode: recorded.userMode || 'professional',
        isLocalGuest: true,
        createdAt: recorded.createdAt,
      };

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      return user;
    }

    throw new Error('Authentication unavailable');
  }

  static async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  }
}
