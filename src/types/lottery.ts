export interface TelegramUser {

  id: number;

  firstName: string;

  lastName?: string;

  username?: string;

  photoUrl?: string;

}



export interface FeaturedPrize {

  title: string;

  value: string;

  ticketPrice: string;

  description: string;

  imageSrc: string;

  imageAlt: string;

}



export interface TicketStats {

  sold: number;

  total: number;

}



export interface CountdownTarget {

  date: string;

  label: string;

}



export interface RecentWinner {

  name: string;

  winningTicket: string;

  prize: string;

  drawDate: string;

}



export interface NavigationItem {

  label: string;

  href: string;

  icon: string;

}

