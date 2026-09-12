import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOS } from '../../context/OSContext';
import { useAuth } from '../../context/AuthContext';
import { PORTFOLIO_USER, EXPERIENCES, EDUCATION } from '../../data/portfolioData';
import {
  MapPin,
  Mail,
  Github,
  Linkedin,
  Instagram,
  Download,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  ExternalLink,
  Star,
  BookOpen,
  Users,
  Edit3,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Camera,
  Check,
  Globe,
  Upload,
  FolderOpen,
  Link as LinkIcon,
  Image as ImageIcon,
  HardDrive,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface AboutProfileData {
  name: string;
  title: string;
  location: string;
  avatar: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  instagram: string;
  goals: string[];
  publicRepos: number;
  totalStars: number;
  followers: number;
  experiences: Array<{
    role: string;
    company: string;
    location: string;
    period: string;
    description: string[];
    skills: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    period: string;
    details: string;
  }>;
}

const DEFAULT_PROFILE_DATA: AboutProfileData = {
  name: PORTFOLIO_USER.name,
  title: PORTFOLIO_USER.title,
  location: PORTFOLIO_USER.location,
  avatar: PORTFOLIO_USER.avatar,
  bio: PORTFOLIO_USER.bio,
  email: PORTFOLIO_USER.email,
  github: PORTFOLIO_USER.github,
  linkedin: PORTFOLIO_USER.linkedin,
  instagram: PORTFOLIO_USER.instagram || '',
  goals: [...PORTFOLIO_USER.goals],
  publicRepos: 24,
  totalStars: 142,
  followers: 88,
  experiences: EXPERIENCES.map((e) => ({
    role: e.role,
    company: e.company,
    location: e.location,
    period: e.period,
    description: [...e.description],
    skills: [...e.skills],
  })),
  education: EDUCATION.map((edu) => ({
    degree: edu.degree,
    institution: edu.institution,
    period: edu.period,
    details: edu.details,
  })),
};

export const AboutApp: React.FC = () => {
  const { openApp, addNotification, files } = useOS();
  const { updateProfile } = useAuth();

  // Load custom edited profile data from localStorage
  const [profile, setProfile] = useState<AboutProfileData>(() => {
    try {
      const saved = localStorage.getItem('win11_custom_about_profile');
      const savedAvatar = localStorage.getItem('win11_default_avatar');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (savedAvatar) parsed.avatar = savedAvatar;
        return parsed;
      }
      if (savedAvatar) {
        return { ...DEFAULT_PROFILE_DATA, avatar: savedAvatar };
      }
    } catch {}
    return DEFAULT_PROFILE_DATA;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<AboutProfileData>(profile);

  // Avatar Management Modal State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'upload' | 'this_pc' | 'url'>('upload');
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string>(profile.avatar);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isDragOverAvatar, setIsDragOverAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalFileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit form when opening edit modal
  useEffect(() => {
    if (isEditing) {
      setEditForm(profile);
    }
  }, [isEditing, profile]);

  // Sync avatar preview when modal opens
  useEffect(() => {
    if (isAvatarModalOpen) {
      setAvatarPreviewUrl(profile.avatar);
      setCustomUrlInput(profile.avatar.startsWith('http') ? profile.avatar : '');
    }
  }, [isAvatarModalOpen, profile.avatar]);

  // Discover all system images from VFS and built-in assets
  const systemImages = useMemo(() => {
    const list: Array<{ name: string; path: string; url: string; source: string }> = [
      {
        name: 'Default Portfolio Avatar',
        path: 'C:/Users/Anish Jethva/avatar.png',
        url: '/avatar.png',
        source: 'System Avatar',
      },
      {
        name: 'Professional Portrait',
        path: 'C:/Users/Anish Jethva/Pictures/Portrait.png',
        url: '/avatar.png',
        source: 'Pictures',
      },
      {
        name: 'Windows 11 Bloom Dark',
        path: 'C:/Windows/Web/Wallpaper/bloom-dark.jpg',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        source: 'Wallpapers',
      },
      {
        name: 'Windows 11 Glow Minimal',
        path: 'C:/Windows/Web/Wallpaper/glow.jpg',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
        source: 'Wallpapers',
      },
      {
        name: 'Developer Workspace',
        path: 'C:/Users/Anish Jethva/Pictures/Desk.jpg',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        source: 'Pictures',
      },
      {
        name: 'Cyberpunk Code',
        path: 'C:/Users/Anish Jethva/Pictures/Cyberpunk.jpg',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
        source: 'Downloads',
      },
    ];

    // Scan actual files in VFS
    if (files && files.length > 0) {
      files.forEach((f) => {
        if (f.type === 'file' && ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(f.extension?.toLowerCase() || '')) {
          const contentUrl = f.content || (f.path.startsWith('/') ? f.path : '');
          if (contentUrl && !list.some((item) => item.path === f.path)) {
            list.push({
              name: f.name,
              path: f.path,
              url: contentUrl,
              source: f.path.includes('Pictures') ? 'Pictures' : f.path.includes('Desktop') ? 'Desktop' : 'This PC',
            });
          }
        }
      });
    }

    return list;
  }, [files]);

  // Handle direct file upload from device
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addNotification({
        title: 'Unsupported File',
        message: 'Please select an image file (PNG, JPG, WEBP, GIF, SVG).',
        type: 'warning',
      });
      return;
    }

    // Check size limit (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      addNotification({
        title: 'File Too Large',
        message: 'Please select an image smaller than 12MB.',
        type: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarPreviewUrl(result);
        setEditForm((prev) => ({ ...prev, avatar: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct fast apply for avatar updates
  const applyAvatar = (newAvatar: string) => {
    const updatedProfile = { ...profile, avatar: newAvatar };
    setProfile(updatedProfile);
    setEditForm((prev) => ({ ...prev, avatar: newAvatar }));
    try {
      localStorage.setItem('win11_custom_about_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('win11_default_avatar', newAvatar);
    } catch {}

    // Update global auth user profile (Start Menu, Lock Screen, Sleep Mode, Settings)
    updateProfile({ avatar: newAvatar });

    setIsAvatarModalOpen(false);
    addNotification({
      title: 'Default Profile Picture Set',
      message: 'New avatar applied across Start Menu, Sleep Mode, Lock Screen, and Portfolio.',
      type: 'success',
    });
  };

  const handleSave = () => {
    setProfile(editForm);
    try {
      localStorage.setItem('win11_custom_about_profile', JSON.stringify(editForm));
      if (editForm.avatar) {
        localStorage.setItem('win11_default_avatar', editForm.avatar);
      }
    } catch {}
    updateProfile({ avatar: editForm.avatar, name: editForm.name, bio: editForm.bio });
    setIsEditing(false);
    addNotification({
      title: 'Profile Updated',
      message: 'Your profile details and default avatar have been saved.',
      type: 'success',
    });
  };

  const handleReset = () => {
    setProfile(DEFAULT_PROFILE_DATA);
    setEditForm(DEFAULT_PROFILE_DATA);
    try {
      localStorage.removeItem('win11_custom_about_profile');
      localStorage.removeItem('win11_default_avatar');
    } catch {}
    updateProfile({ avatar: DEFAULT_PROFILE_DATA.avatar, name: DEFAULT_PROFILE_DATA.name, bio: DEFAULT_PROFILE_DATA.bio });
    setIsEditing(false);
    addNotification({
      title: 'Profile Reset',
      message: 'Restored original default profile and avatar.',
      type: 'info',
    });
  };

  return (
    <div className="h-full w-full overflow-y-auto p-6 max-w-4xl mx-auto space-y-8 select-text font-sans">
      {/* Hidden File Input for Direct Local Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const res = ev.target?.result as string;
              if (res) applyAvatar(res);
            };
            reader.readAsDataURL(file);
          }
        }}
      />

      {/* Hero Header Card */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl transform translate-x-12 -translate-y-12" />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Interactive Avatar Container with Drag-and-Drop & Camera Badge */}
          <div
            className={`relative group cursor-pointer rounded-2xl transition-all duration-300 ${
              isDragOverAvatar ? 'scale-105 ring-4 ring-cyan-300' : ''
            }`}
            onClick={() => setIsAvatarModalOpen(true)}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOverAvatar(true);
            }}
            onDragLeave={() => setIsDragOverAvatar(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOverAvatar(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const res = ev.target?.result as string;
                  if (res) applyAvatar(res);
                };
                reader.readAsDataURL(file);
              }
            }}
            title="Click or Drop image to change Profile Picture"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white/30 shadow-2xl transition-transform group-hover:scale-102"
            />
            {/* Hover overlay with Change Photo label */}
            <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
              <Camera className="w-6 h-6 mb-1 text-white drop-shadow" />
              <span className="text-[10px] font-bold tracking-wide uppercase">Change Photo</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAvatarModalOpen(true);
              }}
              className="absolute -bottom-2 -right-2 p-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white shadow-lg cursor-pointer transition-all border-2 border-white"
              title="Change Profile Picture (Upload or Pick)"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{profile.name}</h1>
                <p className="text-sm font-medium text-blue-100">{profile.title}</p>
              </div>

              {/* Action Buttons: Change Photo & Edit Profile */}
              <div className="flex items-center gap-2 self-center md:self-start">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-all shadow-sm cursor-pointer border border-white/20"
                  onClick={() => setIsAvatarModalOpen(true)}
                  title="Upload from device or choose from This PC"
                >
                  <Camera className="w-3.5 h-3.5" /> Change Photo
                </button>
                <button
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/25 hover:bg-white/35 text-white text-xs font-bold backdrop-blur-md transition-all shadow-sm cursor-pointer border border-white/25"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            </div>

            <p className="text-xs text-blue-200/90 flex items-center justify-center md:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </p>

            {/* Social Links & Quick Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profile.instagram && (
                <a
                  href={profile.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-md transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" /> Instagram
                </a>
              )}

              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm cursor-pointer ml-auto"
                onClick={() => openApp('resume')}
              >
                <Download className="w-3.5 h-3.5" /> Resume CV
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
                onClick={() => openApp('contact')}
              >
                <Mail className="w-3.5 h-3.5" /> Contact
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub & Project Stats Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Github className="w-4 h-4 text-slate-800 dark:text-slate-100" /> Open Source & Project Statistics
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            Edit Stats <Edit3 className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <p className="text-xl font-black text-blue-600 dark:text-blue-400">{profile.publicRepos}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <BookOpen className="w-3.5 h-3.5" /> Repositories
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <p className="text-xl font-black text-amber-500">{profile.totalStars}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500/20" /> Total Stars
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <p className="text-xl font-black text-purple-600 dark:text-purple-400">{profile.followers}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5" /> Followers
            </p>
          </div>
        </div>
      </div>

      {/* About Summary & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Sparkles className="w-4 h-4 text-blue-500" /> Biography & Background
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-500 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        </div>

        <div className="space-y-3 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Award className="w-4 h-4 text-purple-500" /> Key Focus & Goals
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-500 hover:underline cursor-pointer"
            >
              Edit
            </button>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {profile.goals.map((goal, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Briefcase className="w-5 h-5 text-blue-500" /> Work Experience
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            Add / Edit Experience <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {profile.experiences.map((exp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                  <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    {exp.company} • {exp.location}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {exp.period}
                </span>
              </div>

              <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                {exp.description.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>

              <div className="pt-1 flex flex-wrap gap-1">
                {exp.skills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <GraduationCap className="w-5 h-5 text-purple-500" /> Education
          </h2>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            Add / Edit Education <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {profile.education.map((edu, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-2"
          >
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">{edu.institution}</p>
              <p className="text-xs text-slate-500 mt-1">{edu.details}</p>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {edu.period}
            </span>
          </div>
        ))}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl text-xs overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Edit About Me & Profile Data</h2>
              </div>
              <button
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* 1. Basic Information & Avatar Studio */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs">
                    1. Basic Information & Profile Picture
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Open Avatar Studio
                  </button>
                </div>

                {/* Interactive Avatar Selector Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                    <img
                      src={editForm.avatar}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-md"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Profile Avatar Image
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload from Device
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarTab('this_pc');
                          setIsAvatarModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-blue-500" /> Choose from This PC
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarTab('url');
                          setIsAvatarModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-indigo-500" /> Web URL
                      </button>
                    </div>

                    <input
                      type="file"
                      ref={modalFileInputRef}
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processImageFile(file);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Professional Title</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Biography & Goals */}
              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs">
                  2. Biography & Key Focus
                </h3>
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Biography</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1 text-[11px]">Focus Goals (one per line)</label>
                  <textarea
                    rows={3}
                    value={editForm.goals.join('\n')}
                    onChange={(e) => setEditForm({ ...editForm, goals: e.target.value.split('\n').filter(Boolean) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                  />
                </div>
              </div>

              {/* 3. Social & Contact Links */}
              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs">
                  3. Social Links & Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">GitHub URL</label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">LinkedIn URL</label>
                    <input
                      type="text"
                      value={editForm.linkedin}
                      onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Instagram URL</label>
                    <input
                      type="text"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Public Repos</label>
                    <input
                      type="number"
                      value={editForm.publicRepos}
                      onChange={(e) => setEditForm({ ...editForm, publicRepos: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Total Stars</label>
                    <input
                      type="number"
                      value={editForm.totalStars}
                      onChange={(e) => setEditForm({ ...editForm, totalStars: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1 text-[11px]">Followers</label>
                    <input
                      type="number"
                      value={editForm.followers}
                      onChange={(e) => setEditForm({ ...editForm, followers: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Work Experience */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-xs">
                    4. Work Experience
                  </h3>
                  <button
                    className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-semibold cursor-pointer"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        experiences: [
                          ...editForm.experiences,
                          {
                            role: 'Software Engineer',
                            company: 'Tech Studio',
                            location: 'Remote',
                            period: '2024 - Present',
                            description: ['Developed web applications and cloud architectures.'],
                            skills: ['TypeScript', 'React', 'Node.js'],
                          },
                        ],
                      });
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Experience
                  </button>
                </div>

                {editForm.experiences.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          placeholder="Role"
                          value={exp.role}
                          onChange={(e) => {
                            const newExp = [...editForm.experiences];
                            newExp[idx].role = e.target.value;
                            setEditForm({ ...editForm, experiences: newExp });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...editForm.experiences];
                            newExp[idx].company = e.target.value;
                            setEditForm({ ...editForm, experiences: newExp });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Period"
                          value={exp.period}
                          onChange={(e) => {
                            const newExp = [...editForm.experiences];
                            newExp[idx].period = e.target.value;
                            setEditForm({ ...editForm, experiences: newExp });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 dark:text-white"
                        />
                      </div>
                      <button
                        className="p-1.5 text-red-500 hover:text-red-600 cursor-pointer"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            experiences: editForm.experiences.filter((_, i) => i !== idx),
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Bullet points (one per line)"
                      value={exp.description.join('\n')}
                      onChange={(e) => {
                        const newExp = [...editForm.experiences];
                        newExp[idx].description = e.target.value.split('\n');
                        setEditForm({ ...editForm, experiences: newExp });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-[11px] dark:text-white"
                    />

                    <input
                      type="text"
                      placeholder="Skills (comma-separated)"
                      value={exp.skills.join(', ')}
                      onChange={(e) => {
                        const newExp = [...editForm.experiences];
                        newExp[idx].skills = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                        setEditForm({ ...editForm, experiences: newExp });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-[11px] dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/90">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                onClick={handleReset}
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-600/30"
                  onClick={handleSave}
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Studio & Photo Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Change Profile Picture</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload from your device, choose from This PC, or paste a photo URL
                  </p>
                </div>
              </div>
              <button
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
                  avatarTab === 'upload'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload from Device
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('this_pc')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
                  avatarTab === 'this_pc'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-4 h-4" /> This PC (System Images)
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
                  avatarTab === 'url'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-4 h-4" /> Web Image URL
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tab 1: Upload from Device */}
              {avatarTab === 'upload' && (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverAvatar(true);
                    }}
                    onDragLeave={() => setIsDragOverAvatar(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOverAvatar(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) processImageFile(file);
                    }}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragOverAvatar
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                        : 'border-slate-300 dark:border-white/20 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">
                        Click to browse or drag and drop an image
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Upload directly from your local computer, phone, or tablet
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300">PNG</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300">JPG / JPEG</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300">WEBP</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300">GIF</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-semibold text-slate-600 dark:text-slate-300">SVG</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Choose from This PC */}
              {avatarTab === 'this_pc' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select any picture, wallpaper, or media file located on This PC:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-1">
                    {systemImages.map((img, idx) => {
                      const isSelected = avatarPreviewUrl === img.url;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setAvatarPreviewUrl(img.url);
                          }}
                          className={`relative group p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-600/10 ring-2 ring-blue-500/50'
                              : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-slate-800/60'
                          }`}
                        >
                          <div className="relative w-full h-20 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800">
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 p-1 rounded-full bg-blue-600 text-white shadow-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="w-full text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{img.name}</p>
                            <span className="text-[10px] text-slate-400 block truncate">{img.source}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Web URL */}
              {avatarTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Direct Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or https://github.com/username.png"
                        value={customUrlInput}
                        onChange={(e) => {
                          setCustomUrlInput(e.target.value);
                          if (e.target.value.trim()) {
                            setAvatarPreviewUrl(e.target.value.trim());
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/10 focus:outline-none focus:border-blue-500 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUrlInput.trim()) {
                            setAvatarPreviewUrl(customUrlInput.trim());
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quick Presets:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = 'https://github.com/anishjethva18.png';
                          setCustomUrlInput(url);
                          setAvatarPreviewUrl(url);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        <Github className="w-3.5 h-3.5" /> GitHub Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomUrlInput('/avatar.png');
                          setAvatarPreviewUrl('/avatar.png');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Default Portfolio Image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center gap-5">
                <div className="relative">
                  <img
                    src={avatarPreviewUrl}
                    alt="Selected Avatar Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/avatar.png';
                    }}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-blue-600 text-[9px] font-bold text-white rounded-md">
                    Preview
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-white">Active Avatar Preview</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    This photo will be applied to your About Me card, Start Menu profile, and Lock Screen.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/90">
              <button
                type="button"
                onClick={() => {
                  applyAvatar(DEFAULT_PROFILE_DATA.avatar);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset to Default
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => applyAvatar(avatarPreviewUrl)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Apply Profile Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
