'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'am' | 'om';

interface Translations {
  appName: string;
  darkMode: string;
  lightMode: string;
  language: string;
  
  // Home Page
  prizeTitle: string;
  prizeDesc: string;
  closesIn: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  sold: string;
  total: string;
  filled: string;
  ticketsRemaining: string;
  participants: string;
  buyTicket: string;
  
  // Checkout Modal
  checkoutTitle: string;
  ticketCount: string;
  paymentMethod: string;
  phoneNumberLabel: string;
  pricePerTicket: string;
  totalPrice: string;
  confirmPay: string;
  processing: string;
  successTitle: string;
  successDesc: string;
  ticketNumbers: string;
  viewMyTickets: string;
  close: string;
  
  // Tickets Page
  myTickets: string;
  trackEntries: string;
  searchPlaceholder: string;
  searchBtn: string;
  active: string;
  pending: string;
  totalStats: string;
  noTickets: string;
  
  // Profile Page
  userPhone: string;
  rightsReserved: string;
  designedBy: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: 'Getachew Fikadu',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    language: 'Language',
    prizeTitle: 'BYD Yuan UP',
    prizeDesc: 'Time Grey',
    closesIn: 'Next draw closes in',
    days: 'Days',
    hours: 'Hrs',
    minutes: 'Min',
    seconds: 'Sec',
    sold: 'sold',
    total: 'total',
    filled: 'filled',
    ticketsRemaining: 'tickets remaining',
    participants: 'Participants',
    buyTicket: 'Buy Ticket',
    checkoutTitle: 'Buy Ekub Tickets',
    ticketCount: 'Select Ticket Quantity',
    paymentMethod: 'Choose Payment Method',
    phoneNumberLabel: 'Enter Phone Number',
    pricePerTicket: 'Price per ticket',
    totalPrice: 'Total Price',
    confirmPay: 'Confirm & Pay',
    processing: 'Processing payment...',
    successTitle: 'Payment Successful! ✅',
    successDesc: 'Congratulations! Your tickets have been successfully registered.',
    ticketNumbers: 'Your Ticket Numbers',
    viewMyTickets: 'View My Tickets',
    close: 'Close',
    myTickets: 'My Tickets',
    trackEntries: 'Track your lottery entries',
    searchPlaceholder: 'Search by phone number',
    searchBtn: 'Search',
    active: 'Active',
    pending: 'Pending',
    totalStats: 'Total',
    noTickets: 'No tickets found for this phone number.',
    userPhone: 'User Phone Number',
    rightsReserved: 'All Rights Reserved.',
    designedBy: 'Designed & Developed by',
  },
  am: {
    appName: 'ጌታቸው ፍቃዱ',
    darkMode: 'ጨለማ ሁነታ',
    lightMode: 'ብርሃን ሁነታ',
    language: 'ቋንቋ',
    prizeTitle: 'ቢ.ዋይ.ዲ ዩዋን አፕ (BYD Yuan UP)',
    prizeDesc: 'ታይም ግሬይ',
    closesIn: 'ቀጣዩ ዕጣ መዝጊያ ጊዜ',
    days: 'ቀናት',
    hours: 'ሰዓት',
    minutes: 'ደቂቃ',
    seconds: 'ሰከንድ',
    sold: 'የተሸጠ',
    total: 'ጠቅላላ',
    filled: 'ተሞልቷል',
    ticketsRemaining: 'የቀሩ ትኬቶች',
    participants: 'ተሳታፊዎች',
    buyTicket: 'ትኬት ግዛ',
    checkoutTitle: 'የዕቁብ ትኬት ይግዙ',
    ticketCount: 'የትኬት ብዛት ይምረጡ',
    paymentMethod: 'የክፍያ አማራጭ ይምረጡ',
    phoneNumberLabel: 'የስልክ ቁጥር ያስገቡ',
    pricePerTicket: 'የአንድ ትኬት ዋጋ',
    totalPrice: 'ጠቅላላ ዋጋ',
    confirmPay: 'ክፍያውን አረጋግጥ',
    processing: 'ክፍያ በመከናወን ላይ ነው...',
    successTitle: 'ክፍያው ተጠናቋል! ✅',
    successDesc: 'እንኳን ደስ አለዎት! ትኬትዎ በተሳካ ሁኔታ ተመዝግቧል።',
    ticketNumbers: 'የእርስዎ የትኬት ቁጥሮች',
    viewMyTickets: 'ትኬቶቼን እይ',
    close: 'ዝጋ',
    myTickets: 'ትኬቶቼ',
    trackEntries: 'የዕጣ ቁጥሮችዎን ይከታተሉ',
    searchPlaceholder: 'በስልክ ቁጥር ይፈልጉ',
    searchBtn: 'ፈልግ',
    active: 'ገባሪ',
    pending: 'በመጠባበቅ ላይ',
    totalStats: 'ጠቅላላ',
    noTickets: 'በዚህ የስልክ ቁጥር የተገኘ ትኬት የለም።',
    userPhone: 'የተጠቃሚ ስልክ ቁጥር',
    rightsReserved: 'መብቱ በህግ የተጠበቀ ነው።',
    designedBy: 'የተነደፈውና የበለፀገው በ',
  },
  om: {
    appName: 'Getaachew Fikaaduu',
    darkMode: 'Dhaamsa Dukkanhaa',
    lightMode: 'Dhaamsa Ifaa',
    language: 'Afaan',
    prizeTitle: 'BYD Yuan UP',
    prizeDesc: 'Time Grey',
    closesIn: 'Carraan itti aanu cufamuuf',
    days: 'Guyyaa',
    hours: 'Sa\'a',
    minutes: 'Daq',
    seconds: 'Sek',
    sold: 'gurgurame',
    total: 'waliigala',
    filled: 'guddateera',
    ticketsRemaining: 'tikikeetii hafan',
    participants: 'Hirmaattota',
    buyTicket: 'Tikikeetii Bitadhu',
    checkoutTitle: 'Tikikeetii Equb Biti',
    ticketCount: 'Baay\'ina Tikikeetii Filadhu',
    paymentMethod: 'Malleen Kafaltii Filadhu',
    phoneNumberLabel: 'Lakkoofsa Bilbilaa Galchi',
    pricePerTicket: 'Gatii tikikeetii tokkoo',
    totalPrice: 'Gatii Waliigalaa',
    confirmPay: 'Kafaltii Mirkaneessi',
    processing: 'Kafaltiin adeemsisamaa jira...',
    successTitle: 'Kafaltiin Milkaa\'eera! ✅',
    successDesc: 'Baga gammaddan! Tikikeetiin keessan milkiin galmeeffameera.',
    ticketNumbers: 'Lakkoofsota Tikikeetii Keessan',
    viewMyTickets: 'Tikikeetii Koo Ilaali',
    close: 'Cufi',
    myTickets: 'Tikikeetii Koo',
    trackEntries: 'Galmee carraa keessan hordofaa',
    searchPlaceholder: 'Lakkoofsa bilbilaan barbaadi',
    searchBtn: 'Barbaadi',
    active: 'Hojjataa',
    pending: 'Eeggamaa',
    totalStats: 'Waliigala',
    noTickets: 'Lakkoofsa bilbilaa kanaan tikikeetiin hin argamne.',
    userPhone: 'Lakkoofsa Bilbila Hirmaattichaa',
    rightsReserved: 'Mirgi Qopheessaa Seeraan Eeggamaadha.',
    designedBy: 'Kan Saxamee fi Misoomse',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Detect preferred language from Telegram if available
    const tgLanguage = typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code : null;
    const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem('appLanguage') : null;
    
    if (storedLanguage === 'en' || storedLanguage === 'am' || storedLanguage === 'om') {
      setLanguageState(storedLanguage as Language);
    } else if (tgLanguage) {
      if (tgLanguage.startsWith('am')) {
        setLanguageState('am');
      } else if (tgLanguage.startsWith('om')) {
        setLanguageState('om');
      } else {
        setLanguageState('en');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
