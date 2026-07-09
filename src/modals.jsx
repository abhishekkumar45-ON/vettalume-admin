import React, { useState } from 'react';
import { Modal, Field, Row, Avatar, ExamTag, SecTag, Pill, RegPill, PayPill, VerPill, Progress } from './ui.jsx';
import Icon from './icons.jsx';
import { A, openModal, closeModal, getState } from './store.jsx';
import { EXC, SECS, SECCOL, initials, avatarColor, money, diffLabel, accessLevel } from './helpers.js';

/* small helper for exam/course checkbox rows */
function CourseChecks({ value, onToggle, idp = 'c' }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {['CAT', 'GMAT', 'GRE'].map((e) => (
        <label key={e} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--line)', borderRadius: 8, padding: '9px 11px', cursor: 'pointer', fontWeight: 600 }}>
          <input type="checkbox" checked={value.includes(e)} onChange={() => onToggle(e)} />
          <ExamTag exam={e} />
        </label>
      ))}
    </div>
  );
}
const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

/* ============================ Students ============================ */
export function StudentModal({ student }) {
  const edit = !!student;
  const p = student ? student.payment : { status: null, amount: 0 };
  const [f, setF] = useState({
    name: student?.name || '', email: student?.email || '', phone: student?.phone || '',
    status: student?.status || 'active', reg: student?.regType || 'registered',
    course: student?.purchasedCourse || '', pay: p.status || '', amount: p.amount || 0, prog: student?.progress ?? 0,
    exams: student?.exams || [], verified: student?.verified || false,
  });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    if (!f.name) return; // validation toast handled below
    const exams = f.exams;
    const payment = { status: f.pay || null, amount: +f.amount || 0, method: (student && student.payment && student.payment.method) || 'UPI', date: (student && student.payment && student.payment.date) || new Date().toISOString().slice(0, 10) };
    A.saveStudent(student, { name: f.name, email: f.email, phone: f.phone, status: f.status, regType: f.reg, purchasedCourse: f.course || null, progress: +f.prog || 0, verified: f.verified, payment, exams });
    closeModal();
  };
  return (
    <Modal title={edit ? 'Edit student' : 'Add student'} lg saveLabel={edit ? 'Save changes' : 'Add student'} onSave={save}>
      <Row><Field label="Full name" value={f.name} onChange={up('name')} placeholder="e.g. Rohan Mehta" /><Field label="Email" value={f.email} onChange={up('email')} placeholder="name@email.com" /></Row>
      <Row><Field label="Contact number" value={f.phone} onChange={up('phone')} placeholder="+91 …" /><Field label="Enrollment status" value={f.status} onChange={up('status')} options={[{ v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }]} /></Row>
      <Row>
        <Field label="Registration type" value={f.reg} onChange={up('reg')} options={[{ v: 'registered', l: 'Registered only' }, { v: 'trial', l: 'Free trial' }, { v: 'paid', l: 'Paid / purchased' }]} />
        <Field label="Course purchased" value={f.course} onChange={up('course')} options={[{ v: '', l: '— none' }, { v: 'CAT', l: 'CAT' }, { v: 'GMAT', l: 'GMAT' }, { v: 'GRE', l: 'GRE' }]} />
      </Row>
      <Row cols={3}>
        <Field label="Payment status" value={f.pay} onChange={up('pay')} options={[{ v: '', l: '— none' }, { v: 'pending', l: 'Pending' }, { v: 'successful', l: 'Successful' }, { v: 'failed', l: 'Failed' }, { v: 'refunded', l: 'Refunded' }]} />
        <Field label="Amount (₹)" type="number" value={f.amount} onChange={up('amount')} />
        <Field label="Progress (%)" type="number" value={f.prog} onChange={up('prog')} />
      </Row>
      <div className="field"><label>Enroll in courses</label><CourseChecks value={f.exams} onToggle={(e) => setF((s) => ({ ...s, exams: toggleIn(s.exams, e) }))} /></div>
      <label className={'switch' + (f.verified ? ' on' : '')} onClick={() => setF((s) => ({ ...s, verified: !s.verified }))}>
        <span className="sw-track" /><div><div className="sw-l">Account verified</div><div className="sw-s">Manually mark this account as verified</div></div>
      </label>
    </Modal>
  );
}

export function StudentDetail({ student: s }) {
  const acc = accessLevel(s);
  const DI = ({ k, children, full }) => <div className={'di' + (full ? ' full' : '')}><div className="dk">{k}</div><div className="dv">{children}</div></div>;
  return (
    <Modal title="Student details" onSave={false} lg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Avatar name={initials(s.name)} color={avatarColor(s.name)} size={46} />
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>{s.name}</div><div className="cellsub">{s.email} · {s.phone}</div></div>
        <div style={{ marginLeft: 'auto' }}><VerPill v={s.verified} /></div>
      </div>
      <div className="dl">
        <DI k="Registered exams">{s.exams.length ? s.exams.map((e) => <ExamTag key={e} exam={e} />) : '—'}</DI>
        <DI k="Enrollment status"><Pill kind={s.status === 'active' ? 'ok' : 'mut'} dot>{s.status}</Pill></DI>
        <DI k="Registration type"><RegPill t={s.regType} /></DI>
        <DI k="Course purchased">{s.purchasedCourse ? <ExamTag exam={s.purchasedCourse} /> : '—'}</DI>
        <DI k="Payment status"><PayPill s={s.payment.status} /></DI>
        <DI k="Amount">{s.payment.status ? money(s.payment.amount) + (s.payment.method ? ` · ${s.payment.method}` : '') : '—'}</DI>
        <DI k="Account"><VerPill v={s.verified} /></DI>
        <DI k="Access level"><Pill kind={acc.c}>{acc.l}</Pill></DI>
        <DI k="Last login">{s.lastLogin}</DI>
        <DI k="Joined">{s.joined}</DI>
        <DI k="Course progress" full><Progress value={s.progress} width={160} /></DI>
      </div>
      <div className="wrapgap mt14">
        <button className={'btn ' + (s.verified ? 'ghost' : 'primary') + ' sm'} onClick={() => { A.verifyStudent(s.id); closeModal(); }}><Icon name="check" /> {s.verified ? 'Unverify' : 'Verify account'}</button>
        <button className="btn ghost sm" onClick={() => openModal(<EnrollModal student={s} />)}><Icon name="layers" /> Enrollments</button>
        <button className="btn ghost sm" onClick={() => openModal(<StudentModal student={s} />)}><Icon name="edit" /> Edit</button>
        {s.regType === 'paid' && <button className="btn ghost sm" onClick={() => { closeModal(); A.nav('payments'); }}><Icon name="award" /> Payments</button>}
      </div>
    </Modal>
  );
}

export function EnrollModal({ student: s }) {
  const [exams, setExams] = useState(s.exams);
  return (
    <Modal title="Manage enrollments" sub={s.name} saveLabel="Update enrollments" onSave={() => { A.setEnrollments(s, exams); closeModal(); }}>
      <p className="cellsub" style={{ marginBottom: 14 }}>Register or deregister {s.name} from any course.</p>
      {['CAT', 'GMAT', 'GRE'].map((e) => (
        <label key={e} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--line)', borderRadius: 9, padding: '13px 15px', marginBottom: 9, cursor: 'pointer' }}>
          <input type="checkbox" checked={exams.includes(e)} onChange={() => setExams((x) => toggleIn(x, e))} />
          <ExamTag exam={e} />
          <span style={{ fontWeight: 600 }}>{e === 'CAT' ? 'CAT — IIM admissions' : e === 'GMAT' ? 'GMAT — MBA' : 'GRE — Grad school'}</span>
        </label>
      ))}
    </Modal>
  );
}

/* ============================ Chapters / subtopics / media ============================ */
export function ChapterModal({ chapter }) {
  const [name, setName] = useState(chapter?.name || '');
  const S = getState();
  const sections = (S.lmsSections && S.lmsSections[S.exam]) || [];
  const [sectionKey, setSectionKey] = useState(chapter?.section || sections[0]?.key || '');
  const save = () => {
    if (!name) return;
    chapter ? A.renameChapter(chapter, name) : A.addChapter(name, sectionKey);
    closeModal();
  };
  return (
    <Modal title={chapter ? 'Rename chapter' : 'Add chapter'} sub={S.exam} saveLabel={chapter ? 'Save' : 'Add chapter'} onSave={save}>
      <Field label="Chapter name" value={name} onChange={setName} placeholder="e.g. Arithmetic" />
      {!chapter && sections.length > 0 ? (
        <Field
          label="Section"
          options={sections.map((s) => ({ v: s.key, l: s.name || s.key }))}
          value={sectionKey}
          onChange={setSectionKey}
        />
      ) : null}
    </Modal>
  );
}
export function SubtopicModal({ subtopic, chapterName }) {
  const [name, setName] = useState(subtopic?.name || '');
  const save = () => { if (!name) return; subtopic ? A.renameSubtopic(subtopic, name) : A.addSubtopic(name); closeModal(); };
  return (
    <Modal title={subtopic ? 'Rename subtopic' : 'Add subtopic'} sub={chapterName} saveLabel={subtopic ? 'Save' : 'Add subtopic'} onSave={save}>
      <Field label="Subtopic name" value={name} onChange={setName} placeholder="e.g. Averages" />
    </Modal>
  );
}
export function VideoModal({ video }) {
  const [f, setF] = useState({ title: video?.title || '', src: video?.src || '', dur: video?.dur || '' });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.title) return; A.saveVideo(video, f); closeModal(); };
  return (
    <Modal title={video ? 'Edit video' : 'Add video'} saveLabel={video ? 'Save' : 'Add video'} onSave={save}>
      <Field label="Title" value={f.title} onChange={up('title')} placeholder="Lesson title" />
      <Field label="Video link" value={f.src} onChange={up('src')} placeholder="https://youtu.be/…" hint="Paste a YouTube/Vimeo link, or a hosted video URL." />
      <Field label="Duration" optional value={f.dur} onChange={up('dur')} placeholder="08:24" />
    </Modal>
  );
}
export function PdfModal() {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const save = () => { if (!file) return; A.addPdf(file, title || file.name); closeModal(); };
  return (
    <Modal title="Upload material" saveLabel="Add material" onSave={save}>
      <div className="field">
        <label>File</label>
        <input type="file" onChange={(e) => setFile((e.target.files && e.target.files[0]) || null)} style={{ display: 'block', width: '100%' }} />
        <div className="hint">{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : 'Pick a file to upload (PDF, image, etc. — up to 25 MB).'}</div>
      </div>
      <Field label="Title" optional value={title} onChange={setTitle} placeholder="Defaults to the file name" />
    </Modal>
  );
}

/* ============================ Questions ============================ */
export function QuestionModal({ question, target }) {
  const o = question?.options || ['', '', '', ''];
  const [f, setF] = useState({
    text: question?.text || '', image: question?.image || '',
    o0: o[0] || '', o1: o[1] || '', o2: o[2] || '', o3: o[3] || '',
    correct: String(question?.correct ?? 0), difficulty: String(question?.difficulty ?? 0),
    time: question?.time || 60, solution: question?.solution || '',
  });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    if (!f.text) return;
    const data = { text: f.text, image: f.image, options: [f.o0, f.o1, f.o2, f.o3], correct: +f.correct, difficulty: +f.difficulty, time: +f.time || 60, solution: f.solution };
    question ? A.editQuestion(question, data) : A.addQuestion(target, data);
    closeModal();
  };
  return (
    <Modal title={question ? 'Edit question' : 'Add question'} sub="images in question & options supported" lg saveLabel={question ? 'Save question' : 'Add question'} onSave={save}>
      <Field label="Question text" as="textarea" value={f.text} onChange={up('text')} placeholder="Type the question…" />
      <Field label="Image URL" optional value={f.image} onChange={up('image')} placeholder="https://…  (shown above the question)" hint="Paste an image link to embed a figure in the question." />
      <Row>
        <Field label="Option A" value={f.o0} onChange={up('o0')} placeholder="Option A" />
        <Field label="Option B" value={f.o1} onChange={up('o1')} placeholder="Option B" />
      </Row>
      <Row>
        <Field label="Option C" value={f.o2} onChange={up('o2')} placeholder="Option C" />
        <Field label="Option D" value={f.o3} onChange={up('o3')} placeholder="Option D" />
      </Row>
      <Row cols={3}>
        <Field label="Correct answer" value={f.correct} onChange={up('correct')} options={[{ v: 0, l: 'A' }, { v: 1, l: 'B' }, { v: 2, l: 'C' }, { v: 3, l: 'D' }]} />
        <Field label="Difficulty" value={f.difficulty} onChange={up('difficulty')} options={[{ v: -2, l: '−2 · L1' }, { v: -1, l: '−1 · L2' }, { v: 0, l: '0 · L3' }, { v: 1, l: '+1 · L4' }, { v: 2, l: '+2 · L5' }]} />
        <Field label="Time (sec)" type="number" value={f.time} onChange={up('time')} />
      </Row>
      <Field label="Solution" optional as="textarea" value={f.solution} onChange={up('solution')} placeholder="Worked solution…" />
    </Modal>
  );
}
export function PreviewQuestion({ q }) {
  if (!q) return null;
  return (
    <Modal title="Question preview" onSave={false}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 10, padding: 20 }}>
        <div style={{ fontFamily: 'var(--m)', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-4)', marginBottom: 10 }}>Student preview · {diffLabel(q.difficulty)}</div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: q.image ? 12 : 16 }}>{q.text}</div>
        {q.image && <img src={q.image} style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--line)', marginBottom: 16 }} onError={(e) => (e.target.style.display = 'none')} />}
        {(q.options || []).map((opt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, border: `1px solid ${i === q.correct ? 'var(--ok)' : 'var(--line)'}`, background: i === q.correct ? 'rgba(92,143,114,.08)' : 'transparent', borderRadius: 9, padding: '12px 15px', marginBottom: 9 }}>
            <span style={{ fontFamily: 'var(--m)', fontWeight: 600, color: i === q.correct ? 'var(--ok)' : 'var(--text-3)' }}>{String.fromCharCode(65 + i)}</span>
            <span>{opt}</span>
            {i === q.correct && <span style={{ marginLeft: 'auto', color: 'var(--ok)' }}><Icon name="check" /></span>}
          </div>
        ))}
        {q.solution && <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 14 }}><div className="cellsub" style={{ textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 5 }}>Solution</div><div style={{ fontSize: 13.5, color: 'var(--text-2)' }}>{q.solution}</div></div>}
      </div>
    </Modal>
  );
}
export function ImportPreview({ questions, target }) {
  return (
    <Modal title="Preview import" sub="images & options supported" lg saveLabel={`Import ${questions.length} question${questions.length !== 1 ? 's' : ''}`} onSave={() => { A.commitImport(target, questions); closeModal(); }}>
      <div className="cellsub" style={{ marginBottom: 14 }}>{questions.length} question{questions.length !== 1 ? 's' : ''} parsed. Review, then import.</div>
      <div style={{ maxHeight: '46vh', overflow: 'auto', border: '1px solid var(--line)', borderRadius: 9 }}>
        {questions.map((q, i) => (
          <div className="qrow" style={{ margin: 0, border: 'none', borderBottom: '1px solid var(--line-soft)', borderRadius: 0 }} key={q.id}>
            <div className="qn">{i + 1}</div>
            <div className="qmain">
              <div className="qtext" style={{ fontSize: 13 }}>{q.text}</div>
              {q.image && <img className="qimg" src={q.image} onError={(e) => (e.target.style.display = 'none')} />}
              <div className="qopts">{q.options.map((o, oi) => <span className={`qopt ${oi === q.correct ? 'cor' : ''}`} key={oi}>{String.fromCharCode(65 + oi)}. {o}</span>)}</div>
              <div className="qmeta"><span className={`diffpill d${q.difficulty}`}>{diffLabel(q.difficulty)}</span></div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ============================ Mocks ============================ */
export function SectionalModal({ mock }) {
  const S = getState();
  const [f, setF] = useState({ name: mock?.name || '', neg: mock?.negative ?? 1, status: mock?.status || 'draft' });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.name) return; const data = { name: f.name, negative: +f.neg, status: f.status }; mock ? A.saveSectionalConfig(mock, data) : A.newSectional(data); closeModal(); };
  return (
    <Modal title={mock ? 'Configure sectional mock' : 'New sectional mock'} sub={S.exam} saveLabel={mock ? 'Save configuration' : 'Create mock'} onSave={save}>
      <Field label="Mock name" value={f.name} onChange={up('name')} placeholder="e.g. QA Sectional Mock 2" />
      <Row>
        <Field label="Negative marking" type="number" value={f.neg} onChange={up('neg')} hint="per wrong answer" />
        <Field label="Publishing status" value={f.status} onChange={up('status')} options={[{ v: 'draft', l: 'Draft' }, { v: 'published', l: 'Published' }]} />
      </Row>
      <div className="hint">After creating the mock, add sections inside it — each with its own questions and time.</div>
    </Modal>
  );
}
export function SectionConfigModal({ section }) {
  const S = getState();
  const m = S.sectional[S.exam].find((x) => x.id === S.mock);
  const used = m.sections.map((x) => x.name);
  const avail = SECS[S.exam].filter((n) => !used.includes(n) || (section && section.name === n));
  const opts = avail.length ? avail : SECS[S.exam];
  const [f, setF] = useState({ name: section?.name || opts[0], num: section?.numQuestions ?? 10, time: section?.time ?? 40 });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { const data = { name: f.name, numQuestions: +f.num || 0, time: +f.time || 0 }; section ? A.saveSection(section, data) : A.addSection(data); closeModal(); };
  return (
    <Modal title={section ? 'Edit section' : 'Add section'} sub={m.name} saveLabel={section ? 'Save section' : 'Add section'} onSave={save}>
      <Field label="Section" value={f.name} onChange={up('name')} options={opts} />
      <Row>
        <Field label="No. of questions" type="number" value={f.num} onChange={up('num')} />
        <Field label="Time (min)" type="number" value={f.time} onChange={up('time')} />
      </Row>
    </Modal>
  );
}
export function FullModal({ mock, kind = 'full' }) {
  const S = getState();
  const diag = kind === 'diagnostic';
  const [f, setF] = useState({ name: mock?.name || '', dur: mock?.duration ?? 120, status: mock?.status || 'draft', marks: mock?.scoringMarks ?? 3, neg: mock?.scoringNeg ?? 1, instr: mock?.instructions || '' });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => { if (!f.name) return; const data = { name: f.name, duration: +f.dur, status: f.status, scoringMarks: +f.marks, scoringNeg: +f.neg, instructions: f.instr }; mock ? A.saveFullConfig(mock, data) : (diag ? A.newDiagnostic(data) : A.newFull(data)); closeModal(); };
  return (
    <Modal title={mock ? 'Exam settings' : (diag ? 'New diagnostic test' : 'New full mock')} sub={S.exam} saveLabel={mock ? 'Save settings' : (diag ? 'Create diagnostic' : 'Create mock')} onSave={save}>
      <Field label={diag ? 'Diagnostic name' : 'Mock name'} value={f.name} onChange={up('name')} placeholder={diag ? 'e.g. CAT Diagnostic' : 'e.g. Full Mock 2'} />
      <Row>
        <Field label="Duration (min)" type="number" value={f.dur} onChange={up('dur')} />
        <Field label="Publishing status" value={f.status} onChange={up('status')} options={[{ v: 'draft', l: 'Draft' }, { v: 'published', l: 'Published' }]} />
      </Row>
      <Row>
        <Field label="Marks / question" type="number" value={f.marks} onChange={up('marks')} />
        <Field label="Negative marking" type="number" value={f.neg} onChange={up('neg')} />
      </Row>
      <Field label="Instructions" as="textarea" value={f.instr} onChange={up('instr')} placeholder="Shown to students before they begin…" />
    </Modal>
  );
}
export function FullSectionModal() {
  const S = getState();
  const m = S.full[S.exam].find((x) => x.id === S.mock);
  const used = m.sections.map((s) => s.name);
  const avail = SECS[S.exam].filter((s) => !used.includes(s));
  const [name, setName] = useState(avail[0] || '');
  if (!avail.length) return <Modal title="Add section" onSave={false}><p className="cellsub">All sections for {S.exam} are already in this mock.</p></Modal>;
  return (
    <Modal title="Add section" saveLabel="Add section" onSave={() => { A.addFullSection(name); closeModal(); }}>
      <Field label="Section" value={name} onChange={setName} options={avail} />
    </Modal>
  );
}
export function AttemptReport({ mock, aid }) {
  const a = (mock.attempts || []).find((x) => x.id === aid);
  if (!a) return null;
  const DI = ({ k, children }) => <div className="di"><div className="dk">{k}</div><div className="dv">{children}</div></div>;
  return (
    <Modal title="Performance report" onSave={false} lg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <Avatar name={initials(a.student)} color={avatarColor(a.student)} size={44} />
        <div><div style={{ fontSize: 17, fontWeight: 700 }}>{a.student}</div><div className="cellsub">{mock.name} · {a.date}</div></div>
        <div style={{ marginLeft: 'auto' }}><Pill kind={a.status === 'completed' ? 'ok' : 'warn'}>{a.status}</Pill></div>
      </div>
      <div className="dl" style={{ marginBottom: 16 }}>
        <DI k="Total score">{a.score}</DI><DI k="Overall accuracy">{a.accuracy}%</DI><DI k="Time taken">{a.time} min</DI><DI k="Completion">{a.status}</DI>
      </div>
      <div className="panel-h" style={{ marginBottom: 10 }}><div className="t" style={{ fontSize: 14 }}>Section-wise performance</div></div>
      <div className="tbl-wrap"><table><thead><tr><th>Section</th><th>Score</th><th>Attempted</th><th>Accuracy</th></tr></thead>
        <tbody>{a.sections.map((s, i) => (
          <tr key={i}><td><SecTag name={s.name} /></td><td className="cellname">{s.score}</td><td className="cellsub">{s.attempted}/{s.total}</td>
            <td><Progress value={s.accuracy} width={120} /></td></tr>
        ))}</tbody></table></div>
    </Modal>
  );
}

/* ============================ Coupons ============================ */
export function CouponModal({ coupon }) {
  const [f, setF] = useState({
    code: coupon?.code || '', type: coupon?.type || '', value: coupon?.value ?? '', maxTotal: coupon?.maxTotal ?? '',
    maxPerUser: coupon?.maxPerUser ?? '', minPurchase: coupon?.minPurchase ?? '', maxDiscount: coupon?.maxDiscount ?? '',
    validFrom: coupon?.validFrom || '', validUntil: coupon?.validUntil || '', description: coupon?.description || '',
    attempt: coupon?.attempt || 'all', courses: coupon?.courses || [],
  });
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    if (!f.code || !f.type) return;
    A.saveCoupon(coupon, readCoupon(f));
    closeModal();
  };
  return (
    <Modal title="Edit coupon" sub={coupon.code} lg saveLabel="Save coupon" onSave={save}>
      <CouponFields f={f} up={up} setF={setF} />
    </Modal>
  );
}
export function readCoupon(f) {
  return {
    code: f.code.toUpperCase(), type: f.type, value: +f.value || 0, maxTotal: +f.maxTotal || 0, maxPerUser: +f.maxPerUser || 0,
    minPurchase: +f.minPurchase || 0, maxDiscount: +f.maxDiscount || 0, validFrom: f.validFrom, validUntil: f.validUntil,
    description: f.description, attempt: f.attempt || 'all', courses: f.courses,
  };
}
export function CouponFields({ f, up, setF }) {
  return (
    <>
      <Row>
        <Field label="Coupon code" value={f.code} onChange={up('code')} placeholder="e.g. SAVE20" />
        <Field label="Discount type" value={f.type} onChange={up('type')} options={[{ v: '', l: 'Select type' }, { v: 'percentage', l: 'Percentage' }, { v: 'fixed', l: 'Fixed amount' }]} />
      </Row>
      <Row>
        <Field label="Discount value" type="number" value={f.value} onChange={up('value')} placeholder="e.g. 20 (% or smallest unit)" />
        <Field label="Max total uses" type="number" value={f.maxTotal} onChange={up('maxTotal')} placeholder="e.g. 100" />
      </Row>
      <Row>
        <Field label="Max uses per user" type="number" value={f.maxPerUser} onChange={up('maxPerUser')} placeholder="e.g. 1" />
        <Field label="Min purchase (smallest unit)" type="number" value={f.minPurchase} onChange={up('minPurchase')} placeholder="e.g. 50000" />
      </Row>
      <Row>
        <Field label="Max discount (smallest unit)" type="number" value={f.maxDiscount} onChange={up('maxDiscount')} placeholder="e.g. 20000" />
        <Field label="Exam attempt" value={f.attempt} onChange={up('attempt')} options={[{ v: 'all', l: 'All attempts (no restriction)' }, { v: 'first', l: '1st attempt' }, { v: 'second', l: '2nd attempt' }, { v: 'third', l: '3rd+ attempt' }]} />
      </Row>
      <Row>
        <Field label="Valid from" type="datetime-local" value={f.validFrom} onChange={up('validFrom')} />
        <Field label="Valid until" type="datetime-local" value={f.validUntil} onChange={up('validUntil')} />
      </Row>
      <Field label="Description" optional value={f.description} onChange={up('description')} placeholder="Optional description" />
      <div className="field"><label>Applicable course types <span className="opt">leave empty for no restriction</span></label>
        <CourseChecks value={f.courses} onToggle={(e) => setF((s) => ({ ...s, courses: toggleIn(s.courses, e) }))} />
      </div>
    </>
  );
}
