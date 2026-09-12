import React from 'react';
import { AnimatePresence } from 'motion/react';
import { OSProvider, useOS } from './context/OSContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Desktop } from './components/desktop/Desktop';
import { WindowFrame } from './components/window/WindowFrame';
import { RenderApp } from './components/apps/AppRegistry';
import { Taskbar } from './components/taskbar/Taskbar';
import { BSODScreen } from './components/easter/BSODScreen';
import { SleepScreen } from './components/common/SleepScreen';
import { PowerScreen } from './components/common/PowerScreen';
import { LockScreen } from './components/desktop/LockScreen';

const OSMainContent: React.FC = () => {
  const { windows, isBsod, powerState, settings, currentDesktopId } = useOS();
  const { isLocked } = useAuth();

  if (isBsod) {
    return <BSODScreen />;
  }

  if (powerState === 'sleep') {
    return <SleepScreen />;
  }

  if (powerState === 'shutdown' || powerState === 'restart' || powerState === 'off') {
    return <PowerScreen mode={powerState} />;
  }

  return (
    <>
      <AnimatePresence>
        {isLocked && (
          <LockScreen
            wallpaper={
              settings.customLockScreenUrl ||
              'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=2560&auto=format&fit=crop&q=90'
            }
          />
        )}
      </AnimatePresence>
      <Desktop>
        <AnimatePresence>
          {windows
            .filter((win) => !win.desktopId || win.desktopId === currentDesktopId)
            .map((win) => (
              <WindowFrame key={win.id} windowState={win}>
                <RenderApp appId={win.appId} args={win.args} windowId={win.id} />
              </WindowFrame>
            ))}
        </AnimatePresence>
        <Taskbar />
      </Desktop>
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <OSProvider>
        <OSMainContent />
      </OSProvider>
    </AuthProvider>
  );
}
