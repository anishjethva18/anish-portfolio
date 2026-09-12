import React, { useState, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { Wallpaper } from './Wallpaper';
import { DesktopIcon } from './DesktopIcon';
import { ContextMenu } from './ContextMenu';
import { useLongPress } from '../../utils/useLongPress';
import { PropertiesModal } from '../common/PropertiesModal';
import { ToastNotificationOverlay } from '../common/ToastNotificationOverlay';
import { MobileStatusBar } from '../common/MobileStatusBar';
import { TopProgressBar } from '../common/TopProgressBar';
import { NightLightFilter } from '../common/NightLightFilter';
import { ClipboardHistoryModal } from '../common/ClipboardHistoryModal';
import { SnippingToolOverlay } from '../common/SnippingToolOverlay';
import { GameBarOverlay } from '../common/GameBarOverlay';
import { AltTabOverlay } from '../desktop/AltTabOverlay';
import { WidgetsBoard } from '../widgets/WidgetsBoard';
import { TouchKeyboard } from '../common/TouchKeyboard';
import { Smartphone } from 'lucide-react';
import { isMediaFile } from '../../utils/fileAssociations';
import { soundManager } from '../../utils/sound';

export const Desktop: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const {
    desktopIcons,
    deleteDesktopIcon,
    closeStart,
    toggleStart,
    isStartOpen,
    closeSearch,
    toggleSearch,
    closeNotifications,
    closeTrayPanels,
    isMatrixMode,
    showContextMenu,
    closeContextMenu,
    settings,
    openApp,
    showDesktop,
    createFile,
    copyFile,
    cutFile,
    pasteFile,
    deleteFile,
    addOrMoveDesktopIcon,
    openProperties,
    sortDesktopIcons,
    refreshFileSystem,
    addNotification,
    files,
    apps = [],
    isGlobalLoading,
    globalProgress,
    // Overlay triggers & states
    activeWindowId,
    snapWindow,
    maximizeWindow,
    minimizeWindow,
    isClipboardOpen,
    toggleClipboard,
    closeClipboard,
    isSnippingOpen,
    openSnipping,
    closeSnipping,
    isGameBarOpen,
    toggleGameBar,
    closeGameBar,
    isAltTabOpen,
    openAltTab,
    closeAltTab,
    isWidgetsOpen,
    toggleWidgets,
    closeWidgets,
  } = useOS();
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const lastClickedIndexRef = useRef<number>(0);
  const desktopRef = useRef<HTMLDivElement>(null);
  const [dragOverCell, setDragOverCell] = useState<{ gridX: number; gridY: number } | null>(null);

  const desktopLongPressProps = useLongPress(
    (e, coords) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[data-desktop-icon="true"]') ||
        target.closest('[data-taskbar="true"]') ||
        target.closest('[data-start-menu="true"]') ||
        target.closest('[data-contextmenu="true"]') ||
        target.closest('[data-window="true"]')
      ) {
        return;
      }
      const clientX = coords?.x ?? (('touches' in e && e.touches?.[0]) ? e.touches[0].clientX : ('clientX' in e ? (e as React.MouseEvent).clientX : 0));
      const clientY = coords?.y ?? (('touches' in e && e.touches?.[0]) ? e.touches[0].clientY : ('clientY' in e ? (e as React.MouseEvent).clientY : 0));
      showContextMenu({
        type: 'desktop',
        x: clientX,
        y: clientY,
      });
    },
    { threshold: 380, hapticFeedback: true }
  );

  const CELL_WIDTH = settings.iconSize === 'small' ? 90 : settings.iconSize === 'large' ? 124 : 108;
  const CELL_HEIGHT = settings.iconSize === 'small' ? 94 : settings.iconSize === 'large' ? 124 : 110;
  const PADDING_LEFT = 16;
  const PADDING_TOP = 16;

  // Global Keyboard shortcuts & Arrow Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // 0. Refresh Desktop (F5 or Ctrl+R when focused on desktop without active window)
      if ((e.key === 'F5' || (e.ctrlKey && e.key.toLowerCase() === 'r')) && !activeWindowId) {
        e.preventDefault();
        soundManager.playRefresh();
        refreshFileSystem('desktop');
        addNotification({
          title: 'Desktop Refreshed',
          message: 'Desktop view updated.',
          type: 'info',
        });
        return;
      }

      // 1. Meta / Super / Win key or Ctrl+Escape -> Start Menu
      if (e.key === 'Meta' || (e.ctrlKey && e.key === 'Escape')) {
        e.preventDefault();
        toggleStart();
        return;
      }

      // 2. Alt + Tab -> Window Switcher
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        openAltTab();
        return;
      }

      // 3. Win + V -> Clipboard History
      if (e.metaKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleClipboard();
        return;
      }

      // 4. Win + Shift + S -> Snipping Tool
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        openSnipping();
        return;
      }

      // 5. Win + G -> Xbox Game Bar
      if (e.metaKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        toggleGameBar();
        return;
      }

      // 5b. Win + W -> Widgets Board
      if (e.metaKey && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        toggleWidgets();
        return;
      }

      // 6. Win + Z -> Snap Layout Helper (Snap Left on primary)
      if (e.metaKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (activeWindowId) {
          snapWindow(activeWindowId, 'left');
        }
        return;
      }

      // 9. Win + Arrow Keys -> Window Snap & Maximize/Minimize
      if (e.metaKey && e.key === 'ArrowLeft' && activeWindowId) {
        e.preventDefault();
        snapWindow(activeWindowId, 'left');
        return;
      }
      if (e.metaKey && e.key === 'ArrowRight' && activeWindowId) {
        e.preventDefault();
        snapWindow(activeWindowId, 'right');
        return;
      }
      if (e.metaKey && e.key === 'ArrowUp' && activeWindowId) {
        e.preventDefault();
        maximizeWindow(activeWindowId);
        return;
      }
      if (e.metaKey && e.key === 'ArrowDown' && activeWindowId) {
        e.preventDefault();
        minimizeWindow(activeWindowId);
        return;
      }

      // 10. Win + E -> File Explorer
      if (e.metaKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        openApp('explorer');
        return;
      }

      // 11. Win + D -> Show Desktop
      if (e.metaKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        showDesktop();
        return;
      }

      // 12. Ctrl + Shift + Esc -> Task Manager
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        openApp('taskmanager');
        return;
      }

      // 13. Alt + Enter -> View Properties of selected icon
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        const targetId = selectedIconId || (selectedIconIds.size > 0 ? Array.from(selectedIconIds)[0] : null);
        if (targetId) {
          const icon = desktopIcons.find((i) => i.id === targetId);
          if (icon) {
            if (icon.filePath) {
              const f = files.find((item) => item.path === icon.filePath);
              if (f) {
                openProperties({
                  name: f.name,
                  type: f.type === 'folder' ? 'Folder' : `${f.extension?.toUpperCase() || 'File'} Document`,
                  location: f.path,
                  size: f.size || (f.type === 'folder' ? '0 KB' : '1.2 KB'),
                  created: f.modified || '2026-08-17',
                  modified: f.modified || '2026-08-17',
                  icon: f.icon || (f.type === 'folder' ? 'Folder' : 'FileText'),
                  item: f,
                });
              }
            } else if (icon.appId) {
              const app = apps.find((a) => a.id === icon.appId);
              if (app) {
                openProperties({
                  name: app.name,
                  type: 'Application',
                  location: 'C:\\Program Files\\WindowsApps\\' + app.id,
                  size: '12.4 MB',
                  created: '2026-08-17',
                  modified: '2026-08-17',
                  icon: app.icon,
                  item: app,
                });
              }
            }
          }
        }
        return;
      }

      // 14. Ctrl + A -> Select all desktop icons
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a' && desktopIcons.length > 0) {
        e.preventDefault();
        const allIds = new Set(desktopIcons.map((i) => i.id));
        setSelectedIconIds(allIds);
        setSelectedIconId(desktopIcons[0]?.id || null);
        return;
      }

      // 14b. Ctrl + C -> Copy selected desktop file(s)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        const targetIds = selectedIconIds.size > 0 ? Array.from(selectedIconIds) : selectedIconId ? [selectedIconId] : [];
        if (targetIds.length > 0) {
          const selectedFileItems = targetIds
            .map((id) => desktopIcons.find((i) => i.id === id))
            .filter((i): i is typeof desktopIcons[0] => !!i && !!i.filePath)
            .map((i) => files.find((f) => f.path === i.filePath))
            .filter((f): f is typeof files[0] => !!f);
          if (selectedFileItems.length > 0) {
            e.preventDefault();
            copyFile(selectedFileItems);
            return;
          }
        }
      }

      // 14c. Ctrl + X -> Cut selected desktop file(s)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        const targetIds = selectedIconIds.size > 0 ? Array.from(selectedIconIds) : selectedIconId ? [selectedIconId] : [];
        if (targetIds.length > 0) {
          const selectedFileItems = targetIds
            .map((id) => desktopIcons.find((i) => i.id === id))
            .filter((i): i is typeof desktopIcons[0] => !!i && !!i.filePath)
            .map((i) => files.find((f) => f.path === i.filePath))
            .filter((f): f is typeof files[0] => !!f);
          if (selectedFileItems.length > 0) {
            e.preventDefault();
            cutFile(selectedFileItems);
            return;
          }
        }
      }

      // 14d. Ctrl + V -> Paste to Desktop
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteFile('C:/Users/Anish Jethva/Desktop');
        return;
      }

      // 14e. Delete -> Delete selected desktop file(s)
      if (e.key === 'Delete') {
        const targetIds = selectedIconIds.size > 0 ? Array.from(selectedIconIds) : selectedIconId ? [selectedIconId] : [];
        if (targetIds.length > 0) {
          const selectedFileItems = targetIds
            .map((id) => desktopIcons.find((i) => i.id === id))
            .filter((i): i is typeof desktopIcons[0] => !!i && !!i.filePath)
            .map((i) => files.find((f) => f.path === i.filePath))
            .filter((f): f is typeof files[0] => !!f);
          if (selectedFileItems.length > 0) {
            e.preventDefault();
            selectedFileItems.forEach((f) => deleteFile(f.id));
            setSelectedIconId(null);
            setSelectedIconIds(new Set());
            return;
          }
        }
      }

      // 14f. Enter -> Open selected desktop item
      if (e.key === 'Enter' && selectedIconId) {
        const icon = desktopIcons.find((i) => i.id === selectedIconId);
        if (icon) {
          e.preventDefault();
          if (icon.appId) {
            openApp(icon.appId);
          } else if (icon.type === 'folder' && icon.filePath) {
            openApp('explorer', { path: icon.filePath });
          } else if (icon.filePath) {
            if (icon.filePath.toLowerCase().endsWith('.pdf')) {
              openApp('resume');
            } else if (isMediaFile(icon.filePath)) {
              openApp('photos', { filePath: icon.filePath });
            } else {
              openApp('notepad', { filePath: icon.filePath });
            }
          }
          return;
        }
      }

      // 15. Arrow keys navigation & Shift+Arrow range selection
      if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(e.key) && desktopIcons.length > 0) {
        e.preventDefault();
        const currentIndex = desktopIcons.findIndex((icon) => icon.id === (selectedIconId || Array.from(selectedIconIds)[0]));
        let nextIndex = currentIndex === -1 ? 0 : currentIndex;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (nextIndex + 1) % desktopIcons.length;
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = (nextIndex - 1 + desktopIcons.length) % desktopIcons.length;
        }

        if (e.shiftKey) {
          const anchor = lastClickedIndexRef.current >= 0 ? lastClickedIndexRef.current : 0;
          const minIdx = Math.min(anchor, nextIndex);
          const maxIdx = Math.max(anchor, nextIndex);
          const rangeSet = new Set<string>();
          for (let i = minIdx; i <= maxIdx; i++) {
            if (desktopIcons[i]) rangeSet.add(desktopIcons[i].id);
          }
          setSelectedIconIds(rangeSet);
          setSelectedIconId(desktopIcons[nextIndex].id);
        } else {
          lastClickedIndexRef.current = nextIndex;
          setSelectedIconId(desktopIcons[nextIndex].id);
          setSelectedIconIds(new Set([desktopIcons[nextIndex].id]));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedIconId,
    selectedIconIds,
    desktopIcons,
    toggleStart,
    openApp,
    showDesktop,
    openAltTab,
    toggleClipboard,
    openSnipping,
    toggleGameBar,
    snapWindow,
    maximizeWindow,
    minimizeWindow,
    activeWindowId,
  ]);

  // Rectangle selection state
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const isSelectingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleDesktopClick = () => {
    setSelectedIconId(null);
    setSelectedIconIds(new Set());
    closeContextMenu();
    closeStart();
    closeSearch();
    closeNotifications();
    closeTrayPanels();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (Date.now() - ((window as any).__lastLongPressTime || 0) < 600) {
      return;
    }
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-desktop-icon="true"]') ||
      target.closest('[data-taskbar="true"]') ||
      target.closest('[data-start-menu="true"]') ||
      target.closest('[data-contextmenu="true"]') ||
      target.closest('[data-window="true"]')
    ) {
      return;
    }
    showContextMenu({ type: 'desktop', x: e.clientX, y: e.clientY });
    closeStart();
    closeSearch();
    closeNotifications();
    closeTrayPanels();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click on desktop background
    const target = e.target as HTMLElement;
    if (e.button !== 0 || target.closest('[data-desktop-icon="true"]') || target.closest('[data-contextmenu="true"]')) return;
    isSelectingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    setSelectionBox({ x: e.clientX, y: e.clientY, w: 0, h: 0 });

    if (!e.ctrlKey && !e.metaKey) {
      setSelectedIconId(null);
      setSelectedIconIds(new Set());
    }
    closeContextMenu();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelectingRef.current || !desktopRef.current) return;
    const currentX = e.clientX;
    const currentY = e.clientY;

    const x = Math.min(startPosRef.current.x, currentX);
    const y = Math.min(startPosRef.current.y, currentY);
    const w = Math.abs(currentX - startPosRef.current.x);
    const h = Math.abs(currentY - startPosRef.current.y);

    setSelectionBox({ x, y, w, h });

    // Detect intersection with desktop icons
    const iconEls = desktopRef.current.querySelectorAll<HTMLElement>('[data-desktop-icon-id]');
    const newSelected = new Set<string>();

    iconEls.forEach((el) => {
      const id = el.getAttribute('data-desktop-icon-id');
      if (!id) return;

      const rect = el.getBoundingClientRect();
      const intersects =
        x < rect.right &&
        x + w > rect.left &&
        y < rect.bottom &&
        y + h > rect.top;

      if (intersects) {
        newSelected.add(id);
      }
    });

    setSelectedIconIds(newSelected);
    if (newSelected.size > 0) {
      const first = Array.from(newSelected)[0];
      setSelectedIconId(first);
    }
  };

  const handleMouseUp = () => {
    isSelectingRef.current = false;
    setSelectionBox(null);
  };

  const handleIconSelect = (iconId: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (e.shiftKey) {
      const anchor = lastClickedIndexRef.current >= 0 ? lastClickedIndexRef.current : 0;
      const minIdx = Math.min(anchor, idx);
      const maxIdx = Math.max(anchor, idx);
      const rangeSet = new Set<string>();
      for (let i = minIdx; i <= maxIdx; i++) {
        if (desktopIcons[i]) rangeSet.add(desktopIcons[i].id);
      }
      setSelectedIconIds(rangeSet);
      setSelectedIconId(iconId);
    } else if (e.ctrlKey || e.metaKey) {
      lastClickedIndexRef.current = idx;
      setSelectedIconIds((prev) => {
        const next = new Set(prev);
        if (next.has(iconId)) {
          next.delete(iconId);
          if (selectedIconId === iconId) {
            setSelectedIconId(Array.from(next)[0] || null);
          }
        } else {
          next.add(iconId);
          setSelectedIconId(iconId);
        }
        return next;
      });
    } else {
      lastClickedIndexRef.current = idx;
      setSelectedIconId(iconId);
      setSelectedIconIds(new Set([iconId]));
    }
  };

  return (
    <div
      ref={desktopRef}
      className="relative w-screen h-[100dvh] overflow-hidden select-none font-sans"
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => {
        // Only trigger desktop long-press if touching desktop background, not an icon, window, or contextmenu
        const target = e.target as HTMLElement;
        const isIconOrWindow =
          target.closest('[data-desktop-icon="true"]') ||
          target.closest('[data-window="true"]') ||
          target.closest('[data-contextmenu="true"]');
        if (!isIconOrWindow) {
          desktopLongPressProps.onTouchStart(e);
        }
      }}
      onTouchMove={desktopLongPressProps.onTouchMove}
      onTouchEnd={(e) => {
        desktopLongPressProps.onTouchEnd(e);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (desktopRef.current) {
          const rect = desktopRef.current.getBoundingClientRect();
          const dropX = e.clientX - rect.left - PADDING_LEFT;
          const dropY = e.clientY - rect.top - PADDING_TOP;
          const gridX = Math.max(0, Math.floor((dropX + CELL_WIDTH / 2) / CELL_WIDTH));
          const gridY = Math.max(0, Math.floor((dropY + CELL_HEIGHT / 2) / CELL_HEIGHT));
          setDragOverCell({ gridX, gridY });
        }
      }}
      onDragLeave={() => setDragOverCell(null)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOverCell(null);
        if (!desktopRef.current) return;
        const rect = desktopRef.current.getBoundingClientRect();
        const dropX = e.clientX - rect.left - PADDING_LEFT;
        const dropY = e.clientY - rect.top - PADDING_TOP;
        const gridX = Math.max(0, Math.floor((dropX + CELL_WIDTH / 2) / CELL_WIDTH));
        const gridY = Math.max(0, Math.floor((dropY + CELL_HEIGHT / 2) / CELL_HEIGHT));

        try {
          const rawData = e.dataTransfer.getData('text/plain');
          if (!rawData) return;
          const data = JSON.parse(rawData);

          if (data.type === 'desktop_icon' || data.appId) {
            const appId = data.appId;
            const isExplorer = appId === 'explorer';
            const name = isExplorer ? 'This PC' : data.name || 'Shortcut';
            const icon = isExplorer ? 'Monitor' : data.icon || 'AppWindow';
            const iconId = isExplorer ? 'icon-thispc' : data.id || `icon-${appId}`;

            addOrMoveDesktopIcon({
              id: iconId,
              appId,
              name,
              icon,
              position: { gridX, gridY },
              type: 'app',
            });
          } else if (data.type === 'file_item' && data.file) {
            const f = data.file;
            createFile('C:/Users/Anish Jethva/Desktop', f.name, f.content, f.extension);
            addOrMoveDesktopIcon({
              id: `file-${f.id}-${Date.now()}`,
              filePath: f.path,
              name: f.name,
              icon: f.extension === 'pdf' ? 'FileText' : f.type === 'folder' ? 'Folder' : 'FileCode',
              position: { gridX, gridY },
              type: f.type === 'folder' ? 'folder' : 'file',
            });
          }
        } catch {
          // ignore drop error
        }
      }}
    >
      {/* Mobile Top Status Bar */}
      <MobileStatusBar />

      {/* Top Loading Progress Bar */}
      <TopProgressBar isLoading={isGlobalLoading} progress={globalProgress} color={settings.accentColor} />

      {/* Background Wallpaper */}
      <Wallpaper />

      {/* Optional Matrix Mode Matrix Rain Effect Overlay */}
      {isMatrixMode && <MatrixRainOverlay />}

      {/* Grid Drop Indicator Overlay */}
      {dragOverCell && (
        <div
          className="absolute border-2 border-dashed border-blue-400 bg-blue-500/20 rounded-xl pointer-events-none z-20 animate-pulse transition-all duration-75"
          style={{
            left: PADDING_LEFT + dragOverCell.gridX * CELL_WIDTH,
            top: PADDING_TOP + dragOverCell.gridY * CELL_HEIGHT,
            width: 92,
            height: 98,
          }}
        />
      )}

      {/* Fixed Grid Layout for Desktop Icons */}
      <div className="absolute inset-x-0 top-0 bottom-14 z-10 pointer-events-auto overflow-y-auto overflow-x-hidden" data-desktop-bg="true">
        {desktopIcons.map((icon, idx) => (
          <DesktopIcon
            key={`${icon.id}-${icon.filePath || icon.appId || idx}`}
            iconItem={icon}
            isSelected={selectedIconIds.has(icon.id) || selectedIconId === icon.id}
            onSelect={(e) => handleIconSelect(icon.id, idx, e)}
          />
        ))}
      </div>

      {/* Rectangle Selection Box */}
      {selectionBox && (
        <div
          className="fixed border border-blue-400 bg-blue-500/20 rounded pointer-events-none z-20"
          style={{
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.w,
            height: selectionBox.h,
          }}
        />
      )}

      {/* Desktop Context Menu */}
      <ContextMenu />

      {/* Properties Modal */}
      <PropertiesModal />

      {/* Toast Notification Banner (Mobile & Desktop) */}
      <ToastNotificationOverlay />

      {/* Night Light & Accessibility Filter Overlay */}
      <NightLightFilter />

      {/* Alt+Tab Window Switcher Overlay */}
      <AltTabOverlay isOpen={isAltTabOpen} onClose={closeAltTab} />

      {/* Clipboard History Win+V Modal */}
      <ClipboardHistoryModal isOpen={isClipboardOpen} onClose={closeClipboard} />

      {/* Snipping Tool Overlay */}
      <SnippingToolOverlay isOpen={isSnippingOpen} onClose={closeSnipping} />

      {/* Xbox Game Bar Overlay */}
      <GameBarOverlay isOpen={isGameBarOpen} onClose={closeGameBar} />

      {/* Windows 11 Widgets Board Drawer Overlay */}
      <WidgetsBoard />

      {/* Windows 11 On-Screen Touch Keyboard Overlay */}
      <TouchKeyboard />

      {/* Portrait Mode Lock Active Indicator Banner */}
      {settings.lockPortrait && (
        <div className="fixed top-8 sm:top-2 right-3 z-[60] bg-slate-900/90 backdrop-blur-md text-cyan-400 border border-cyan-500/30 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none animate-in fade-in">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Portrait Lock Active</span>
        </div>
      )}

      {/* Open Application Windows Layer */}
      <div className="relative z-30 pointer-events-auto">{children}</div>

      {/* Global Screen Brightness Dimming Overlay */}
      {settings.brightness !== undefined && settings.brightness < 1 && (
        <div
          className="fixed inset-0 bg-black pointer-events-none z-[99999] transition-opacity duration-150"
          style={{ opacity: Math.max(0, Math.min(0.8, 1 - settings.brightness)) }}
        />
      )}
    </div>
  );
};

// Matrix Rain Effect Component
const MatrixRainOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEF0123456789<>/{}[]';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981'; // emerald green matrix text
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1] opacity-75" />;
};
