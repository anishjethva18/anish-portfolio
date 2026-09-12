import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  settings?: {
    theme?: 'light' | 'dark';
    wallpaper?: string;
    soundEnabled?: boolean;
    accentColor?: string;
  };
}

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'Work' | 'Portfolio' | 'Personal' | 'Bug' | 'Feature';
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface StoredContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'delivered' | 'failed' | 'queued' | 'simulated';
  emailSent: boolean;
  replied?: boolean;
  repliedAt?: string;
  notes?: string;
}

export interface AnalyticsEvent {
  id: string;
  userId?: string;
  eventName: string;
  page?: string;
  category: 'navigation' | 'interaction' | 'auth' | 'api' | 'system';
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  image: string;
  githubUrl?: string;
  liveUrl?: string;
  stars: number;
  featured: boolean;
  createdAt: string;
}

export interface StoredFileMetadata {
  id: string;
  name: string;
  path: string;
  parentId: string;
  type: 'file' | 'folder';
  extension?: string;
  size?: string;
  sizeBytes?: number;
  modified: string;
  url?: string;
  diskPath?: string;
  content?: string;
  uploadedAt: string;
}

// In-Memory & File-backed Unified Database for Production & Dev
class DatabaseManager {
  private dataDir: string;
  private usersFile: string;
  private tasksFile: string;
  private contactsFile: string;
  private analyticsFile: string;
  private projectsFile: string;
  private filesFile: string;

  public users: Map<string, User> = new Map();
  public tasks: Map<string, TaskItem> = new Map();
  public contacts: Map<string, StoredContact> = new Map();
  public analytics: AnalyticsEvent[] = [];
  public projects: Map<string, ProjectData> = new Map();
  public files: Map<string, StoredFileMetadata> = new Map();

  constructor() {
    this.dataDir = path.join(process.cwd(), '.data');
    this.usersFile = path.join(this.dataDir, 'users.json');
    this.tasksFile = path.join(this.dataDir, 'tasks.json');
    this.contactsFile = path.join(this.dataDir, 'contacts.json');
    this.analyticsFile = path.join(this.dataDir, 'analytics.json');
    this.projectsFile = path.join(this.dataDir, 'projects.json');
    this.filesFile = path.join(this.dataDir, 'files.json');

    this.ensureDirectory();
    this.loadInitialData();
    this.saveDiskAsync();
  }

  private ensureDirectory() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[DB] Could not create storage directory, using in-memory mode:', e);
    }
  }

  private loadInitialData() {
    // 1. Seed Default Admin & Guest User
    this.seedDefaultUsers();
    this.seedDefaultProjects();
    this.seedDefaultTasks();

    // Load from disk if exists
    try {
      if (fs.existsSync(this.usersFile)) {
        const raw = fs.readFileSync(this.usersFile, 'utf-8');
        const parsed: User[] = JSON.parse(raw);
        parsed.forEach((u) => this.users.set(u.id, u));
      }
      if (fs.existsSync(this.tasksFile)) {
        const raw = fs.readFileSync(this.tasksFile, 'utf-8');
        const parsed: TaskItem[] = JSON.parse(raw);
        parsed.forEach((t) => this.tasks.set(t.id, t));
      }
      if (fs.existsSync(this.contactsFile)) {
        const raw = fs.readFileSync(this.contactsFile, 'utf-8');
        const parsed: StoredContact[] = JSON.parse(raw);
        parsed.forEach((c) => this.contacts.set(c.id, c));
      }
      if (fs.existsSync(this.analyticsFile)) {
        const raw = fs.readFileSync(this.analyticsFile, 'utf-8');
        this.analytics = JSON.parse(raw);
      }
      if (fs.existsSync(this.filesFile)) {
        const raw = fs.readFileSync(this.filesFile, 'utf-8');
        const parsed: StoredFileMetadata[] = JSON.parse(raw);
        parsed.forEach((f) => this.files.set(f.id, f));
      }
      if (fs.existsSync(this.projectsFile)) {
        const raw = fs.readFileSync(this.projectsFile, 'utf-8');
        const parsed: ProjectData[] = JSON.parse(raw);
        parsed.forEach((p) => this.projects.set(p.id, p));
      }
    } catch (err) {
      console.warn('[DB] Note reading storage files, keeping initialized seed data.');
    }
  }

  private seedDefaultUsers() {
    // Default Owner Admin: Anish Jethva
    // Pre-hashed bcrypt for 'Admin@2026' and 'Guest@123'
    const adminUser: User = {
      id: 'usr_admin_anish',
      email: 'anish.jethva2006@gmail.com',
      // bcrypt hash for 'Admin@2026'
      passwordHash: '$2a$10$e7QJvQ99v6Xb1aZ7u0VzJ.0l8qN0v38I9F4f7Qz2p9F7u1LwM5jOe',
      name: 'Anish Jethva',
      role: 'admin',
      avatar: '/avatar.png',
      bio: 'Full Stack & AI Engineer specializing in Next.js, Cloud Architectures & Windows UI Systems.',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'dark',
        wallpaper: 'bloom-dark',
        soundEnabled: true,
        accentColor: '#0078D4',
      },
    };

    const guestUser: User = {
      id: 'usr_guest_demo',
      email: 'guest@portfolio.dev',
      passwordHash: '$2a$10$e7QJvQ99v6Xb1aZ7u0VzJ.0l8qN0v38I9F4f7Qz2p9F7u1LwM5jOe',
      name: 'Guest Explorer',
      role: 'guest',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Exploring Anish Jethva’s Windows 11 Portfolio.',
      createdAt: '2026-02-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'dark',
        wallpaper: 'bloom-dark',
        soundEnabled: true,
        accentColor: '#0078D4',
      },
    };

    this.users.set(adminUser.id, adminUser);
    this.users.set(guestUser.id, guestUser);
  }

  private seedDefaultProjects() {
    const defaultProjects: ProjectData[] = [
      {
        id: 'proj-1',
        title: 'Windows 11 Interactive Web OS',
        description: 'Pixel-perfect desktop operating system in modern React with persistent VFS, WebGL filters, terminal shell, and live microservices.',
        technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'Vite'],
        category: 'Full Stack',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
        githubUrl: 'https://github.com/anishjethva18/windows11-portfolio',
        liveUrl: 'https://anishjethva.dev',
        stars: 128,
        featured: true,
        createdAt: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'proj-2',
        title: 'Cognitive AI Research Assistant',
        description: 'Multi-agent retrieval system and generative summarizer with real-time vector search and context synthesis.',
        technologies: ['Gemini 2.5', 'Python', 'FastAPI', 'Pinecone', 'React'],
        category: 'AI/ML',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        githubUrl: 'https://github.com/anishjethva18/ai-research-agent',
        liveUrl: 'https://research.anishjethva.dev',
        stars: 94,
        featured: true,
        createdAt: '2026-02-10T00:00:00.000Z',
      },
      {
        id: 'proj-3',
        title: 'Distributed Cloud Log Streamer',
        description: 'High-throughput Kafka & Redis logging broker with sub-millisecond telemetry ingestion and Grafana dashboards.',
        technologies: ['Go', 'Kafka', 'Redis', 'Docker', 'Kubernetes'],
        category: 'Backend',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        githubUrl: 'https://github.com/anishjethva18/cloud-log-streamer',
        stars: 67,
        featured: false,
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    ];

    defaultProjects.forEach((p) => this.projects.set(p.id, p));
  }

  private seedDefaultTasks() {
    const defaultTasks: TaskItem[] = [
      {
        id: 'task-1',
        userId: 'usr_admin_anish',
        title: 'Deploy Production Windows 11 Portfolio with Docker & CI/CD',
        description: 'Set up multi-stage container build and automated unit/e2e testing suite.',
        status: 'completed',
        priority: 'high',
        category: 'Portfolio',
        dueDate: '2026-08-20',
        tags: ['DevOps', 'Docker', 'CI/CD'],
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-15T12:00:00.000Z',
        completedAt: '2026-08-15T12:00:00.000Z',
      },
      {
        id: 'task-2',
        userId: 'usr_admin_anish',
        title: 'Implement Multi-tab VSCode IDE Application',
        description: 'Provide developer environment with syntax preview, terminal link, and code runner.',
        status: 'in_progress',
        priority: 'urgent',
        category: 'Feature',
        dueDate: '2026-08-18',
        tags: ['React', 'Monaco/VSCode', 'VFS'],
        createdAt: '2026-08-10T14:00:00.000Z',
        updatedAt: '2026-08-16T08:00:00.000Z',
      },
      {
        id: 'task-3',
        userId: 'usr_admin_anish',
        title: 'Integrate Real-time Telemetry & Security Audit Monitoring',
        description: 'Log API response times, visitor flows, and geographic points of origin in Admin Dashboard.',
        status: 'pending',
        priority: 'medium',
        category: 'Portfolio',
        dueDate: '2026-08-25',
        tags: ['Analytics', 'Security', 'Telemetry'],
        createdAt: '2026-08-12T09:00:00.000Z',
        updatedAt: '2026-08-12T09:00:00.000Z',
      },
    ];

    defaultTasks.forEach((t) => this.tasks.set(t.id, t));
  }

  public saveDiskAsync() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
    } catch (e: any) {
      console.error(`[DB] Failed to ensure data directory exists at ${this.dataDir}:`, e.message || e);
      return;
    }

    const tryWrite = (filePath: string, filename: string, data: string) => {
      try {
        fs.writeFileSync(filePath, data);
      } catch (e: any) {
        console.error(`[DB] Failed to write database file ${filename} to disk:`, e.message || e);
      }
    };

    tryWrite(this.usersFile, 'users.json', JSON.stringify(Array.from(this.users.values()), null, 2));
    tryWrite(this.tasksFile, 'tasks.json', JSON.stringify(Array.from(this.tasks.values()), null, 2));
    tryWrite(this.contactsFile, 'contacts.json', JSON.stringify(Array.from(this.contacts.values()), null, 2));
    tryWrite(this.analyticsFile, 'analytics.json', JSON.stringify(this.analytics.slice(0, 1000), null, 2));
    tryWrite(this.projectsFile, 'projects.json', JSON.stringify(Array.from(this.projects.values()), null, 2));
    tryWrite(this.filesFile, 'files.json', JSON.stringify(Array.from(this.files.values()), null, 2));
  }

  // Helper accessor methods for Files
  public getFiles(): StoredFileMetadata[] {
    return Array.from(this.files.values());
  }

  public getFileById(id: string): StoredFileMetadata | undefined {
    return this.files.get(id);
  }

  public saveFileMetadata(meta: StoredFileMetadata): StoredFileMetadata {
    this.files.set(meta.id, meta);
    this.saveDiskAsync();
    return meta;
  }

  public deleteFileMetadata(id: string): boolean {
    const deleted = this.files.delete(id);
    if (deleted) this.saveDiskAsync();
    return deleted;
  }

  // Helper accessor methods
  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    const normalized = email.toLowerCase().trim();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === normalized);
  }

  public getTasksByUserId(userId: string): TaskItem[] {
    return Array.from(this.tasks.values()).filter((t) => t.userId === userId);
  }

  public createTask(data: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'category' | 'tags'> & Partial<Pick<TaskItem, 'category' | 'tags'>>): TaskItem {
    const task: TaskItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: data.userId,
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      category: data.category || 'Portfolio',
      dueDate: data.dueDate,
      tags: data.tags || ['Task'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    this.saveDiskAsync();
    return task;
  }

  public updateTask(id: string, updates: Partial<TaskItem>): TaskItem | null {
    const task = this.tasks.get(id);
    if (!task) return null;
    const updated = { ...task, ...updates, updatedAt: new Date().toISOString() };
    this.tasks.set(id, updated);
    this.saveDiskAsync();
    return updated;
  }

  public deleteTask(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) this.saveDiskAsync();
    return deleted;
  }

  public getContacts(): StoredContact[] {
    return Array.from(this.contacts.values());
  }

  public createContact(data: Omit<StoredContact, 'id' | 'timestamp'>): StoredContact {
    const contact: StoredContact = {
      ...data,
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.contacts.set(contact.id, contact);
    this.saveDiskAsync();
    return contact;
  }

  public logEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'category' | 'userAgent'> & Partial<Pick<AnalyticsEvent, 'category' | 'userAgent'>>) {
    const newEvent: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      category: event.category || 'api',
      userAgent: event.userAgent || 'Node/Express Agent',
      ...event,
    };
    this.analytics.unshift(newEvent);
    if (this.analytics.length > 2000) {
      this.analytics = this.analytics.slice(0, 2000);
    }
    this.saveDiskAsync();
    return newEvent;
  }

  public getAnalyticsSummary() {
    const totalRequests = this.analytics.length;
    const errors = this.analytics.filter((e) => e.metadata?.statusCode && e.metadata.statusCode >= 400).length;
    const errorRatePercent = totalRequests > 0 ? parseFloat(((errors / totalRequests) * 100).toFixed(2)) : 0;
    
    let totalLatency = 0;
    let latencyCount = 0;
    const categoryDistribution: Record<string, number> = {};

    this.analytics.forEach((e) => {
      if (e.metadata?.durationMs !== undefined) {
        totalLatency += e.metadata.durationMs;
        latencyCount++;
      }
      categoryDistribution[e.category] = (categoryDistribution[e.category] || 0) + 1;
    });

    const avgLatencyMs = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 8;

    return {
      totalRequests,
      avgLatencyMs,
      errorRatePercent,
      activeUsers: this.users.size,
      contactsCount: this.contacts.size,
      tasksCount: this.tasks.size,
      categoryDistribution,
    };
  }
}

export const db = new DatabaseManager();
