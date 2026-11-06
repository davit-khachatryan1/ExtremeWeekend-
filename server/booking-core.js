/* Shared booking logic for the serverless functions (Vercel: /api/booking.js,
 * Netlify: /netlify/functions/booking.mjs). Validates the request and sends a
 * message to your Telegram via a bot.
 *
 * Environment variables (set them in the Vercel / Netlify dashboard):
 *   TELEGRAM_BOT_TOKEN  — from @BotFather
 *   TELEGRAM_CHAT_ID    — your chat / group id (see README)
 */

const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

export function buildMessage(body) {
  const addons = body && typeof body.addons === 'object' && body.addons
    ? Object.entries(body.addons)
        .filter(([, q]) => Number(q) > 0)
        .map(([k, q]) => `${clip(k, 20)} ×${Math.min(99, Number(q) || 0)}`)
        .join(', ')
    : '';
  const money = (n) => (typeof n === 'number' && isFinite(n) ? `${Math.round(n).toLocaleString('en-US')} AMD` : 'on request');
  return [
    '🏔 Weekend Extreme — new booking request',
    `👤 ${clip(body.name, 80)}`,
    `📞 ${clip(body.phone, 40)}`,
    `🎒 ${clip(body.packageName || body.package, 60)} · ${Math.max(1, Math.min(99, Number(body.people) || 1))} people`,
    `📅 ${clip(body.date, 40)}`,
    `➕ Add-ons: ${addons || '—'}`,
    `🗣 Guide: ${clip(body.guideLanguage, 4).toUpperCase()} · site: ${clip(body.siteLanguage, 4).toUpperCase()}`,
    `💰 Total: ${money(body.total)} · deposit: ${money(body.deposit)}`,
    body.comment ? `💬 ${clip(body.comment, 800)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function validate(body) {
  if (!body || typeof body !== 'object') return 'Invalid body';
  if (body.website) return 'spam';
  if (!clip(body.name, 80)) return 'Name is required';
  if (String(body.phone || '').replace(/\D/g, '').length < 8) return 'Phone is invalid';
  return null;
}

export async function sendToTelegram(text, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chat = env.TELEGRAM_CHAT_ID;
  if (!token || !chat) throw new Error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set');
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
  });
  if (!r.ok) throw new Error(`Telegram responded ${r.status}`);
}
