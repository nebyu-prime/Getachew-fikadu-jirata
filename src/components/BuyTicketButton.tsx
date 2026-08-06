'use client';

import { useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';

import CheckoutModal from './CheckoutModal';


type BuyTicketButtonProps = {
  lottery: any;
  participants?: number;
  phoneFromUrl?: string | null;
};


export default function BuyTicketButton({
  lottery,
  participants = 0,
  phoneFromUrl = null
}: BuyTicketButtonProps) {


  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);



  return (

    <>

      <section className="flex items-end justify-between gap-4">


        <div className="flex items-center gap-3">


          <div className="
          flex 
          h-12 
          w-12 
          items-center 
          justify-center 
          rounded-2xl 
          bg-white/10 
          text-white/80
          ">

            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>

          </div>



          <div>


            <p className="
            text-[11px] 
            font-medium 
            uppercase 
            tracking-[0.2em] 
            text-sky-200/70
            ">

              {t.participants}

            </p>



            <p className="
            text-[22px] 
            font-black 
            leading-none 
            text-white
            ">

              {participants}

            </p>


          </div>


        </div>





        <button

          type="button"

          onClick={() => setIsOpen(true)}

          className="
          min-w-[145px]
          rounded-[22px]
          bg-[linear-gradient(135deg,#facc15,#f59e0b)]
          px-6
          py-4
          text-center
          text-[16px]
          font-black
          text-slate-950
          shadow-[0_18px_40px_rgba(245,196,81,0.4)]
          transition-transform
          duration-200
          hover:-translate-y-0.5
          active:translate-y-0
          "

        >

          {t.buyTicket}

        </button>


      </section>







      <CheckoutModal

        isOpen={isOpen}

        onClose={() => setIsOpen(false)}

        lottery={lottery}

        phoneFromUrl={phoneFromUrl}

      />


    </>

  );

}