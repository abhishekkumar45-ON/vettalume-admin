import React, { useEffect } from 'react';
import Icon from '../icons.jsx';
import { useStore, A, openModal, startImport, getMock } from '../store.jsx';
import { PageHead, Empty, Banner, KV, QuestionRow, SecTag, Pill, Avatar, Stat, IconBtn } from '../ui.jsx';
import { EXC, SECCOL, initials, avatarColor } from '../helpers.js';
import { ConfirmDelete } from '../ui.jsx';
import { SectionalModal, SectionConfigModal, FullModal, FullSectionModal, QuestionModal, PreviewQuestion, AttemptReport } from '../modals.jsx';

/* ------------------------------- entry points ------------------------------- */
export function Sectional() {
  const S = useStore();
  if (S.mock && S.mockType === 'sectional') return S.results ? <MockResults type="sectional" /> : <MockEditor type="sectional" />;
  return <SectionalList />;
}
export function Full() {
  const S = useStore();
  if (S.mock && S.mockType === 'full') return S.results ? <MockResults type="full" /> : <MockEditor type="full" />;
  return <FullList />;
}

/* ------------------------------- list views ------------------------------- */
function SectionalList() {
  const S = useStore();
  useEffect(() => { A.loadMocks(); }, [S.exam]);
  const list = S.sectional[S.exam];
  return (
    <>
      <PageHead eyebrow={`${S.exam} · assessments`} eyebrowColor={EXC[S.exam]} title="Sectional mocks"
        desc="Timed papers built from one or more sections. Set questions and time per section; upload questions in bulk."
        actions={<button className="btn primary" onClick={() => openModal(<SectionalModal />)}><Icon name="plus" /> New sectional mock</button>} />
      {list.length ? (
        <div className="tbl-wrap"><table>
          <thead><tr><th>Mock</th><th>Sections</th><th>Questions</th><th>Time</th><th>Attempts</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
          <tbody>{list.map((m) => {
            const tq = m.sections.reduce((a, s) => a + s.questions.length, 0);
            const tm = m.sections.reduce((a, s) => a + (s.time || 0), 0);
            const na = (m.attempts || []).length;
            return (
              <tr key={m.id}>
                <td className="cellname"><span className="dotted" onClick={() => A.openSectional(m.id)}>{m.name}</span></td>
                <td>{m.sections.map((s) => <SecTag key={s.id} name={s.name} />)}</td>
                <td>{tq}</td><td className="cellsub">{tm} min</td><td className="cellsub">{na} attempt{na !== 1 ? 's' : ''}</td>
                <td><Pill kind={m.status === 'published' ? 'ok' : 'draft'} dot={m.status === 'published'}>{m.status}</Pill></td>
                <td><div className="rowacts">
                  <IconBtn name="list" onClick={() => A.openSectional(m.id)} title="Manage questions" />
                  <IconBtn name="bar" onClick={() => A.openResults(m.id, 'sectional')} title="Attempts & results" />
                  <IconBtn name="settings" onClick={() => openModal(<SectionalModal mock={m} />)} title="Configure" />
                  <IconBtn name="trash" kind="del" onClick={() => openModal(<ConfirmDelete what={m.name} onYes={() => A.delSectional(m.id)} />)} />
                </div></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      ) : (
        <div className="card"><Empty icon="clip" title={`No sectional mocks for ${S.exam}`} text="Create a timed test, add sections, and upload questions from Excel." action={<button className="btn primary" onClick={() => openModal(<SectionalModal />)}><Icon name="plus" /> New sectional mock</button>} /></div>
      )}
    </>
  );
}

function FullList() {
  const S = useStore();
  useEffect(() => { A.loadMocks(); }, [S.exam]);
  const list = S.full[S.exam];
  return (
    <>
      <PageHead eyebrow={`${S.exam} · assessments`} eyebrowColor={EXC[S.exam]} title="Full-length mocks"
        desc="Complete exams across all sections. Set duration, instructions, scoring and publishing."
        actions={<button className="btn primary" onClick={() => openModal(<FullModal />)}><Icon name="plus" /> New full mock</button>} />
      {list.length ? (
        <div className="grid cols-2">{list.map((m) => {
          const tq = m.sections.reduce((a, s) => a + s.questions.length, 0);
          return (
            <div className="card panel" key={m.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</div>
                <Pill kind={m.status === 'published' ? 'ok' : 'draft'} dot={m.status === 'published'}>{m.status}</Pill>
              </div>
              <div className="cellsub mb16"><Icon name="clock" /> {m.duration} min · {m.sections.length} sections · {tq} questions · +{m.scoringMarks}/−{m.scoringNeg}</div>
              <div className="wrapgap" style={{ marginBottom: 16 }}>{m.sections.map((s) => <SecTag key={s.id} name={s.name}>{s.name} · {s.questions.length}</SecTag>)}</div>
              <div className="rowgap">
                <button className="btn primary sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => A.editFull(m.id)}><Icon name="edit" /> Manage</button>
                <button className="btn ghost sm" onClick={() => A.openResults(m.id, 'full')}><Icon name="bar" /> Results</button>
                <button className="btn danger sm" onClick={() => openModal(<ConfirmDelete what={m.name} onYes={() => A.delFull(m.id)} />)}><Icon name="trash" /></button>
              </div>
            </div>
          );
        })}</div>
      ) : (
        <div className="card"><Empty icon="file" title={`No full mocks for ${S.exam}`} text="Build a complete exam organised by sections, with duration and scoring rules." action={<button className="btn primary" onClick={() => openModal(<FullModal />)}><Icon name="plus" /> New full mock</button>} /></div>
      )}
    </>
  );
}

/* ------------------------------- diagnostic test ------------------------------- */

export function Diagnostic() {
  const S = useStore();
  if (S.mock && S.mockType === 'diagnostic') return <MockEditor type="diagnostic" />;
  return <DiagnosticList />;
}

function DiagnosticList() {
  const S = useStore();
  useEffect(() => { A.loadMocks(); }, [S.exam]);
  const list = S.diagnostic[S.exam];
  const published = list.filter((m) => m.status === 'published');
  return (
    <>
      <PageHead eyebrow={`${S.exam} · assessments`} eyebrowColor={EXC[S.exam]} title="Diagnostic test"
        desc="A full-format paper each student takes ONCE. On submit it sets the student's ability for every section, which seeds their plan. Build it like a full mock, then publish — the most recent published diagnostic is the live one."
        actions={<button className="btn primary" onClick={() => openModal(<FullModal kind="diagnostic" />)}><Icon name="plus" /> New diagnostic test</button>} />
      {published.length > 1 && (
        <div className="cellsub" style={{ background: '#fff7e6', border: '1px solid #f0d8a0', borderRadius: 8, padding: '9px 13px', marginBottom: 14 }}>
          More than one diagnostic is published for {S.exam} — students get the most recent one. Unpublish the others to avoid confusion.
        </div>
      )}
      {list.length ? (
        <div className="grid cols-2">{list.map((m) => {
          const tq = m.sections.reduce((a, s) => a + s.questions.length, 0);
          return (
            <div className="card panel" key={m.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</div>
                <Pill kind={m.status === 'published' ? 'ok' : 'draft'} dot={m.status === 'published'}>{m.status}</Pill>
              </div>
              <div className="cellsub mb16"><Icon name="clock" /> {m.duration} min · {m.sections.length} sections · {tq} questions · one attempt per student</div>
              <div className="wrapgap" style={{ marginBottom: 16 }}>{m.sections.map((s) => <SecTag key={s.id} name={s.name}>{s.name} · {s.questions.length}</SecTag>)}</div>
              <div className="rowgap">
                <button className="btn primary sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => A.editDiagnostic(m.id)}><Icon name="edit" /> Manage</button>
                <button className="btn danger sm" onClick={() => openModal(<ConfirmDelete what={m.name} onYes={() => A.delDiagnostic(m.id)} />)}><Icon name="trash" /></button>
              </div>
            </div>
          );
        })}</div>
      ) : (
        <div className="card"><Empty icon="award" title={`No diagnostic test for ${S.exam}`} text="Create the one-time placement test students take before their plan begins. Same format as a full mock — all sections, with questions you author or bulk-upload from Excel." action={<button className="btn primary" onClick={() => openModal(<FullModal kind="diagnostic" />)}><Icon name="plus" /> New diagnostic test</button>} /></div>
      )}
    </>
  );
}

/* ------------------------------- shared editor ------------------------------- */
function GmatBanner() {
  const S = useStore();
  if (S.exam !== 'GMAT') return null;
  return <Banner><b>GMAT is adaptive.</b> Upload questions in any order — the engine serves the next item dynamically by difficulty (IRT b). Manual ordering is disabled for GMAT.</Banner>;
}

function SectionBlock({ sec, si, kind }) {
  const S = useStore();
  const adaptive = S.exam === 'GMAT';
  return (
    <div className="section-block">
      <div className="sb-h">
        <SecTag name={sec.name} />
        {kind === 'sectional'
          ? <span className="sec-cfg"><span><b>{sec.questions.length}</b>/{sec.numQuestions || '—'} questions</span><span><b>{sec.time}</b> min</span></span>
          : <span className="sb-t">{sec.questions.length} questions</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
          {kind === 'sectional' && <button className="btn ghost sm" onClick={() => openModal(<SectionConfigModal section={sec} />)}><Icon name="settings" /> Configure</button>}
          <button className="btn primary sm" onClick={() => startImport({ kind, si })}><Icon name="upload" /> Bulk upload</button>
          <button className="btn ghost sm" onClick={() => openModal(<QuestionModal target={{ kind, si }} />)}><Icon name="plus" /> Add</button>
          <button className="btn danger sm" onClick={() => (kind === 'sectional' ? A.delSection(si) : A.delFullSection(si))}><Icon name="trash" /></button>
        </div>
      </div>
      <div className="sb-b">
        {sec.questions.length ? sec.questions.map((q, i) => (
          <QuestionRow key={q.id} q={q} i={i} total={sec.questions.length} adaptive={adaptive}
            onMove={(dir) => A.moveQuestion(q.id, dir)} onPreview={() => openModal(<PreviewQuestion q={q} />)}
            onEdit={() => openModal(<QuestionModal question={q} />)} onDelete={() => A.delQuestion(q.id)} />
        )) : <div className="cellsub" style={{ textAlign: 'center', padding: 18 }}>No questions yet — add manually or bulk upload from Excel.</div>}
      </div>
    </div>
  );
}

function MockEditor({ type }) {
  const S = useStore();
  const m = getMock(type);
  if (!m) { A.nav(type); return null; }
  const tq = m.sections.reduce((a, s) => a + s.questions.length, 0);
  const sectional = type === 'sectional';
  const kindLabel = type === 'diagnostic' ? 'Diagnostic test' : sectional ? 'Sectional mocks' : 'Full mocks';
  const eyebrowLabel = type === 'diagnostic' ? 'Diagnostic test' : sectional ? 'Sectional mock' : 'Full mock';
  return (
    <>
      <div className="lpath"><a onClick={() => A.nav(type)}>{S.exam} · {kindLabel}</a><Icon name="chevR" /><span className="cur">{m.name}</span></div>
      <PageHead eyebrow={eyebrowLabel} title={m.name}
        actions={<>
          <button className="btn ghost" onClick={() => A.openResults(m.id, type)}><Icon name="bar" /> Attempts &amp; analytics</button>
          <button className="btn ghost" onClick={() => openModal(sectional ? <SectionalModal mock={m} /> : <FullModal mock={m} />)}><Icon name="settings" /> {sectional ? 'Configure' : 'Exam settings'}</button>
          <button className={'btn ' + (m.status === 'published' ? 'ghost' : 'primary')} onClick={() => A.togglePublish(type)}>{m.status === 'published' ? 'Unpublish' : <><Icon name="check" /> Publish</>}</button>
        </>} />
      <GmatBanner />
      <div className="config-card">
        {sectional
          ? <KV rows={[['Sections', m.sections.length], ['Questions', tq], ['Negative', '−' + m.negative], ['Status', m.status]]} />
          : <>
            <KV rows={[['Duration', m.duration + ' min'], ['Sections', m.sections.length], ['Questions', tq], ['Scoring', '+' + m.scoringMarks + ' / −' + m.scoringNeg], ['Status', m.status]]} />
            <div className="cellsub" style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 12 }}><b style={{ color: 'var(--text-2)' }}>Instructions:</b> {m.instructions || '—'}</div>
          </>}
      </div>
      <div className="toolbar"><button className="btn ghost sm" onClick={() => openModal(sectional ? <SectionConfigModal /> : <FullSectionModal />)}><Icon name="plus" /> Add section</button><div className="grow" /></div>
      {m.sections.map((sec, si) => <SectionBlock key={sec.id} sec={sec} si={si} kind={type} />)}
    </>
  );
}

/* ------------------------------- attempt analytics ------------------------------- */
function MockResults({ type }) {
  const S = useStore();
  const m = getMock(type);
  const at = m.attempts || [];
  const avg = (k) => (at.length ? Math.round(at.reduce((a, x) => a + x[k], 0) / at.length) : 0);
  const completed = at.filter((x) => x.status === 'completed').length;
  return (
    <>
      <div className="lpath"><a onClick={() => A.nav(type)}>{S.exam} · {type === 'sectional' ? 'Sectional' : 'Full'} mocks</a><Icon name="chevR" /><a onClick={() => A.backResults()}>{m.name}</a><Icon name="chevR" /><span className="cur">Attempts &amp; analytics</span></div>
      <PageHead eyebrow={`${type === 'sectional' ? 'Sectional' : 'Full'} mock analytics`} title={`${m.name} · attempts`} desc="Which students attempted, their scores, section-wise performance, accuracy and time taken." />
      <div className="grid cols-4 mb16">
        <Stat value={at.length} label="Attempts" />
        <Stat value={{ text: avg('score'), color: 'var(--cat)' }} label="Avg. score" />
        <Stat value={{ text: avg('accuracy') + '%', color: 'var(--brand)' }} label="Avg. accuracy" />
        <Stat value={{ text: at.length ? Math.round((completed / at.length) * 100) + '%' : '0%', color: 'var(--ok)' }} label="Completion" />
      </div>
      {at.length ? (
        <div className="tbl-wrap"><table>
          <thead><tr><th>Student</th><th>Attempted on</th><th>Score</th><th>Accuracy</th><th>Time taken</th><th>Status</th><th style={{ textAlign: 'right' }}>Report</th></tr></thead>
          <tbody>{at.map((x) => (
            <tr key={x.id}>
              <td><div className="who"><Avatar name={initials(x.student)} color={avatarColor(x.student)} /><div className="cellname">{x.student}</div></div></td>
              <td className="cellsub">{x.date}</td><td className="cellname">{x.score}</td><td>{x.accuracy}%</td><td className="cellsub">{x.time} min</td>
              <td><Pill kind={x.status === 'completed' ? 'ok' : 'warn'}>{x.status}</Pill></td>
              <td><div className="rowacts"><button className="btn ghost sm" onClick={() => openModal(<AttemptReport mock={m} aid={x.id} />)}><Icon name="eye" /> Report</button></div></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : (
        <div className="card"><Empty icon="bar" title="No attempts yet" text="Once students take this mock, who attempted it and their scores appear here." /></div>
      )}
    </>
  );
}
