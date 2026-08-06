'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface CountdownProps {
  targetDate: string | Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string | Date): TimeLeft {
  let targetTime: number;

  if (typeof targetDate === 'string') {
    // Check if it's a local time string without timezone (like "2026-07-29T20:05:00")
    if (targetDate.includes('T') && !targetDate.includes('Z') && !targetDate.includes('+') && !targetDate.includes('-')) {
      // Parse as local time by manually constructing the date
      const [datePart, timePart] = targetDate.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
      const localDate = new Date(year, month - 1, day, hours, minutes, seconds);
      targetTime = localDate.getTime();
    } else {
      // ISO string with timezone - use standard parsing
      targetTime = new Date(targetDate).getTime();
    }
  } else {
    targetTime = targetDate.getTime();
  }

  const difference = Math.max(targetTime - Date.now(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-h-[62px] min-w-[62px] flex-col items-center justify-center rounded-[14px] border border-amber-500/20 bg-slate-900/70 px-2 py-2 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
      <span className="text-[26px] font-black leading-none text-amber-400">
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ targetDate }: CountdownProps) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const update = () => setTimeLeft(getTimeLeft(targetDate));

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return null;
  }

  // Determine which time blocks to show (hide leading zeros)
  const showDays = timeLeft.days > 0;
  const showHours = showDays || timeLeft.hours > 0;
  const showMinutes = showHours || timeLeft.minutes > 0;
  const showSeconds = true; // Always show seconds

  // Calculate grid columns based on visible blocks
  const visibleBlocks = [showDays, showHours, showMinutes, showSeconds].filter(Boolean).length;
  const gridCols = visibleBlocks === 1 ? 'grid-cols-1' : visibleBlocks === 2 ? 'grid-cols-2' : visibleBlocks === 3 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <section className="px-0 py-0">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em] text-sky-200/80">
        {t.closesIn || 'Closes In'}
      </p>
      <div className={`grid ${gridCols} gap-2`}>
        {showDays && <TimeBlock value={timeLeft.days} label={t.days || 'Days'} />}
        {showHours && <TimeBlock value={timeLeft.hours} label={t.hours || 'Hours'} />}
        {showMinutes && <TimeBlock value={timeLeft.minutes} label={t.minutes || 'Minutes'} />}
        {showSeconds && <TimeBlock value={timeLeft.seconds} label={t.seconds || 'Seconds'} />}
      </div>
    </section>
  );
}