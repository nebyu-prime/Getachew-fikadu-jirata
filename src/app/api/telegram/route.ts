import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Telegram webhook received:', JSON.stringify(body));

    const message = body.message;
    const callbackQuery = body.callback_query;
    const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();

    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not set');
      return NextResponse.json({ error: 'Bot token not configured' }, { status: 500 });
    }

    // Handle callback queries (button clicks)
    if (callbackQuery) {
      const callbackData = callbackQuery.data;
      const callbackChatId = callbackQuery.message.chat.id;

      if (callbackData === 'lang_amharic') {
        await answerCallbackQuery(botToken, callbackQuery.id);
        await sendMessage(botToken, callbackChatId,
          'እንኳን እንነገርዎታለን! 🎉\n\n' +
          'እባክዎ ስልክ ቁጥርዎን ይጻፉ።',
          { reply_markup: { remove_keyboard: true } }
        );
      } else if (callbackData === 'lang_english') {
        await answerCallbackQuery(botToken, callbackQuery.id);
        await sendMessage(botToken, callbackChatId,
          'Welcome! 🎉\n\n' +
          'Please enter your phone number to continue.',
          { reply_markup: { remove_keyboard: true } }
        );
      } else if (callbackData === 'lang_oromo') {
        await answerCallbackQuery(botToken, callbackQuery.id);
        await sendMessage(botToken, callbackChatId,
          'Baga nagaan dhuftu! 🎉\n\n' +
          'Fone bilbisa barreessuu.',
          { reply_markup: { remove_keyboard: true } }
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle regular messages
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || '';

    // Handle commands - prioritize /start
    if (text === '/start') {
      console.log('Processing /start command for chatId:', chatId);

      // Just show the language selection directly
      await sendMessageWithKeyboard(botToken, chatId,
        '🚗 Getachew Fikadu Jirata\n\n' +
        'Maaloo Afaan filadhaa.\n' +
        '━━━━━━━━━━━━━━\n' +
        'እባክዎ ቋንቋ ይምረጡ።\n' +
        '━━━━━━━━━━━━━━\n' +
        'Please select your language.',
        [
          [
            { text: 'አማርኛ', callback_data: 'lang_amharic' },
            { text: 'English', callback_data: 'lang_english' },
            { text: 'Afaan Oromoo', callback_data: 'lang_oromo' }
          ]
        ]
      );
      console.log('Successfully sent /start response');
      return NextResponse.json({ ok: true });
    }

    // Handle phone number input
    if (text.match(/^\+?[0-9]{9,15}$/)) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://getachew-fikadu-jirata.vercel.app';
      await sendMessageWithKeyboard(botToken, chatId,
        '✅ Phone number received!\n\n' +
        'Click the button below to open the app.',
        [
          [
            { text: '🚗 Open App', web_app: { url: `${siteUrl}?phone=${text}` } }
          ]
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // Handle other commands
    if (text === '/help') {
      await sendMessage(botToken, chatId,
        '📖 Available commands:\n\n' +
        '/start - Get started\n' +
        '/help - Show this help message\n' +
        '/tickets - Check your tickets\n' +
        '/lotteries - View active lotteries'
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/tickets') {
      await sendMessage(botToken, chatId,
        '🎟️ To check your tickets:\n' +
        '1. Visit our website\n' +
        '2. Enter your phone number\n' +
        '3. View your ticket status\n\n' +
        '🔗 ' + (process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com/tickets')
      );
      return NextResponse.json({ ok: true });
    }

    if (text === '/lotteries') {
      await sendMessage(botToken, chatId,
        '🚗 View all active lotteries at:\n' +
        '🔗 ' + (process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com')
      );
      return NextResponse.json({ ok: true });
    }

    await sendMessage(botToken, chatId,
      '❓ I didn\'t understand that command.\n' +
      'Type /help to see available commands.'
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

async function sendMessage(botToken: string, chatId: number, text: string, options?: any) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...options
      })
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
    }
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

async function sendMessageWithKeyboard(botToken: string, chatId: number, text: string, keyboard: any[][]) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: {
          inline_keyboard: keyboard
        }
      })
    });

    const data = await response.json();
    if (!data.ok) {
      console.error('Telegram API error:', data);
    }
    return data;
  } catch (error) {
    console.error('Error sending message with keyboard:', error);
    throw error;
  }
}

async function answerCallbackQuery(botToken: string, callbackQueryId: string) {
  const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId
    })
  });
}

// Handle webhook setup GET request
export async function GET(req: NextRequest) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL?.trim();

  if (!botToken || !webhookUrl) {
    return NextResponse.json({
      error: 'TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_URL must be set',
      hasToken: !!botToken,
      hasWebhook: !!webhookUrl
    }, { status: 400 });
  }

  try {
    // Check current webhook status first
    const statusUrl = `https://api.telegram.org/bot${botToken}/getWebhookInfo`;
    const statusResponse = await fetch(statusUrl);
    const statusData = await statusResponse.json();

    // First, delete any existing webhook
    const deleteUrl = `https://api.telegram.org/bot${botToken}/deleteWebhook`;
    await fetch(deleteUrl, { method: 'POST' });

    // Set the new webhook with proper settings - accept all updates
    const url = `https://api.telegram.org/bot${botToken}/setWebhook`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true
        // Don't restrict allowed_updates - accept all updates
      })
    });

    const data = await response.json();
    return NextResponse.json({
      webhookSet: data,
      previousStatus: statusData,
      message: 'Webhook reset to accept all updates from all users'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to set webhook', details: String(error) }, { status: 500 });
  }
}
