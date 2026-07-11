import { useSyncExternalStore } from 'react';
import { uid, SECS } from './helpers.js';
import * as api from './api.js';

/* ============================ seed builders ============================ */
function seedQuiz(n) {
  const samples = [
    ['A class has 3 students averaging 80 and 2 averaging 90. Find the overall average.', ['84', '85', '86', '88'], 0, 0, '(3×80+2×90)/5 = 420/5 = 84.'],
    ['Find the average of 7, 3, 5 and 9.', ['5', '6', '7', '8'], 1, -1, 'Sum 24 ÷ 4 = 6.'],
    ['A car goes 60 km/h and returns the same distance at 40 km/h. Average speed?', ['48', '50', '52', '45'], 0, 1, '2·60·40/100 = 48 km/h.'],
  ];
  return samples.slice(0, n).map((s) => ({ id: uid(), text: s[0], options: s[1], correct: s[2], difficulty: s[3], solution: s[4], image: '' }));
}

const lmsSeed = () => ({
  CAT: [
    { id: uid(), name: 'Arithmetic', subs: [
      { id: uid(), name: 'Averages', concept: '<h2>Averages</h2><p>The <b>average</b> of a set of values is their sum divided by how many there are. For groups of different sizes, use the <b>weighted</b> average.</p><ul><li>Simple mean = total ÷ count</li><li>Weighted mean accounts for group size</li></ul>', videos: [{ id: uid(), title: 'Averages — core idea', src: 'https://youtu.be/averages', dur: '08:24' }], pdfs: [{ id: uid(), title: 'Averages — formula sheet.pdf', size: '420 KB' }], quiz: seedQuiz(3) },
      { id: uid(), name: 'Percentages', concept: '<h2>Percentages</h2><p>Percentage change, successive change and applications.</p>', videos: [], pdfs: [], quiz: seedQuiz(2) },
      { id: uid(), name: 'Ratio & Proportion', concept: '', videos: [], pdfs: [], quiz: [] },
    ] },
    { id: uid(), name: 'Algebra', subs: [
      { id: uid(), name: 'Linear Equations', concept: '', videos: [], pdfs: [], quiz: seedQuiz(1) },
      { id: uid(), name: 'Quadratic Equations', concept: '', videos: [], pdfs: [], quiz: [] },
    ] },
    { id: uid(), name: 'Geometry', subs: [{ id: uid(), name: 'Triangles', concept: '', videos: [], pdfs: [], quiz: [] }] },
  ],
  GMAT: [
    { id: uid(), name: 'Problem Solving', subs: [{ id: uid(), name: 'Percentages', concept: '', videos: [], pdfs: [], quiz: seedQuiz(2) }] },
    { id: uid(), name: 'Critical Reasoning', subs: [{ id: uid(), name: 'Weaken', concept: '', videos: [], pdfs: [], quiz: [] }] },
  ],
  GRE: [
    { id: uid(), name: 'Text Completion', subs: [{ id: uid(), name: 'One-blank', concept: '', videos: [], pdfs: [], quiz: [] }] },
    { id: uid(), name: 'Quantitative Comparison', subs: [{ id: uid(), name: 'Powers', concept: '', videos: [], pdfs: [], quiz: [] }] },
  ],
});

function studentSeed() {
  const base = [
    ['Rohan Mehta', ['CAT'], 'paid', 'CAT', 'successful', 62],
    ['Priya Nair', ['CAT', 'GMAT'], 'paid', 'CAT', 'successful', 78],
    ['Arjun Singh', ['GMAT'], 'trial', null, null, 18],
    ['Sara Khan', ['GRE'], 'registered', null, null, 4],
    ['Vikram Rao', ['CAT', 'GRE'], 'paid', 'GRE', 'pending', 31],
    ['Neha Gupta', ['GMAT', 'GRE'], 'paid', 'GMAT', 'successful', 55],
    ['Karan Patel', ['CAT'], 'trial', null, null, 12],
    ['Ananya Iyer', ['GRE'], 'paid', 'GRE', 'failed', 9],
    ['Dev Sharma', ['CAT', 'GMAT', 'GRE'], 'paid', 'CAT', 'refunded', 40],
    ['Isha Bose', ['GMAT'], 'registered', null, null, 0],
    ['Manav Joshi', ['CAT'], 'paid', 'CAT', 'successful', 71],
    ['Tara Menon', ['GRE'], 'trial', null, null, 22],
  ];
  const price = { CAT: 4900, GMAT: 6900, GRE: 6900 };
  const methods = ['UPI', 'Card', 'Netbanking'];
  return base.map((b, i) => {
    const [name, exams, reg, course, pay, prog] = b;
    const verified = reg === 'paid' ? pay === 'successful' : reg === 'registered' ? false : i % 3 === 0;
    return {
      id: uid(), name, email: name.toLowerCase().replace(/ /g, '.') + '@email.com',
      phone: '+91 9' + String(8000000 + i * 111111).slice(0, 8),
      exams, status: i % 6 === 3 ? 'inactive' : 'active', regType: reg, purchasedCourse: course, verified,
      lastLogin: `2026-06-${String(26 - (i % 20)).padStart(2, '0')} ${String(9 + (i % 9)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
      progress: prog,
      payment: reg === 'paid' ? { status: pay, amount: price[course] || 4900, method: methods[i % 3], date: `2026-06-${String(20 - (i % 15)).padStart(2, '0')}` } : { status: null, amount: 0, method: null, date: null },
      role: i === 0 ? 'manager' : 'student', joined: `2026-0${(i % 6) + 1}-1${i % 9}`,
    };
  });
}

function mkAttempts(data) {
  return data.map((d) => ({
    id: uid(), student: d[0], date: d[1], status: d[2], score: d[3], accuracy: d[4], time: d[5],
    sections: d[6].map((s) => ({ name: s[0], score: s[1], accuracy: s[2], attempted: s[3], total: s[4] })),
  }));
}
const fullAttemptsSeed = () => mkAttempts([
  ['Rohan Mehta', '2026-06-22 10:05', 'completed', 98, 72, 118, [['VARC', 34, 68, 46, 72], ['DILR', 28, 64, 32, 54], ['QA', 36, 78, 40, 80]]],
  ['Priya Nair', '2026-06-23 16:40', 'completed', 112, 79, 120, [['VARC', 40, 76, 46, 80], ['DILR', 30, 70, 30, 66], ['QA', 42, 82, 44, 86]]],
  ['Manav Joshi', '2026-06-24 09:15', 'completed', 86, 66, 109, [['VARC', 28, 60, 40, 62], ['DILR', 24, 58, 28, 54], ['QA', 34, 74, 40, 76]]],
  ['Dev Sharma', '2026-06-25 19:30', 'incomplete', 54, 61, 71, [['VARC', 22, 64, 30, 52], ['DILR', 14, 52, 18, 40], ['QA', 18, 70, 20, 38]]],
]);
const sectionalAttemptsSeed = () => mkAttempts([
  ['Rohan Mehta', '2026-06-21 11:20', 'completed', 34, 76, 38, [['QA', 34, 76, 18, 80]]],
  ['Manav Joshi', '2026-06-23 15:05', 'completed', 28, 68, 40, [['QA', 28, 68, 16, 75]]],
  ['Priya Nair', '2026-06-24 18:40', 'incomplete', 16, 60, 22, [['QA', 16, 60, 9, 55]]],
]);

const couponSeed = () => [
  { id: uid(), code: 'TEST99', type: 'percentage', value: 99, maxTotal: 1, maxPerUser: 1, minPurchase: 0, maxDiscount: 0, validFrom: '2026-06-01T00:00', validUntil: '2026-10-06T23:59', description: 'Internal test coupon', attempt: 'all', courses: [], used: 1, status: 'active' },
  { id: uid(), code: 'SAVE20', type: 'percentage', value: 20, maxTotal: 100, maxPerUser: 1, minPurchase: 500000, maxDiscount: 200000, validFrom: '2026-06-01T00:00', validUntil: '2026-12-31T23:59', description: 'Launch offer — 20% off', attempt: 'all', courses: ['CAT'], used: 14, status: 'active' },
  { id: uid(), code: 'FLAT500', type: 'fixed', value: 50000, maxTotal: 200, maxPerUser: 2, minPurchase: 0, maxDiscount: 0, validFrom: '2026-06-01T00:00', validUntil: '2026-07-31T23:59', description: 'Flat ₹500 off', attempt: 'first', courses: ['GMAT', 'GRE'], used: 33, status: 'inactive' },
];

function initialState() {
  return {
    authed: api.isLoggedIn(),
    exam: 'CAT', view: 'dashboard', cid: null, sid: null, tab: 'concepts',
    mock: null, mockType: null, results: null,
    settings: { autoVerify: true },
    filters: {},
    lms: { CAT: [], GMAT: [], GRE: [] },
    lmsSections: { CAT: [], GMAT: [], GRE: [] },
    students: [],
    sectional: { CAT: [], GMAT: [], GRE: [] },
    full: { CAT: [], GMAT: [], GRE: [] },
    diagnostic: { CAT: [], GMAT: [], GRE: [] },
    coupons: [],
    modal: null,
    toasts: [],
  };
}

/* ============================ external store ============================ */
let state = initialState();
let version = 0;
const listeners = new Set();
function emit() { version += 1; listeners.forEach((l) => l()); }
function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); }
function getSnapshot() { return version; }
export function useStore() { useSyncExternalStore(subscribe, getSnapshot, getSnapshot); return state; }
export function getState() { return state; }

/* ---- toast + modal primitives ---- */
export function toast(msg, kind = 'ok') {
  const id = uid();
  state.toasts = [...state.toasts, { id, msg, kind }];
  emit();
  setTimeout(() => { state.toasts = state.toasts.filter((t) => t.id !== id); emit(); }, 2600);
}
export function openModal(node) { state.modal = node; emit(); }
export function closeModal() { state.modal = null; emit(); }

/* ---- import bridge (file input lives in App) ---- */
let importTrigger = null;
export function registerImport(fn) { importTrigger = fn; }
export function startImport(target) { if (importTrigger) importTrigger(target); }

/* ============================ selectors ============================ */
export const allSubs = (ex) => state.lms[ex].flatMap((c) => c.subs);
export const countQuestions = (ex) =>
  allSubs(ex).reduce((a, s) => a + s.quiz.length, 0) +
  state.sectional[ex].reduce((a, m) => a + m.sections.reduce((b, s) => b + s.questions.length, 0), 0) +
  state.full[ex].reduce((a, m) => a + m.sections.reduce((b, s) => b + s.questions.length, 0), 0);
export const enrollCount = (ex) => state.students.filter((s) => s.exams.includes(ex)).length;
export const totalEnroll = () => state.students.reduce((a, s) => a + s.exams.length, 0);
export const publishedMocks = () =>
  ['CAT', 'GMAT', 'GRE'].reduce((a, ex) => a + state.sectional[ex].filter((m) => m.status === 'published').length + state.full[ex].filter((m) => m.status === 'published').length, 0);

export const chapterById = (id) => state.lms[state.exam].find((c) => c.id === id);
export const subById = (ch, id) => ch.subs.find((s) => s.id === id);
export const curSub = () => { const ch = chapterById(state.cid); return ch && subById(ch, state.sid); };
export const getMock = (type) => (type === 'sectional' ? state.sectional : type === 'diagnostic' ? state.diagnostic : state.full)[state.exam].find((m) => m.id === state.mock);

function locateQ(id) {
  if (state.view === 'sectional' || state.view === 'full' || state.view === 'diagnostic') {
    const m = getMock(state.view);
    for (const sec of m.sections) { const q = sec.questions.find((x) => x.id === id); if (q) return { list: sec.questions, q }; }
  }
  const s = curSub();
  return { list: s.quiz, q: s.quiz.find((x) => x.id === id) };
}

// Persist the current mock's full section/question tree to the backend. Mock-only questions live
// inside the paper, so every structure change (add/move/delete/import) saves the whole tree.
async function persistMock(type) {
  if (type !== 'sectional' && type !== 'full' && type !== 'diagnostic') return; // e.g. a Learning-page quiz, not a mock
  const m = getMock(type);
  if (!m || !m.id) return;
  try { await api.setMockStructure(m.id, m.sections); }
  catch (e) { toast(e.message || 'Could not save changes to the server', 'del'); }
}

/* ---- Learning helpers ---- */
// The backend stores a video's length as an integer number of seconds; the UI shows "MM:SS".
function secToLabel(s) {
  if (s == null || s === '') return '';
  s = +s; if (!isFinite(s) || s <= 0) return '';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = Math.round(s % 60);
  const mm = String(m).padStart(2, '0'), sss = String(ss).padStart(2, '0');
  return h ? `${h}:${mm}:${sss}` : `${m}:${sss}`;
}
function labelToSec(d) {
  if (!d) return null;
  const parts = String(d).trim().split(':').map(Number);
  if (!parts.length || parts.some((n) => !isFinite(n))) return null;
  return parts.reduce((a, b) => a * 60 + b, 0) || null;
}
// New chapters/subtopics need a backend section; the UI doesn't model sections, so default to the
// exam's first one (loaded from the syllabus). Section is a backend concept here, invisible in the UI.
const firstSectionKey = () => (state.lmsSections[state.exam] || [])[0]?.key || null;

// Browser Back button: step up the learning drill-down (subtopic -> chapter -> chapter list) instead
// of leaving the app. Paired with the history.pushState() calls in openChapter/openSubtopic below.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    if (state.sid) { state.sid = null; emit(); }
    else if (state.cid) { state.cid = null; emit(); }
  });
}
// Save a subtopic's concept HTML + its videos (mapped to the backend's {title,url,seconds} shape).
async function persistConcept(sub) {
  if (!sub || !sub.id) return;
  try {
    await api.setContent(sub.id, sub.concept || '',
      (sub.videos || []).map((v) => ({ title: v.title, url: v.src, seconds: labelToSec(v.dur) })));
  } catch (e) { toast(e.message || 'Could not save content to the server', 'del'); }
}
// Lazily pull a subtopic's concept text, videos and materials from the backend (once).
// Content and materials load INDEPENDENTLY: a failure in one (e.g. an older backend missing the
// materials endpoint) must never blank the other.
async function loadSub(sub) {
  if (!sub || sub._loaded) return;
  try {
    const content = await api.getContent(sub.id);
    sub.concept = content.body || '';
    sub.videos = (content.videos || []).map((v) => ({ id: uid(), title: v.title, src: v.url, dur: secToLabel(v.seconds) }));
  } catch (e) { toast(e.message || 'Could not load concept content', 'del'); }
  try {
    const mats = await api.getMaterials(sub.id);
    sub.pdfs = (mats.materials || []).map((m) => ({ id: m.id, title: m.title, size: m.sizeLabel, filename: m.filename }));
  } catch (e) { /* materials are optional — never let this blank the concept/videos */ }
  try {
    const r = await api.getItems(state.exam, sub.id);
    sub.quiz = (r.items || []).map(itemToQuiz);
  } catch (e) { /* quiz is optional too */ }
  sub._loaded = true;
}

/* ---- quiz <-> Item-bank mapping ----
   The console's quiz uses a 0-based `correct` index; the bank stores `correct_answer` as a string
   (a letter, the option text, or a number, depending on how it was authored). Map robustly both ways. */
function correctToIndex(ca, options) {
  if (ca == null) return 0;
  const s = String(ca).trim();
  const exact = (options || []).findIndex((o) => String(o).trim() === s);
  if (exact >= 0) return exact;
  if (/^[A-Ea-e]$/.test(s)) return s.toUpperCase().charCodeAt(0) - 65;
  if (/^\d+$/.test(s)) { const n = +s; if (n >= 1 && n <= (options || []).length) return n - 1; if (n >= 0 && n < (options || []).length) return n; }
  return 0;
}
const itemToQuiz = (it) => {
  const options = it.options || [];
  return { id: it.item_id, text: it.stem, options, correct: correctToIndex(it.correct_answer, options), difficulty: it.difficulty_d, solution: it.solution || '', image: '', type: it.format || 'mcq', correctAnswer: it.correct_answer, time: it.time_benchmark_s || 60 };
};
// Build a valid ItemIn from a console quiz question (used for add + bulk import).
// The bank requires correct_answer to be one of the option *texts* (not a letter), so send opts[ci].
// prune '', null, '-' and empty nested objects so provenance stays compact
function pruneMeta(o) {
  const out = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (v === '' || v == null || v === '-') continue;
    if (Array.isArray(v)) { if (v.length) out[k] = v; }
    else if (typeof v === 'object') { const p = pruneMeta(v); if (Object.keys(p).length) out[k] = p; }
    else out[k] = v;
  }
  return out;
}

function quizToItem(sub, q) {
  const isTita = q.type === 'tita' || !(q.options && q.options.length);
  const opts = isTita ? null : (q.options || []);
  let correct_answer;
  if (isTita) {
    correct_answer = q.correctAnswer != null && q.correctAnswer !== '' ? String(q.correctAnswer) : '';
  } else {
    const ci = Math.max(0, Math.min(q.correct || 0, Math.max(0, opts.length - 1)));
    correct_answer = opts[ci] != null ? String(opts[ci]) : '';
  }
  // Authored tags ride along in provenance (Status + the /10 ratings are intentionally NOT stored).
  const provenance = pruneMeta({
    external_id: q.externalId, source: q.source, why_level: q.whyLevel, question_type: q.type,
    section: q.section, topic: q.topic, subtopic: q.subtopic, sheet: q.sheet,
    prerequisites: q.prerequisites,
    notes: pruneMeta(q.notes || {}),
  });
  return {
    item_id: `${sub.id}-${uid()}`,
    exam_code: state.exam,
    section_key: sub._section || firstSectionKey(),
    concept_node_id: sub.id,
    difficulty_d: Math.max(-2, Math.min(2, Number.isFinite(+q.difficulty) ? +q.difficulty : 0)),
    format: isTita ? 'tita' : 'mcq',
    num_options: opts ? opts.length : 0,
    stem: q.text || '',
    options: opts,
    correct_answer,
    solution: q.solution || null,
    time_benchmark_s: Number.isFinite(+q.time) ? +q.time : null,
    passage_set_id: q.passageId && q.passageId !== '-' ? String(q.passageId) : null,
    provenance: Object.keys(provenance).length ? provenance : null,
  };
}

/* ============================ actions ============================ */
export const A = {
  /* auth + nav */
  async login(email, pass) {
    if (!email || !pass) return 'Enter your email and password.';
    try {
      const acct = await api.login(email, pass);
      state.authed = true; emit();
      const first = (acct && acct.display_name ? String(acct.display_name).split(/[.\s]/)[0] : '') || 'admin';
      toast('Welcome back, ' + first.charAt(0).toUpperCase() + first.slice(1));
      return null;
    } catch (e) {
      state.authed = false; emit();
      return e.message || 'Sign in failed';
    }
  },
  logout() { api.logout(); state.authed = false; state.view = 'dashboard'; state.cid = state.sid = state.mock = state.results = null; emit(); toast('Signed out'); },
  nav(view) { state.view = view; state.cid = state.sid = state.mock = state.results = null; state.tab = 'concepts'; emit(); },
  setExam(exam) { state.exam = exam; state.cid = state.sid = state.mock = state.results = null; emit(); },
  openCourse(exam) { state.exam = exam; state.view = 'learning'; state.cid = state.sid = null; emit(); },
  openCourseMocks(exam) { state.exam = exam; state.view = 'sectional'; state.mock = state.results = null; emit(); },

  /* students */
  /* students — backed by the API */
  async loadStudents() {
    try { const r = await api.getStudents(); state.students = r.students || []; emit(); }
    catch (e) { toast(e.message || 'Could not load students', 'del'); }
  },
  async saveStudent(existing, data) {
    let verified = data.verified;
    if (state.settings.autoVerify && data.payment && data.payment.status === 'successful') verified = true;
    const payload = { ...data, verified };
    try {
      if (existing) {
        const upd = await api.updateStudent(existing.id, payload);
        Object.assign(existing, upd); emit(); toast('Student updated');
      } else {
        const created = await api.createStudent(payload);
        state.students.unshift(created); emit(); toast('Student added');
      }
      return true;
    } catch (e) { toast(e.message || 'Could not save student', 'del'); return false; }
  },
  async delStudent(id) {
    try { await api.deleteStudent(id); state.students = state.students.filter((s) => s.id !== id); emit(); toast('Student removed', 'del'); }
    catch (e) { toast(e.message || 'Could not remove student', 'del'); }
  },
  async verifyStudent(id) {
    try {
      const upd = await api.verifyStudent(id);
      const s = state.students.find((x) => x.id === id); if (s) Object.assign(s, upd); emit();
      toast(upd.verified ? 'Account verified' : 'Verification removed', upd.verified ? 'ok' : 'info');
    } catch (e) { toast(e.message || 'Could not update verification', 'del'); }
  },
  async setEnrollments(s, exams) {
    try { const upd = await api.setStudentEnrollments(s.id, exams); Object.assign(s, upd); emit(); toast('Enrollments updated'); }
    catch (e) { toast(e.message || 'Could not update enrollments', 'del'); }
  },
  async setPayment(id, status) {
    try {
      const upd = await api.setStudentPayment(id, { status, autoVerify: state.settings.autoVerify });
      const s = state.students.find((x) => x.id === id); if (s) Object.assign(s, upd); emit();
      toast('Payment marked ' + status, status === 'failed' ? 'del' : status === 'successful' ? 'ok' : 'info');
    } catch (e) { toast(e.message || 'Could not update payment', 'del'); }
  },

  /* chapters / subtopics */
  /* learning — backed by the API */
  async loadLearning() {
    const exam = state.exam;
    try {
      const s = await api.getSyllabus(exam);
      state.lmsSections[exam] = s.sections || [];
      const nodes = s.nodes || [];
      const topics = nodes.filter((n) => n.kind === 'topic');
      const concepts = nodes.filter((n) => n.kind === 'concept');
      state.lms[exam] = topics.map((t) => ({
        id: t.id, name: t.name, section: t.section,
        subs: concepts.filter((c) => c.parent_id === t.id).map((c) => ({
          id: c.id, name: c.name, concept: '', videos: [], pdfs: [], quiz: [], _loaded: false, _section: c.section,
          _practiceBank: (c.id || '').endsWith('__practice'),
        })),
      }));
      emit();
    } catch (e) { toast(e.message || 'Could not load chapters', 'del'); }
  },
  async addChapter(name, sectionKey) {
    const key = sectionKey || firstSectionKey();
    if (!key) { toast('Chapters are still loading — try again in a moment', 'del'); return; }
    const id = uid();
    try { await api.addTopic(state.exam, key, id, name); state.lms[state.exam].push({ id, name, section: key, subs: [] }); emit(); toast('Chapter added'); }
    catch (e) { toast(e.message || 'Could not add chapter', 'del'); }
  },
  async renameChapter(ch, name) {
    try { await api.renameNode(ch.id, name); ch.name = name; emit(); toast('Chapter renamed'); }
    catch (e) { toast(e.message || 'Could not rename chapter', 'del'); }
  },
  async delChapter(id) {
    // cascade=1 removes the chapter, its subtopics, and all their questions in one call.
    try {
      await api.deleteNode(id, true);
      state.lms[state.exam] = state.lms[state.exam].filter((c) => c.id !== id); emit(); toast('Chapter deleted', 'del');
    } catch (e) { toast(e.message || 'Could not delete chapter', 'del'); }
  },
  async openChapter(id) {
    state.cid = id; state.sid = null; emit();
    try { window.history.pushState({ lms: 'chapter' }, ''); } catch (e) {}
    const ch = chapterById(id);
    if (!ch || !ch.subs.some((s) => !s._loaded)) return;
    try { await Promise.all(ch.subs.map(loadSub)); emit(); }
    catch (e) { toast(e.message || 'Could not load subtopics', 'del'); }
  },
  async addSubtopic(name) {
    const ch = chapterById(state.cid); const key = (ch && ch.section) || firstSectionKey();
    if (!ch || !key) { toast('Still loading — try again in a moment', 'del'); return; }
    const id = uid();
    try { await api.addConcept(state.exam, key, id, name, ch.id); ch.subs.push({ id, name, concept: '', videos: [], pdfs: [], quiz: [], _loaded: true, _section: key }); emit(); toast('Subtopic added'); }
    catch (e) { toast(e.message || 'Could not add subtopic', 'del'); }
  },
  async renameSubtopic(s, name) {
    try { await api.renameNode(s.id, name); s.name = name; emit(); toast('Subtopic renamed'); }
    catch (e) { toast(e.message || 'Could not rename subtopic', 'del'); }
  },
  async delSubtopic(id) {
    const ch = chapterById(state.cid);
    // cascade=1 also removes the subtopic's questions (backend refuses a plain delete if any exist).
    try { await api.deleteNode(id, true); ch.subs = ch.subs.filter((s) => s.id !== id); emit(); toast('Subtopic deleted', 'del'); }
    catch (e) { toast(e.message || 'Could not delete subtopic', 'del'); }
  },
  // Open a subtopic's practice-question bank (its own pool for the adaptive practice section).
  // Get-or-create it on the backend, make sure it's in the current chapter's subs, then open it.
  async openPracticeBank(nodeId) {
    const ch = chapterById(state.cid); if (!ch) return;
    try {
      const r = await api.ensurePracticeBank(nodeId);
      let pb = ch.subs.find((s) => s.id === r.id);
      if (!pb) {
        pb = { id: r.id, name: r.name || 'Practice questions', _practiceBank: true, _section: ch.section,
               concept: '', videos: [], pdfs: [], quiz: [], _loaded: false };
        ch.subs.push(pb);
      }
      state.cid = ch.id; state.sid = r.id; state.tab = 'quiz'; emit();
      try { window.history.pushState({ lms: 'practice' }, ''); } catch (e) {}
      if (!pb._loaded) { await loadSub(pb); emit(); }
    } catch (e) { toast(e.message || 'Could not open the practice bank', 'del'); }
  },
  async openSubtopic(id) {
    state.sid = id; state.tab = 'concepts'; emit();
    try { window.history.pushState({ lms: 'subtopic' }, ''); } catch (e) {}
    const ch = chapterById(state.cid); const sub = ch && subById(ch, id);
    if (!sub || sub._loaded) return;
    try { await loadSub(sub); emit(); }
    catch (e) { toast(e.message || 'Could not load subtopic content', 'del'); }
  },
  setTab(t) { state.tab = t; emit(); },

  /* content */
  saveConcept(html) { const s = curSub(); s.concept = html; emit(); toast('Concept saved'); persistConcept(s); },
  async uploadConceptHtml(file) {
    const s = curSub();
    if (!s) return;
    try {
      const r = await api.uploadConceptHtml(s.id, file);   // backend reads + sanitizes + stores
      s.concept = r.body || '';                            // editor re-renders with the cleaned HTML (the preview)
      emit();
      toast('HTML uploaded — cleaned and saved');
    } catch (e) { toast(e.message || 'Could not upload HTML', 'del'); }
  },
  saveVideo(existing, data) {
    const s = curSub();
    if (existing) Object.assign(existing, data); else s.videos.push({ id: uid(), ...data });
    emit(); toast(existing ? 'Video updated' : 'Video added'); persistConcept(s);
  },
  delVideo(id) { const s = curSub(); s.videos = s.videos.filter((v) => v.id !== id); emit(); toast('Video removed', 'del'); persistConcept(s); },
  async addPdf(file, title) {
    const s = curSub();
    try {
      const m = await api.uploadMaterial(s.id, file, title);
      s.pdfs.push({ id: m.id, title: m.title, size: m.sizeLabel, filename: m.filename });
      emit(); toast('Material added');
    } catch (e) { toast(e.message || 'Could not upload material', 'del'); }
  },
  async delPdf(id) {
    const s = curSub();
    try { await api.deleteMaterial(id); s.pdfs = s.pdfs.filter((p) => p.id !== id); emit(); toast('Material removed', 'del'); }
    catch (e) { toast(e.message || 'Could not remove material', 'del'); }
  },
  // open a material in a new tab. The tab is opened SYNCHRONOUSLY (inside the click) to dodge popup
  // blockers; once the authenticated fetch resolves to a blob URL, point the tab at it.
  openPdf(id) {
    const w = window.open('', '_blank');
    api.openMaterial(id)
      .then((url) => { if (w) w.location = url; else window.open(url, '_blank'); })
      .catch((e) => { if (w) w.close(); toast(e.message || 'Could not open the file', 'del'); });
  },

  /* questions (quiz / sectional / full) */
  async addQuestion(target, data) {
    const nq = { id: uid(), ...data };
    if (target.kind === 'quiz') {
      const s = curSub();
      try { const payload = quizToItem(s, nq); await api.createItem(payload); nq.id = payload.item_id; s.quiz.push(nq); emit(); toast('Question added'); }
      catch (e) { toast(e.message || 'Could not add question', 'del'); }
      return;
    }
    if (target.kind === 'sectional') getMock('sectional').sections[target.si].questions.push(nq);
    else getMock(target.kind).sections[target.si].questions.push(nq);
    emit(); toast('Question added'); persistMock(target.kind);
  },
  editQuestion(q, data) {
    Object.assign(q, data, { id: q.id }); emit(); toast('Question updated');
    if (state.view === 'sectional' || state.view === 'full' || state.view === 'diagnostic') { persistMock(state.view); return; }
    // Learning quiz question -> PATCH the bank item (correct_answer is the option text)
    const opts = q.options || [];
    const ci = Math.max(0, Math.min(q.correct || 0, Math.max(0, opts.length - 1)));
    api.patchItem(q.id, { stem: q.text, options: opts, correct_answer: opts[ci] != null ? String(opts[ci]) : '', solution: q.solution || null, difficulty_d: Math.max(-2, Math.min(2, +q.difficulty || 0)) })
      .catch((e) => toast(e.message || 'Could not save the edit', 'del'));
  },
  delQuestion(id) {
    const inMock = state.view === 'sectional' || state.view === 'full' || state.view === 'diagnostic';
    const { list, q } = locateQ(id); const i = list.indexOf(q); if (i > -1) list.splice(i, 1); emit();
    if (inMock) { toast('Question deleted', 'del'); persistMock(state.view); return; }
    // Only confirm the delete once the backend actually removed it; on failure put the row back
    // so the admin list never diverges from the database.
    api.deleteItem(id)
      .then(() => toast('Question deleted', 'del'))
      .catch((e) => {
        if (i > -1) { list.splice(i, 0, q); emit(); }
        toast(e.message || 'Could not delete the question', 'del');
      });
  },
  moveQuestion(id, dir) {
    const { list } = locateQ(id); const i = list.findIndex((q) => q.id === id); const j = dir === 'up' ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]]; emit();
    if (state.view === 'sectional' || state.view === 'full' || state.view === 'diagnostic') persistMock(state.view);
    // quiz order is local-only (the practice bank has no fixed ordering)
  },
  async commitImport(target, questions) {
    if (target.kind === 'quiz') {
      const s = curSub();
      try {
        const rep = await api.ingestItems(questions.map((q) => quizToItem(s, q)));
        const r = await api.getItems(state.exam, s.id);   // reload to get canonical ids/state
        s.quiz = (r.items || []).map(itemToQuiz);
        emit();
        const n = rep.inserted ?? questions.length;
        toast(`Imported ${n} question${n !== 1 ? 's' : ''}`);
      } catch (e) { toast(e.message || 'Could not import questions', 'del'); }
      return;
    }
    if (target.kind === 'sectional') getMock('sectional').sections[target.si].questions.push(...questions);
    else getMock(target.kind).sections[target.si].questions.push(...questions);
    emit(); toast(`Imported ${questions.length} questions`); persistMock(target.kind);
  },

  /* mocks — backed by the API */
  async loadMocks() {
    const exam = state.exam;
    try {
      const [sec, full, diag] = await Promise.all([api.getMocks(exam, 'sectional'), api.getMocks(exam, 'full'), api.getMocks(exam, 'diagnostic')]);
      state.sectional[exam] = sec.mocks || [];
      state.full[exam] = full.mocks || [];
      state.diagnostic[exam] = diag.mocks || [];
      emit();
    } catch (e) { toast(e.message || 'Could not load mocks', 'del'); }
  },

  /* sectional mocks */
  async newSectional(data) {
    try {
      const m = await api.createMock({ type: 'sectional', name: data.name, exam: state.exam, negative: data.negative || 0 });
      if (data.status === 'published') { const p = await api.toggleMockPublish(m.id); Object.assign(m, p); }
      state.sectional[state.exam].push(m); state.mock = m.id; state.mockType = 'sectional'; state.results = null; emit(); toast('Mock created');
    } catch (e) { toast(e.message || 'Could not create mock', 'del'); }
  },
  async saveSectionalConfig(m, data) {
    try {
      const upd = await api.updateMock(m.id, { name: data.name, negative: data.negative });
      Object.assign(m, upd);
      if (data.status && data.status !== m.status) { const p = await api.toggleMockPublish(m.id); Object.assign(m, p); }
      emit(); toast('Configuration saved');
    } catch (e) { toast(e.message || 'Could not save configuration', 'del'); }
  },
  async delSectional(id) {
    try { await api.deleteMock(id); state.sectional[state.exam] = state.sectional[state.exam].filter((m) => m.id !== id); emit(); toast('Mock deleted', 'del'); }
    catch (e) { toast(e.message || 'Could not delete mock', 'del'); }
  },
  openSectional(id) { state.mock = id; state.mockType = 'sectional'; state.results = null; emit(); },
  addSection(data) { getMock('sectional').sections.push({ id: uid(), ...data, questions: [] }); emit(); toast('Section added'); persistMock('sectional'); },
  saveSection(sec, data) { Object.assign(sec, data); emit(); toast('Section updated'); persistMock('sectional'); },
  delSection(si) { const m = getMock('sectional'); m.sections.splice(si, 1); emit(); toast('Section removed', 'del'); persistMock('sectional'); },

  /* full mocks */
  async newFull(data) {
    try {
      const m = await api.createMock({ type: 'full', name: data.name, exam: state.exam, duration: data.duration, scoringMarks: data.scoringMarks, scoringNeg: data.scoringNeg, instructions: data.instructions });
      if (data.status === 'published') { const p = await api.toggleMockPublish(m.id); Object.assign(m, p); }
      state.full[state.exam].push(m); state.mock = m.id; state.mockType = 'full'; state.results = null; emit(); toast('Full mock created');
    } catch (e) { toast(e.message || 'Could not create mock', 'del'); }
  },
  async saveFullConfig(m, data) {
    try {
      const upd = await api.updateMock(m.id, { name: data.name, duration: data.duration, scoringMarks: data.scoringMarks, scoringNeg: data.scoringNeg, instructions: data.instructions });
      Object.assign(m, upd);
      if (data.status && data.status !== m.status) { const p = await api.toggleMockPublish(m.id); Object.assign(m, p); }
      emit(); toast('Settings saved');
    } catch (e) { toast(e.message || 'Could not save settings', 'del'); }
  },
  editFull(id) { state.mock = id; state.mockType = 'full'; state.results = null; emit(); },
  async delFull(id) {
    try { await api.deleteMock(id); state.full[state.exam] = state.full[state.exam].filter((m) => m.id !== id); emit(); toast('Full mock deleted', 'del'); }
    catch (e) { toast(e.message || 'Could not delete mock', 'del'); }
  },
  /* diagnostic test (a full-format paper, but one attempt per student; sets section ability) */
  async newDiagnostic(data) {
    try {
      const m = await api.createMock({ type: 'diagnostic', name: data.name, exam: state.exam, duration: data.duration, scoringMarks: data.scoringMarks, scoringNeg: data.scoringNeg, instructions: data.instructions });
      if (data.status === 'published') { const p = await api.toggleMockPublish(m.id); Object.assign(m, p); }
      state.diagnostic[state.exam].push(m); state.mock = m.id; state.mockType = 'diagnostic'; state.results = null; emit(); toast('Diagnostic test created');
    } catch (e) { toast(e.message || 'Could not create diagnostic', 'del'); }
  },
  editDiagnostic(id) { state.mock = id; state.mockType = 'diagnostic'; state.results = null; emit(); },
  async delDiagnostic(id) {
    try { await api.deleteMock(id); state.diagnostic[state.exam] = state.diagnostic[state.exam].filter((m) => m.id !== id); emit(); toast('Diagnostic deleted', 'del'); }
    catch (e) { toast(e.message || 'Could not delete diagnostic', 'del'); }
  },
  addFullSection(name) { getMock(state.mockType).sections.push({ id: uid(), name, questions: [] }); emit(); toast('Section added'); persistMock(state.mockType); },
  delFullSection(si) { const m = getMock(state.mockType); m.sections.splice(si, 1); emit(); toast('Section removed', 'del'); persistMock(state.mockType); },

  /* publish + results */
  async togglePublish(type) {
    const m = getMock(type);
    try { const upd = await api.toggleMockPublish(m.id); Object.assign(m, upd); emit(); toast(upd.status === 'published' ? 'Published' : 'Moved to draft', upd.status === 'published' ? 'ok' : 'info'); }
    catch (e) { toast(e.message || 'Could not change publish status', 'del'); }
  },
  openResults(id, type) { state.mock = id; state.mockType = type; state.results = true; emit(); },
  backResults() { state.results = null; emit(); },

  /* coupons — backed by the API */
  async loadCoupons() {
    try { const r = await api.getCoupons(); state.coupons = r.coupons || []; emit(); }
    catch (e) { toast(e.message || 'Could not load coupons', 'del'); }
  },
  async createCoupon(data) {
    try { const cp = await api.createCoupon(data); state.coupons.unshift(cp); emit(); toast('Coupon created'); return cp; }
    catch (e) { toast(e.message || 'Could not create coupon', 'del'); return null; }
  },
  async saveCoupon(cp, data) {
    try { const upd = await api.updateCoupon(cp.id, data); Object.assign(cp, upd); emit(); toast('Coupon updated'); return upd; }
    catch (e) { toast(e.message || 'Could not update coupon', 'del'); return null; }
  },
  async toggleCoupon(id) {
    try {
      const upd = await api.toggleCoupon(id);
      const cp = state.coupons.find((x) => x.id === id); if (cp) Object.assign(cp, upd); emit();
      toast('Coupon ' + (upd.status === 'active' ? 'activated' : 'deactivated'), upd.status === 'active' ? 'ok' : 'info');
    } catch (e) { toast(e.message || 'Could not update coupon', 'del'); }
  },
  async delCoupon(id) {
    try { await api.deleteCoupon(id); state.coupons = state.coupons.filter((c) => c.id !== id); emit(); toast('Coupon deleted', 'del'); }
    catch (e) { toast(e.message || 'Could not delete coupon', 'del'); }
  },

  /* settings */
  toggleAutoVerify() { state.settings.autoVerify = !state.settings.autoVerify; emit(); toast('Auto-verify ' + (state.settings.autoVerify ? 'enabled' : 'disabled'), state.settings.autoVerify ? 'ok' : 'info'); },
};
