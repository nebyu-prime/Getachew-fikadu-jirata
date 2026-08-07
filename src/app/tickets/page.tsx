'use client';

import { useEffect, useState } from 'react';

import Header from '@/components/Header';

import { useLanguage } from '@/context/LanguageContext';
import { useTelegramApp } from '@/hooks/useTelegramApp';



interface TicketItem {

  $id:string;

  phone:string;

  ticketNumber:string;

  status:string;

  paymentMethod:string;

  screenshot:string;

  carId:string;

  carName:string;

}




export default function TicketsPage(){


  const { t } = useLanguage();

  const { user } = useTelegramApp();



  const [tickets,setTickets] =
    useState<TicketItem[]>([]);



  const [loading,setLoading] =
    useState(true);

  const [notification, setNotification] =
    useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [previousTicketStatuses, setPreviousTicketStatuses] =
    useState<Map<string, string>>(new Map());



  const [searchPhone,setSearchPhone] =
    useState('');



  const [activeQuery,setActiveQuery] =
    useState('');






  const loadTickets = async(phone:string)=>{


    try{


      setLoading(true);



      if(

        typeof window === 'undefined'

        ||

        !(window as any).Appwrite

      ){

        return;

      }






      const {

        Client,

        Databases,

        Query

      } =
      (window as any).Appwrite;






      const client =

        new Client()

        .setEndpoint(

          process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||

          'https://fra.cloud.appwrite.io/v1'

        )

        .setProject(

          process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||

          '6765c172002d08b3b5b6'

        );






      const databases =

        new Databases(client);






      const response =

        await databases.listDocuments(


          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||

          '6765f6f3001120e42a14',




          process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID ||

          '6765f9fb0002879b1a46',




          [

            Query.equal(

              'phone',

              phone

            )

          ]

        );






      setTickets(

        response.documents as TicketItem[]

      );

      // Check for newly approved tickets
      const newTickets = response.documents as TicketItem[];
      newTickets.forEach((ticket) => {
        const previousStatus = previousTicketStatuses.get(ticket.$id);
        if (previousStatus === 'Pending' && ticket.status === 'Approved') {
          setNotification({
            type: 'success',
            message: `🎉 Your ticket #${ticket.ticketNumber} for ${ticket.carName} has been approved!`
          });
          setTimeout(() => setNotification(null), 5000);
        }
      });

      // Update previous statuses
      const newStatuses = new Map<string, string>();
      newTickets.forEach((ticket) => {
        newStatuses.set(ticket.$id, ticket.status);
      });
      setPreviousTicketStatuses(newStatuses);



    }


    catch(error){


      console.error(

        'Ticket loading error',

        error

      );


      // Fallback to localStorage
      const stored = localStorage.getItem('purchased_tickets');
      console.log('Loading from localStorage with phone:', phone);
      if (stored) {
        const allTickets = JSON.parse(stored);
        console.log('All tickets from localStorage:', allTickets);
        const filtered = allTickets.filter((ticket: any) =>
          ticket.phone && ticket.phone.trim() === phone.trim()
        );
        console.log('Filtered tickets:', filtered);
        setTickets(filtered);
      } else {
        console.log('No tickets found in localStorage');
        setTickets([]);
      }


    }


    finally{


      setLoading(false);


    }


  };








  useEffect(()=>{

    // Try to get phone from URL first
    const urlParams = new URLSearchParams(window.location.search);
    const phoneFromUrl = urlParams.get('phone');
    const phoneToUse = phoneFromUrl || localStorage.getItem('user_phone') || activeQuery;
    
    loadTickets(phoneToUse || '');

    const interval =

      setInterval(()=>{


        loadTickets(phoneToUse || '');


      },30000);





    return ()=>{


      clearInterval(interval);


    };


  },[activeQuery]);








  const handleSearch = ()=>{


    setActiveQuery(

      searchPhone.trim()

    );


  };






  const activeCount =

    tickets.filter(

      ticket =>

      [

        'approved',

        'active'

      ].includes(

        ticket.status?.toLowerCase()

      )

    ).length;





  const pendingCount =

    tickets.filter(

      ticket =>

      ticket.status?.toLowerCase()

      ===

      'pending'

    ).length;





  const totalCount =

    tickets.length;






  const stats = [


    {

      label:t.active,

      value:String(activeCount),

      accent:'text-emerald-300',

      border:'border-emerald-500/20',

      bg:'bg-emerald-500/10'

    },


    {

      label:t.pending,

      value:String(pendingCount),

      accent:'text-amber-300',

      border:'border-amber-500/20',

      bg:'bg-amber-500/10'

    },


    {

      label:t.totalStats,

      value:String(totalCount),

      accent:'text-orange-300',

      border:'border-orange-500/20',

      bg:'bg-orange-500/10'

    }


  ];


  return (

    <>

      <Header />



      <main className="min-h-screen pb-28 text-white">


        <div
          className="
          mx-auto
          max-w-2xl
          space-y-5
          px-4
          pt-4
          "
        >





          <section>


            <h1
              className="
              text-3xl
              font-black
              text-white
              "
            >

              {t.myTickets}

            </h1>



            <p
              className="
              mt-1
              text-sm
              text-sky-200/80
              "
            >

              Track your lottery tickets

            </p>


          </section>








          <section>


            <div
              className="
              flex
              gap-2
              "
            >


              <input

                type="text"

                value={searchPhone}

                onChange={(e)=>
                  setSearchPhone(
                    e.target.value
                  )
                }

                placeholder="+2519xxxxxxxx"

                className="
                h-14
                w-full
                rounded-2xl
                border
                border-white/10
                bg-white
                px-4
                text-lg
                font-medium
                text-black
                outline-none
                "

              />




              <button

                onClick={handleSearch}

                className="
                h-14
                rounded-2xl
                bg-yellow-400
                px-5
                font-black
                text-black
                "

              >

                Search

              </button>



            </div>


          </section>

          {notification && (
            <div
              className={`rounded-xl p-4 ${
                notification.type === 'success'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : notification.type === 'error'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}
            >
              {notification.message}
            </div>
          )}








          <section>


            <div
              className="
              grid
              grid-cols-3
              gap-3
              "
            >



              {
                stats.map((item)=>(


                  <div

                    key={item.label}

                    className={`
                    rounded-[18px]
                    border
                    ${item.border}
                    ${item.bg}
                    p-4
                    text-center
                    `}

                  >



                    <p
                      className={`
                      text-2xl
                      font-black
                      ${item.accent}
                      `}
                    >

                      {item.value}

                    </p>




                    <p
                      className="
                      mt-1
                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-slate-300
                      "
                    >

                      {item.label}

                    </p>


                  </div>


                ))
              }



            </div>


          </section>









          <section className="space-y-3">



          {
            loading && (

              <div
                className="
                rounded-3xl
                bg-[#1a1a1a]
                p-10
                text-center
                text-slate-300
                "
              >

                Loading tickets...

              </div>

            )
          }








          {
            !loading &&

            tickets.map((ticket)=>(


              <div

                key={ticket.$id}

                className="
                rounded-3xl
                border
                border-white/10
                bg-black
                p-4
                shadow-lg
                "

              >



                <div
                  className="
                  flex
                  items-center
                  justify-between
                  "
                >



                  <div
                    className="
                    flex
                    items-center
                    gap-3
                    "
                  >



                    <div
                      className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-xl
                      bg-yellow-400/10
                      text-2xl
                      "
                    >

                      🎫

                    </div>




                    <div>


                      <p
                        className="
                        font-black
                        text-white
                        "
                      >

                        Ticket #{ticket.ticketNumber}

                      </p>




                      <p
                        className="
                        text-xs
                        text-slate-400
                        "
                      >

                        {ticket.carName || 'Lottery Car'}

                      </p>


                    </div>


                  </div>






                  <span

                    className={`

                    rounded-full

                    border

                    px-3

                    py-1

                    text-xs

                    font-bold

                    uppercase



                    ${
                      ticket.status?.toLowerCase()
                      ===
                      'pending'

                      ?

                      'border-amber-500/20 bg-amber-500/10 text-amber-300'

                      :

                      'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'

                    }


                    `}

                  >

                    {ticket.status}


                  </span>



                </div>






                <div
                  className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                  text-sm
                  "
                >


                  <div
                    className="
                    rounded-xl
                    bg-[#1a1a1a]
                    p-3
                    "
                  >

                    <p className="text-slate-400">
                      Phone
                    </p>

                    <p className="font-bold">
                      {ticket.phone}
                    </p>

                  </div>





                  <div
                    className="
                    rounded-xl
                    bg-[#1a1a1a]
                    p-3
                    "
                  >

                    <p className="text-slate-400">
                      Payment
                    </p>

                    <p className="font-bold">
                      {ticket.paymentMethod}
                    </p>

                  </div>


                </div>


              </div>


            ))
          }









          {
            !loading &&

            tickets.length === 0 && (

              <div
                className="
                rounded-3xl
                bg-[#1a1a1a]
                p-10
                text-center
                "
              >

                <div className="text-5xl">
                  🎟️
                </div>


                <p
                  className="
                  mt-4
                  text-slate-400
                  "
                >

                  No tickets found

                </p>


              </div>

            )
          }



          </section>






        </div>


      </main>


    </>

  );


}