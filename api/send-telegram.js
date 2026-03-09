// Vercel Serverless Function для отправки заявок в Telegram
// Deploy на Vercel: https://vercel.com/new

export const config = {
  runtime: 'edge'
};

export default async function handler(request) {
  // Разрешаем CORS только для нашего домена
  const allowedOrigins = [
    'https://monkeddev.github.io',
    'http://localhost:3000',
    'http://localhost:8080'
  ];
  
  const origin = request.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin);

  // Обработка preflight запроса
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // Разрешаем только POST запросы
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Метод не разрешён' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        },
      }
    );
  }

  try {
    // Получаем данные из запроса
    const data = await request.json();
    
    // Валидация обязательных полей
    const { name, contact, message } = data;
    
    if (!name || !contact || !message) {
      return new Response(
        JSON.stringify({ error: 'Заполните все обязательные поля' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // Проверка на спам (honeypot)
    if (data.botcheck) {
      return new Response(
        JSON.stringify({ error: 'Spam detected' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // Получаем данные Telegram из переменных окружения
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Telegram credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // Формируем красивое сообщение
    const formattedMessage = `
🔥 <b>Новая заявка с сайта monkedDev</b>

👤 <b>Имя:</b> ${escapeHtml(name)}
📬 <b>Контакт:</b> ${escapeHtml(contact)}
${data.type ? `📋 <b>Тип проекта:</b> ${escapeHtml(data.type)}\n` : ''}${data.budget ? `💰 <b>Бюджет:</b> ${escapeHtml(data.budget)}\n` : ''}
📝 <b>Сообщение:</b>
${escapeHtml(message)}

${data.privacy ? '✅ Согласие на обработку данных получено' : '❌ Нет согласия'}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
🌐 <b>IP:</b> ${request.headers.get('x-forwarded-for') || 'unknown'}
📱 <b>User-Agent:</b> ${request.headers.get('user-agent')?.substring(0, 100) || 'unknown'}
    `.trim();

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: formattedMessage,
        parse_mode: 'HTML',
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ 
          error: 'Ошибка отправки в Telegram',
          details: telegramResult.description 
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // Успех!
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Заявка успешно отправлена'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        },
      }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Внутренняя ошибка сервера',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        },
      }
    );
  }
}

// Функция для экранирования HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
