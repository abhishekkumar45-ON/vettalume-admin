import React from 'react';
import Icon from './icons.jsx';
import { useStore, A } from './store.jsx';
import { EXC } from './helpers.js';

const NAV = [
  { grp: 'Overview', items: [['dashboard', 'Dashboard', 'grid']] },
  { grp: 'People', items: [['students', 'Students', 'users'], ['payments', 'Payments', 'award']] },
  { grp: 'Billing', items: [['coupons', 'Coupons', 'clip']] },
  { grp: 'Catalog', items: [['courses', 'Courses', 'layers']] },
  { grp: 'Learning', items: [['learning', 'Chapters & Content', 'book']] },
  { grp: 'Assessments', items: [['diagnostic', 'Diagnostic Test', 'award'], ['sectional', 'Sectional Mocks', 'clip'], ['full', 'Full Mocks', 'file'], ['media', 'Question Images', 'image']] },
  { grp: 'Insights', items: [['reports', 'Reports', 'bar']] },
  { grp: 'Support', items: [['messages', 'Messages', 'mail'], ['admins', 'Admins', 'shield']] },
  { grp: 'System', items: [['settings', 'Settings', 'settings']] },
];

export default function Sidebar({ onNavigate }) {
  const S = useStore();
  const counts = {
    students: S.students.length,
    payments: S.students.filter((s) => s.regType === 'paid').length,
    coupons: S.coupons.length,
    learning: S.lms[S.exam].length,
    sectional: S.sectional[S.exam].length,
    full: S.full[S.exam].length,
    courses: 3,
  };
  const go = (view) => { A.nav(view); onNavigate && onNavigate(); };
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/logo-mark.png" alt="Vettalume" style={{ height: 32, width: 'auto', display: 'block' }} />
        <div><div className="wm">Vetta<span className="lm">lume</span></div><div className="tag">Admin Console</div></div>
      </div>

      <div className="examsw">
        {['CAT', 'GMAT', 'GRE'].map((e) => (
          <button key={e} className={S.exam === e ? 'on' : ''} style={S.exam === e ? { color: EXC[e] } : undefined} onClick={() => A.setExam(e)}>
            <span className="d" style={{ background: EXC[e] }} />{e}
          </button>
        ))}
      </div>

      <nav className="nav">
        {NAV.map((g) => (
          <React.Fragment key={g.grp}>
            <div className="grp">{g.grp}</div>
            {g.items.map(([view, label, icn]) => (
              <a key={view} className={S.view === view ? 'on' : ''} onClick={() => go(view)}>
                <Icon name={icn} /><span>{label}</span>
                {counts[view] != null && <span className="ct">{counts[view]}</span>}
              </a>
            ))}
          </React.Fragment>
        ))}
      </nav>

      <div className="side-foot">
        <div className="adminchip">
          <div className="av">AV</div>
          <div><div className="nm">Aanya Verma</div><div className="rl">Administrator</div></div>
          <button className="logout-btn" onClick={() => A.logout()} title="Sign out"><Icon name="logout" /></button>
        </div>
      </div>
    </aside>
  );
}
