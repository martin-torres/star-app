// Telegram notification service
import type { Order } from '../types';

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

function formatOrderMessage(order: Order, _message: string = ''): string {
  const statusEmojis: Record<string, string> = {
    recibido: '🆕',
    preparando: '🔥',
    empaquetando: '📦',
    listo: '✅',
    en_camino: '🚗',
    entregado: '🎉',
    pendiente_pago: '💳'
  };
  
  const statusText: Record<string, string> = {
    recibido: 'Recibido',
    preparando: 'Preparando',
    empaquetando: 'Empaquetando',
    listo: 'Listo para recoger',
    en_camino: 'En camino',
    entregado: 'Entregado',
    pendiente_pago: 'Pendiente de pago'
  };
  
  const itemsList = order.items.map(item => 
    `• ${item.name} x${item.quantity}${item.weightInGrams ? ` (${item.weightInGrams}g)` : ''} - $${item.price * item.quantity}`
  ).join('\n');
  
  const paymentMethodText: Record<string, string> = {
    efectivo: '💵 Efectivo',
    transferencia: '🏦 Transferencia',
    tarjeta: '💳 Tarjeta'
  };
  
  const emoji = statusEmojis[order.status] || '🛒';
  const statusName = statusText[order.status] || order.status;
  
  let notification = `${emoji} *NUEVO PEDIDO*\n`;
  notification += `━━━━━━━━━━━━━━━━\n`;
  notification += `*Cliente:* ${order.customerName}\n`;
  notification += `*Tipo:* ${order.customerAddress.includes('Paso por él') ? '🚀 Pickup' : '🏠 Delivery'}\n`;
  notification += `*Pago:* ${paymentMethodText[order.paymentMethod] || order.paymentMethod}\n`;
  notification += `*Total:* $${order.total} ${order.total > 0 ? 'MXN' : ''}\n`;
  notification += `*Status:* ${emoji} ${statusName}\n`;
  notification += `━━━━━━━━━━━━━━━━\n`;
  notification += `*Items:*\n${itemsList}`;
  
  return notification;
}

export async function sendTelegramNotification(
  order: Order,
  config: TelegramConfig,
  notificationType: 'new_order' | 'status_update' = 'new_order'
): Promise<boolean> {
  if (!config.botToken || !config.chatId) {
    console.log('Telegram notifications disabled - missing config');
    return false;
  }

  try {
    const message = formatOrderMessage(order);
    
    const response = await fetch(`${TELEGRAM_API_BASE}${config.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_notification: notificationType === 'status_update'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

export async function sendTestTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  if (!botToken || !chatId) {
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Telegram API error:', error);
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}