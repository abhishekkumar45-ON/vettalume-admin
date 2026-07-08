import React, { useEffect, useRef, useState } from 'react';
import Icon from './icons.jsx';
import Sidebar from './Sidebar.jsx';
import { useStore, A, getState, openModal, closeModal, registerImport, toast } from './store.jsx';
import { Toasts } from './ui.jsx';
import { EXC } from './helpers.js';
import { parseFile } from './excel.js';
import { ImportPreview } from './modals.jsx';

import { Dashboard, Courses, Reports, Settings } from './pages/Misc.jsx';
import { Students, Payments } from './pages/People.jsx';
import Coupons from './pages/Coupons.jsx';
import Learning from './pages/Learning.jsx';
import { Sectional, Full, Diagnostic } from './pages/Mocks.jsx';

const VIEWS = {
  dashboard: 'Dashboard', students: 'Students', payments: 'Payments', coupons: 'Coupons',
  courses: 'Courses', learning: 'Learning', sectional: 'Sectional Mocks', full: 'Full Mocks', diagnostic: 'Diagnostic Test',
  reports: 'Reports', settings: 'Settings',
};
const PAGES = {
  dashboard: Dashboard, students: Students, payments: Payments, coupons: Coupons,
  courses: Courses, learning: Learning, sectional: Sectional, full: Full, diagnostic: Diagnostic,
  reports: Reports, settings: Settings,
};

export default function App() {
  const S = useStore();
  return (
    <>
      {S.authed ? <Shell /> : <Auth />}
      {S.modal && <div key="modal-slot">{S.modal}</div>}
      <Toasts toasts={S.toasts} />
    </>
  );
}

/* --------------------------- authenticated shell --------------------------- */
function Shell() {
  const S = useStore();
  const [navOpen, setNavOpen] = useState(false);
  const fileRef = useRef(null);
  const targetRef = useRef(null);

  // bridge: store.startImport(target) -> open the hidden file picker
  useEffect(() => {
    registerImport((target) => { targetRef.current = target; if (fileRef.current) fileRef.current.click(); });
    return () => registerImport(null);
  }, []);

  // toggle body class for the off-canvas drawer
  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen);
    return () => document.body.classList.remove('nav-open');
  }, [navOpen]);

  const onFile = (e) => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    parseFile(f)
      .then((qs) => {
        if (!qs.length) return toast('No questions found in that file', 'info');
        openModal(<ImportPreview questions={qs} target={targetRef.current} />);
      })
      .catch(() => toast('Could not read that file', 'del'));
  };

  const Page = PAGES[S.view] || Dashboard;
  const showExam = ['learning', 'sectional', 'full'].includes(S.view);

  return (
    <>
      <div className="app">
        <Sidebar onNavigate={() => setNavOpen(false)} />
        <div className="main">
          <header className="topbar">
            <button className="iconbtn menu-btn" aria-label="Menu" onClick={() => setNavOpen(true)}><Icon name="menu" /></button>
            <div className="crumb">
              <b>{VIEWS[S.view] || ''}</b>
              {showExam && <> · <span style={{ color: EXC[S.exam] }}>{S.exam}</span></>}
            </div>
            <div className="sp" />
            <div className="gsearch"><Icon name="search" /><input placeholder="Search students, content, mocks…" /></div>
            <button className="iconbtn" aria-label="Notifications"><Icon name="bell" /><span className="dot" /></button>
          </header>
          <main className="content"><Page /></main>
        </div>
      </div>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={onFile} />
    </>
  );
}

/* --------------------------- auth gate --------------------------- */
function Auth() {
  const [email, setEmail] = useState('admin@vettalume.com');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    if (busy) return;
    setBusy(true); setErr('');
    const msg = await A.login(email, pass);
    setBusy(false);
    if (msg) setErr(msg);
  };
  return (
    <div className="auth">
      <div className="authcard">
        <div className="lg">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M3 4 L13 22 L23 4" stroke="#c8932e" strokeWidth="2.2" strokeLinecap="square" />
            <path d="M8.5 4 L13 12.5 L17.5 4" stroke="#181a18" strokeWidth="2.2" strokeLinecap="square" />
          </svg>
          <div className="wm">Vetta<span className="lm">lume</span></div>
        </div>
        <h2>Admin sign in</h2>
        <div className="as">Secure access to the platform console.</div>
        <div className="field"><label>Email</label>
          <input type="email" placeholder="admin@vettalume.com" value={email} disabled={busy} onChange={(e) => { setEmail(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
        <div className="field"><label>Password</label>
          <input type="password" placeholder="••••••••" value={pass} disabled={busy} onChange={(e) => { setPass(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && submit()} /></div>
        {err && <div style={{ color: '#b23b3b', background: '#fbeeee', border: '1px solid #f1d4d4', borderRadius: 8, padding: '8px 11px', fontSize: 13, marginTop: 12 }}>{err}</div>}
        <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} disabled={busy} onClick={submit}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <div className="demo">Sign in with a backend admin account. Create one with <b>python -m scripts.create_admin &lt;email&gt; &lt;password&gt;</b></div>
      </div>
    </div>
  );
}
