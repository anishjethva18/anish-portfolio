import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';

export const HeaderClockBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { settings } = useOS();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const update = () => {
      let d = new Date();
      if (settings.timeZone) {
        try {
          const tzString = d.toLocaleString('en-US', { timeZone: settings.timeZone });
          d = new Date(tzString);
        } catch {}
      }
      setNow(d);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [settings.timeZone]);

  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Format 12h or 24h
  let timeStr = '';
  if (settings.clockFormat === '24h') {
    timeStr = `${String(hours).padStart(2, '0')}:${minutes}`;
  } else {
    const h12 = hours % 12 || 12;
    timeStr = `${h12}:${minutes}`;
  }

  if (settings.showSecondsInClock) {
    timeStr += `:${seconds}`;
  }

  // Days in short format (like 'sun' in image 1)
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[now.getDay()];
  const dateNum = now.getDate();
  const monthName = months[now.getMonth()];
  const dateStr = `${dayName}, ${dateNum} ${monthName}`;

  return (
    <div className={`flex items-baseline gap-2.5 px-1 pt-1 pb-3 select-none ${className}`}>
      <span className="text-3xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans tabular-nums drop-shadow-xs">
        {timeStr}
      </span>
      <span className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-200 tracking-normal">
        {dateStr}
      </span>
    </div>
  );
};
