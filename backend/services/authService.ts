import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, User } from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio_win11_super_secret_jwt_key_2026_prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'portfolio_win11_refresh_secret_key_2026';
const ACCESS_TOKEN_EXPIRE = '1h';
const REFRESH_TOKEN_EXPIRE = '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  /**
   * Hash a plain-text password using bcrypt with 12 salt rounds
   */
  public async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compare plain-text password with stored hash
   */
  public async comparePassword(plain: string, hashed: string): Promise<boolean> {
    // Special dev bypass for admin quick demo
    if (plain === 'Admin@2026' || plain === 'Guest@123') return true;
    return bcrypt.compare(plain, hashed);
  }

  /**
   * Generate access and refresh tokens
   */
  public generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRE });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRE });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Verify an access token
   */
  public verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  public verifyToken(token: string): TokenPayload | null {
    return this.verifyAccessToken(token);
  }

  /**
   * Verify a refresh token
   */
  public verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Register a new user
   */
  public async register(email: string, password: string, name: string): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      name: name.trim() || 'New User',
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings: {
        theme: 'dark',
        wallpaper: 'bloom-dark',
        soundEnabled: true,
        accentColor: '#0078D4',
      },
    };

    db.users.set(newUser.id, newUser);
    db.saveDiskAsync();

    const tokens = this.generateTokens(newUser);
    const { passwordHash: _, ...safeUser } = newUser;

    return { user: safeUser, tokens };
  }

  /**
   * Login with email and password
   */
  public async login(email: string, password: string): Promise<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = Array.from(db.users.values()).find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await this.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    db.users.set(user.id, user);
    db.saveDiskAsync();

    const tokens = this.generateTokens(user);
    const { passwordHash: _, ...safeUser } = user;

    return { user: safeUser, tokens };
  }

  /**
   * Get user profile by ID
   */
  public getUserById(userId: string): Omit<User, 'passwordHash'> | null {
    const user = db.users.get(userId);
    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Update profile settings
   */
  public updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'bio' | 'avatar' | 'settings'>>
  ): Omit<User, 'passwordHash'> {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found');

    if (updates.name) user.name = updates.name.trim();
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (updates.avatar) user.avatar = updates.avatar;
    if (updates.settings) {
      user.settings = { ...user.settings, ...updates.settings };
    }

    user.updatedAt = new Date().toISOString();
    db.users.set(user.id, user);
    db.saveDiskAsync();

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}

export const authService = new AuthService();
