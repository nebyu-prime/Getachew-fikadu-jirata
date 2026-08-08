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
        bg-gradient-to-r
        from-slate-950/95
        via-slate-900/95
        to-slate-950/95
        px-4
        py-3
        backdrop-blur-xl
        shadow-lg
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
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            border
            border-yellow-400/40
            bg-gradient-to-br
            from-yellow-400/20
            to-yellow-600/20
            text-2xl
            text-yellow-300
            shadow-lg
            shadow-yellow-400/20
          "
        >

          🏆

        </div>




        <div className="leading-tight">


          <p
            className="
              text-base
              font-black
              text-transparent
              bg-clip-text
              bg-gradient-to-r
              from-yellow-300
              to-yellow-500
            "
          >

            Getachew Fikadu

          </p>



          <p
            className="
              text-xs
              font-semibold
              text-slate-400
              tracking-wide
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
            bg-gradient-to-br
            from-white/10
            to-white/5
            px-2
            py-1.5
            shadow-md
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
              text-xs
              font-bold
              uppercase
              text-slate-300
              outline-none
              hover:text-yellow-300
              transition-colors
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
