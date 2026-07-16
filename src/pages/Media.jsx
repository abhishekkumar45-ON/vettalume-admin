import React, { useEffect, useRef, useState } from 'react';
import Icon from '../icons.jsx';
import { PageHead, Empty, IconBtn } from '../ui.jsx';
import { BASE, uploadMedia, listMedia, deleteMedia } from '../api.js';

const fmtSize = (n) => {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

export default function Media() {
  const fileRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { kind: 'ok' | 'del', text }

  const load = async () => {
    try {
      const r = await listMedia();
      setItems(r.items || []);
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
  };
  useEffect(() => { load(); }, []);

  const onUpload = async () => {
    if (busy || !files.length) return;
    setBusy(true); setMsg(null);
    try {
      const r = await uploadMedia(files);
      setMsg({ kind: 'ok', text: `Uploaded ${r.count} image${r.count !== 1 ? 's' : ''}.` });
      setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
      await load();
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
    setBusy(false);
  };

  const onDelete = async (key) => {
    setMsg(null);
    try {
      await deleteMedia(key);
      await load();
    } catch (e) {
      setMsg({ kind: 'del', text: e.message });
    }
  };

  return (
    <>
      <PageHead eyebrow="Assessments" title="Question Images"
        desc="Upload question images. Each file's name must be the question ID (e.g. q123.png). The image auto-attaches to that question in mocks, diagnostic, and practice." />

      <div className="card panel mb16">
        <div className="panel-h"><div className="t">Upload</div><div className="s">JPG / PNG · one or many</div></div>
        <div className="rowgap" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <input ref={fileRef} type="file" accept="image/*" multiple
            onChange={(e) => { setFiles(Array.from(e.target.files)); setMsg(null); }} />
          <button className="btn primary" disabled={busy || !files.length} onClick={onUpload}>
            <Icon name="upload" /> {busy ? 'Uploading…' : `Upload${files.length ? ` (${files.length})` : ''}`}
          </button>
        </div>
        {msg && (
          <div style={{
            marginTop: 12, fontSize: 13, borderRadius: 8, padding: '8px 11px',
            color: msg.kind === 'ok' ? 'var(--ok)' : '#b23b3b',
            background: msg.kind === 'ok' ? 'rgba(30,160,90,.08)' : '#fbeeee',
            border: `1px solid ${msg.kind === 'ok' ? 'rgba(30,160,90,.25)' : '#f1d4d4'}`,
          }}>{msg.text}</div>
        )}
      </div>

      <div className="card panel">
        <div className="panel-h"><div className="t">Uploaded images</div><div className="s">{items.length} total</div></div>
        {items.length ? (
          <div className="grid cols-4" style={{ gap: 14 }}>
            {items.map((it) => (
              <div key={it.key} className="card" style={{ overflow: 'hidden' }}>
                <div style={{ background: 'var(--panel-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 130 }}>
                  <img src={`${BASE}/media/${encodeURIComponent(it.key)}`} alt={it.key}
                    style={{ maxWidth: '100%', maxHeight: 130, display: 'block', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="cellname" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.key}</div>
                    <div className="cellsub">{fmtSize(it.size)}</div>
                  </div>
                  <IconBtn name="trash" kind="del" title="Delete" onClick={() => onDelete(it.key)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon="image" title="No images yet" text="Upload question images above. Name each file after its question ID." />
        )}
      </div>
    </>
  );
}
