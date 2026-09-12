import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  bio?: string;
  settings?: {
    theme?: 'light' | 'dark';
    wallpaper?: string;
    soundEnabled?: boolean;
    accentColor?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lockScreen: () => void;
  unlockScreen: (passwordOrPin?: string) => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'win11_portfolio_jwt_token';
const USER_KEY = 'win11_portfolio_user_data';
const LOCK_KEY = 'win11_portfolio_is_locked';
export const DEFAULT_AVATAR_KEY = 'win11_default_avatar';
export const ABOUT_PROFILE_KEY = 'win11_custom_about_profile';

const getInitialAvatar = (): string => {
  try {
    const savedAvatar = localStorage.getItem(DEFAULT_AVATAR_KEY);
    if (savedAvatar) return savedAvatar;
    const customProfile = localStorage.getItem(ABOUT_PROFILE_KEY);
    if (customProfile) {
      const parsed = JSON.parse(customProfile);
      if (parsed?.avatar) return parsed.avatar;
    }
  } catch {}
  return '/avatar.png';
};

const getInitialName = (): string => {
  try {
    const customProfile = localStorage.getItem(ABOUT_PROFILE_KEY);
    if (customProfile) {
      const parsed = JSON.parse(customProfile);
      if (parsed?.name) return parsed.name;
    }
  } catch {}
  return 'Anish Jethva';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const defaultAvatar = getInitialAvatar();
    const defaultName = getInitialName();

    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return {
            ...parsed,
            avatar: defaultAvatar || parsed.avatar || '/avatar.png',
            name: parsed.name || defaultName,
          };
        }
      } catch {}
    }
    // Default logged in user is Anish Jethva (Owner)
    return {
      id: 'usr_admin_anish',
      email: 'anish.jethva2006@gmail.com',
      name: defaultName,
      role: 'admin',
      avatar: defaultAvatar,
      bio: 'Full Stack & AI Engineer',
      settings: {
        theme: 'dark',
        wallpaper: 'bloom-dark',
        soundEnabled: true,
        accentColor: '#0078D4',
      },
    };
  });

  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize profile changes across tabs or custom events
  useEffect(() => {
    const handleProfileUpdateEvent = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, ...detail };
          return updated;
        });
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DEFAULT_AVATAR_KEY && e.newValue) {
        setUser((prev) => (prev ? { ...prev, avatar: e.newValue || prev.avatar } : prev));
      }
    };

    window.addEventListener('win11_profile_updated', handleProfileUpdateEvent as EventListener);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('win11_profile_updated', handleProfileUpdateEvent as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Validate or fetch profile on mount if token exists
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Keep local fallback
        });
    }
  }, [token]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Login failed' };
      }

      setToken(data.tokens.accessToken);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.tokens.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setIsLocked(false);
      localStorage.setItem(LOCK_KEY, 'false');
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const register = async (email: string, pass: string, name: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, name }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        return { success: false, error: data.error || 'Registration failed' };
      }

      setToken(data.tokens.accessToken);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.tokens.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setIsLocked(false);
      localStorage.setItem(LOCK_KEY, 'false');
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser({
      id: 'usr_guest_demo',
      email: 'guest@portfolio.dev',
      name: 'Guest User',
      role: 'guest',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const lockScreen = () => {
    setIsLocked(true);
    localStorage.setItem(LOCK_KEY, 'true');
  };

  const unlockScreen = async (passwordOrPin?: string): Promise<boolean> => {
    // If no password supplied (e.g. click swipe/sign-in) or matches, unlock
    if (!passwordOrPin || passwordOrPin === 'Admin@2026' || passwordOrPin === '1234' || passwordOrPin.length > 0) {
      setIsLocked(false);
      localStorage.setItem(LOCK_KEY, 'false');
      return true;
    }
    return false;
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (data.avatar) {
        try {
          localStorage.setItem(DEFAULT_AVATAR_KEY, data.avatar);
        } catch {}
      }
      if (token) {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
      }
      if (user) {
        const updated = { ...user, ...data };
        setUser(updated);
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(updated));
        } catch {}
      } else {
        const defaultAvatar = data.avatar || getInitialAvatar();
        const defaultName = data.name || getInitialName();
        const newUser: UserProfile = {
          id: 'usr_admin_anish',
          email: 'anish.jethva2006@gmail.com',
          name: defaultName,
          role: 'admin',
          avatar: defaultAvatar,
          bio: 'Full Stack & AI Engineer',
          settings: {
            theme: 'dark',
            wallpaper: 'bloom-dark',
            soundEnabled: true,
            accentColor: '#0078D4',
          },
          ...data,
        };
        setUser(newUser);
        try {
          localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        } catch {}
      }
      window.dispatchEvent(new CustomEvent('win11_profile_updated', { detail: data }));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && user.role !== 'guest',
        isLocked,
        isLoading,
        token,
        login,
        register,
        logout,
        lockScreen,
        unlockScreen,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
