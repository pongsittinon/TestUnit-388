// TreeEditDrawer — ported from mris/screens.jsx
import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { TreeRecord, PlantCategory } from '../types';
import { PLOTS, SPECIES } from '../data';

interface TreeEditDrawerProps {
  tree: TreeRecord | null;
  open: boolean;
  onClose: () => void;
  onSave: (draft: Partial<TreeRecord> & { id: number | null; category: PlantCategory }) => void;
  defaultCat: PlantCategory;
}

function makeBlank(cat: PlantCategory): Record<string, any> {
  return {
    id: null, tree_code: '', plot_code: '', species_code: '', tree_number: '',
    rcd_cm: '', height_m: '', status: 'alive', flowering: 'no', notes: '', recorder: '', survey_date: '2570-11-15',
    utm_x: '', utm_y: '', category: cat || 'forest', species_name: '', spacing: '3x4.5',
  };
}

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div><div className="text-[11px] font-bold uppercase tracking-[.16em] text-stone-500 mb-2">{label}</div>{children}</div>
);

const Field2: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block"><span className="text-[11px] font-semibold text-stone-600">{label}</span><div className="mt-1">{children}</div></label>
);

const TreeEditDrawer: React.FC<TreeEditDrawerProps> = ({ tree, open, onClose, onSave, defaultCat }) => {
  const [draft, setDraft] = useState<Record<string, any>>(() => tree || makeBlank(defaultCat));

  useEffect(() => {
    setDraft(tree || makeBlank(defaultCat));
  }, [tree, defaultCat, open]);

  if (!open) return null;
  const isEdit = !!tree?.id;

  function set(k: string, v: any) { setDraft({ ...draft, [k]: v }); }

  return (
    <div className="fixed inset-y-0 right-0 z-[8500] w-full md:w-[480px] bg-white shadow-2xl flex flex-col anim-in border-l border-stone-200">
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between" style={{ background: isEdit ? '#fff7e6' : 'var(--mris-brand-50)' }}>
        <div>
          <h3 className="font-bold text-lg">{isEdit ? 'แก้ไขข้อมูลต้นไม้' : 'บันทึกต้นไม้ใหม่'}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded"><Icon name="x" /></button>
      </div>
      <div className="flex-1 overflow-auto scroll-thin p-5 space-y-4">
        <Section label="📍 ข้อมูลแปลง">
          <div className="grid grid-cols-2 gap-3">
            <Field2 label="แปลง">
              <select className="mris-input" value={draft.plot_code} onChange={e => set('plot_code', e.target.value)}>
                <option value="">—</option>
                {PLOTS.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
              </select>
            </Field2>
            <Field2 label="ชนิดไม้">
              <select className="mris-input" value={draft.species_code} onChange={e => {
                const sp = SPECIES.find(s => s.code === e.target.value);
                setDraft({ ...draft, species_code: e.target.value, species_name: sp?.name || '', category: sp?.cat || draft.category });
              }}>
                <option value="">—</option>
                {SPECIES.map(s => <option key={s.code} value={s.code}>{s.code} · {s.name}</option>)}
              </select>
            </Field2>
            <Field2 label="หมายเลขต้น"><input className="mris-input" value={draft.tree_number} onChange={e => set('tree_number', e.target.value)} /></Field2>
            <Field2 label="ระยะปลูก"><input className="mris-input" value={draft.spacing} onChange={e => set('spacing', e.target.value)} /></Field2>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs">
            <div className="text-stone-500">tree_code (auto)</div>
            <div className="font-bold" style={{ color: 'var(--mris-brand-800)' }}>
              {(draft.plot_code && draft.species_code && draft.tree_number)
                ? `${draft.plot_code}${draft.species_code}${String(draft.tree_number).padStart(3, '0')}`
                : '—'}
            </div>
          </div>
        </Section>

        <Section label="📐 พิกัด UTM (utm_x, utm_y)">
          <div className="grid grid-cols-2 gap-3">
            <Field2 label="UTM E"><input className="mris-input" value={draft.utm_x} onChange={e => set('utm_x', e.target.value)} /></Field2>
            <Field2 label="UTM N"><input className="mris-input" value={draft.utm_y} onChange={e => set('utm_y', e.target.value)} /></Field2>
          </div>
          <button className="mt-2 mris-btn-ghost mris-btn text-xs"><Icon name="crosshair" size={12} /> ปักจากแผนที่</button>
        </Section>

        <Section label="📏 ข้อมูลการเจริญ">
          <div className="grid grid-cols-2 gap-3">
            <Field2 label="สถานะ">
              <div className="flex gap-2">
                {(['alive', 'dead'] as const).map(s => (
                  <button key={s} onClick={() => set('status', s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold ${draft.status === s ? (s === 'alive' ? 'bg-[var(--mris-brand-700)] text-white' : 'bg-red-600 text-white') : 'bg-stone-100 text-stone-600'}`}>
                    {s === 'alive' ? 'รอด' : 'ตาย'}
                  </button>
                ))}
              </div>
            </Field2>
            <Field2 label="ติดดอก/ผล">
              <div className="flex gap-2">
                {(['yes', 'no'] as const).map(s => (
                  <button key={s} onClick={() => set('flowering', s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold ${draft.flowering === s ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    {s === 'yes' ? 'มี' : 'ไม่มี'}
                  </button>
                ))}
              </div>
            </Field2>
            <Field2 label="RCD (cm)"><input className="mris-input" value={draft.rcd_cm || ''} onChange={e => set('rcd_cm', e.target.value)} /></Field2>
            <Field2 label="สูง (m)"><input className="mris-input" value={draft.height_m || ''} onChange={e => set('height_m', e.target.value)} /></Field2>
          </div>
        </Section>

        <Section label="📝 หมายเหตุ / ผู้บันทึก">
          <Field2 label="หมายเหตุ"><textarea className="mris-input" rows={2} value={draft.notes || ''} onChange={e => set('notes', e.target.value)} /></Field2>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Field2 label="ผู้บันทึก"><input className="mris-input" value={draft.recorder} onChange={e => set('recorder', e.target.value)} /></Field2>
            <Field2 label="วันที่สำรวจ"><input type="date" className="mris-input" value={draft.survey_date} onChange={e => set('survey_date', e.target.value)} /></Field2>
          </div>
        </Section>
      </div>
      <div className="px-5 py-4 border-t border-stone-200 bg-stone-50 flex gap-2">
        <button className="mris-btn-ghost mris-btn flex-1" onClick={onClose}>ยกเลิก</button>
        <button className="mris-btn flex-1" onClick={() => onSave(draft as any)}><Icon name="save" size={14} /> {isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}</button>
      </div>
    </div>
  );
};

export default TreeEditDrawer;
