import * as XLSX from 'xlsx';
import { uid } from './helpers.js';

// Header-matching helper: exact match wins (so 'Question text' beats 'Question ID'); a guarded
// partial match is the fallback (never lets a bare term latch onto an *ID* column).
function header(row) {
  const cols = Object.keys(row);
  return (...keys) => {
    for (const t of keys) for (const k of cols) if (k.toLowerCase().trim() === t) return row[k];
    for (const t of keys) for (const k of cols) {
      const kl = k.toLowerCase().trim();
      if (kl.includes(t) && !(kl.includes('id') && !t.includes('id'))) return row[k];
    }
    return '';
  };
}

const clean = (v) => (v == null ? '' : String(v).trim());
const isBlank = (v) => { const s = clean(v); return s === '' || s === '-'; };

// drop '', null, '-' and empty nested objects so provenance stays tidy
function prune(o) {
  const out = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (v === '' || v == null || v === '-') continue;
    if (Array.isArray(v)) { if (v.length) out[k] = v; }
    else if (typeof v === 'object') { const p = prune(v); if (Object.keys(p).length) out[k] = p; }
    else out[k] = v;
  }
  return out;
}

function parseRow(row) {
  const get = header(row);

  // options: keep only real ones (a '-' placeholder, used by TITA rows, is not an option)
  const opts = [];
  ['option a', 'option b', 'option c', 'option d', 'option e', 'option f'].forEach((k) => {
    const v = get(k);
    if (!isBlank(v)) opts.push(clean(v));
  });
  if (!opts.length) ['a', 'b', 'c', 'd'].forEach((k) => { const v = row[k] || row[k.toUpperCase()]; if (!isBlank(v)) opts.push(clean(v)); });

  // type: explicit 'Question type' (TITA/MCQ), else inferred from whether real options exist
  let type = clean(get('question type', 'type')).toLowerCase();
  const isTita = type === 'tita' || (!type && opts.length === 0);
  if (!type) type = isTita ? 'tita' : 'mcq';

  // correct answer: for MCQ resolve to an option index; for TITA keep the typed value verbatim
  const rawCorrect = clean(get('correct answer', 'correct'));
  let ci = 0;
  if (!isTita) {
    if (/^[a-f]$/i.test(rawCorrect[0] || '')) ci = rawCorrect.toUpperCase().charCodeAt(0) - 65;
    else if (!isNaN(+rawCorrect) && rawCorrect !== '') ci = Math.max(0, +rawCorrect - 1);
    ci = Math.min(ci, (opts.length || 1) - 1);
  }

  let diff = get('difficulty (-2 to 2)', 'difficulty');
  diff = diff === '' ? 0 : isNaN(+diff) ? 0 : Math.max(-2, Math.min(2, +diff));

  const prerequisites = clean(get('prerequisites'))
    .split(',').map((s) => s.trim()).filter((s) => s && s !== '-');

  return {
    id: uid(),
    // --- display / standard fields ---
    text: clean(get('question text', 'question', 'stem', 'text')),
    options: opts,                       // [] for TITA
    correct: ci,
    difficulty: diff,
    solution: clean(get('solution / explanation', 'solution', 'explanation')),
    image: clean(get('image url', 'image', 'figure')),
    time: +get('expected time (sec)', 'expected time') || 60,
    // --- everything else, carried through to provenance / item fields ---
    type,                                // 'tita' | 'mcq'
    correctAnswer: rawCorrect,           // verbatim answer (used for TITA)
    passageId: clean(get('passage / set id', 'passage', 'set id')),
    source: clean(get('source')),
    whyLevel: clean(get('why this level', 'why level')),
    prerequisites,
    section: clean(get('section')),
    topic: clean(get('topic')),
    subtopic: clean(get('subtopic')),
    externalId: clean(get('question id')),
    notes: {
      calc: clean(get('calc note')),
      time: clean(get('time note')),
      thinking: clean(get('thinking note')),
      concept: clean(get('concept note')),
    },
  };
}

/** Parse an uploaded .xlsx/.xls file into question objects. Reads EVERY sheet so a multi-tab
 *  bank (e.g. text + figure-based) is imported whole, not just the first tab. */
export function parseFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const out = [];
        wb.SheetNames.forEach((name) => {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
          rows.forEach((row) => { const q = parseRow(row); if (q.text) { q.sheet = name; out.push(q); } });
        });
        resolve(out);
      } catch (err) { reject(err); }
    };
    r.onerror = reject;
    r.readAsArrayBuffer(file);
  });
}

/** Download a starter question template showing the full tag set (one MCQ + one TITA example). */
export function downloadTemplate() {
  const cols = ['Question ID', 'Section', 'Topic', 'Subtopic', 'Prerequisites', 'Difficulty (-2 to 2)',
    'Question type', 'Question text', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct answer',
    'Solution / explanation', 'Why this level', 'Expected time (sec)', 'Passage / Set ID', 'Source',
    'Status', 'Weighted rating (/10)', 'Calc intensity (/10)', 'Time (/10)', 'Critical thinking (/10)',
    'Concept load (/10)', 'Calc note', 'Time note', 'Thinking note', 'Concept note', 'Image URL'];
  const mcq = ['CAT-QA-0001', 'QA', 'Averages', 'Basic averages', 'Arithmetic mean', '-1', 'MCQ',
    'Find the average of 7, 3, 5 and 9.', '5', '6', '7', '8', 'B', 'Sum 24 / 4 = 6', 'Level -1: one clean step.',
    '40', '-', 'Vettalume', 'approved', 2, 2, 2, 2, 2, 'one division', 'under a minute', 'direct', 'single concept', ''];
  const tita = ['CAT-QA-0002', 'QA', 'Quadratic Equations', 'Modelling', 'Solving quadratics', '-2', 'TITA',
    'The product of two consecutive positive integers is 56. Find the smaller integer.', '-', '-', '-', '-', '7',
    'n(n+1)=56 -> n=7.', 'Level -2: one factorisation.', '40', '-', 'Vettalume', 'draft', 2, 2, 2, 2, 2,
    'one factorisation', 'under a minute', 'set up integers', 'word to quadratic', ''];
  const ws = XLSX.utils.aoa_to_sheet([cols, mcq, tita]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');
  XLSX.writeFile(wb, 'vettalume_question_template.xlsx');
}
