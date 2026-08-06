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

        .setEndpoint(
          process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
          'https://fra.cloud.appwrite.io/v1'
        )

        .setProject(
          process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID ||
          '672ff168000cbe773d3b'
        );
      const databases =
        new Databases(client);


      const storage =
        new Storage(client);
      const response =
        await (databases as any).listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID ||
          '67308bd3000e40a80649',
          process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID ||
          '67308be1002a84336ce9'


        );
      
      // Use TICKET PROJECT to fetch tickets
      const ticketClient = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6765c172002d08b3b5b6');
      const ticketDatabases = new Databases(ticketClient);
      
      // Fetch all tickets to count sold tickets per car
      const ticketsResponse = await (ticketDatabases as any).listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6765f6f3001120e42a14',
        process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || '6765f9fb0002879b1a46'
      );
      
      // Count tickets per car
      const ticketCounts: Record<string, number> = {};
      const participantCounts: Record<string, Set<string>> = {};
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
      
      const formattedLotteries =

        response.documents.map((lottery:any)=>{
          let photo = '';
          if(lottery.carPhoto){
            photo =
              storage.getFileView(

                process.env.NEXT_PUBLIC_APPWRITE_CAR_STORAGE_BUCKET_ID ||
                '672ff8f80018710993c2',

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
          console.log(`Lottery: ${lottery.carName}, totalTickets: ${totalTickets}, baseline: ${baselineSold}, actual: ${actualSold}, total sold: ${soldTickets}, participants: ${participants}`);
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
              lottery.isActive,

            isFeatured:
              lottery.isFeatured,


          };


        });
      setLotteries(formattedLotteries);
    }

    catch(error){
      console.error(
        'Lottery loading error:',
        error
      );

      // Fallback to sample data if Appwrite fails
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
      
      setLotteries([
        {
          id: 'sample-1',
          carName: 'Toyota Land Cruiser',
          description: '2024 Model - Fully Loaded',
          carPhoto: '',
          ticketPrice: 1000,
          totalTickets: 3500,
          soldTickets: 3150,
          remainingTickets: 350,
          participants: 3150,
          progress: 90,
          drawDate: futureDate.toISOString().split('T')[0],
          isActive: true,
          isFeatured: true,
        }
      ]);


    }

    finally{


      setLoading(false);


    }


  };
  useEffect(()=>{


    fetchLotteries();
    const interval =

      setInterval(()=>{
        fetchLotteries();


      },30000);

    return ()=>{


      clearInterval(interval);


    };


  },[]);

  // Get top 2 active lotteries to display above Active Lotteries section
  const featuredLotteries = lotteries
    .filter(lottery => lottery.isActive)
    .slice(0, 2);

  const featuredLotteryIds = new Set(featuredLotteries.map(l => l.id));

  const filteredLotteries =

    lotteries.filter((lottery)=>{


      if(!lottery.isActive)

        return false;

      if(featuredLotteryIds.has(lottery.id))

        return false;

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

      return true;


    });

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
            featuredLotteries.map((lottery) => (
              <LotteryCard
                key={lottery.id}
                prize={lottery}
                featured
                showButtons
                phoneFromUrl={phoneFromUrl}
              />
            ))
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
              loading ?


              (

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


              )
              :
              filteredLotteries.length === 0 ?
              (
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
              )
              :
              filteredLotteries.map((lottery)=>(
                <LotteryCard
                  key={lottery.id}
                  prize={lottery}
                  showButtons
                  phoneFromUrl={phoneFromUrl}
                />
              ))
            }
          </section>
        </div>
      </main>
    </>

  );

}