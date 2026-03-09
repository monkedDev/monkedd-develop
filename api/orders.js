// Vercel Serverless Function для хранения заявок
// Используем Vercel KV (бесплатно) или отправку на почту

export const config = {
  runtime: 'edge'
};

// Временное хранилище в памяти (для демонстрации)
// В продакшене лучше использовать Vercel KV или базу данных
const orders = new Map();

export default async function handler(request) {
  const allowedOrigins = [
    'https://monkeddev.github.io',
    'http://localhost:3000',
    'http://localhost:8080'
  ];
  
  const origin = request.headers.get('origin') || '';
  const isAllowed = allowedOrigins.includes(origin);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Проверка авторизации для защищённых эндпоинтов
  const isProtected = request.method !== 'POST';
  
  if (isProtected) {
    const authHeader = request.headers.get('Authorization');
    const adminPassword = process.env.ADMIN_PASSWORD || 'monkeddev2025';
    
    if (!authHeader || !authHeader.includes('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Требуется авторизация' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token !== adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Неверный пароль' }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }
  }

  try {
    // GET - получить все заявки
    if (request.method === 'GET') {
      const allOrders = Array.from(orders.values()).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      return new Response(
        JSON.stringify({
          success: true,
          orders: allOrders,
          total: allOrders.length,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // POST - создать новую заявку
    if (request.method === 'POST') {
      const data = await request.json();

      // Валидация
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

      // Проверка на спам
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

      // Создаём заказ
      const order = {
        id: Date.now().toString(),
        ...data,
        status: 'new', // new, in_progress, completed, cancelled
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'unknown',
      };

      orders.set(order.id, order);

      // Отправляем уведомление в Telegram (если настроено)
      if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
        try {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: process.env.TELEGRAM_CHAT_ID,
              text: `🔥 Новая заявка!\n\n👤 ${name}\n📬 ${contact}\n📋 ${data.type || 'Не указан'}\n💰 ${data.budget || 'Не указан'}`,
              parse_mode: 'HTML',
            }),
          });
        } catch (e) {
          console.error('Telegram notification failed:', e);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Заявка успешно создана',
          orderId: order.id,
        }),
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // DELETE - удалить заявку
    if (request.method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const orderId = searchParams.get('id');

      if (!orderId) {
        return new Response(
          JSON.stringify({ error: 'Не указан ID заявки' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
            },
          }
        );
      }

      if (orders.has(orderId)) {
        orders.delete(orderId);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // PATCH - обновить статус заявки
    if (request.method === 'PATCH') {
      const data = await request.json();
      const { id, status } = data;

      if (!id || !status) {
        return new Response(
          JSON.stringify({ error: 'Укажите ID и статус' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
            },
          }
        );
      }

      const order = orders.get(id);
      if (!order) {
        return new Response(
          JSON.stringify({ error: 'Заявка не найдена' }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
            },
          }
        );
      }

      order.status = status;
      order.updatedAt = new Date().toISOString();
      orders.set(id, order);

      return new Response(
        JSON.stringify({ success: true, order }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
          },
        }
      );
    }

    // Метод не разрешён
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

  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Внутренняя ошибка сервера', details: error.message }),
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
