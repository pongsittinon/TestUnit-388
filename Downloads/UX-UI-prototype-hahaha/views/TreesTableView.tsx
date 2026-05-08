// TreesTableView — ported from mris/screens.jsx
import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon';
import { TreeRecord, PlantCategory } from '../types';
import { PLOTS, CATEGORIES } from '../data';

interface TreesTableViewProps {
  trees: TreeRecord[];
  onEdit: (tree: TreeRecord) => void;
  onDelete: (tree: TreeRecord) => void;
  onLocateOnMap: (tree: TreeRecord) => void;
  onAdd: (cat: PlantCategory) => void;
}

const TreesTableView: React.FC<TreesTableViewProps> = ({ trees, onEdit, onDelete, onLocateOnMap, onAdd }) => {
  const [cat, setCat] = useState<PlantCategory>('forest');
  const [search, setSearch] = useState('');
  const [plot, setPlot] = useState('');
  const [statusF, setStatusF] = useState('');

  const filtered = useMemo(() => trees.filter(t =>
    t.category === cat
    && (!search || t.tree_code.toLowerCase().includes(search.toLowerCase()) || t.species_name.includes(search))
    && (!plot || t.plot_code === plot)
    && (!statusF || t.status === statusF)
  ), [trees, cat, search, plot, statusF]);

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-stone-500">จัดการข้อมูลต้นไม้รายต้นในแปลง</div>
            <button className="mris-btn" onClick={() => onAdd(cat)}><Icon name="plus" size={14} /> เพิ่มข้อมูล</button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-6 py-3 border-b border-stone-200 flex items-center gap-1 overflow-auto no-scrollbar">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 ${cat === c.id ? 'bg-[var(--mris-brand-700)] text-white' : 'hover:bg-stone-100 text-stone-600'}`}>
            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            {c.th}
            <span className={`ml-1 text-[10px] ${cat === c.id ? 'opacity-80' : 'text-stone-400'}`}>
              {trees.filter(t => t.category === c.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-stone-200 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="mris-input pl-9" placeholder="ค้นหา รหัสต้นไม้ / ชนิดพรรณไม้…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="mris-input w-auto" value={plot} onChange={e => setPlot(e.target.value)}>
          <option value="">ทุกแปลง</option>
          {PLOTS.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
        </select>
        <select className="mris-input w-auto" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">ทุกสถานะ</option>
          <option value="alive">รอด</option>
          <option value="dead">ตาย</option>
        </select>
        <span className="chip chip-info self-center">{filtered.length} รายการ</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-stone-800 text-white text-[11px] uppercase sticky top-0">
            <tr>
              <th className="px-3 py-3 text-left">รหัสต้นไม้ / ต้นที่</th>
              <th className="px-3 py-3 text-left">แปลง</th>
              <th className="px-3 py-3 text-left">ชนิดพรรณไม้</th>
              <th className="px-3 py-3 text-center">สถานะการรอดตาย</th>
              {(cat === 'forest' || cat === 'fruit' || cat === 'rubber') && <>
                <th className="px-3 py-3 text-right">RCD (ซม.)</th>
                <th className="px-3 py-3 text-right">ความสูง (ม.)</th>
                <th className="px-3 py-3 text-center">การติดดอกออกผล</th>
              </>}
              {cat === 'bamboo' && <>
                <th className="px-3 py-3 text-right">จำนวนลำ</th>
                <th className="px-3 py-3 text-right">RCD 1</th>
                <th className="px-3 py-3 text-right">RCD 2</th>
                <th className="px-3 py-3 text-right">RCD 3</th>
                <th className="px-3 py-3 text-right">สูงที่สุด</th>
              </>}
              {cat === 'banana' && <>
                <th className="px-3 py-3 text-right">จำนวนทั้งหมด</th>
                <th className="px-3 py-3 text-right">จำนวนหน่อ</th>
                <th className="px-3 py-3 text-right">จำนวนต้น</th>
                <th className="px-3 py-3 text-right">เครือ</th>
                <th className="px-3 py-3 text-right">หวี</th>
                <th className="px-3 py-3 text-right">ราคา/หวี</th>
              </>}
              {cat === 'herb' && <>
                <th className="px-3 py-3 text-right">จำนวนทั้งหมด</th>
                <th className="px-3 py-3 text-right">จำนวนหน่อแรกเกิด</th>
                <th className="px-3 py-3 text-right">ความยาวผลผลิตชุดที่ 1</th>
                <th className="px-3 py-3 text-right">ความยาวผลผลิตชุดที่ 2</th>
                <th className="px-3 py-3 text-right">ความยาวผลผลิตชุดที่ 3</th>
                <th className="px-3 py-3 text-right">ราคา/กก.</th>
              </>}
              <th className="px-3 py-3 text-left">พิกัด UTM (X/Y)</th>
              <th className="px-3 py-3 text-center bg-stone-900">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.slice(0, 200).map(t => (
              <tr key={t.id} className="hover:bg-[var(--mris-brand-50)] group">
                <td className="px-3 py-2.5">
                  <div className="font-bold" style={{ color: 'var(--mris-brand-700)' }}>{t.tree_code}</div>
                  <div className="text-[10px] text-stone-400">ต้นที่ {String(t.tree_number).padStart(3, '0')}</div>
                </td>
                <td className="px-3 py-2.5 font-semibold">{t.plot_code}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: t.color }} />
                  {t.species_name}
                  <div className="text-[10px] text-stone-400">{t.species_code}</div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={`chip ${t.status === 'alive' ? 'chip-ok' : 'chip-err'}`}>{t.status === 'alive' ? 'รอด' : 'ตาย'}</span>
                </td>
                {(cat === 'forest' || cat === 'fruit' || cat === 'rubber') && <>
                  <td className="px-3 py-2.5 text-right">{t.rcd_cm ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.height_m ?? '—'}</td>
                  <td className="px-3 py-2.5 text-center">{t.flowering === 'yes' ? '🌸' : '—'}</td>
                </>}
                {cat === 'bamboo' && <>
                  <td className="px-3 py-2.5 text-right font-bold">{t.culm_count ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.rcd_cm_1 ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.rcd_cm_2 ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.rcd_cm_3 ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.height_m ?? '—'}</td>
                </>}
                {cat === 'banana' && <>
                  <td className="px-3 py-2.5 text-right">{t.total_count ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.sucker_count ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.plant_count ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.productivity_bunches ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.productivity_combs ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.price_per_comb ?? '—'}</td>
                </>}
                {cat === 'herb' && <>
                  <td className="px-3 py-2.5 text-right">{t.total_count ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.new_shoot_count ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.produce_length_1_cm ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.produce_length_2_cm ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.produce_length_3_cm ?? '—'}</td>
                  <td className="px-3 py-2.5 text-right">{t.price_per_kg ?? '—'}</td>
                </>}
                <td className="px-3 py-2.5 text-[11px] text-stone-500">
                  <div>{t.utm_x}</div><div>{t.utm_y}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onLocateOnMap(t)} title="ดูบนแผนที่"
                      className="p-1.5 text-stone-400 hover:text-[var(--mris-brand-700)] hover:bg-[var(--mris-brand-50)] rounded">
                      <Icon name="map" size={14} />
                    </button>
                    <button onClick={() => onEdit(t)} title="แก้ไข"
                      className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded">
                      <Icon name="edit" size={14} />
                    </button>
                    <button onClick={() => onDelete(t)} title="ลบ"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={20} className="py-16 text-center text-stone-400">ไม่พบข้อมูลในกลุ่มนี้</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 200 && (
          <div className="text-center py-4 text-xs text-stone-500">แสดง 200 จาก {filtered.length} รายการ — ใช้ตัวกรองเพื่อเจาะข้อมูล</div>
        )}
      </div>
    </div>
  );
};

export default TreesTableView;
