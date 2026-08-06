'use client';

import { useEffect, useState } from 'react';
import {
  applyTelegramTheme,
  getTelegramTheme,
  getTelegramUser,
  initializeTelegramApp,
  type TelegramThemeState,
} from '@/lib/telegram';
import type { TelegramUser } from '@/types/lottery';

export function useTelegramApp() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [theme, setTheme] = useState<TelegramThemeState>(() => getTelegramTheme(null));

  useEffect(() => {
    const webApp = initializeTelegramApp();

    const syncState = () => {
      const nextTheme = getTelegramTheme(webApp);
      setUser(getTelegramUser(webApp));
      setTheme(nextTheme);
      applyTelegramTheme(nextTheme);
    };

    syncState();

    const handleThemeChange = () => syncState();

    webApp?.onEvent?.('themeChanged', handleThemeChange);
    webApp?.onEvent?.('viewportChanged', handleThemeChange);

    return () => {
      webApp?.offEvent?.('themeChanged', handleThemeChange);
      webApp?.offEvent?.('viewportChanged', handleThemeChange);
    };
  }, []);

  return { user, theme };
}