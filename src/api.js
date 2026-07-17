// src/api.js — connects this admin console to the Vettalume FastAPI backend.
//
// Override the backend URL without touching code by creating a .env file:
//   VITE_API_URL=http://localhost:8001
export const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const TOKEN_KEY = 'vettalume_admin_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isLoggedIn = () => !!getToken();

/* ------------------------------------------------------------------ core */
async function request(path, { method = 'GET', body, form, auth = true } = {}) {
  const headers = {};
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let payload;
  if (form) {
    payload = form; // FormData — browser sets the multipart Content-Type itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  } catch (e) {
    throw new Error(`Cannot reach the backend at ${BASE}. Is it running? (uvicorn on :8001)`);
  }

  if (res.status === 401 && auth) { clearToken(); throw new Error('Not signed in, or your session expired.'); }
  if (res.status === 403) throw new Error('This account is not an admin.');
  if (!res.ok) {
    let detail = '';
    try { detail = (await res.json()).detail || ''; } catch { detail = await res.text().catch(() => ''); }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

const get = (p) => request(p);
const post = (p, body) => request(p, { method: 'POST', body });
const put = (p, body) => request(p, { method: 'PUT', body });
const del = (p, body) => request(p, { method: 'DELETE', body });
const upload = (p, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return request(p, { method: 'POST', form: fd });
};

/* ------------------------------------------------------------------ auth */
// Logs in, stores the token, and confirms the account is actually an admin.
export async function login(email, password) {
  let data;
  try {
    data = await request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
  } catch (e) {
    throw new Error(/invalid email or password/i.test(e.message) ? 'Incorrect email or password.' : e.message);
  }
  if (!data?.access_token) throw new Error('No token returned by the server.');
  setToken(data.access_token);
  try {
    return await get('/admin/me'); // 403 here => not an admin
  } catch (e) {
    clearToken();
    throw e;
  }
}
export function logout() { clearToken(); }
export const me = () => get('/admin/me');

/* ----------------------------------------------------------- admin: syllabus
   Returns the backend's view: { sections:[{key,name}], nodes:[{id,kind,name,section,parent_id,item_count}] }.
   kind is 'topic' (your "chapter") or 'concept' (your "subtopic"). */
export const getSyllabus = (exam) => get(`/admin/syllabus?exam=${encodeURIComponent(exam)}`);

export const addTopic = (exam, sectionKey, id, name) =>
  post('/admin/topics', { id, exam_code: exam, section_key: sectionKey, name });

export const addConcept = (exam, sectionKey, id, name, parentId) =>
  post('/admin/concepts', { id, exam_code: exam, section_key: sectionKey, name, parent_id: parentId });

export const deleteNode = (id, cascade) =>
  del(`/admin/nodes/${encodeURIComponent(id)}${cascade ? '?cascade=1' : ''}`);
export const renameNode = (id, name) =>
  request(`/admin/nodes/${encodeURIComponent(id)}`, { method: 'PATCH', body: { name } });
// Get-or-create a chapter's hidden practice-question bank; returns { id } to author questions into.
export const ensurePracticeBank = (nodeId) =>
  post(`/admin/nodes/${encodeURIComponent(nodeId)}/practice-bank`);

/* ----------------------------------------------------- admin: learning content
   Backend stores per-concept content as { body, videos:[{title,url,seconds}] }. */
export const getContent = (conceptId) => get(`/admin/concepts/${encodeURIComponent(conceptId)}/content`);
export const setContent = (conceptId, body, videos) =>
  put(`/admin/concepts/${encodeURIComponent(conceptId)}/content`, { body, videos });
// Upload an .html file as the concept body; backend sanitizes it and returns the cleaned HTML.
export const uploadConceptHtml = (conceptId, file) => {
  const fd = new FormData();
  fd.append('file', file);
  return request(`/admin/concepts/${encodeURIComponent(conceptId)}/content/html`, { method: 'POST', form: fd });
};

/* ----------------------------------------------------- admin: study materials
   Real file storage. Upload is multipart (file + optional title); list returns metadata only. */
export const getMaterials = (conceptId) =>
  get(`/admin/concepts/${encodeURIComponent(conceptId)}/materials`);
// fetch a material's bytes WITH the admin token (a plain link / window.open can't send the header),
// and hand back an object URL the browser can open inline.
export async function openMaterial(mid) {
  const r = await fetch(`${BASE}/admin/materials/${encodeURIComponent(mid)}/download`, {
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
  });
  if (!r.ok) throw new Error(r.status === 404 ? 'File not found on the server' : `Could not open the file (${r.status})`);
  return URL.createObjectURL(await r.blob());
}
export const uploadMaterial = (conceptId, file, title) => {
  const fd = new FormData();
  fd.append('file', file);
  if (title) fd.append('title', title);
  return request(`/admin/concepts/${encodeURIComponent(conceptId)}/materials`, { method: 'POST', form: fd });
};
export const deleteMaterial = (mid) => del(`/admin/materials/${encodeURIComponent(mid)}`);

/* --------------------------------------------------------- admin: questions
   scope: 'both' | 'practice_only' | 'mock_only'. */
export const getItems = (exam, conceptId) =>
  get(`/admin/items?exam=${encodeURIComponent(exam)}&concept=${encodeURIComponent(conceptId)}&limit=2000`);
export const ingestItems = (items) => post('/ingest/items', items); // bulk JSON; whole batch rejected on any one error
export const createItem = (item) => post('/admin/items', item);
export const patchItem = (id, patch) =>
  request(`/admin/items/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
export const deleteItem = (id) => del(`/admin/items/${encodeURIComponent(id)}`);
export const uploadConceptQuiz = (conceptId, file, scope = 'both') =>
  upload(`/admin/concepts/${encodeURIComponent(conceptId)}/items/upload-xlsx?scope=${scope}`, file);
export const uploadBankXlsx = (file, scope = 'both') =>
  upload(`/admin/items/upload-xlsx?scope=${scope}`, file);

/* ---------------------------------------------------------- admin: media
   Question images. Each file is stored keyed by its filename minus extension
   (q123.png -> key "q123"); the public {BASE}/media/{key} serves the bytes. */
export const uploadMedia = (files) => {
  const fd = new FormData();
  for (const f of files) fd.append('files', f);
  return request('/admin/media', { method: 'POST', form: fd });
};
export const listMedia = () => get('/admin/media');
export const deleteMedia = (key) => del(`/admin/media/${encodeURIComponent(key)}`);

/* ------------------------------------------------------- admin: contact-us
   Contact-form submissions. Newest first; handled/unhandled is a toggle. */
export const getContact = () => get('/admin/contact');
export const setContactHandled = (id, handled) =>
  request(`/admin/contact/${encodeURIComponent(id)}?handled=${handled ? 'true' : 'false'}`, { method: 'PATCH' });
export const deleteContact = (id) => del(`/admin/contact/${encodeURIComponent(id)}`);

/* ------------------------------------------------------------ admin: admins
   Manage which accounts have admin access. List returns [{account_id, role, email, display_name}].
   Create either makes a new admin account with that password or resets password + grants admin
   if the email already exists. Delete revokes admin (400 if you try to revoke yourself). */
export const getAdmins = () => get('/admin/admins');
export const createAdmin = ({ email, password, displayName }) =>
  post('/admin/admins', { email, password, display_name: displayName });
export const deleteAdmin = (accountId) => del(`/admin/admins/${encodeURIComponent(accountId)}`);

/* ---------------------------------------------------------- admin: students */
export const getStudents = (q = '') => get(`/admin/students${q ? `?q=${encodeURIComponent(q)}` : ''}`);
export const getStudent = (id) => get(`/admin/students/${encodeURIComponent(id)}`);
export const createStudent = (data) => post('/admin/students', data);
export const updateStudent = (id, data) => put(`/admin/students/${encodeURIComponent(id)}`, data);
export const deleteStudent = (id) => del(`/admin/students/${encodeURIComponent(id)}`);
export const verifyStudent = (id) => post(`/admin/students/${encodeURIComponent(id)}/verify`);
export const setStudentPayment = (id, data) => post(`/admin/students/${encodeURIComponent(id)}/payment`, data);
export const setStudentEnrollments = (id, exams) =>
  put(`/admin/students/${encodeURIComponent(id)}/enrollments`, { exams });
export const enrollStudent = (id, examCode) =>
  post(`/admin/students/${encodeURIComponent(id)}/enroll`, { exam_code: examCode });
export const deregisterStudent = (id, examCode) =>
  post(`/admin/students/${encodeURIComponent(id)}/deregister`, { exam_code: examCode });

/* ----------------------------------------------------------- admin: coupons
   The backend speaks this console's exact camelCase shape, so coupon objects pass straight
   through both ways (code, type, value, maxTotal, maxPerUser, minPurchase, maxDiscount,
   validFrom, validUntil, description, attempt, courses, + server-side used/status). */
export const getCoupons = () => get('/admin/coupons');
export const createCoupon = (data) => post('/admin/coupons', data);
export const updateCoupon = (id, data) => put(`/admin/coupons/${encodeURIComponent(id)}`, data);
export const toggleCoupon = (id) => post(`/admin/coupons/${encodeURIComponent(id)}/toggle`);
export const deleteCoupon = (id) => del(`/admin/coupons/${encodeURIComponent(id)}`);

/* ------------------------------------------------------------ admin: mocks
   Fixed-form mocks. The whole section/question tree is sent to /structure; the page mutates
   the mock in memory then persists the result, so import/add/move/delete all flow through here. */
export const getMocks = (exam, type) =>
  get(`/admin/mocks?exam=${encodeURIComponent(exam)}${type ? `&type=${type}` : ''}`);
export const createMock = (data) => post('/admin/mocks', data);
export const updateMock = (id, data) => put(`/admin/mocks/${encodeURIComponent(id)}`, data);
export const setMockStructure = (id, sections) =>
  put(`/admin/mocks/${encodeURIComponent(id)}/structure`, { sections });
export const toggleMockPublish = (id) => post(`/admin/mocks/${encodeURIComponent(id)}/publish`);
export const deleteMock = (id) => del(`/admin/mocks/${encodeURIComponent(id)}`);

export default {
  BASE, getToken, isLoggedIn, login, logout, me,
  getSyllabus, addTopic, addConcept, deleteNode, renameNode,
  getContent, setContent, getMaterials, openMaterial, uploadMaterial, deleteMaterial,
  getItems, ingestItems, createItem, patchItem, deleteItem, uploadConceptQuiz, uploadBankXlsx,
  uploadMedia, listMedia, deleteMedia,
  getContact, setContactHandled, deleteContact,
  getAdmins, createAdmin, deleteAdmin,
  getStudents, getStudent, createStudent, updateStudent, deleteStudent,
  verifyStudent, setStudentPayment, setStudentEnrollments, enrollStudent, deregisterStudent,
  getCoupons, createCoupon, updateCoupon, toggleCoupon, deleteCoupon,
  getMocks, createMock, updateMock, setMockStructure, toggleMockPublish, deleteMock,
};
