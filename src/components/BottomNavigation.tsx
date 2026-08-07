'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


const navigationItems = [
  {
    href: '/',
    label: 'Home',
    icon: '⌂',
  },
  {
    href: '/tickets',
    label: 'Tickets',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-6 w-6"
      >
        <path
          d="M4 7h16v4a2 2 0 0 1 0 4v2H4v-2a2 2 0 0 1 0-4V7Z"
        />
        <path
          d="M9 7v10"
          strokeDasharray="2 2"
        />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-6 w-6"
      >
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        />

        <path
          d="M4 21a8 8 0 0 1 16 0"
        />
      </svg>
    ),
  },
];



export default function BottomNavigation() {

  const pathname = usePathname();


  return (
    <nav className="
      fixed
      inset-x-0
      bottom-0
      z-40
      border-t
      border-white/10
      bg-black
      px-3
      pb-[max(0.75rem,env(safe-area-inset-bottom))]
      pt-2
      backdrop-blur-2xl
    ">

      <div className="
        mx-auto
        grid
        w-full
        max-w-2xl
        grid-cols-3
        gap-2
      ">

        {navigationItems.map((item) => {

          const active = pathname === item.href;


          return (

            <Link
              key={item.href}
              href={item.href}

              className={`
                flex
                flex-col
                items-center
                justify-center
                rounded-[18px]
                px-3
                py-2
                text-center
                transition
                duration-200

                ${
                  active
                    ? 'bg-[linear-gradient(135deg,rgba(245,196,81,0.95),rgba(245,196,81,0.7))] text-slate-900 shadow-glow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
              `}

              aria-current={
                active ? 'page' : undefined
              }
            >

              <span className="
                flex
                items-center
                justify-center
                text-lg
                font-bold
                leading-none
              ">
                {item.icon}
              </span>


              <span className="
                mt-0.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.15em]
              ">
                {item.label}
              </span>


            </Link>

          );

        })}

      </div>

    </nav>
  );
}
