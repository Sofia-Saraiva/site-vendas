import { clearCookie, sameOrigin, json } from '../lib/server.js';

export default function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Método não permitido.' }); }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
  res.setHeader('Set-Cookie', clearCookie());
  return json(res, 200, { ok: true });
}
