import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useOS } from '../../context/OSContext';
import { BatteryIndicator } from '../common/BatteryIndicator';
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryMedium,
  BatteryLow,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Power,
  RotateCcw,
  Moon,
  Camera,
  Sun,
  CloudSun,
  Volume2,
  Info,
  ChevronUp,
} from 'lucide-react';

interface LockScreenProps {
  wallpaper: string;
}

export const LockScreen: React.FC<LockScreenProps> = ({ wallpaper }) => {
  const { user, isLocked, unlockScreen } = useAuth();
  const { setPowerState, files, settings } = useOS();

  const currentUser = React.useMemo(() => {
    let customProfile: any = null;
    try {
      const raw = localStorage.getItem('win11_custom_about_profile');
      if (raw) customProfile = JSON.parse(raw);
    } catch {}
    const defaultAvatar = localStorage.getItem('win11_default_avatar');

    return {
      name: user?.name || customProfile?.name || 'Anish Jethva',
      avatar: user?.avatar || defaultAvatar || customProfile?.avatar || '/avatar.png',
    };
  }, [user]);

  const [time, setTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [showSpotlightInfo, setShowSpotlightInfo] = useState(false);

  // Dynamic / Simulated Battery State
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [isCharging, setIsCharging] = useState<boolean>(true);
  const [hasBatteryApi, setHasBatteryApi] = useState<boolean>(false);

  // Dynamic Network State & Simulated Ping
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pingMs, setPingMs] = useState<number>(14);

  const [videoError, setVideoError] = useState(false);

  // Resolve wallpaper if it's a file path or URL
  const resolvedWallpaper = React.useMemo(() => {
    if (!wallpaper) {
      return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&auto=format&fit=crop&q=90';
    }
    const matchingFile = files.find(
      (f) => f.path === wallpaper || f.id === wallpaper || f.name === wallpaper
    );
    const content = matchingFile?.content || wallpaper;
    if (!content || content.startsWith('C:/')) {
      return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&auto=format&fit=crop&q=90';
    }
    return content;
  }, [wallpaper, files]);

  useEffect(() => {
    setVideoError(false);
  }, [resolvedWallpaper]);

  const isVideoWallpaper = React.useMemo(() => {
    if (videoError || !resolvedWallpaper) return false;
    return (
      (resolvedWallpaper.endsWith('.mp4') ||
        resolvedWallpaper.endsWith('.webm') ||
        resolvedWallpaper.includes('.mp4?') ||
        resolvedWallpaper.includes('.webm?') ||
        resolvedWallpaper.startsWith('data:video/mp4') ||
        resolvedWallpaper.startsWith('data:video/webm') ||
        resolvedWallpaper.startsWith('blob:') ||
        resolvedWallpaper.includes('/sample/')) &&
      !resolvedWallpaper.includes('unsplash.com')
    );
  }, [resolvedWallpaper, videoError]);

  // Real-time clock timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Online / Offline live listener & ping fluctuation
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const pingInterval = setInterval(() => {
      if (navigator.onLine) {
        setPingMs(Math.floor(12 + Math.random() * 8));
      }
    }, 4000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  // Real Battery API query & event listeners with realistic simulation fallback
  useEffect(() => {
    let batteryInstance: any = null;
    const isBrave = typeof navigator !== 'undefined' && (
      (navigator as any).brave !== undefined || 
      /brave/i.test(navigator.userAgent)
    );

    const updateBattery = (battery: any) => {
      setBatteryLevel(Math.round(battery.level * 100));
      setIsCharging(battery.charging);
      setHasBatteryApi(true);
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator && !isBrave) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          batteryInstance = battery;
          updateBattery(battery);

          battery.addEventListener('levelchange', () => updateBattery(battery));
          battery.addEventListener('chargingchange', () => updateBattery(battery));
        })
        .catch(() => {
          setHasBatteryApi(false);
        });
    } else {
      // Synchronized realistic battery simulation for Brave/unsupported browsers based on system clock
      const syncSimulatedBattery = () => {
        const now = new Date();
        const minutes = now.getMinutes();
        // Toggle charging every 15 minutes
        const chargingState = Math.floor(minutes / 15) % 2 === 0;
        // Level ranges from 45% to 89% depending on current minute
        const level = 45 + (minutes % 45);
        setBatteryLevel(level);
        setIsCharging(chargingState);
        setHasBatteryApi(true);
      };

      syncSimulatedBattery();
      const interval = setInterval(syncSimulatedBattery, 5000);
      return () => clearInterval(interval);
    }

    return () => {
      if (batteryInstance) {
        try {
          batteryInstance.removeEventListener('levelchange', () => {});
          batteryInstance.removeEventListener('chargingchange', () => {});
        } catch {}
      }
    };
  }, []);

  // Listen for any keypress to unlock automatically
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPowerMenu) {
        if (e.key === 'Escape') setShowPowerMenu(false);
        return;
      }
      e.preventDefault();
      handleDirectUnlock();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocked, showPowerMenu]);

  if (!isLocked) return null;

  const handleDirectUnlock = () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    setTimeout(() => {
      unlockScreen();
      setIsUnlocking(false);
    }, 250);
  };

  const renderBatteryIcon = () => {
    return <BatteryIndicator level={batteryLevel} isCharging={isCharging} size="sm" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: isUnlocking ? -50 : 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      id="windows-lock-screen"
      className="fixed inset-0 z-[99999] flex flex-col justify-between overflow-hidden select-none cursor-pointer"
      onClick={() => {
        if (showPowerMenu) setShowPowerMenu(false);
        else handleDirectUnlock();
      }}
    >
      {/* Background Wallpaper Container (Video or Image) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {isVideoWallpaper ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            key={resolvedWallpaper}
            src={resolvedWallpaper}
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        ) : (
          <img
            src={resolvedWallpaper}
            alt="Lock Screen Wallpaper"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none pointer-events-none"
          />
        )}
      </div>

      {/* Acrylic backdrop filter */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-all duration-500 hover:backdrop-blur-none z-1" />

      {/* Top Status Indicators */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-6 text-white/85">
        {/* Left: Dynamic Weather Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium bg-black/40 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg text-white/90">
            <CloudSun className="w-3.5 h-3.5 text-amber-300" />
            <span>26°C Clear • RealFeel® 28°C</span>
          </div>
        </div>

        {/* Right: Live Network & Battery Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-sm bg-black/40 backdrop-blur-xl px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
            <div
              className="flex items-center gap-1.5"
              title={isOnline ? 'Internet Connected • Wi-Fi 6' : 'Offline'}
            >
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-400" />
              )}
              <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            <div
              className="flex items-center gap-1.5 cursor-pointer hover:text-blue-300 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsCharging((c) => !c);
              }}
              title={`${batteryLevel}% ${isCharging ? 'Plugged In (Fast Charging)' : 'Discharging on Battery'} — Click to toggle charge simulation`}
            >
              {renderBatteryIcon()}
              <span className="text-xs font-semibold">
                {batteryLevel}%{isCharging && ' ⚡'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center Stage: Dynamic Clock & One-Click Sign In */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center"
        >
          {/* Time & Date Display */}
          <h1 className="text-8xl md:text-9xl font-light tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
          </h1>
          <p className="mt-2 text-xl md:text-2xl font-normal text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* User Profile Tile with Direct One-Click Enter */}
          <div className="mt-10 flex flex-col items-center">
            <div className="relative mb-3 group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatar.png';
                }}
                className="w-24 h-24 rounded-full border-2 border-white/60 shadow-2xl object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <h2 className="text-2xl font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {currentUser.name}
            </h2>
            <p className="text-xs text-blue-300 font-medium tracking-wide uppercase mt-0.5">
              Full Stack & AI Engineer
            </p>

            {/* Direct Sign-In Action Button */}
            <button
              id="lockscreen-enter-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDirectUnlock();
              }}
              className="mt-6 flex items-center gap-2.5 px-7 py-3 rounded-full bg-white/20 hover:bg-blue-600 active:scale-95 text-white font-medium text-sm backdrop-blur-xl border border-white/30 shadow-xl transition-all duration-200 hover:shadow-blue-500/30 cursor-pointer"
            >
              {isUnlocking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entering Desktop...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span>Sign In / Enter Desktop</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>

            <span className="mt-4 text-xs text-white/70 drop-shadow flex items-center gap-1.5">
              <ChevronUp className="w-3.5 h-3.5 animate-bounce" />
              Click anywhere or press any key to enter
            </span>
          </div>
        </motion.div>
      </div>

      {/* Bottom info bar & Windows 11 Power Controls */}
      <div className="relative z-10 flex items-center justify-between px-8 pb-6 text-white/80 text-xs">
        <div className="flex items-center gap-2">
          <span>Windows 11 Pro</span>
          <span>•</span>
          <span>Anish Jethva Portfolio</span>
          <span>•</span>
          <span className="text-white/60">Version 24H2</span>
        </div>

        {/* Right Power & Quick Controls Menu */}
        <div className="relative flex items-center gap-3">
          <button
            id="lockscreen-power-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowPowerMenu((prev) => !prev);
            }}
            className="p-2.5 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-xl border border-white/15 text-white shadow-lg transition-all cursor-pointer"
            title="Power options"
          >
            <Power className="w-4 h-4 text-rose-400" />
          </button>

          {/* Windows 11 Power Popup Menu */}
          <AnimatePresence>
            {showPowerMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-12 w-48 rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl p-2 text-white z-50 space-y-1"
              >
                <button
                  onClick={() => {
                    setShowPowerMenu(false);
                    setPowerState('sleep');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer text-xs"
                >
                  <Moon className="w-4 h-4 text-blue-400" />
                  <span>Sleep</span>
                </button>
                <button
                  onClick={() => {
                    setShowPowerMenu(false);
                    setPowerState('restart');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-left transition-colors cursor-pointer text-xs"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Restart</span>
                </button>
                <button
                  onClick={() => {
                    setShowPowerMenu(false);
                    setPowerState('shutdown');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-600/80 text-left transition-colors cursor-pointer text-xs text-rose-300 hover:text-white"
                >
                  <Power className="w-4 h-4" />
                  <span>Shut Down</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
