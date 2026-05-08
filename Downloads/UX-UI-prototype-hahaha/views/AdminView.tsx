// AdminView — ported from mris/screens.jsx
import React, { useState } from 'react';
import Icon from '../components/Icon';
import { StatCard } from '../components/Modal';
import { USERS, PLOTS, TREES, IMPORT_HISTORY, CATEGORIES } from '../data';

const AdminView: React.FC = () => {
  const [tab, setTab] = useState('users');

  return (
    <div className="p-6 md:p-8 h-full overflow-auto scroll-thin">
      <div className="chip chip-ok">Admin</div>
      <h1 className="text-3xl font-bold mt-2">การจัดการระบบ</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <StatCard label="ผู้ใช้งาน" value={USERS.length} />
        <StatCard label="แปลง" value={PLOTS.length} />
        <StatCard label="ต้นไม้" value={TREES.length.toLocaleString()} />
        <StatCard label="การนำเข้า" value={IMPORT_HISTORY.length} />
      </div>
      <div className="card mt-6">
        <div className="border-b border-stone-200 flex">
          {[{ id: 'users', th: 'ผู้ใช้งาน' }, { id: 'imports', th: 'ประวัติการนำเข้า' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 font-semibold text-sm border-b-2 ${tab === t.id ? 'border-[var(--mris-brand-600)] text-[var(--mris-brand-700)]' : 'border-transparent text-stone-500'}`}>
              {t.th}
            </button>
          ))}
        </div>
        {tab === 'users' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-stone-500">จัดการสิทธิ์และข้อมูลผู้ใช้งาน</div>
              <button className="mris-btn"><Icon name="plus" size={14} /> เพิ่มผู้ใช้ใหม่</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-stone-100 uppercase text-[11px]">
                <tr>{['username', 'full_name', 'role', 'created_at', 'actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {USERS.map(u => (
                  <tr key={u.user_id} className="hover:bg-stone-50">
                    <td className="px-3 py-2.5 font-bold">{u.username}</td>
                    <td className="px-3 py-2.5">{u.full_name}</td>
                    <td className="px-3 py-2.5">
                      <span className={`chip ${u.role === 'admin' ? 'chip-err' : u.role === 'surveyor' ? 'chip-ok' : 'chip-info'}`}>{u.role}</span>
                    </td>
                    <td className="px-3 py-2.5 text-stone-500">{u.created_at}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1">
                        <button className="p-1.5 hover:bg-amber-50 rounded text-stone-400 hover:text-amber-600"><Icon name="edit" size={14} /></button>
                        <button className="p-1.5 hover:bg-red-50 rounded text-stone-400 hover:text-red-600"><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'imports' && (
          <div className="p-5">
            <table className="w-full text-sm">
              <thead className="bg-stone-100 uppercase text-[11px]">
                <tr>{['id', 'file', 'category', 'total', 'passed', 'soft', 'hard', 'by', 'at'].map(h => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {IMPORT_HISTORY.map(h => (
                  <tr key={h.id} className="hover:bg-stone-50">
                    <td className="px-3 py-2.5">{h.id}</td>
                    <td className="px-3 py-2.5">{h.file}</td>
                    <td className="px-3 py-2.5">{CATEGORIES.find(c => c.id === h.cat)?.th}</td>
                    <td className="px-3 py-2.5">{h.total}</td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--mris-brand-700)' }}>{h.passed}</td>
                    <td className="px-3 py-2.5 text-amber-600">{h.soft}</td>
                    <td className="px-3 py-2.5 text-red-600">{h.hard}</td>
                    <td className="px-3 py-2.5">{h.by}</td>
                    <td className="px-3 py-2.5 text-stone-500">{h.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;
