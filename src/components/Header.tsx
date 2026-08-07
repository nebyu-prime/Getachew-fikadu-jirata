'use client';

import { useEffect, useState } from 'react';

import { useTelegramApp } from '@/hooks/useTelegramApp';
import { getTelegramUser } from '@/lib/telegram';

import type { TelegramUser } from '@/types/lottery';

import {
  useLanguage,
  type Language,
} from '@/context/LanguageContext';

import NotificationPanel from '@/components/NotificationPanel';



export default function Header() {


  useTelegramApp();


  const {
    language,
    setLanguage,
    t,
  } = useLanguage();



  const [fallbackUser, setFallbackUser] =
    useState<TelegramUser | null>(null);



  useEffect(() => {

    setFallbackUser(
      getTelegramUser()
    );

  }, []);







  return (

    <header
      className="
        sticky
        top-0
        z-30
        flex
        items-center
        justify-between
        border-b
        border-white/10
        bg-black
        px-4
        py-3
        backdrop-blur-md
        sm:px-6
      "
    >




      {/* Logo + Name */}

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
            h-10
            w-10
            items-center
            justify-center
            rounded-2xl
            border
            border-yellow-400/40
            bg-yellow-400/10
            text-xl
            text-yellow-300
          "
        >

          🏆

        </div>




        <div className="leading-tight">


          <p
            className="
              text-sm
              font-black
              text-yellow-300
            "
          >

            Getachew Fikadu

          </p>



          <p
            className="
              text-[11px]
              text-slate-400
            "
          >

            {t.appName}

          </p>


        </div>


      </div>









      {/* Right Actions */}

      <div
        className="
          flex
          items-center
          gap-2
        "
      >




        {/* Language */}

        <div
          className="
            flex
            items-center
            gap-1
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-2
            py-1.5
          "
        >


          <span className="text-sm">
            🌐
          </span>




          <select

            value={language}

            onChange={(e) =>
              setLanguage(
                e.target.value as Language
              )
            }


            className="
              cursor-pointer
              bg-transparent
              text-[11px]
              font-bold
              uppercase
              text-slate-300
              outline-none
            "

          >

            <option
              value="en"
              className="bg-slate-900"
            >

              English

            </option>



            <option
              value="am"
              className="bg-slate-900"
            >

              አማርኛ

            </option>



            <option
              value="om"
              className="bg-slate-900"
            >

              Oromoo

            </option>


          </select>


        </div>








        {/* Notification */}

        <NotificationPanel />





      </div>




    </header>

  );

}
