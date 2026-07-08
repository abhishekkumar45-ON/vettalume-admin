import React, { useState, useEffect } from 'react';
import Icon from '../icons.jsx';
import { useStore, A, getState, openModal } from '../store.jsx';
import { PageHead, Empty, Avatar, ExamTag, RegPill, PayPill, VerPill, Pill, Progress, IconBtn, Stat, Banner } from '../ui.jsx';
import { EXC, initials, avatarColor, money, accessLevel } from '../helpers.js';
import { StudentModal, StudentDetail, EnrollModal } from '../modals.jsx';
import { ConfirmDelete } from '../ui.jsx';

export function Students() {
  const S = useStore();
  const [f, setF] = useState({ q: '', exam: 'all', reg: 'all', pay: 'all', ver: 'all' });
  useEffect(() => { A.loadStudents(); }, []);
  const up = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const rows = S.students.filter((s) => {
    if (f.exam !== 'all' && !s.exams.includes(f.exam)) return false;
    if (f.reg !== 'all' && s.regType !== f.reg) return false;
    if (f.pay !== 'all' && (s.payment.status || 'none') !== f.pay) return false;
    if (f.ver === 'yes' && !s.verified) return false;
    if (f.ver === 'no' && s.verified) return false;
    if (f.q && !(s.name + s.email + s.phone).toLowerCase().includes(f.q.toLowerCase())) return false;
    return true;
  });
  const del = (s) => openModal(<ConfirmDelete what={s.name} onYes={() => A.delStudent(s.id)} />);
  return (
    <>
      <PageHead eyebrow="People" title="Students" desc="Accounts, enrollments, verification and payment status across the platform."
        actions={<button className="btn primary" onClick={() => openModal(<StudentModal />)}><Icon name="userplus" /> Add student</button>} />
      <div className="toolbar">
        <div className="tsearch"><Icon name="search" /><input placeholder="Search name, email or phone" value={f.q} onChange={up('q')} /></div>
        <select className="fil" value={f.exam} onChange={up('exam')}><option value="all">All courses</option>{['CAT', 'GMAT', 'GRE'].map((e) => <option key={e}>{e}</option>)}</select>
        <select className="fil" value={f.reg} onChange={up('reg')}><option value="all">All types</option><option value="registered">Registered only</option><option value="trial">Free trial</option><option value="paid">Paid / purchased</option></select>
        <select className="fil" value={f.pay} onChange={up('pay')}><option value="all">Any payment</option><option value="successful">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
        <select className="fil" value={f.ver} onChange={up('ver')}><option value="all">All accounts</option><option value="yes">Verified</option><option value="no">Unverified</option></select>
        <div className="grow" /><span className="cellsub">{rows.length} of {S.students.length}</span>
      </div>
      <div className="tbl-wrap"><table>
        <thead><tr><th>Student</th><th>Exams</th><th>Registration</th><th>Payment</th><th>Account</th><th>Progress</th><th>Last login</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
        <tbody>
          {rows.length ? rows.map((s) => (
            <tr key={s.id}>
              <td><div className="who"><Avatar name={initials(s.name)} color={avatarColor(s.name)} /><div><div className="cellname">{s.name} {s.status === 'inactive' && <Pill kind="mut" style={{ marginLeft: 4 }}>inactive</Pill>}</div><div className="cellsub">{s.email} · {s.phone}</div></div></div></td>
              <td>{s.exams.length ? s.exams.map((e) => <ExamTag key={e} exam={e} />) : <span className="cellsub">—</span>}</td>
              <td><RegPill t={s.regType} />{s.purchasedCourse && <div className="cellsub" style={{ marginTop: 3 }}>{s.purchasedCourse} course</div>}</td>
              <td><PayPill s={s.payment.status} /></td>
              <td><VerPill v={s.verified} /></td>
              <td><Progress value={s.progress} /></td>
              <td className="cellsub">{s.lastLogin}</td>
              <td><div className="rowacts">
                <IconBtn name="eye" onClick={() => openModal(<StudentDetail student={s} />)} title="View details" />
                {!s.verified && <IconBtn name="check" onClick={() => A.verifyStudent(s.id)} title="Verify account" />}
                <IconBtn name="layers" onClick={() => openModal(<EnrollModal student={s} />)} title="Enrollments" />
                <IconBtn name="edit" onClick={() => openModal(<StudentModal student={s} />)} title="Edit" />
                <IconBtn name="trash" kind="del" onClick={() => del(s)} title="Remove" />
              </div></td>
            </tr>
          )) : (
            <tr><td colSpan={8}><Empty icon="users" title="No students match" text="Try a different search or clear the filters." /></td></tr>
          )}
        </tbody>
      </table></div>
    </>
  );
}

export function Payments() {
  const S = useStore();
  useEffect(() => { A.loadStudents(); }, []);
  const [status, setStatus] = useState('all');
  const paid = S.students.filter((s) => s.regType === 'paid');
  const rows = paid.filter((s) => status === 'all' || (s.payment.status || 'none') === status);
  const sum = (st) => paid.filter((s) => s.payment.status === st);
  const revenue = sum('successful').reduce((a, s) => a + s.payment.amount, 0);
  return (
    <>
      <PageHead eyebrow="People" title="Payments" desc="Transaction status and access control. Successful payments can auto-verify accounts." />
      <div className="grid cols-4 mb16">
        <Stat value={{ text: money(revenue), color: 'var(--ok)' }} label="Revenue collected" />
        <Stat value={{ text: sum('successful').length, color: 'var(--ok)' }} label="Successful" />
        <Stat value={{ text: sum('pending').length, color: 'var(--warn)' }} label="Pending" />
        <Stat value={{ text: sum('failed').length + sum('refunded').length, color: 'var(--danger)' }} label="Failed / refunded" />
      </div>
      <Banner icon="award">Automatic verification after payment is <b>{S.settings.autoVerify ? 'ON' : 'OFF'}</b> — {S.settings.autoVerify ? 'accounts verify the moment a payment is marked successful.' : 'mark accounts verified manually from here or Students.'} Change this in Settings.</Banner>
      <div className="toolbar">
        <select className="fil" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All transactions</option><option value="successful">Successful</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select>
        <div className="grow" /><span className="cellsub">{rows.length} transaction{rows.length !== 1 ? 's' : ''}</span>
      </div>
      {rows.length ? (
        <div className="tbl-wrap"><table>
          <thead><tr><th>Student</th><th>Course</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Account</th><th>Access</th><th style={{ textAlign: 'right' }}>Update status</th></tr></thead>
          <tbody>{rows.map((s) => {
            const acc = accessLevel(s);
            return (
              <tr key={s.id}>
                <td><div className="who"><Avatar name={initials(s.name)} color={avatarColor(s.name)} /><div><div className="cellname">{s.name}</div><div className="cellsub">{s.email}</div></div></div></td>
                <td>{s.purchasedCourse ? <ExamTag exam={s.purchasedCourse} /> : '—'}</td>
                <td className="cellname">{money(s.payment.amount)}</td><td className="cellsub">{s.payment.method || '—'}</td><td className="cellsub">{s.payment.date || '—'}</td>
                <td><PayPill s={s.payment.status} /></td><td><VerPill v={s.verified} /></td><td><Pill kind={acc.c}>{acc.l}</Pill></td>
                <td><div className="rowacts">
                  <IconBtn name="check" onClick={() => A.setPayment(s.id, 'successful')} title="Mark successful" />
                  <IconBtn name="clock" onClick={() => A.setPayment(s.id, 'pending')} title="Mark pending" />
                  <IconBtn name="x" kind="del" onClick={() => A.setPayment(s.id, 'failed')} title="Mark failed" />
                  <IconBtn name="download" onClick={() => A.setPayment(s.id, 'refunded')} title="Mark refunded" />
                </div></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      ) : <div className="card"><Empty icon="award" title="No transactions" text="Paid enrollments and their payment status appear here." /></div>}
    </>
  );
}
