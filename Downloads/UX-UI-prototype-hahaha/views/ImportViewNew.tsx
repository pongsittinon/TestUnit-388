// ImportViewNew — ported from mris/screens.jsx
import React, { useState, useRef, useMemo } from 'react';
import Icon from '../components/Icon';
import { CATEGORIES, TREES } from '../data';

const Field2: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block"><span className="text-[11px] font-semibold text-stone-600">{label}</span><div className="mt-1">{children}</div></label>
);

// --- Validation Grid ---
interface ValidationGridProps {
  cat: string;
  fileName: string;
  onBack: () => void;
  onSubmit: () => void;
}

const ValidationGrid: React.FC<ValidationGridProps> = ({ cat, fileName, onBack, onSubmit }) => {
  const sample = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const t = TREES[i + 5];
      const errType = i === 2 ? 'hard' : i === 6 || i === 10 ? 'soft' : 'pass';
      return {
        no: String(i + 1).padStart(3, '0'),
        tree_code: t.tree_code,
        plot_code: t.plot_code,
        subtype_name: t.species_name,
        survival: t.status === 'alive' ? 'รอด' : 'ตาย',
        rcd: t.rcd_cm ?? '-',
        height: t.height_m ?? '-',
        notes: errType === 'soft' ? 'ต้องการเหตุผลตรวจสอบ' : '',
        error_type: errType,
        message: errType === 'hard' ? 'tree_code ซ้ำกับระบบ' : errType === 'soft' ? 'height ต่ำกว่าเกณฑ์' : '',
      };
    });
  }, [cat]);
  const hard = sample.filter(r => r.error_type === 'hard').length;
  const soft = sample.filter(r => r.error_type === 'soft').length;
  const pass = sample.filter(r => r.error_type === 'pass').length;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="sheet" size={18} />
        <div className="text-sm">{fileName}</div>
        <span className="chip chip-info">{sample.length} rows · {CATEGORIES.find(c => c.id === cat)?.th}</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card p-3 border-l-4 border-red-500"><div className="text-xs text-stone-500">Hard errors</div><div className="text-2xl font-bold text-red-600">{hard}</div></div>
        <div className="card p-3 border-l-4 border-amber-500"><div className="text-xs text-stone-500">Soft warnings</div><div className="text-2xl font-bold text-amber-600">{soft}</div></div>
        <div className="card p-3 border-l-4 border-[var(--mris-brand-600)]"><div className="text-xs text-stone-500">Passed</div><div className="text-2xl font-bold" style={{ color: 'var(--mris-brand-700)' }}>{pass}</div></div>
      </div>
      <div className="overflow-auto border border-stone-200 rounded-xl scroll-thin max-h-[420px]">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 text-[11px] uppercase sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">no</th>
              <th className="px-3 py-2 text-left">tree_code</th>
              <th className="px-3 py-2 text-left">plot</th>
              <th className="px-3 py-2 text-left">subtype</th>
              <th className="px-3 py-2 text-center">survival</th>
              <th className="px-3 py-2 text-right">rcd</th>
              <th className="px-3 py-2 text-right">height</th>
              <th className="px-3 py-2 text-left">message</th>
              <th className="px-3 py-2 text-left">notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sample.map(r => (
              <tr key={r.no} className={r.error_type === 'hard' ? 'bg-red-50' : r.error_type === 'soft' ? 'bg-amber-50' : ''}>
                <td className="px-3 py-2">{r.no}</td>
                <td className="px-3 py-2">{r.tree_code}</td>
                <td className="px-3 py-2">{r.plot_code}</td>
                <td className="px-3 py-2">{r.subtype_name}</td>
                <td className="px-3 py-2 text-center"><span className={`chip ${r.survival === 'รอด' ? 'chip-ok' : 'chip-err'}`}>{r.survival}</span></td>
                <td className="px-3 py-2 text-right">{r.rcd}</td>
                <td className="px-3 py-2 text-right">{r.height}</td>
                <td className="px-3 py-2 text-xs">
                  {r.error_type === 'hard' && <span className="chip chip-err">hard · {r.message}</span>}
                  {r.error_type === 'soft' && <span className="chip chip-warn">soft · {r.message}</span>}
                  {r.error_type === 'pass' && <span className="chip chip-ok">pass</span>}
                </td>
                <td className="px-3 py-2 text-xs">
                  {r.error_type === 'soft' ? <input className="mris-input text-xs" placeholder="ระบุเหตุผล…" /> : <span className="text-stone-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button className="mris-btn-ghost mris-btn" onClick={onBack}><Icon name="chevron_left" size={14} /> ย้อนกลับ</button>
        <button className="mris-btn" disabled={hard > 0} onClick={onSubmit}>
          <Icon name="save" size={14} /> บันทึกเข้าระบบ ({pass + soft})
        </button>
      </div>
      {hard > 0 && <div className="mt-3 chip chip-err">ต้องแก้ hard errors ก่อนจึงจะบันทึกได้ — ดาวน์โหลดไฟล์ใหม่หรือกลับไปแก้</div>}
    </div>
  );
};

// --- Import Screen ---
const ImportViewNew: React.FC = () => {
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto h-full overflow-auto scroll-thin">
      <div className="mb-6">
        <div className="chip chip-ok">Bulk Import</div>
        <h1 className="text-3xl font-bold mt-2">นำเข้าข้อมูลจากไฟล์</h1>
        <p className="text-stone-600 text-sm mt-1">รองรับ .xlsx / .csv สูงสุด 500 แถว/ครั้ง</p>
      </div>

      <div className="card overflow-hidden">
        {/* Stepper */}
        <div className="grid grid-cols-3 border-b border-stone-200">
          {[
            { n: 1, label: 'เลือกกลุ่ม + ไฟล์' },
            { n: 2, label: 'Validation Grid' },
            { n: 3, label: 'บันทึกเข้าระบบ' },
          ].map(s => (
            <div key={s.n} className={`px-5 py-4 flex items-center gap-3 ${step >= s.n ? 'bg-[var(--mris-brand-50)]' : 'bg-white'} ${s.n < 3 ? 'border-r border-stone-200' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.n ? 'bg-[var(--mris-brand-700)] text-white' : 'bg-stone-200 text-stone-500'}`}>
                {step > s.n ? <Icon name="check" size={14} /> : s.n}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-stone-500">Step {s.n}</div>
                <div className="font-semibold text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">1. เลือกกลุ่มพืช <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCat(c.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${cat === c.id ? 'border-[var(--mris-brand-600)] bg-[var(--mris-brand-50)]' : 'border-stone-200 hover:border-stone-300'}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                      <span className="font-semibold">{c.th}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">2. แนบไฟล์ <span className="text-red-500">*</span></label>
              <div onClick={() => cat && fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${!cat ? 'opacity-50 cursor-not-allowed bg-stone-50' : 'cursor-pointer hover:bg-[var(--mris-brand-50)]'}`}>
                <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white" style={{ background: 'var(--mris-brand-900)' }}>
                  <Icon name="upload" size={28} />
                </div>
                <div className="mt-4 font-bold text-lg">{file ? file.name : 'ลากไฟล์มาวางที่นี่ หรือคลิกเลือก'}</div>
                <div className="text-xs text-stone-500 mt-1">{!cat ? 'กรุณาเลือกกลุ่มพืชก่อน' : 'รองรับ .xlsx / .csv'}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="mris-btn" disabled={!cat || !file} onClick={() => setStep(2)}>
                ถัดไป: ตรวจสอบข้อมูล <Icon name="chevron_right" size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && <ValidationGrid cat={cat} fileName={file?.name || 'demo.xlsx'} onBack={() => setStep(1)} onSubmit={() => setStep(3)} />}

        {step === 3 && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white" style={{ background: 'var(--mris-brand-700)' }}>
              <Icon name="check" size={40} />
            </div>
            <h3 className="font-bold text-2xl mt-4">บันทึกเรียบร้อย</h3>
            <p className="text-stone-600 mt-2">เพิ่ม 142 รายการ · ข้าม 3 รายการ · กลุ่ม {CATEGORIES.find(c => c.id === cat)?.th}</p>
            <button className="mris-btn mt-6" onClick={() => { setStep(1); setFile(null); setCat(''); }}>นำเข้าครั้งใหม่</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportViewNew;
