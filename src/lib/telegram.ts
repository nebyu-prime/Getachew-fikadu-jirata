import type { TelegramUser } from '@/types/lottery';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface TelegramWebApp {
  initDataUnsafe: {
    user?: TelegramWebAppUser;
  };
  themeParams?: {
    bg_color?: string;
    secondary_bg_color?: string;
    text_color?: string;
    hint_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  colorScheme?: 'light' | 'dark';
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  onEvent?: (eventType: 'themeChanged' | 'viewportChanged', eventHandler: () => void) => void;
  offEvent?: (eventType: 'themeChanged' | 'viewportChanged', eventHandler: () => void) => void;
}

export interface TelegramThemeState {
  colorScheme: 'light' | 'dark';
  backgroundColor: string;
  secondaryBackgroundColor: string;
  textColor: string;
  hintColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export function initializeTelegramApp(): TelegramWebApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const webApp = window.Telegram?.WebApp ?? null;

  webApp?.ready?.();
  webApp?.expand?.();
  webApp?.setHeaderColor?.('#0f172a');
  webApp?.setBackgroundColor?.('#0f172a');

  return webApp;
}

export function getTelegramTheme(webApp: TelegramWebApp | null = initializeTelegramApp()): TelegramThemeState {
  return {
    colorScheme: webApp?.colorScheme ?? 'dark',
    backgroundColor: webApp?.themeParams?.bg_color ?? '#0f172a',
    secondaryBackgroundColor: webApp?.themeParams?.secondary_bg_color ?? '#111827',
    textColor: webApp?.themeParams?.text_color ?? '#f8fafc',
    hintColor: webApp?.themeParams?.hint_color ?? '#94a3b8',
    buttonColor: webApp?.themeParams?.button_color ?? '#f5c451',
    buttonTextColor: webApp?.themeParams?.button_text_color ?? '#0f172a',
  };
}

export function applyTelegramTheme(theme: TelegramThemeState) {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty('--telegram-bg', theme.backgroundColor);
  root.style.setProperty('--telegram-bg-secondary', theme.secondaryBackgroundColor);
  root.style.setProperty('--telegram-text', theme.textColor);
  root.style.setProperty('--telegram-hint', theme.hintColor);
  root.style.setProperty('--telegram-button', theme.buttonColor);
  root.style.setProperty('--telegram-button-text', theme.buttonTextColor);
  root.dataset.telegramColorScheme = theme.colorScheme;
}

export function getTelegramUser(webApp: TelegramWebApp | null = initializeTelegramApp()): TelegramUser | null {
  const user = webApp?.initDataUnsafe.user;

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    photoUrl: user.photo_url,
  };
}

export function getDisplayName(user: TelegramUser | null): string {
  if (!user) {
    return 'Telegram user';
  }

  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}
