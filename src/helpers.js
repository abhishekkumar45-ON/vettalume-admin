// Pure, dependency-free helpers and domain constants.

export const uid = () => Math.random().toString(36).slice(2, 9);

// Turn a YouTube / Vimeo / Gumlet link into an embeddable iframe URL.
// Gumlet's share link (gumlet.tv/watch/{id}) does NOT embed — it must become the
// embed link (play.gumlet.io/embed/{id}); the asset id is the same in both.
export function embedUrl(src) {
  if (!src) return '';
  const s = String(src).trim();
  let m = s.match(/gumlet\.tv\/watch\/([a-z0-9]+)/i) || s.match(/play\.gumlet\.io\/embed\/([a-z0-9]+)/i);
  if (m) return `https://play.gumlet.io/embed/${m[1]}`;
  m = s.match(/youtu\.be\/([\w-]+)/) || s.match(/[?&]v=([\w-]+)/) || s.match(/youtube\.com\/embed\/([\w-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = s.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  // a generic https page (not a raw media file) — embed as-is; raw mp4/m3u8 handled separately
  if (/^https?:\/\//.test(s) && !/\.(mp4|m3u8|mpd|webm)(\?|$)/i.test(s)) return s;
  return '';
}

export const EXC = { CAT: 'var(--cat)', GMAT: 'var(--gmat)', GRE: 'var(--gre)' };
export const SECS = {
  CAT: ['VARC', 'DILR', 'QA'],
  GMAT: ['Quant', 'Verbal', 'Data Insights'],
  GRE: ['Verbal', 'Quant', 'AWA'],
};
export const SECCOL = {
  VARC: 'var(--varc)', DILR: 'var(--dilr)', QA: 'var(--qa)',
  Quant: 'var(--qa)', Verbal: 'var(--varc)', 'Data Insights': 'var(--dilr)', AWA: 'var(--dilr)',
};
export const REGLABEL = { registered: 'Registered', trial: 'Free trial', paid: 'Paid' };
export const ATTEMPTLABEL = { all: 'All attempts', first: '1st attempt', second: '2nd attempt', third: '3rd+ attempt' };

export const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const avatarColor = (n) =>
  ['#4f8466', '#a8705f', '#6a6f9c', '#b2847a', '#7d9a84', '#797ea4', '#bb7d49'][n.charCodeAt(0) % 7];
export const diffLabel = (d) => ({ '-2': 'L1', '-1': 'L2', 0: 'L3', 1: 'L4', 2: 'L5' }[String(d)] || 'L3');
export const money = (n) => '₹' + (n || 0).toLocaleString('en-IN');

export const couponValue = (c) =>
  c.type === 'percentage' ? c.value + '% off' : money(Math.round((c.value || 0) / 100)) + ' off';

export const fmtExpiry = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d)
    ? s
    : String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
};

export function accessLevel(s) {
  if (s.status === 'inactive') return { l: 'Disabled', c: 'mut' };
  if (s.regType === 'paid') {
    const p = s.payment.status;
    if (p === 'successful') return { l: 'Full access', c: 'ok' };
    if (p === 'pending') return { l: 'Restricted · awaiting payment', c: 'warn' };
    if (p === 'failed') return { l: 'Blocked · payment failed', c: 'danger' };
    if (p === 'refunded') return { l: 'Revoked · refunded', c: 'mut' };
    return { l: 'Restricted', c: 'warn' };
  }
  if (s.regType === 'trial') return { l: 'Trial access', c: 'warn' };
  return { l: 'Limited · free', c: 'mut' };
}
