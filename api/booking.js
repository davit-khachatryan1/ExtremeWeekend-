/* Vercel serverless function: POST /api/booking → message to your Telegram. */
import { buildMessage, sendToTelegram, validate } from '../server/booking-core.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  const err = validate(body);
  if (err === 'spam') return res.status(200).json({ ok: true });
  if (err) return res.status(400).json({ ok: false, error: err });
  try {
    await sendToTelegram(buildMessage(body), process.env);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'Could not deliver the booking' });
  }
}
