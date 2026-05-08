// ExportView — ported from mris/screens.jsx
import React, { useState } from 'react';
import Icon from '../components/Icon';
import { PLOTS, CATEGORIES, TREES, YEARS } from '../data';

const Field2: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block"><span className="text-[11px] font-semibold text-stone-600">{label}</span><div className="mt-1">{children}</div></label>
);

const ExportView: React.FC = () => {
  const [plot, setPlot] = useState('');
  const [cat, setCat] = useState('');
  const [year, setYear] = useState('');
  const filtered = TREES.filter(t => (!plot || t.plot_code === plot) && (!cat || t.category === cat));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto h-full overflow-auto scroll-thin">
      <div className="mb-6">
        <div className="chip chip-ok">Export</div>
        <h1 className="text-3xl font-bold mt-2">ส่งออกข้อมูล (Long Format)</h1>
        <p className="text-stone-600 text-sm mt-1">เลือกแปลงและกลุ่มพืชที่ต้องการส่งออกเป็นไฟล์ .xlsx หรือ .csv</p>
      </div>
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field2 label="Plot">
            <select className="mris-input" value={plot} onChange={e => setPlot(e.target.value)}>
              <option value="">ทั้งหมด</option>
              {PLOTS.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
            </select>
          </Field2>
          <Field2 label="Subtype">
            <select className="mris-input" value={cat} onChange={e => setCat(e.target.value)}>
              <option value="">ทั้งหมด</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.th}</option>)}
            </select>
          </Field2>
          <Field2 label="Year">
            <select className="mris-input" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">ทั้งหมด</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field2>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button className="mris-btn"><Icon name="download" size={14} /> Export .xlsx</button>
          <button className="mris-btn-ghost mris-btn"><Icon name="sheet" size={14} /> Export CSV (UTF-8)</button>
          <button className="mris-btn-ghost mris-btn"><Icon name="eye" size={14} /> Preview</button>
          <span className="ml-auto self-center chip chip-info">{filtered.length.toLocaleString()} rows</span>
        </div>
      </div>
      <div className="card p-5 mt-4">
        <h3 className="font-bold mb-3">ตัวอย่าง 10 แถวแรก</h3>
        <div className="overflow-auto scroll-thin">
          <table className="w-full text-xs">
            <thead className="bg-stone-100 uppercase">
              <tr>{['tree_code', 'plot_code', 'species', 'survey_year', 'survival_status', 'rcd_cm', 'height_m', 'remark'].map(h => (
                <th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>
              ))}</tr>
            </thead>
            <tbody>{filtered.slice(0, 10).map(t => (
              <tr key={t.id} className="border-b border-stone-100">
                <td className="px-2 py-1.5">{t.tree_code}</td>
                <td className="px-2 py-1.5">{t.plot_code}</td>
                <td className="px-2 py-1.5">{t.species_name}</td>
                <td className="px-2 py-1.5">2570</td>
                <td className="px-2 py-1.5">{t.status === 'alive' ? 'true' : 'false'}</td>
                <td className="px-2 py-1.5">{t.rcd_cm ?? ''}</td>
                <td className="px-2 py-1.5">{t.height_m ?? ''}</td>
                <td className="px-2 py-1.5">{t.notes}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportView;
