import crypto from 'node:crypto';

const STATE_KEY = 'estante:state';
const SESSION_DAYS = 7;
const CONDS = ['Bem conservado', 'Com marcas de uso'];
export const DEFAULT_STATE = { v: 1, items: {}, contact: { wa: '', note: '' }, lotPct: 7 };

// ---------- armazenamento (Upstash Redis pela API REST, sem dependências) ----------
function redisEnv() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}
export const storageReady = () => !!redisEnv();
export async function redis(...cmd) {
  const env = redisEnv();
  if (!env) throw new Error('storage_not_configured');
  const r = await fetch(env.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error('storage_error');
  return j.result;
}
export async function readState() {
  const raw = await redis('GET', STATE_KEY);
  if (!raw) return DEFAULT_STATE;
  try { return sanitizeState(JSON.parse(raw)); } catch { return DEFAULT_STATE; }
}
export async function writeState(state) {
  await redis('SET', STATE_KEY, JSON.stringify(state));
}

// ---------- validação: nada do que o navegador manda é gravado sem passar por aqui ----------
export function sanitizeState(input) {
  const out = { v: 1, items: {}, contact: { wa: '', note: '' }, lotPct: 7 };
  if (!input || typeof input !== 'object') return out;
  const items = input.items && typeof input.items === 'object' ? input.items : {};
  for (const id of Object.keys(items).slice(0, 300)) {
    if (!/^[a-z0-9-]{1,40}$/.test(id)) continue;
    const src = items[id] || {}, it = {};
    if (src.sold === true) it.sold = true;
    if (typeof src.price === 'number' && Number.isFinite(src.price) && src.price >= 0 && src.price <= 100000) it.price = Math.round(src.price * 100) / 100;
    if (CONDS.includes(src.cond)) it.cond = src.cond;
    if (Object.keys(it).length) out.items[id] = it;
  }
  const c = input.contact || {};
  if (typeof c.wa === 'string' && /^[0-9+()\-\s]{0,25}$/.test(c.wa)) out.contact.wa = c.wa.trim();
  if (typeof c.note === 'string') out.contact.note = c.note.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 120);
  const p = Number(input.lotPct);
  if (Number.isInteger(p) && p >= 0 && p <= 50) out.lotPct = p;
  return out;
}

// ---------- sessão do vendedor: cookie assinado (HMAC), ilegível para JavaScript ----------
const secret = () => process.env.SESSION_SECRET || '';
export const authReady = () => (process.env.ADMIN_PASSWORD || '').length >= 10 && secret().length >= 32;
const sign = (v) => crypto.createHmac('sha256', secret()).update(v).digest('base64url');
const safeEqual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};
export const passwordOk = (given) => authReady() && typeof given === 'string' && safeEqual(given, process.env.ADMIN_PASSWORD);

export function sessionCookie() {
  const exp = String(Date.now() + SESSION_DAYS * 864e5);
  return `estante_adm=${exp}.${sign(exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearCookie = () => 'estante_adm=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
export function isAdmin(req) {
  if (!authReady()) return false;
  const m = /(?:^|;\s*)estante_adm=([^;]+)/.exec(req.headers.cookie || '');
  if (!m) return false;
  const [exp, sig] = m[1].split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  return safeEqual(sig, sign(exp)) && Number(exp) > Date.now();
}

// ---------- proteções de requisição ----------
// Recusa POST vindo de outro site (CSRF), além do SameSite=Strict do cookie.
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
export const clientIp = (req) => String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
// No máximo 5 tentativas de senha a cada 15 minutos por IP.
export async function loginAllowed(ip) {
  const key = `estante:login:${ip}`;
  const n = await redis('INCR', key);
  if (n === 1) await redis('EXPIRE', key, 900);
  return n <= 5;
}
export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
export function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
