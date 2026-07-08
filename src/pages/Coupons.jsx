import React, { useState, useEffect } from 'react';
import Icon from '../icons.jsx';
import { useStore, A, openModal, toast } from '../store.jsx';
import { PageHead, Empty, Pill, ExamTag } from '../ui.jsx';
import { ATTEMPTLABEL, couponValue, fmtExpiry } from '../helpers.js';
import { CouponFields, CouponModal, readCoupon } from '../modals.jsx';
import { ConfirmDelete } from '../ui.jsx';

const emptyForm = { code: '', type: '', value: '', maxTotal: '', maxPerUser: '', minPurchase: '', maxDiscount: '', validFrom: '', validUntil: '', description: '', attempt: 'all', courses: [] };

export default function Coupons() {
  const S = useStore();
  const [f, setF] = useState(emptyForm);
  useEffect(() => { A.loadCoupons(); }, []);
  const up = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const create = async () => {
    if (!f.code) return toast('Coupon code is required', 'info');
    if (!f.type) return toast('Choose a discount type', 'info');
    const cp = await A.createCoupon(readCoupon(f));
    if (cp) setF(emptyForm);
  };
  const courses = (c) => (c.courses && c.courses.length ? c.courses.map((e) => <ExamTag key={e} exam={e} />) : <Pill kind="mut">All courses</Pill>);
  return (
    <>
      <PageHead eyebrow="Billing" title="Coupons" desc="Create and manage discount codes, usage limits and course or attempt restrictions." />
      <div className="card panel mb18">
        <div className="panel-h"><div className="t">Create coupon</div><div className="s">discount code</div></div>
        <CouponFields f={f} up={up} setF={setF} />
        <button className="btn primary" onClick={create}><Icon name="plus" /> Create coupon</button>
      </div>
      <div className="card panel">
        <div className="panel-h"><div className="t">Coupons</div><button className="ibtn" onClick={() => A.loadCoupons()} title="Refresh"><Icon name="download" /></button></div>
        {S.coupons.length ? (
          <div className="tbl-wrap"><table>
            <thead><tr><th>Status</th><th>Code</th><th>Discount</th><th>Attempt</th><th>Courses</th><th>Used</th><th>Expires</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>{S.coupons.map((cp) => (
              <tr key={cp.id}>
                <td><Pill kind={cp.status === 'active' ? 'ok' : 'mut'} dot={cp.status === 'active'}>{cp.status}</Pill></td>
                <td><span className="examtag" style={{ background: cp.type === 'percentage' ? 'var(--qa)' : 'var(--dilr)', marginRight: 7 }}>{cp.type}</span><span className="cellname">{cp.code}</span></td>
                <td className="cellname">{couponValue(cp)}</td>
                <td className="cellsub">{ATTEMPTLABEL[cp.attempt] || cp.attempt}</td>
                <td>{courses(cp)}</td>
                <td className="cellsub">{cp.used} / {cp.maxTotal || '∞'}</td>
                <td className="cellsub">{fmtExpiry(cp.validUntil)}</td>
                <td><div className="rowacts">
                  <button className="ibtn" onClick={() => A.toggleCoupon(cp.id)} title={cp.status === 'active' ? 'Deactivate' : 'Activate'}><Icon name={cp.status === 'active' ? 'x' : 'check'} /></button>
                  <button className="ibtn" onClick={() => openModal(<CouponModal coupon={cp} />)} title="Edit"><Icon name="edit" /></button>
                  <button className="ibtn del" onClick={() => openModal(<ConfirmDelete what={cp.code} onYes={() => A.delCoupon(cp.id)} />)} title="Delete"><Icon name="trash" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : (
          <Empty icon="clip" title="No coupons yet" text="Create your first discount code using the form above." />
        )}
      </div>
    </>
  );
}
