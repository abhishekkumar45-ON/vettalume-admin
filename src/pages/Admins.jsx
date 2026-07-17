import React, { useEffect, useState } from 'react';
import Icon from '../icons.jsx';
import { PageHead, Empty, IconBtn, Pill } from '../ui.jsx';
import { getAdmins, createAdmin, deleteAdmin, me } from '../api.js';

const emptyForm = { email: '', password: '', displayName: '' };

export default function Admins() {
  const [items, setItems] = useState([]);
  const [f, setF] = useState(emptyForm);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meId, setMeId] = useState(null);
  const [msg, setMsg] = useState(null); // { kind: 'ok' | 'del', text }

  const load = async () => {
    setBusy(true);
    try {
      setItems(await getAdmins());
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
    setBusy(false);
  };

  useEffect(() => {
    load();
    // learn the current admin so we can avoid offering "remove" on ourselves
    me().then((m) => setMeId(m?.account_id ?? m?.accountId ?? m?.id ?? null)).catch(() => {});
  }, []);

  const up = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setMsg(null); };

  const create = async () => {
    if (saving) return;
    const email = f.email.trim();
    if (!email) return setMsg({ kind: 'del', text: 'Email is required.' });
    if (f.password.length < 8) return setMsg({ kind: 'del', text: 'Password must be at least 8 characters.' });
    setSaving(true); setMsg(null);
    try {
      await createAdmin({ email, password: f.password, displayName: f.displayName.trim() });
      setF(emptyForm);
      setMsg({ kind: 'ok', text: `Admin access granted to ${email}.` });
      await load();
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
    setSaving(false);
  };

  const remove = async (a) => {
    setMsg(null);
    try {
      await deleteAdmin(a.account_id);
      setMsg({ kind: 'ok', text: `Admin access revoked for ${a.email || a.account_id}.` });
      await load();
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
  };

  return (
    <>
      <PageHead eyebrow="Support" title="Admins"
        desc="Grant or revoke admin access to the console. Adding an existing email resets its password and makes it an admin." />

      <div className="card panel mb18">
        <div className="panel-h"><div className="t">Add admin</div><div className="s">grant access</div></div>

        {msg && (
          <div style={{
            marginBottom: 12, fontSize: 13, borderRadius: 8, padding: '8px 11px',
            color: msg.kind === 'ok' ? 'var(--ok)' : '#b23b3b',
            background: msg.kind === 'ok' ? 'rgba(30,160,90,.08)' : '#fbeeee',
            border: `1px solid ${msg.kind === 'ok' ? 'rgba(30,160,90,.25)' : '#f1d4d4'}`,
          }}>{msg.text}</div>
        )}

        <div className="frow">
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="admin@company.com" value={f.email} disabled={saving} onChange={up('email')} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="At least 8 characters" value={f.password} disabled={saving} onChange={up('password')} />
          </div>
        </div>
        <div className="field">
          <label>Name<span className="opt">optional</span></label>
          <input type="text" placeholder="Display name" value={f.displayName} disabled={saving} onChange={up('displayName')} />
        </div>
        <button className="btn primary" disabled={saving} onClick={create}>
          <Icon name="plus" /> {saving ? 'Adding…' : 'Add admin'}
        </button>
      </div>

      <div className="card panel">
        <div className="panel-h">
          <div className="t">Current admins</div>
          <button className="ibtn" onClick={load} title="Refresh"><Icon name="download" /></button>
        </div>

        {busy ? (
          <div className="cellsub" style={{ padding: '8px 2px' }}>Loading…</div>
        ) : items.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((a) => {
              const self = meId != null && a.account_id === meId;
              return (
                <div key={a.account_id} className="card" style={{ padding: 14 }}>
                  <div className="rowgap" style={{ alignItems: 'center' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="cellname" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {a.email || '—'}
                        {self && <Pill kind="mut">(you)</Pill>}
                        {a.role && <Pill kind="ok" dot>{a.role}</Pill>}
                      </div>
                      <div className="cellsub" style={{ marginTop: 2 }}>{a.display_name || '—'}</div>
                    </div>
                    {!self && (
                      <IconBtn name="trash" kind="del" title="Revoke admin access" onClick={() => remove(a)} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty icon="shield" title="No admins yet" text="Add an admin using the form above." />
        )}
      </div>
    </>
  );
}
