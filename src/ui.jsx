import React, { useEffect, useRef, useState } from 'react';
import Icon from './icons.jsx';
import { closeModal, toast } from './store.jsx';
import { EXC, SECCOL, REGLABEL, diffLabel } from './helpers.js';

/* ---------------- Buttons ---------------- */
export function Btn({ kind = 'ghost', sm, icon, children, ...rest }) {
  return (
    <button className={`btn ${kind}${sm ? ' sm' : ''}`} {...rest}>
      {icon && <Icon name={icon} />}
      {children}
    </button>
  );
}
export function IconBtn({ name, kind, ...rest }) {
  return (
    <button className={`ibtn${kind ? ' ' + kind : ''}`} {...rest}>
      <Icon name={name} />
    </button>
  );
}

/* ---------------- Pills / tags ---------------- */
export const Pill = ({ kind, dot, children, style }) => (
  <span className={`pill ${kind || ''}`} style={style}>
    {dot && <span className="d" />}
    {children}
  </span>
);
export const ExamTag = ({ exam, children }) => (
  <span className="examtag" style={{ background: EXC[exam] }}>{children || exam}</span>
);
export const SecTag = ({ name, children }) => (
  <span className="examtag" style={{ background: SECCOL[name] || 'var(--text-3)' }}>{children || name}</span>
);
export const DiffPill = ({ d, children }) => (
  <span className={`diffpill d${d}`}>{children || diffLabel(d)}</span>
);
export const RegPill = ({ t }) => <span className={`pill reg-${t}`}>{REGLABEL[t] || t}</span>;
export const PayPill = ({ s }) => (s ? <span className={`pill pay-${s}`}>{s}</span> : <span className="cellsub">—</span>);
export const VerPill = ({ v }) =>
  v ? <Pill kind="ok" dot>verified</Pill> : <Pill kind="mut">unverified</Pill>;

/* ---------------- Avatar ---------------- */
export const Avatar = ({ name, color, size }) => (
  <div className="avatar" style={{ background: color, ...(size ? { width: size, height: size, borderRadius: 12, fontSize: size / 2.8 } : {}) }}>
    {name}
  </div>
);

/* ---------------- Stat / page bits ---------------- */
export const Stat = ({ icon, value, label, delta, up }) => (
  <div className="card stat">
    {icon ? (
      <div className="top">
        <div className="ic"><Icon name={icon} /></div>
        {delta && <span className={`delta ${up ? 'up' : 'dn'}`}>{delta}</span>}
      </div>
    ) : null}
    <div className="v" style={value.color ? { color: value.color } : undefined}>{value.text ?? value}</div>
    <div className="l">{label}</div>
  </div>
);

export const PageHead = ({ eyebrow, eyebrowColor, title, desc, actions }) => (
  <div className="page-head">
    <div>
      {eyebrow && <div className="eyebrow" style={eyebrowColor ? { color: eyebrowColor } : undefined}>{eyebrow}</div>}
      <h1>{title}</h1>
      {desc && <div className="desc">{desc}</div>}
    </div>
    {actions && <><div className="sp" />{actions}</>}
  </div>
);

export const Empty = ({ icon, title, text, action }) => (
  <div className="empty">
    <div className="eic"><Icon name={icon} /></div>
    <h3>{title}</h3>
    {text && <p>{text}</p>}
    {action}
  </div>
);

export const Progress = ({ value, width = 84, showPct }) => (
  <div className="progwrap">
    <div className="progress" style={{ width }}><i style={{ width: value + '%' }} /></div>
    {showPct !== false && <span className="pv">{value}%</span>}
  </div>
);

export const KV = ({ rows }) => (
  <div className="configrow">
    {rows.map(([k, v]) => (
      <div className="kv" key={k}><div className="k">{k}</div><div className="v">{v}</div></div>
    ))}
  </div>
);

export const Banner = ({ icon = 'layers', children }) => (
  <div className="banner"><span className="bi"><Icon name={icon} /></span><div className="bt">{children}</div></div>
);

/* ---------------- Form field ---------------- */
export function Field({ label, optional, hint, type, as, options, value, onChange, placeholder }) {
  const set = (e) => onChange(e.target.value);
  return (
    <div className="field">
      <label>{label}{optional && <span className="opt">optional</span>}</label>
      {as === 'textarea' ? (
        <textarea value={value} onChange={set} placeholder={placeholder} />
      ) : options ? (
        <select value={value} onChange={set}>
          {options.map((o) =>
            typeof o === 'object' ? (
              <option key={String(o.v)} value={o.v}>{o.l}</option>
            ) : (
              <option key={o} value={o}>{o}</option>
            )
          )}
        </select>
      ) : (
        <input type={type || 'text'} value={value} onChange={set} placeholder={placeholder} />
      )}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
export const Row = ({ children, cols = 2 }) => <div className={cols === 3 ? 'frow-3' : 'frow'}>{children}</div>;

/* ---------------- Modal shell ---------------- */
export function Modal({ title, sub, lg, onSave, saveLabel = 'Save', danger, children }) {
  // Esc closes the modal (a common "back" gesture).
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div
      className="overlay on"
      onMouseDown={(e) => { if (e.target.classList.contains('overlay')) closeModal(); }}
    >
      <div className={'modal' + (lg ? ' lg' : '')}>
        <div className="modal-h">
          <div>
            <div className="mh-t">{title}</div>
            {sub && <div className="mh-s">{sub}</div>}
          </div>
          <button className="x" onClick={closeModal}><Icon name="x" /></button>
        </div>
        <div className="modal-b">{children}</div>
        {onSave !== false && (
          <div className="modal-f">
            <button className="btn ghost" onClick={closeModal}>Cancel</button>
            <button className={'btn ' + (danger ? 'danger' : 'primary')} onClick={onSave}>{saveLabel}</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Confirm-delete helper used across pages */
export function ConfirmDelete({ what, onYes }) {
  return (
    <Modal
      title={`Delete ${what}?`}
      saveLabel="Delete"
      danger
      onSave={() => { onYes(); closeModal(); }}
    >
      <p style={{ color: 'var(--text-2)', fontSize: 13.5 }}>
        This removes <b>{what}</b> and everything inside it. This can't be undone.
      </p>
    </Modal>
  );
}

/* ---------------- Toasts ---------------- */
export function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div className={`toast on ${t.kind}`} key={t.id}>
          <span className="ti"><Icon name={t.kind === 'del' ? 'trash' : t.kind === 'info' ? 'bell' : 'check'} /></span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Charts (inline SVG) ---------------- */
export function AreaChart({ series, color, h = 150 }) {
  const w = 560, PAD = 8, B = 4, mx = Math.max(...series) * 1.1, n = series.length;
  const X = (i) => PAD + (i / (n - 1)) * (w - 2 * PAD);
  const Y = (v) => B + (1 - v / (mx || 1)) * (h - 2 * B);
  let d = '';
  series.forEach((v, i) => (d += (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1) + ' '));
  const gid = 'ag' + Math.round(color.length * 7);
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".22" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d}L ${X(n - 1).toFixed(1)} ${h - B} L ${X(0).toFixed(1)} ${h - B} Z`} fill={`url(#${gid})`} />
        <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={X(n - 1).toFixed(1)} cy={Y(series[n - 1]).toFixed(1)} r="3.5" fill="var(--ink)" stroke={color} strokeWidth="2.2" />
      </svg>
    </div>
  );
}
export function Donut({ segs, h = 160 }) {
  const r = 58, cx = 80, cy = 80, C = 2 * Math.PI * r, tot = segs.reduce((a, s) => a + s.v, 0) || 1;
  let off = 0;
  const arcs = segs.map((s, i) => {
    const len = (s.v / tot) * C;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth="15"
        strokeDasharray={`${len.toFixed(1)} ${(C - len).toFixed(1)}`} strokeDashoffset={(-off).toFixed(1)}
        transform={`rotate(-90 ${cx} ${cy})`} />
    );
    off += len;
    return el;
  });
  return (
    <div className="chart">
      <svg viewBox={`0 0 160 ${h}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--panel-3)" strokeWidth="15" />
        {arcs}
        <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--m)" fontSize="26" fontWeight="700" fill="var(--text)">{tot}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontFamily="var(--m)" fontSize="9" fill="var(--text-4)" letterSpacing="1">TOTAL</text>
      </svg>
    </div>
  );
}
export function VBars({ rows, h = 160 }) {
  const w = 560, PAD = 24, B = 22, mx = Math.max(...rows.map((r) => r.v)) * 1.15 || 1, bw = (w - 2 * PAD) / rows.length;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${w} ${h}`}>
        {rows.map((r, i) => {
          const bh = (r.v / mx) * (h - B - 8), x = PAD + i * bw + bw * 0.22, y = h - B - bh, bwid = bw * 0.56;
          return (
            <g key={i}>
              <rect x={x.toFixed(1)} y={y.toFixed(1)} width={bwid.toFixed(1)} height={Math.max(2, bh).toFixed(1)} rx="4" fill={r.c} />
              <text x={(x + bwid / 2).toFixed(1)} y={(y - 5).toFixed(1)} textAnchor="middle" fontFamily="var(--m)" fontSize="11" fontWeight="600" fill="var(--text-2)">{r.v}</text>
              <text x={(x + bwid / 2).toFixed(1)} y={h - 7} textAnchor="middle" fontFamily="var(--m)" fontSize="10" fill="var(--text-4)">{r.l}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------------- Rich text editor (concepts) ---------------- */
export function RichText({ html, onSave, onUpload }) {
  const ref = useRef(null);
  const fileRef = useRef(null);
  useEffect(() => { if (ref.current) ref.current.innerHTML = html || '<p>Write the concept explanation here…</p>'; }, [html]);
  const cmd = (e, c) => {
    e.preventDefault();
    if (c === 'createLink') { const u = prompt('Link URL'); if (u) document.execCommand('createLink', false, u); }
    else if (c === 'h2') document.execCommand('formatBlock', false, 'h2');
    else document.execCommand(c, false, null);
  };
  const tool = (c, label, bold) => (
    <button onMouseDown={(e) => cmd(e, c)} style={bold ? { fontWeight: 800 } : undefined}>{label}</button>
  );
  return (
    <>
      <div className="rte-tools">
        {tool('bold', 'B', true)}{tool('italic', 'I', true)}{tool('underline', 'U', true)}
        {tool('h2', 'H2')}{tool('insertUnorderedList', '• List')}{tool('insertOrderedList', '1. List')}{tool('createLink', 'Link')}
      </div>
      <div className="rte" ref={ref} contentEditable suppressContentEditableWarning />
      {onUpload && (
        <input ref={fileRef} type="file" accept=".html,.htm,text/html" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) onUpload(f); e.target.value = ''; }} />
      )}
      <div className="mt14 rowgap">
        <button className="btn primary" onClick={() => onSave(ref.current.innerHTML)}><Icon name="check" /> Save concept</button>
        {onUpload && <button className="btn" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="upload" /> Upload HTML file</button>}
        <span className="cellsub" style={{ alignSelf: 'center' }}>Rich text · scripts are stripped and images must use full URLs</span>
      </div>
    </>
  );
}

/* ---- Concept preview: renders the concept HTML in a sandboxed iframe with MathJax, so the page's
   own CSS can't leak into the admin UI and \(LaTeX\) equations typeset exactly as students will see. */
function buildPreviewDoc(html) {
  const body = html && html.trim()
    ? html
    : '<p style="color:#94a3b8">No concept content yet — switch to Edit / Upload to add it.</p>';
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<style>html,body{margin:0}body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;',
    'color:#1f2733;line-height:1.6;padding:18px 20px;font-size:15px}img{max-width:100%;height:auto}',
    'table{border-collapse:collapse;max-width:100%}th,td{border:1px solid #d8dee9;padding:6px 9px;text-align:left}',
    'pre{background:#f6f8fa;padding:10px;border-radius:6px;overflow:auto}code{background:#f1f3f5;padding:1px 4px;',
    'border-radius:3px}a{color:#1b5e9c}</style>',
    '<script>window.MathJax={svg:{fontCache:"global"},startup:{pageReady:function(){',
    'return MathJax.startup.defaultPageReady().then(post);}}};',
    'function post(){try{parent.postMessage({_vlh:document.documentElement.scrollHeight},"*");}catch(e){}}',
    'window.addEventListener("load",function(){post();setTimeout(post,500);setTimeout(post,1500);});</script>',
    '<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>',
    '</head><body>', body, '</body></html>',
  ].join('');
}

export function ConceptPreview({ html }) {
  const [h, setH] = useState(420);
  useEffect(() => {
    const onMsg = (e) => {
      if (e.data && typeof e.data._vlh === 'number') setH(Math.max(160, Math.min(8000, e.data._vlh + 24)));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);
  return (
    <iframe title="Concept preview" sandbox="allow-scripts" srcDoc={buildPreviewDoc(html)}
      style={{ width: '100%', height: h + 'px', border: '1px solid #e6e8eb', borderRadius: 10, background: '#fff' }} />
  );
}

export function ConceptPane({ html, onSave, onUpload }) {
  const [mode, setMode] = useState('preview');
  const seg = (m, label) => (
    <button onClick={() => setMode(m)} style={{
      padding: '6px 16px', border: '1px solid #d8dee9', cursor: 'pointer', fontWeight: 600, fontSize: 13,
      background: mode === m ? '#14223b' : '#fff', color: mode === m ? '#fff' : '#475569',
      borderRadius: m === 'preview' ? '8px 0 0 8px' : '0 8px 8px 0',
      borderLeft: m === 'edit' ? 'none' : '1px solid #d8dee9',
    }}>{label}</button>
  );
  return (
    <>
      <div className="rowgap" style={{ marginBottom: 12, alignItems: 'center' }}>
        <div style={{ display: 'inline-flex' }}>{seg('preview', 'Preview')}{seg('edit', 'Edit / Upload')}</div>
        <span className="cellsub" style={{ alignSelf: 'center' }}>Preview renders styles and math exactly as students will see them</span>
      </div>
      {mode === 'preview'
        ? <ConceptPreview html={html} />
        : <RichText html={html} onSave={onSave} onUpload={onUpload} />}
    </>
  );
}

/* ---------------- Question row ---------------- */
export function QuestionRow({ q, i, total, adaptive, onMove, onPreview, onEdit, onDelete }) {
  return (
    <div className="qrow">
      <div className="qn">{i + 1}</div>
      <div className="qmain">
        <div className="qtext">{q.text}</div>
        {q.image && <img className="qimg" src={q.image} alt="" onError={(e) => (e.target.style.display = 'none')} />}
        <div className="qopts">
          {(q.options || []).map((o, oi) => (
            <span className={`qopt ${oi === q.correct ? 'cor' : ''}`} key={oi}>
              {String.fromCharCode(65 + oi)}. {o}{oi === q.correct ? ' ✓' : ''}
            </span>
          ))}
        </div>
        <div className="qmeta">
          <DiffPill d={q.difficulty}>{diffLabel(q.difficulty)} · diff {q.difficulty}</DiffPill>
          {adaptive && <span className="diffpill d0">served dynamically</span>}
        </div>
      </div>
      <div className="qside">
        {!adaptive && (
          <>
            <IconBtn name="chevU" kind="s" disabled={i === 0} onClick={() => onMove('up')} />
            <IconBtn name="chevD" kind="s" disabled={i === total - 1} onClick={() => onMove('down')} />
          </>
        )}
        <IconBtn name="eye" kind="s" onClick={onPreview} />
        <IconBtn name="edit" kind="s" onClick={onEdit} />
        <IconBtn name="trash" kind="s del" onClick={onDelete} />
      </div>
    </div>
  );
}

/* tiny stateful helper for filter selects */
export function useField(init) {
  const [value, setValue] = useState(init);
  return [value, setValue];
}
