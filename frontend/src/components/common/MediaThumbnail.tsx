import React, { useState, useEffect, useRef } from 'react';
import { FileItem } from '../../types';
import { ImageIcon, Film, Play, Music } from 'lucide-react';

// Global memory cache for dynamically captured video thumbnails
const videoThumbnailCache = new Map<string, string>();

export const captureVideoFrame = (videoEl: HTMLVideoElement, key: string): string | null => {
  try {
    if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
      const canvas = document.createElement('canvas');
      const maxW = 480;
      const scale = Math.min(1, maxW / videoEl.videoWidth);
      canvas.width = Math.round(videoEl.videoWidth * scale);
      canvas.height = Math.round(videoEl.videoHeight * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (dataUrl && dataUrl.length > 100) {
          videoThumbnailCache.set(key, dataUrl);
          return dataUrl;
        }
      }
    }
  } catch {
    // Canvas CORS tainted or unsupported fallback
  }
  return null;
};

// High-fidelity fallback scene frames for videos
const FALLBACK_VIDEO_PREVIEWS: Record<string, string> = {
  forbiggerblazes: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
  bigbuckbunny: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  elephantsdream: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  showcase: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  demo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  keynote: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  reel: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
  documentary: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
  tutorial: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  stream: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  clip: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  camera: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
  vid: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
  video: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
};

export const getFallbackVideoPoster = (name: string, content?: string): string => {
  const target = `${name.toLowerCase()} ${(content || '').toLowerCase()}`;
  for (const [k, url] of Object.entries(FALLBACK_VIDEO_PREVIEWS)) {
    if (target.includes(k)) return url;
  }
  return 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80';
};

export const VideoFrameThumbnail: React.FC<{
  src?: string;
  name?: string;
  poster?: string;
  className?: string;
}> = ({ src, name = '', poster, className = '' }) => {
  const fallbackScene = getFallbackVideoPoster(name, src);
  const [frameUrl, setFrameUrl] = useState<string | null>(() => {
    if (poster) return poster;
    if (src && videoThumbnailCache.has(src)) return videoThumbnailCache.get(src)!;
    return null;
  });
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // If a pre-rendered or cached frame exists
  if (frameUrl) {
    return (
      <img
        src={frameUrl}
        alt={name}
        className={`w-full h-full object-cover pointer-events-none ${className}`}
        referrerPolicy="no-referrer"
        onError={() => setFrameUrl(fallbackScene)}
      />
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {/* Background Fallback Scene Image */}
      <img
        src={fallbackScene}
        alt={name}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
          videoLoaded ? 'opacity-0' : 'opacity-100'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* Dynamic Video Element to capture real frame if available */}
      {src && !videoError && (
        <video
          ref={videoRef}
          src={`${src}#t=0.5`}
          preload="metadata"
          muted
          playsInline
          crossOrigin="anonymous"
          onLoadedData={(e) => {
            const video = e.currentTarget;
            setVideoLoaded(true);
            const captured = captureVideoFrame(video, src);
            if (captured) setFrameUrl(captured);
          }}
          onError={() => {
            setVideoError(true);
          }}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};

// Fallback high-resolution previews for system media items
const FALLBACK_IMAGE_PREVIEWS: Record<string, string> = {
  bmw: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
  car: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  desk: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  portrait: '/avatar.png',
  profile: '/avatar.png',
  bloom: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  wallpaper: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  cyberpunk: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  mountain: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  synthwave: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
  jri7ke: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
  architectural: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  badge: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
};

export const VLCBadgeIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`drop-shadow-md select-none ${className}`}>
    <path d="M4 27C4 25.5 8 24.5 16 24.5C24 24.5 28 25.5 28 27C28 28.5 24 29.5 16 29.5C8 29.5 4 28.5 4 27Z" fill="#D97706" />
    <path d="M6.5 27L11 18.5H21L25.5 27C22.5 28.2 18.5 28.8 16 28.8C13.5 28.8 9.5 28.2 6.5 27Z" fill="#F97316" />
    <polygon points="10.8,19.2 21.2,19.2 19.8,15.5 12.2,15.5" fill="#FFFFFF" />
    <polygon points="12.2,15.5 19.8,15.5 18.8,12.5 13.2,12.5" fill="#EA580C" />
    <polygon points="13.2,12.5 18.8,12.5 17.8,9.5 14.2,9.5" fill="#FFFFFF" />
    <path d="M14.2 9.5L15.2 4C15.4 3.2 16.6 3.2 16.8 4L17.8 9.5H14.2Z" fill="#F97316" />
    <circle cx="16" cy="3.5" r="1.5" fill="#FDBA74" />
  </svg>
);

export function getMediaPreviewUrl(file: { name: string; content?: string; extension?: string; poster?: string }): string | null {
  const content = file.content || '';
  const ext = (file.extension || '').toLowerCase();
  const name = file.name.toLowerCase();

  const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'm4v', '3gp'].includes(ext) ||
    content.startsWith('data:video') ||
    content.endsWith('.mp4') ||
    content.endsWith('.webm') ||
    content.endsWith('.mov') ||
    content.includes('/sample/') ||
    content.includes('gtv-videos-bucket');

  // If a dedicated poster exists
  if (file.poster) return file.poster;

  // If cached video frame exists
  if (content && videoThumbnailCache.has(content)) {
    return videoThumbnailCache.get(content)!;
  }

  // If it's a video and has content
  if (isVideo) {
    if (content.startsWith('data:video') || content.startsWith('blob:') || content.startsWith('http')) {
      return content;
    }
    return getFallbackVideoPoster(file.name, content);
  }

  // If content is a direct image URL or data image URL
  if (
    content.startsWith('http://') ||
    content.startsWith('https://') ||
    content.startsWith('data:image') ||
    content.startsWith('blob:') ||
    content.startsWith('/')
  ) {
    return content;
  }

  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) || content.startsWith('data:audio') || content.includes('mp3');
  if (isAudio) {
    if (file.poster) return file.poster;
    return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';
  }
  for (const [key, url] of Object.entries(FALLBACK_IMAGE_PREVIEWS)) {
    if (name.includes(key)) return url;
  }

  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'heic'].includes(ext);
  if (isImage) {
    if (name.includes('bmw') || name.includes('car')) return FALLBACK_IMAGE_PREVIEWS.bmw;
    return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80';
  }

  return null;
}

interface MediaThumbnailProps {
  item: FileItem;
  sizeClass?: string;
  className?: string;
}

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({
  item,
  sizeClass = 'w-full h-full',
  className = '',
}) => {
  const ext = (item.extension || '').toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'ico', 'heic'].includes(ext);
  const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'm4v', '3gp'].includes(ext) ||
    item.content?.startsWith('data:video') ||
    item.content?.includes('/sample/') ||
    item.content?.endsWith('.mp4');
  const isAudio = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) ||
    item.content?.startsWith('data:audio') ||
    item.content?.endsWith('.mp3');

  const [loadError, setLoadError] = useState(false);
  const previewUrl = getMediaPreviewUrl(item);

  if (isAudio) {
    const posterUrl = item.poster || previewUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80';
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-900 border border-slate-700/60 shadow-md group ${sizeClass} ${className}`}>
        <img
          src={posterUrl}
          alt={item.name}
          className="w-full h-full object-cover rounded-[7px] transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <div className="w-8 h-8 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
            <Music className="w-4 h-4 fill-white" />
          </div>
        </div>
        <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white text-[8px] font-extrabold rounded uppercase tracking-wider border border-white/20">
          {ext || 'MP3'}
        </span>
      </div>
    );
  }

  if (isImage) {
    if (previewUrl && !loadError) {
      return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-900/10 dark:bg-black/30 border border-slate-200/80 dark:border-white/10 shadow-xs ${sizeClass} ${className}`}>
          <img
            src={previewUrl}
            alt={item.name}
            onError={() => setLoadError(true)}
            className="w-full h-full object-cover rounded-[7px] transition-transform duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          {ext === 'gif' && (
            <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/75 text-white text-[9px] font-bold rounded uppercase tracking-wider backdrop-blur-xs">
              GIF
            </span>
          )}
        </div>
      );
    }

    return (
      <div className={`flex items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-xs ${sizeClass} ${className}`}>
        <ImageIcon className="w-6 h-6" />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div
        className={`relative flex items-center justify-between overflow-hidden rounded-lg bg-[#18191c] border border-slate-700/60 shadow-md group ${sizeClass} ${className}`}
        style={{ aspectRatio: '16/10' }}
      >
        {/* Left Filmstrip Sprocket Track */}
        <div className="w-[12%] h-full bg-[#1b1c20] flex flex-col justify-around items-center py-1.5 border-r border-black/60 shrink-0 z-10 select-none">
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
        </div>

        {/* Center Dynamic Video Thumbnail from Video Frame */}
        <div className="relative flex-1 h-full overflow-hidden bg-black flex items-center justify-center">
          <VideoFrameThumbnail
            src={item.content}
            poster={item.poster}
            name={item.name}
            className="group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top & Bottom Film Letterbox bars */}
          <div className="absolute top-0 inset-x-0 h-1 bg-black/80" />
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/80" />

          {/* Format Badge */}
          <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-extrabold text-white/90 uppercase border border-white/20">
            {ext || 'MP4'}
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-3 h-3 fill-white translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Right Filmstrip Sprocket Track */}
        <div className="w-[12%] h-full bg-[#1b1c20] flex flex-col justify-around items-center py-1.5 border-l border-black/60 shrink-0 z-10 select-none">
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
          <span className="w-2 sm:w-2.5 h-1.5 sm:h-2 rounded-[2px] bg-white/85 shadow-inner block" />
        </div>
      </div>
    );
  }

  return null;
};
