'use client';

import { useEffect, useState } from 'react';

import BuyTicketButton from './BuyTicketButton';
import Countdown from './Countdown';

type LotteryCardProps = {
  prize: any;
  showButtons?: boolean;
  featured?: boolean;
  phoneFromUrl?: string | null;
};
export default function LotteryCard({
  prize,
  showButtons = false,
  featured = false,
  phoneFromUrl = null,
}: LotteryCardProps) {

  const [approvedTickets, setApprovedTickets] = useState(0);
  const totalTickets = Number(prize.totalTickets) || 3500;
  const baselineParticipants = Math.floor(totalTickets * 0.90);
  const [participants, setParticipants] = useState(baselineParticipants);
  const [winner, setWinner] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [previousWinner, setPreviousWinner] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    let wasExpired = false;

    const fetchApprovedTickets = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).Appwrite) {
          const { Client, Databases, Query } = (window as any).Appwrite;
          const client = new Client()
            .setEndpoint(
              process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() || 'https://fra.cloud.appwrite.io/v1'
            )
            .setProject(
              process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim() || '6a76554c003c80feea3a'
            );
          const databases = new Databases(client);
          const result =
            await (databases as any).listDocuments(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim() || '6a76555e000eab75c13b',
              process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID?.trim() || 'payment_tickets',
              [
                Query.equal(
                  'carId',
                  prize.$id || prize.id
                ),

                Query.equal(
                  'status',
                  'Approved'
                ),
              ]
          );
        if (mounted) {
          setApprovedTickets(
            result.total || 0
          );

          // Count unique phone numbers (participants)
          const uniquePhones = new Set(
            result.documents.map((doc: any) => doc.phone)
          );
          const totalTickets = Number(prize.totalTickets) || 3500;
          const baselineParticipants = Math.floor(totalTickets * 0.90);
          setParticipants(baselineParticipants + uniquePhones.size);
          console.log(`LotteryCard: ${prize.carName}, baseline: ${baselineParticipants}, unique approved: ${uniquePhones.size}, total participants: ${baselineParticipants + uniquePhones.size}`);

          // Check if lottery has expired directly (don't rely on state)
          const drawDate = prize.drawDate;
          let currentlyExpired = false;
          if (drawDate) {
            const now = new Date();
            let draw: Date;
            if (typeof drawDate === 'string' && drawDate.includes('T') && !drawDate.includes('Z') && !drawDate.includes('+') && !drawDate.includes('-')) {
              const [datePart, timePart] = drawDate.split('T');
              const [year, month, day] = datePart.split('-').map(Number);
              const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
              draw = new Date(year, month - 1, day, hours, minutes, seconds);
            } else {
              draw = new Date(drawDate);
            }
            currentlyExpired = now >= draw;
          }

          // Check if lottery has a winner stored
          if (prize.winner) {
            const parsedWinner = typeof prize.winner === 'string' ? JSON.parse(prize.winner) : prize.winner;
            console.log('Winner found in prize:', parsedWinner);
            setWinner(parsedWinner);
          } else if (currentlyExpired && result.documents.length > 0) {
            console.log('No winner in prize, lottery expired, selecting new winner');
            // Auto-select winner if expired and no winner exists
            const randomIndex = Math.floor(Math.random() * result.documents.length);
            const winningTicket = result.documents[randomIndex];
            const winnerInfo = {
              phone: winningTicket.phone,
              ticketNumber: winningTicket.ticketNumber,
              carName: winningTicket.carName
            };
            setWinner(winnerInfo);
            // Save winner to localStorage for notification panel
            localStorage.setItem(`winner_${prize.$id || prize.id}`, JSON.stringify(winnerInfo));

            // Save winner to Appwrite database to persist across page refreshes
            try {
              const { Client, Databases, ID } = (window as any).Appwrite;
              const carClient = new Client()
                .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() || 'https://fra.cloud.appwrite.io/v1')
                .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim() || '6a763444003c46bbc085');
              const carDatabases = new Databases(carClient);
              await carDatabases.updateDocument(
                process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID?.trim() || '6a7636c700306e4c0200',
                process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID?.trim() || '6a7637300026fd93b315',
                prize.$id || prize.id,
                {
                  winner: JSON.stringify(winnerInfo)
                }
              );
              console.log('Winner saved to Appwrite');
            } catch (updateError) {
              console.error('Error saving winner to Appwrite:', updateError);
            }

            // Dispatch custom event to notify NotificationPanel
            window.dispatchEvent(new CustomEvent('winnerSelected', { detail: winnerInfo }));
          }
        }
        }
      } catch (error) {

        console.error(
          'Ticket count error:',
          error
        );

        // Fallback to localStorage for approved tickets count and participants
        if (mounted) {
          const stored = localStorage.getItem('purchased_tickets');
          if (stored) {
            const allTickets = JSON.parse(stored);
            const approved = allTickets.filter((ticket: any) =>
              ticket.carId === (prize.$id || prize.id) && ticket.status === 'Approved'
            );
            setApprovedTickets(approved.length);

            // Count unique phone numbers
            const uniquePhones = new Set(approved.map((ticket: any) => ticket.phone));
            const totalTickets = Number(prize.totalTickets) || 3500;
            const baselineParticipants = Math.floor(totalTickets * 0.90);
            setParticipants(baselineParticipants + uniquePhones.size);

            // Check for winner in localStorage
            const winnerData = localStorage.getItem(`winner_${prize.$id || prize.id}`);
            if (winnerData) {
              const parsedWinner = JSON.parse(winnerData);
              setWinner(parsedWinner);
            } else if (isExpired && approved.length > 0) {
              // Auto-select winner from localStorage
              const randomIndex = Math.floor(Math.random() * approved.length);
              const winningTicket = approved[randomIndex];
              const winnerInfo = {
                phone: winningTicket.phone,
                ticketNumber: winningTicket.ticketNumber,
                carName: winningTicket.carName
              };
              setWinner(winnerInfo);
              // Save winner to localStorage for notification panel
              localStorage.setItem(`winner_${prize.$id || prize.id}`, JSON.stringify(winnerInfo));

              // Try to save winner to Appwrite database to persist across page refreshes
              try {
                const { Client, Databases } = (window as any).Appwrite;
                const client = new Client()
                  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() || 'https://fra.cloud.appwrite.io/v1')
                  .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim() || '6a763444003c46bbc085');
                const databases = new Databases(client);
                await databases.updateDocument(
                  process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID?.trim() || '6a7636c700306e4c0200',
                  process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID?.trim() || '6a7637300026fd93b315',
                  prize.$id || prize.id,
                  {
                    winner: winnerInfo
                  }
                );
              } catch (updateError) {
                console.error('Error saving winner to Appwrite (from localStorage fallback):', updateError);
              }
            }
          }
        }
      }
    };

    // Check if lottery has expired
    const checkExpiration = () => {
      const drawDate = prize.drawDate;
      if (drawDate) {
        const now = new Date();
        let draw: Date;
        // Handle local time strings without timezone (like "2026-07-29T11:45:00")
        if (typeof drawDate === 'string' && drawDate.includes('T') && !drawDate.includes('Z') && !drawDate.includes('+') && !drawDate.includes('-')) {
          const [datePart, timePart] = drawDate.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
          draw = new Date(year, month - 1, day, hours, minutes, seconds);
        } else {
          draw = new Date(drawDate);
        }
        const nowExpired = now >= draw;
        setIsExpired(nowExpired);

        // If lottery just expired, trigger winner selection immediately
        if (!wasExpired && nowExpired) {
          fetchApprovedTickets();
        }
        wasExpired = nowExpired;
      }
    };
    checkExpiration();

    // Check expiration every second to trigger winner selection when countdown ends
    const expirationInterval = setInterval(checkExpiration, 1000);

    fetchApprovedTickets();

    // Disabled polling to prevent exceeding database read limits
    // const interval = setInterval(fetchApprovedTickets, 30000);
    return () => {

      mounted = false;
      // clearInterval(interval); // Disabled polling
      clearInterval(expirationInterval);

    };
  }, [prize.id, prize.drawDate, prize.winner]);

  // Calculate 90% baseline for pre-sold tickets
  const baselineSold = Math.floor(totalTickets * 0.90);
  const soldTickets = baselineSold + approvedTickets;


  const remainingTickets =
    Math.max(
      0,
      totalTickets - soldTickets
    );
  const percentage =
    totalTickets > 0
      ? Math.min(
          100,
          Number(
            (
              (soldTickets / totalTickets) * 100
            ).toFixed(1)
          )
        )
      : 0;



  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(250, 204, 21, 0.5);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes progress-fill {
          from {
            width: 0%;
          }
          to {
            width: var(--progress-width);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes zoom-in-out {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .animate-progress {
          animation: progress-fill 1.5s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-zoom-in-out {
          animation: zoom-in-out 4s ease-in-out infinite;
        }
      `}</style>

    <div
      className={`
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        bg-[#064b3c]
        shadow-2xl
        transition-all
        duration-300
        hover:scale-[1.02]
        hover:shadow-3xl
        hover:border-yellow-400/20
        animate-fade-in
        ${
          featured
            ? 'ring-1 ring-yellow-400/30 animate-pulse-glow'
            : ''
        }
      `}
    >
      <div
        className="
          relative
          h-64
          overflow-hidden
          bg-white
        "
      >

        {prize.carPhoto && (

          <img
            src={prize.carPhoto}
            alt={prize.carName}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              hover:scale-110
              animate-zoom-in-out
            "
          />

        )}
        {featured && (

          <div
            className="
              absolute
              left-4
              top-4
              rounded-full
              bg-yellow-400/20
              px-4
              py-2
              text-xs
              font-bold
              text-yellow-300
              animate-float
            "
          >
            🔥 Featured
          </div>

        )}
        {isExpired && (
          <div
            className="
              absolute
              left-4
              top-4
              rounded-full
              bg-red-500/20
              px-4
              py-2
              text-xs
              font-bold
              text-red-300
            "
          >
            🎯 Draw Complete
          </div>
        )}
        <div
          className="
            absolute
            right-4
            top-4
            text-xl
            text-yellow-400
          "
        >
          ★★★★★
        </div>


      </div>
      <div className="p-5">


        <h2
          className="
            text-2xl
            font-black
            text-white
          "
        >
          {prize.carName}
        </h2>



        <p
          className="
            mt-1
            font-semibold
            text-emerald-300
          "
        >
          {prize.description}
        </p>
        {prize.drawDate && (

          <div className="mt-5">

            <Countdown
              targetDate={prize.drawDate}
            />

          </div>

        )}
        <div className="mt-5 space-y-3">


          <div className="text-sm font-bold text-white">

            Sold Tickets:

            <span className="ml-2 text-yellow-300">

              {soldTickets}

            </span>

          </div>
          <div
            className="
              h-4
              overflow-hidden
              rounded-full
              bg-black/40
            "
          >

            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-yellow-400
                to-emerald-400
                animate-progress
                shimmer-effect
              "
              style={{
                '--progress-width': `${percentage}%`,
                width: `${percentage}%`,
              } as React.CSSProperties}
            />

          </div>
          <div className="flex justify-end">

            <span className="text-xs font-bold text-yellow-300">

              {percentage}% Filled

            </span>

          </div>

          <div className="text-sm font-bold text-slate-300">

            Remaining Tickets:

            <span className="ml-2 text-emerald-300">

              {remainingTickets}

            </span>

          </div>

          {winner && (
            <div className="mt-4 rounded-xl bg-yellow-400/10 border border-yellow-400/30 p-4 animate-fade-in animate-pulse-glow">
              <p className="text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2">
                🏆 Winner
              </p>
              <div className="space-y-1">
                <p className="text-sm text-white">
                  Phone: <span className="font-bold text-yellow-400">{winner.phone}</span>
                </p>
                <p className="text-sm text-white">
                  Ticket: <span className="font-bold text-yellow-400">{winner.ticketNumber}</span>
                </p>
              </div>
            </div>
          )}


        </div>
        {showButtons && !isExpired && (

          <div className="mt-5">

            <BuyTicketButton
              lottery={prize}
              participants={participants}
              phoneFromUrl={phoneFromUrl}
            />

          </div>

        )}





      </div>


    </div>
    </>
  );

}

}