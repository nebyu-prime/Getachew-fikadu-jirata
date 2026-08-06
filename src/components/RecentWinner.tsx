import type { RecentWinner } from '@/types/lottery';

interface RecentWinnerProps {
  winner: RecentWinner;
}

export default function RecentWinner({ winner }: RecentWinnerProps) {
  return (
    <section className="surface-card rounded-[28px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-200/80">Recent Winner Card</p>
          <h3 className="mt-2 text-xl font-bold text-white">Recent winner</h3>
        </div>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
          Verified result
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoTile label="Winner Name" value={winner.name} />
        <InfoTile label="Winning Ticket" value={winner.winningTicket} />
        <InfoTile label="Prize" value={winner.prize} />
        <InfoTile label="Draw Date" value={winner.drawDate} />
      </div>
    </section>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-white">{value}</p>
    </div>
  );
}
