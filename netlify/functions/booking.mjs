/* Netlify function: POST /api/booking (see netlify.toml redirect) → Telegram. */
import { buildMessage, sendToTelegram, validate } from '../../server/booking-core.js';

export default async (req) => {
  if (req.method !== 'POST') return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  let body = null;
  try {
    body = await req.json();
  } catch {
    /* invalid json */
  }
  const err = validate(body);
  if (err === 'spam') return Response.json({ ok: true });
  if (err) return Response.json({ ok: false, error: err }, { status: 400 });
  try {
    await sendToTelegram(buildMessage(body), process.env);
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ ok: false, error: 'Could not deliver the booking' }, { status: 502 });
  }
};
