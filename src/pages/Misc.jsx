import React, { useEffect, useState } from 'react';
import Icon from '../icons.jsx';
import { useStore, A, allSubs, countQuestions, enrollCount, totalEnroll, publishedMocks } from '../store.jsx';
import { me } from '../api.js';
import { PageHead, Stat, AreaChart, Donut, VBars, ExamTag } from '../ui.jsx';
import { EXC } from '../helpers.js';

export function Dashboard() {
  const S = useStore();
  const [admin, setAdmin] = useState(null);
  useEffect(() => { me().then(setAdmin).catch(() => {}); }, []);
  const firstName =
    (admin?.display_name || '').trim().split(/\s+/)[0] ||
    (admin?.email ? admin.email.split('@')[0] : '') || 'there';
  const q = ['CAT', 'GMAT', 'GRE'].reduce((a, e) => a + countQuestions(e), 0);
  const chap = ['CAT', 'GMAT', 'GRE'].reduce((a, e) => a + S.lms[e].length, 0);
  const subs = ['CAT', 'GMAT', 'GRE'].reduce((a, e) => a + allSubs(e).length, 0);
  const activity = [
    ['userplus', <><b>Ananya Iyer</b> enrolled in GRE</>, '12m ago'],
    ['file', <><b>Full Mock 1</b> published · CAT</>, '40m ago'],
    ['book', <>New subtopic <b>Percentages</b> added</>, '1h ago'],
    ['upload', <>24 questions imported to <b>Averages</b> quiz</>, '2h ago'],
    ['edit', <><b>Quadratic Equations</b> concept updated</>, '3h ago'],
  ];
  return (
    <>
      <PageHead eyebrow="Platform overview" title={`Good evening, ${firstName}`} desc="Everything across CAT, GMAT and GRE — students, content and assessments at a glance."
        actions={<><button className="btn ghost" onClick={() => A.nav('students')}><Icon name="users" /> Manage students</button><button className="btn primary" onClick={() => A.nav('learning')}><Icon name="plus" /> Add content</button></>} />
      <div className="grid cols-4 mb16">
        <Stat icon="users" value={S.students.length} label="Total students" delta="+8.2%" up />
        <Stat icon="layers" value={totalEnroll()} label="Active enrollments" delta="+5.1%" up />
        <Stat icon="clip" value={publishedMocks()} label="Published mocks" delta="+3" up />
        <Stat icon="list" value={q.toLocaleString()} label="Quiz & mock questions" delta="+124" up />
      </div>
      <div className="grid cols-2 mb16">
        <div className="card panel"><div className="panel-h"><div className="t">Enrollments</div><div className="s">last 8 months</div></div>
          <AreaChart series={[62, 78, 90, 104, 121, 140, 158, 182]} color="var(--brand)" /></div>
        <div className="card panel"><div className="panel-h"><div className="t">Students by course</div><div className="s">live</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Donut segs={[{ v: enrollCount('CAT'), c: 'var(--cat)' }, { v: enrollCount('GMAT'), c: 'var(--gmat)' }, { v: enrollCount('GRE'), c: 'var(--gre)' }]} />
            <div className="legend" style={{ flexDirection: 'column', gap: 10, margin: 0 }}>
              {['CAT', 'GMAT', 'GRE'].map((e) => <div className="li" key={e}><span className="sw" style={{ background: EXC[e] }} />{e} · {enrollCount(e)}</div>)}
            </div>
          </div>
        </div>
      </div>
      <div className="grid cols-2">
        <div className="card panel"><div className="panel-h"><div className="t">Content library</div><div className="s">chapters · subtopics · questions</div></div>
          <VBars rows={[{ l: 'CAT', v: countQuestions('CAT'), c: 'var(--cat)' }, { l: 'GMAT', v: countQuestions('GMAT'), c: 'var(--gmat)' }, { l: 'GRE', v: countQuestions('GRE'), c: 'var(--gre)' }]} />
          <div className="legend"><div className="li">{chap} chapters</div><div className="li">{subs} subtopics</div><div className="li">{q} questions</div></div></div>
        <div className="card panel"><div className="panel-h"><div className="t">Recent activity</div><div className="s">today</div></div>
          <div className="actfeed">{activity.map((a, i) => (
            <div className="af" key={i}><div className="afi"><Icon name={a[0]} /></div><div><div className="aft">{a[1]}</div><div className="afd">{a[2]}</div></div></div>
          ))}</div>
        </div>
      </div>
    </>
  );
}

export function Courses() {
  const S = useStore();
  return (
    <>
      <PageHead eyebrow="Catalog" title="Courses" desc="The three exams the platform supports. Open one to manage its chapters, content and mocks." />
      <div className="grid cols-3">
        {['CAT', 'GMAT', 'GRE'].map((e) => {
          const tiles = [['Chapters', S.lms[e].length], ['Subtopics', allSubs(e).length], ['Questions', countQuestions(e)], ['Mocks', S.sectional[e].length + S.full[e].length]];
          return (
            <div className="card" style={{ overflow: 'hidden' }} key={e}>
              <div style={{ height: 5, background: EXC[e] }} />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>{e}</div>
                  <ExamTag exam={e}>{enrollCount(e)} students</ExamTag>
                </div>
                <div className="cellsub" style={{ marginBottom: 16 }}>{e === 'CAT' ? 'IIM admissions · India' : e === 'GMAT' ? 'MBA admissions · global' : 'Grad school · global'}</div>
                <div className="grid cols-2" style={{ gap: 10, marginBottom: 16 }}>
                  {tiles.map((t) => <div key={t[0]} style={{ background: 'var(--panel-2)', borderRadius: 8, padding: '11px 13px' }}><div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>{t[1]}</div><div className="cellsub">{t[0]}</div></div>)}
                </div>
                <div className="rowgap">
                  <button className="btn primary sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => A.openCourse(e)}><Icon name="book" /> Manage learning</button>
                  <button className="btn ghost sm" onClick={() => A.openCourseMocks(e)}><Icon name="clip" /> Mocks</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function Reports() {
  const S = useStore();
  return (
    <>
      <PageHead eyebrow="Insights" title="Reports" desc="Engagement and content coverage across courses." />
      <div className="grid cols-3 mb16">
        {[['Avg. mock score', '71%', 'var(--cat)'], ['Quiz completion', '84%', 'var(--brand)'], ['Active this week', '312', 'var(--gre)']].map((x) => (
          <Stat key={x[0]} value={{ text: x[1], color: x[2] }} label={x[0]} />
        ))}
      </div>
      <div className="grid cols-2">
        <div className="card panel"><div className="panel-h"><div className="t">Enrollments by course</div></div>
          <VBars rows={[{ l: 'CAT', v: enrollCount('CAT'), c: 'var(--cat)' }, { l: 'GMAT', v: enrollCount('GMAT'), c: 'var(--gmat)' }, { l: 'GRE', v: enrollCount('GRE'), c: 'var(--gre)' }]} /></div>
        <div className="card panel"><div className="panel-h"><div className="t">Content coverage</div></div>
          <div className="tbl-wrap" style={{ border: 'none' }}><table><thead><tr><th>Course</th><th>Chapters</th><th>Subtopics</th><th>Questions</th></tr></thead>
            <tbody>{['CAT', 'GMAT', 'GRE'].map((e) => <tr key={e}><td><ExamTag exam={e} /></td><td>{S.lms[e].length}</td><td>{allSubs(e).length}</td><td>{countQuestions(e)}</td></tr>)}</tbody></table></div></div>
      </div>
    </>
  );
}

export function Settings() {
  const S = useStore();
  const [admin, setAdmin] = useState(null);
  useEffect(() => { me().then(setAdmin).catch(() => {}); }, []);
  return (
    <>
      <PageHead eyebrow="System" title="Settings" desc="Platform configuration and administrator preferences." />
      <div className="grid cols-2 mb16">
        <div className="card panel"><div className="panel-h"><div className="t">Platform</div></div>
          <div className="field"><label>Platform name</label><input defaultValue="Vettalume" /></div>
          <div className="field"><label>Supported exams</label><input defaultValue="CAT, GMAT, GRE" disabled /></div>
          <div className="field"><label>Default difficulty scale</label><input defaultValue="−2 to +2 (0 = average)" disabled /></div>
          <button className="btn primary"><Icon name="check" /> Save changes</button></div>
        <div className="card panel"><div className="panel-h"><div className="t">Administrator</div></div>
          <div className="field"><label>Name</label><input key={'n' + (admin?.account_id || '')} defaultValue={admin?.display_name || ''} /></div>
          <div className="field"><label>Email</label><input key={'e' + (admin?.account_id || '')} defaultValue={admin?.email || ''} disabled /></div>
          <div className="field"><label>Role</label><input defaultValue="Administrator — full access" disabled /></div>
          <button className="btn primary"><Icon name="check" /> Save changes</button></div>
      </div>
      <div className="card panel"><div className="panel-h"><div className="t">Payments &amp; account verification</div><div className="s">access control</div></div>
        <label className={'switch' + (S.settings.autoVerify ? ' on' : '')} onClick={() => A.toggleAutoVerify()}>
          <span className="sw-track" /><div><div className="sw-l">Automatic account verification after payment</div><div className="sw-s">When a payment is marked successful, the student's account is verified instantly.</div></div>
        </label>
        <div className="hint">When off, verify accounts manually from the Students or Payments screens. Access to paid courses always follows payment status — pending, failed or refunded payments restrict access.</div></div>
    </>
  );
}
