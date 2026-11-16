import { authReady, storageReady, passwordOk, sessionCookie, sameOrigin, clientIp, loginAllowed, json, body } from '../lib/server.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Método não permitido.' }); }
  if (!sameOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
  if (!authReady() || !storageReady()) return json(res, 503, { error: 'Login ainda não configurado. Veja o README.' });
  try {
    if (!(await loginAllowed(clientIp(req)))) return json(res, 429, { error: 'Muitas tentativas. Espere 15 minutos.' });
  } catch (e) {
    return json(res, 503, { error: 'Armazenamento indisponível.' });
  }
  if (!passwordOk(body(req).password)) return json(res, 401, { error: 'Senha incorreta.' });
  res.setHeader('Set-Cookie', sessionCookie());
  return json(res, 200, { ok: true });
}
