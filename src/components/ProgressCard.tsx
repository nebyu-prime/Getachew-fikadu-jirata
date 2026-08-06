'use client';

import { useEffect, useState } from 'react';
import type { TicketStats } from '@/types/lottery';
import { useLanguage } from '@/context/LanguageContext';

interface ProgressCardProps {
  stats: TicketStats;
}

export default function ProgressCard({ stats }: ProgressCardProps) {
  const { t } = useLanguage();
  const [animate, setAnimate] = useState(false);
  const percentage = stats.total > 0 ? (stats.sold / stats.total) * 100 : 0;
  const remaining = Math.max(stats.total - stats.sold, 0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimate(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="px-0 py-0">
      <div className="flex items-center justify-between text-[15px] font-medium text-slate-200">
        <p>{stats.sold.toLocaleString()} {t.sold}</p>
        <p className="font-bold text-emerald-300">{Math.round(percentage)}% {t.filled}</p>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#2dd4bf_0%,#22c55e_100%)] transition-all duration-1000 ease-out"
          style={{ width: animate ? `${percentage}%` : '0%' }}
        />
      </div>

      <p className="mt-2 text-[13px] text-sky-200/60">{remaining.toLocaleString()} {t.ticketsRemaining}</p>
    </section>
  );
}
