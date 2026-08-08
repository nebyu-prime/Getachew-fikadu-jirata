'use client';

import { useEffect, useState } from 'react';

import Header from '@/components/Header';
import LotteryCard from '@/components/LotteryCard';
type FilterType =
  | 'all'
  | 'popular'
  | 'new';
  
export default function HomePage() {
  const [filter, setFilter] =
    useState<FilterType>('all');
  const [lotteries, setLotteries] =
    useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [phoneFromUrl, setPhoneFromUrl] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const phone = urlParams.get('phone');
    console.log('HomePage phone from URL:', phone);
    if (phone) {
      setPhoneFromUrl(phone);
    }
  }, []);
  const fetchLotteries = async () => {
    try {
      setLoading(true);
      if (
        typeof window === 'undefined' ||
        !(window as any).Appwrite
      ) {

        return;

      }
      const {
        Client,
        Databases,
        Storage
      } = (window as any).Appwrite;
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim())
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID?.trim());
      const databases = new Databases(client);


      const storage =
        new Storage(client);
      const response =
        await (databases as any).listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID?.trim(),
          process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID?.trim()
        );

      console.log('HomePage: Raw documents from Appwrite:', response.documents);
      console.log('HomePage: Total documents fetched:', response.documents.length);
      console.log('HomePage: Document attributes:', response.documents.length > 0 ? Object.keys(response.documents[0]) : 'No documents');
      
      // Use TICKET PROJECT to fetch tickets
      const ticketClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim() || '6a76554c003c80feea3a');
      const ticketDatabases = new Databases(ticketClient);
      
      // Count tickets per car (optional - if this fails, cars will still show with 0 actual sales)
      let ticketCounts: Record<string, number> = {};
      let participantCounts: Record<string, Set<string>> = {};
      
      try {
        const ticketsResponse = await (ticketDatabases as any).listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim() || '6a76555e000eab75c13b',
          process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID?.trim() || 'payment_tickets'
        );
        
        ticketsResponse.documents.forEach((ticket: any) => {
          if (ticket.carId && ticket.status === 'Approved') {
            ticketCounts[ticket.carId] = (ticketCounts[ticket.carId] || 0) + 1;
            if (!participantCounts[ticket.carId]) {
              participantCounts[ticket.carId] = new Set();
            }
            participantCounts[ticket.carId].add(ticket.phone);
          }
        });
        console.log('HomePage: ticketCounts:', ticketCounts);
        console.log('HomePage: participantCounts:', Object.fromEntries(Object.entries(participantCounts).map(([k, v]) => [k, v.size])));
      } catch (ticketError) {
        console.error('HomePage: Failed to fetch tickets (will show 0 actual sales):', ticketError);
        // Continue without ticket data - cars will show with just the 90% baseline
      }
      
      const formattedLotteries =

        response.documents.map((lottery:any)=>{
          console.log('HomePage: Processing lottery:', lottery.$id, lottery.carName);
          let photo = '';
          if(lottery.carPhoto){
            photo =
              storage.getFileView(
                process.env.NEXT_PUBLIC_APPWRITE_CAR_STORAGE_BUCKET_ID,
                lottery.carPhoto
              ).toString();

          }
          const totalTickets =
            Number(
              lottery.totalTickets || 3500
            );
          // Calculate 90% baseline for pre-sold tickets
          const baselineSold = Math.floor(totalTickets * 0.90);
          const actualSold = ticketCounts[lottery.$id] || 0;
          const soldTickets = baselineSold + actualSold;
          const participants = baselineSold + (participantCounts[lottery.$id]?.size || 0);
          console.log(`Lottery: ${lottery.carName}, totalTickets: ${totalTickets}, baseline: ${baselineSold}, actual: ${actualSold}, total sold: ${soldTickets}, participants: ${participants}, isActive: ${lottery.isActive}`);
          return {
            id:
              lottery.$id,
            carName:
              lottery.carName,
            description:
              lottery.description,
            carPhoto:
              photo,
            ticketPrice:
              Number(
                lottery.ticketPrice || 0
              ),
            totalTickets,
            soldTickets,
            remainingTickets:
              Math.max(
                0,
                totalTickets - soldTickets
              ),
            participants,
            winner: lottery.winner,
            progress:

              totalTickets > 0

              ?

              Number(
                (
                  (soldTickets / totalTickets) * 100
                ).toFixed(1)
              )

              :

              0,
            drawDate:
              lottery.drawDate,
            isActive:
              lottery.isActive !== undefined ? lottery.isActive : true,

            isFeatured:
              lottery.isFeatured !== undefined ? lottery.isFeatured : false,


          };


        });
      setLotteries(formattedLotteries);
      console.log('HomePage: Total lotteries fetched:', formattedLotteries.length);
      console.log('HomePage: Lottery details:', formattedLotteries.map((l: any) => ({ id: l.id, name: l.carName, isActive: l.isActive, isFeatured: l.isFeatured })));
    }

    catch(error){
      console.error(
        'Lottery loading error:',
        error
      );

      // Don't use fallback sample data - show empty state instead
      setLotteries([]);


    }

    finally{


      setLoading(false);


    }


  };
  useEffect(()=>{


    fetchLotteries();
    // Disabled polling to prevent exceeding database read limits
    // const interval = setInterval(()=>{
    //   fetchLotteries();
    // },30000);

    return ()=>{
      // clearInterval(interval); // Disabled polling
    };


  },[]);

  // Get top 2 active lotteries to display above Active Lotteries section
  const featuredLotteries = lotteries
    .filter(lottery => lottery.isActive)
    .slice(0, 2);

  const featuredLotteryIds = new Set(featuredLotteries.map((l: any) => l.id));

  console.log('HomePage: Featured lotteries:', featuredLotteries.map((l: any) => ({ id: l.id, name: l.carName })));
  console.log('HomePage: Filter type:', filter);

  const filteredLotteries =

    lotteries.filter((lottery)=>{


      if(!lottery.isActive) {
        console.log(`HomePage: Filtering out ${lottery.carName} - not active (isActive: ${lottery.isActive})`);
        return false;
      }

      if(featuredLotteryIds.has(lottery.id)) {
        console.log(`HomePage: Filtering out ${lottery.carName} - already featured`);
        return false;
      }

      if(filter === 'popular'){

        return lottery.progress > 70;

      }

      if(filter === 'new'){
        // Show lotteries created in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const lotteryDate = new Date(lottery.$createdAt || Date.now());
        return lotteryDate >= sevenDaysAgo;
      }

      console.log(`HomePage: Including ${lottery.carName} in filtered list`);
      return true;


    });

  console.log('HomePage: Filtered lotteries count:', filteredLotteries.length);
  console.log('HomePage: Filtered lottery details:', filteredLotteries.map((l: any) => ({ id: l.id, name: l.carName, isActive: l.isActive, isFeatured: l.isFeatured })));

  return (

    <>

      <Header />
      <main className="min-h-screen pb-28">
        <div
          className="
          mx-auto
          max-w-2xl
          space-y-5
          px-4
          pt-4
          "
        >

          {
            loading ? (
              <div
                className="
                rounded-3xl
                bg-white/5
                p-10
                text-center
                text-slate-400
                "
              >
                Loading lotteries...
              </div>
            ) : (
              featuredLotteries.map((lottery) => (
                <LotteryCard
                  key={lottery.id}
                  prize={lottery}
                  featured
                  showButtons
                  phoneFromUrl={phoneFromUrl}
                />
              ))
            )
          }

        
          <section className="space-y-4">

            <div className="flex items-center justify-between">
              <h2
                className="
                text-xl
                font-black
                text-white
                "
              >
                Active Lotteries
              </h2>
              <span className="text-sm text-slate-400">
                {filteredLotteries.length} available
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('popular')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === 'popular'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                Popular
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  filter === 'new'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                New
              </button>
            </div>

            {
              loading ? (
                <div
                  className="
                  rounded-3xl
                  bg-white/5
                  p-10
                  text-center
                  text-slate-400
                  "
                >
                  Loading lotteries...
                </div>
              ) : filteredLotteries.length === 0 ? (
                <div
                  className="
                  rounded-3xl
                  bg-white/5
                  p-10
                  text-center
                  "
                >
                  <div className="text-5xl">
                    🎟️
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    No active lotteries
                  </h3>
                  <p className="mt-2 text-slate-400">
                    Additional lotteries can be added from the admin panel.
                  </p>
                </div>
              ) : (
                filteredLotteries.map((lottery)=>(
                  <LotteryCard
                    key={lottery.id}
                    prize={lottery}
                    showButtons
                    phoneFromUrl={phoneFromUrl}
                  />
                ))
              )
            }
          </section>
        </div>
      </main>
    </>

  );

}