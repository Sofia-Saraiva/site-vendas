import { DEFAULT_STATE, storageReady, readState, writeState, sanitizeState, isAdmin, sameOrigin, json, body } from '../lib/server.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (!storageReady()) return json(res, 200, { state: DEFAULT_STATE, admin: false, setup: false });
      return json(res, 200, { state: await readState(), admin: isAdmin(req) });
    }
    if (req.method === 'POST') {
      if (!sameOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
      if (!isAdmin(req)) return json(res, 401, { error: 'Entre como vendedor para alterar o estoque.' });
      const state = sanitizeState(body(req).state);
      await writeState(state);
      return json(res, 200, { state, admin: true });
    }
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Método não permitido.' });
  } catch (e) {
    return json(res, 503, { error: 'Armazenamento indisponível. Confira o Redis no painel da Vercel.' });
  }
}
