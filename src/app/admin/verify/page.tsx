'use client';

import { useEffect, useState } from 'react';


export default function VerifyPage() {


  const [tickets, setTickets] =
    useState<any[]>([]);


  const [loading, setLoading] =
    useState(true);

  const [notification, setNotification] =
    useState<{ type: 'success' | 'error'; message: string } | null>(null);




  const loadTickets = async () => {

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
        Query,
        Storage
      } =
      (window as any).Appwrite;





      const client =

        new Client()

        .setEndpoint(
          process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim()
        )

        .setProject(
          process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim()
        );





      const databases =

        new Databases(client);

      const storage = new Storage(client);

      let response;
      try {
        response = await (databases as any).listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim(),
          process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID?.trim(),
          [Query.equal('status', 'Pending')]
        );
      } catch (error) {
        console.error('Load pending tickets error:', error);
        // If database fetch fails, show empty list
        setTickets([]);
        setLoading(false);
        return;
      }





      const formattedTickets = [];

      for (const ticket of response.documents) {
        console.log('Processing ticket:', ticket.$id, 'screenshot field:', ticket.screenshot);
        let screenshotUrl = null;
        if (ticket.screenshot) {
          try {
            console.log('Fetching screenshot for ticket:', ticket.$id, 'fileId:', ticket.screenshot);
            screenshotUrl = await storage.getFileView(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID?.trim() || '6a76564800384f6aa185',
              ticket.screenshot
            );
            console.log('Screenshot URL fetched:', screenshotUrl);
          } catch (error) {
            console.error('Error fetching screenshot for ticket:', ticket.$id, error);
          }
        } else {
          console.log('No screenshot field for ticket:', ticket.$id);
        }

        formattedTickets.push({
          id: ticket.$id,
          fullName: ticket.fullName || 'N/A',
          phone: ticket.phone,
          ticketNumber: ticket.ticketNumber,
          paymentMethod: ticket.paymentMethod,
          screenshot: ticket.screenshot || null,
          carId: ticket.carId,
          carName: ticket.carName,
          status: ticket.status,
          screenshotUrl
        });
      }

      console.log('Formatted tickets from Appwrite:', formattedTickets);





      setTickets(formattedTickets);





    }

    catch(error){


      console.error(
        "Load pending tickets error:",
        error
      );

      setTickets([]);

    }

    finally{


      setLoading(false);


    }


  };



  useEffect(()=>{


    loadTickets();


    // Disable polling to prevent exceeding database read limits
    // Uncomment the line below if you need auto-refresh (increased to 60 seconds):
    // const timer = setInterval(loadTickets, 60000);
    // return () => clearInterval(timer);


  },[]);





  const updateStatus = async(


    id:string,



    status:string,



    carId?: string



  )=>{


    try{


      const {

        Client,

        Databases

      }

      =

      (window as any).Appwrite;




      const client =


        new Client()



        .setEndpoint(

          process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim()

        )



        .setProject(

          process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim()

        );





      const databases =

        new Databases(client);






      await (databases as any).updateDocument(


          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim(),


          process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID?.trim(),


          id,


          {

            status

          }


        );





      // If approving, update car stats
      if (status === 'Approved' && carId) {
        try {
          // Use CAR PROJECT for car operations
          const carClient = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim())
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_CAR_PROJECT_ID!);
          const carDatabases = new Databases(carClient);
          
          const carDoc = await (carDatabases as any).getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID!,
            carId
          );
          
          console.log('Car document:', carDoc);
          // Check what fields exist in the car document
          // Currently commenting out the update until we know the correct field names
          /*
          const currentSoldTickets = Number(carDoc.soldTickets || 0);
          const currentParticipants = Number(carDoc.participants || 0);
          const totalTickets = Number(carDoc.totalTickets || 3500);
          
          const newSoldTickets = currentSoldTickets + 1;
          const newParticipants = currentParticipants + 1;
          const newProgress = Math.min(100, (newSoldTickets / totalTickets) * 100);
          
          await carDatabases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_CAR_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_LOTTERIES_COLLECTION_ID!,
            carId,
            {
              soldTickets: newSoldTickets,
              participants: newParticipants,
              progress: newProgress
            }
          );
          */
        } catch (error) {
          console.error('Error updating car stats:', error);
        }
      }

      loadTickets();

      setNotification({
        type: 'success',
        message: `Ticket ${status === 'Approved' ? 'approved' : 'rejected'} successfully`
      });

      setTimeout(() => setNotification(null), 3000);




    }

    catch(error){


      console.error(
        "Update status error:",
        error
      );

      setNotification({
        type: 'error',
        message: 'Failed to update ticket status'
      });

      setTimeout(() => setNotification(null), 3000);



    }



  };






  return (


    <main

      className="

      min-h-screen

      bg-[#071a14]

      p-5

      text-white

      "

    >





      <h1

        className="

        mb-6

        text-3xl

        font-black

        text-yellow-300

        "

      >

        Payment Verification

      </h1>

      {notification && (
        <div
          className={`mb-6 rounded-xl p-4 ${
            notification.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {notification.message}
        </div>
      )}

        <div className="flex gap-3 mb-6">
          <a
            href="/admin/cars"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
          >
            Add Car
          </a>
          <a
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
          >
            Home
          </a>
        </div>





      {

        loading &&

        <div className="text-slate-300">

          Loading payments...

        </div>

      }





      {

        !loading && tickets.length === 0 &&


        <div

          className="

          rounded-2xl

          bg-white/10

          p-8

          text-center

          "

        >

          No pending payments

        </div>


      }





      <div

        className="

        space-y-5

        "

      >





      {

        tickets.map((ticket)=>(



          <div

            key={ticket.id}

            className="

            rounded-3xl

            bg-white/10

            p-5

            "

          >





            <h2

              className="

              text-xl

              font-black

              text-yellow-300

              "

            >

              {ticket.carName}

            </h2>

            <p className="mt-2">

              Full Name:

              {' '}

              {ticket.fullName || 'N/A'}

            </p>





            <p className="mt-2">

              Phone:

              {' '}

              {ticket.phone}

            </p>





            <p>

              Ticket Number:

              {' '}

              {ticket.ticketNumber}

            </p>





            <p>

              Payment:

              {' '}

              {ticket.paymentMethod}

            </p>





            {

              ticket.screenshotUrl &&


              <img


                src={ticket.screenshotUrl}
                alt="payment screenshot"


                className="

                mt-4

                h-64

                w-full

                rounded-2xl

                object-cover

                "


              />


            }





            <div

              className="

              mt-5

              grid

              grid-cols-2

              gap-3

              "

            >





              <button


                onClick={()=>


                  updateStatus(

                    ticket.id,

                    "Approved",

                    ticket.carId

                  )


                }


                className="

                rounded-xl

                bg-green-500

                py-3

                font-black

                text-black

                "

              >

                Approve

              </button>





              <button


                onClick={()=>


                  updateStatus(

                    ticket.id,

                    "Rejected"

                  )


                }


                className="

                rounded-xl

                bg-red-500

                py-3

                font-black

                text-black

                "

              >

                Reject

              </button>



            </div>




          </div>



        ))


      }
      </div>

      <div

        className="

        space-y-5

        "

      >

      </div>




    </main>


  );


}
