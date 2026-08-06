'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '@/context/LanguageContext';
import { useTelegramApp } from '@/hooks/useTelegramApp';
export default function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useTelegramApp();
  const [notification, setNotification] =
    useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Try to get phone from URL first
    const urlParams = new URLSearchParams(window.location.search);
    const phoneFromUrl = urlParams.get('phone');
    if (phoneFromUrl) {
      setPhoneNumber(phoneFromUrl);
    } else {
      // Fallback to localStorage
      const storedPhone = localStorage.getItem('user_phone');
      if (storedPhone) {
        setPhoneNumber(storedPhone);
      }
    }
  }, []);
  return (
    <>
      <Header />
      <main className="pb-24 text-white">
        {notification && (
          <div className="px-4 pt-4 sm:px-6">
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
          </div>
        )}
        {/* Phone Number Card */}

        <section className="px-4 pt-4 sm:px-6">

          <div
            className="
              rounded-[22px]
              border
              border-emerald-400/20
              bg-[linear-gradient(135deg,#0f5132,#0b3f2a)]
              px-4
              py-4
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
            "
          >

            <div className="flex items-center gap-4">


              <div
                className="
                  flex
                  h-20
                  w-20
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#f4bc11]
                  text-4xl
                  text-black
                  shadow-[0_16px_30px_rgba(244,188,17,0.25)]
                "
              >

                ☏

              </div>
              <div className="min-w-0">


                <p
                  className="
                    text-base
                    font-medium
                    text-slate-100/90
                  "
                >

                  {t.userPhone}

                </p>
                <p
                  className="
                    mt-1
                    text-2xl
                    font-extrabold
                    tracking-tight
                    text-white
                  "
                >

                  {phoneNumber || 'Not set'}

                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-[46vh] px-4 pt-4 sm:px-6" />
        {/* Footer */}

        <footer
          className="
            px-4
            pb-6
            text-center
            text-xs
            leading-5
            text-slate-400
            sm:px-6
          "
        >

          <p>
            © 2026 {t.appName}. {t.rightsReserved}
          </p>
          <p>

            {t.designedBy}{' '}


            <a
              href="https://evangadi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                font-semibold
                text-amber-300
                transition
                hover:text-yellow-400
                hover:underline
                underline-offset-2
              "
            >

              Evangadi

            </a>
          </p>
        </footer>
      </main>
    </>

  );

}
