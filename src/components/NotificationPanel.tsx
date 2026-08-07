'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'winner' | 'ticket';
  title: string;
  message: string;
  timestamp: number;
  data?: any;
}

export default function NotificationPanel() {

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [previousTicketStatuses, setPreviousTicketStatuses] = useState<Map<string, string>>(new Map());
  const [dismissedTickets, setDismissedTickets] = useState<Set<string>>(new Set());

  // Load dismissed tickets from localStorage on mount
  useEffect(() => {
    const storedDismissed = localStorage.getItem('dismissed_tickets');
    if (storedDismissed) {
      try {
        const dismissedArray = JSON.parse(storedDismissed);
        setDismissedTickets(new Set(dismissedArray));
      } catch (e) {
        console.error('Error parsing dismissed tickets:', e);
      }
    }
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const newNotifications: Notification[] = [];

      // Load winner notifications from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('winner_')) {
          try {
            const winnerData = JSON.parse(localStorage.getItem(key) || '{}');
            newNotifications.push({
              id: key,
              type: 'winner',
              title: '🏆 Winner Selected',
              message: `${winnerData.phone} - Ticket #${winnerData.ticketNumber}`,
              timestamp: Date.now(),
              data: winnerData
            });
          } catch (e) {
            console.error('Error parsing winner data:', e);
          }
        }
      }

      // Load ticket notifications from Appwrite
      try {
        if (typeof window !== 'undefined' && (window as any).Appwrite) {
          const { Client, Databases, Query } = (window as any).Appwrite;
          const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a76554c003c80feea3a');
          const databases = new Databases(client);

          const currentUserPhone = localStorage.getItem('user_phone');

          if (currentUserPhone) {
            const response = await (databases as any).listDocuments(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a76555e000eab75c13b',
              process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || 'payment_tickets',
              [
                (Query as any).equal('phone', currentUserPhone),
                (Query as any).equal('status', 'Approved')
              ]
            );

            response.documents.forEach((ticket: any) => {
              const previousStatus = previousTicketStatuses.get(ticket.$id);
              if (previousStatus === 'Pending' && ticket.status === 'Approved') {
                // Ticket approved notification will show in the notification panel
              }

              // Skip if this ticket has been dismissed
              if (!dismissedTickets.has(ticket.$id)) {
                newNotifications.push({
                  id: ticket.$id,
                  type: 'ticket',
                  title: '🎟️ Ticket Approved',
                  message: `Ticket #${ticket.ticketNumber} for ${ticket.carName}`,
                  timestamp: Date.now(),
                  data: ticket
                });
              }
            });

            const newStatuses = new Map<string, string>();
            response.documents.forEach((ticket: any) => {
              newStatuses.set(ticket.$id, ticket.status);
            });
            setPreviousTicketStatuses(newStatuses);
          }
        }
      } catch (e) {
        // Suppress HTML error responses from Appwrite (likely network/routing issues)
        if (e && typeof e === 'object' && 'message' in e && (e as any).message.includes('<!DOCTYPE')) {
          console.warn('Appwrite returned HTML error (likely temporary network issue)');
        } else {
          console.error('Error loading tickets from Appwrite:', e);
        }
      }

      // Sort notifications by timestamp (newest first)
      newNotifications.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(newNotifications);
      setHasNewNotifications(newNotifications.length > 0);
    };

    loadNotifications();

    // Disabled polling to prevent exceeding database read limits
    // const interval = setInterval(loadNotifications, 5000);

    // Listen for winner selected event
    const handleWinnerSelected = (event: any) => {
      console.log('Winner selected event received:', event.detail);
      loadNotifications();
    };

    window.addEventListener('winnerSelected', handleWinnerSelected);

    return () => {
      // clearInterval(interval); // Disabled polling
      window.removeEventListener('winnerSelected', handleWinnerSelected);
    };
  }, [previousTicketStatuses]);

  const notificationCount = notifications.length;


  return (
    <>

      {/* Notification Button */}

      <button
        onClick={() => setOpen(true)}
        className="
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          border
          border-yellow-400/40
          bg-yellow-400/10
          transition
          hover:bg-yellow-400/20
        "
      >

        <svg
          className="h-5 w-5 text-yellow-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="
              M18 8
              A6 6 0 0 0 6 8
              C6 15 3 15 3 17
              H21
              C21 15 18 15 18 8
            "
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="
              M10 21
              H14
            "
          />

        </svg>


        {hasNewNotifications && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              min-w-[20px]
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-[10px]
              font-bold
              text-white
              ring-2
              ring-slate-950
            "
          >
            {notificationCount}
          </span>
        )}

      </button>





      {open && (

        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            h-screen
            w-screen
            items-center
            justify-center
            bg-black/70
            p-4
          "
        >


          <div
            className="
              relative
              w-full
              max-w-md
              rounded-3xl
              border
              border-blue-900
              bg-[#020617]
              p-5
              shadow-2xl
            "
          >


            {/* Header */}

            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >

              <h2
                className="
                  text-xl
                  font-black
                  text-yellow-400
                "
              >
                Notifications
              </h2>

              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      // Clear all winner entries from localStorage
                      for (let i = localStorage.length - 1; i >= 0; i--) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('winner_')) {
                          localStorage.removeItem(key);
                        }
                      }
                      // Clear all dismissed tickets and save to localStorage
                      const ticketIds = notifications.filter(n => n.type === 'ticket').map(n => n.id);
                      setDismissedTickets(new Set(ticketIds));
                      localStorage.setItem('dismissed_tickets', JSON.stringify(ticketIds));
                      // Clear all notifications (both winner and ticket)
                      setNotifications([]);
                      setHasNewNotifications(false);
                    }}
                    className="
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-red-400
                      hover:text-red-300
                      transition
                    "
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-900
                    text-white
                  "
                >
                  ✕
                </button>
              </div>


            </div>




            {/* Notifications List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`
                      rounded-2xl
                      border
                      p-4
                      ${notif.type === 'winner'
                        ? 'border-yellow-400/30 bg-[#0f172a]'
                        : 'border-blue-400/30 bg-[#0f172a]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          text-lg
                          ${notif.type === 'winner'
                            ? 'bg-yellow-400/20'
                            : 'bg-blue-400/20'
                          }
                        `}
                      >
                        {notif.type === 'winner' ? '🏆' : '🎟️'}
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm">
                          {notif.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {notif.message}
                    </p>
                    {notif.type === 'winner' && notif.data && (
                      <p className="text-slate-500 text-xs mt-2">
                        {notif.data.carName}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No notifications</p>
                </div>
              )}
            </div>



          </div>


        </div>

      )}


    </>
  );
}
