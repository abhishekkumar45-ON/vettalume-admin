import React, { useEffect, useState } from 'react';
import Icon from '../icons.jsx';
import { PageHead, Empty, IconBtn, Pill } from '../ui.jsx';
import { getContact, setContactHandled, deleteContact } from '../api.js';

const fmtDate = (s) => {
  if (!s) return '—';
  const d = new Date(s);
  if (isNaN(d)) return String(s);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const fullName = (m) => {
  const n = [m.firstName, m.lastName].filter(Boolean).join(' ').trim();
  return n || '—';
};

export default function Messages() {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [unhandled, setUnhandled] = useState(0);
  const [busy, setBusy] = useState(true);
  const [msg, setMsg] = useState(null); // { kind: 'ok' | 'del', text }

  const load = async () => {
    setBusy(true);
    try {
      const r = await getContact();
      setItems(r.items || []);
      setCount(r.count ?? (r.items || []).length);
      setUnhandled(r.unhandled ?? (r.items || []).filter((m) => !m.handled).length);
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
    setBusy(false);
  };
  useEffect(() => { load(); }, []);

  const onToggle = async (m) => {
    setMsg(null);
    try {
      await setContactHandled(m.id, !m.handled);
      await load();
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
  };

  const onDelete = async (id) => {
    setMsg(null);
    try {
      await deleteContact(id);
      await load();
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
  };

  return (
    <>
      <PageHead eyebrow="Support" title="Messages"
        desc="Contact-us submissions from the website. Mark each as handled once you've followed up." />

      <div className="card panel">
        <div className="panel-h">
          <div className="t">Inbox</div>
          <div className="s">{count} total · {unhandled} unhandled</div>
        </div>

        {msg && (
          <div style={{
            marginBottom: 12, fontSize: 13, borderRadius: 8, padding: '8px 11px',
            color: msg.kind === 'ok' ? 'var(--ok)' : '#b23b3b',
            background: msg.kind === 'ok' ? 'rgba(30,160,90,.08)' : '#fbeeee',
            border: `1px solid ${msg.kind === 'ok' ? 'rgba(30,160,90,.25)' : '#f1d4d4'}`,
          }}>{msg.text}</div>
        )}

        {busy ? (
          <div className="cellsub" style={{ padding: '8px 2px' }}>Loading…</div>
        ) : items.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map((m) => (
              <div key={m.id} className="card" style={{
                padding: 14,
                borderLeft: m.handled ? '3px solid var(--panel-3)' : '3px solid var(--warn)',
                background: m.handled ? undefined : 'rgba(224,168,0,.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="cellname" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {!m.handled && <span className="d" style={{
                        width: 8, height: 8, borderRadius: '50%', background: 'var(--warn)', display: 'inline-block', flexShrink: 0,
                      }} />}
                      {fullName(m)}
                      {m.handled
                        ? <Pill kind="ok" dot>handled</Pill>
                        : <Pill kind="mut">new</Pill>}
                    </div>
                    <div className="cellsub" style={{ marginTop: 2 }}>
                      {m.email || '—'}{m.phone ? ` · ${m.phone}` : ''}
                    </div>
                  </div>
                  <div className="cellsub" style={{ whiteSpace: 'nowrap' }}>{fmtDate(m.createdAt)}</div>
                </div>

                <div style={{ fontSize: 13.5, color: 'var(--text-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 10 }}>
                  {m.message || <span className="cellsub">—</span>}
                </div>

                <div className="rowgap" style={{ alignItems: 'center' }}>
                  <button className="btn sm" onClick={() => onToggle(m)}>
                    <Icon name="check" /> {m.handled ? 'Mark unhandled' : 'Mark handled'}
                  </button>
                  <div className="grow" />
                  <IconBtn name="trash" kind="del" title="Delete" onClick={() => onDelete(m.id)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon="mail" title="No messages yet" text="Contact-us submissions from the website will appear here." />
        )}
      </div>
    </>
  );
}
