import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../components/Icon';
import { TreeRecord } from '../types';
import { PLOTS, CATEGORIES } from '../data';

interface FieldProps { label: string; value: string | number; chip?: string; full?: boolean; mono?: boolean; }
const Field: React.FC<FieldProps> = ({ label, value, chip, full, mono }) => (
  <div className={full ? 'col-span-2' : ''}>
    <div className="text-[10px] uppercase tracking-wider text-stone-500">{label}</div>
    <div className={`mt-0.5 ${mono ? 'font-mono' : ''}`}>
      {chip ? <span className={`chip ${chip}`}>{value}</span> : <span className="text-stone-800">{value}</span>}
    </div>
  </div>
);

interface MapViewProps {
  trees: TreeRecord[];
  focus: { tree: TreeRecord; ts: number } | null;
  onEdit: (tree: TreeRecord) => void;
}

const MapView: React.FC<MapViewProps> = ({ trees, focus, onEdit }) => {
  const [plotCode, setPlotCode] = useState(() => focus?.tree?.plot_code || PLOTS[0].code);
  const [colorMode, setColorMode] = useState<'status' | 'species'>('status');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const [focusTreeId, setFocusTreeId] = useState<number | null>(focus?.tree?.id || null);
  const [imgError, setImgError] = useState(false);

  const plotIdx = PLOTS.findIndex(p => p.code === plotCode);
  const plotTrees = useMemo(() => trees.filter(t => t.plot_code === plotCode), [trees, plotCode]);
  const focusedTree = trees.find(t => t.id === focusTreeId) || null;

  useEffect(() => {
    if (focus?.tree) {
      setPlotCode(focus.tree.plot_code);
      setFocusTreeId(focus.tree.id);
    }
  }, [focus?.ts]);

  useEffect(() => { setImgError(false); }, [plotCode]);

  return (
    <div className="relative h-full w-full bg-stone-900 overflow-hidden">

      {/* Map image */}
      {imgError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-800">
          <span className="text-stone-400 text-sm">ยังไม่มีภาพ</span>
        </div>
      ) : (
        <img
          key={plotCode}
          src={`/plots/${PLOTS[plotIdx]?.short ?? plotCode}/tree_map.png`}
          alt={`แผนที่แปลง ${plotCode}`}
          className="absolute inset-0 w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      )}

      {/* Top bar */}
      <div className="absolute top-3 left-3 right-3 flex items-start gap-2 z-[500] pointer-events-none">
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-1.5 flex items-center gap-1 pointer-events-auto">
          <button title="ก่อนหน้า" onClick={() => { const i = PLOTS.findIndex(p => p.code === plotCode); if (i > 0) setPlotCode(PLOTS[i - 1].code); }}
            className="p-2 hover:bg-stone-100 rounded-lg disabled:opacity-30" disabled={plotIdx <= 0}>
            <Icon name="chevron_left" size={16} />
          </button>
          <select value={plotCode} onChange={e => setPlotCode(e.target.value)}
            className="px-3 py-1.5 text-sm font-semibold bg-transparent outline-none cursor-pointer">
            {PLOTS.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
          </select>
          <button title="ถัดไป" onClick={() => { const i = PLOTS.findIndex(p => p.code === plotCode); if (i < PLOTS.length - 1) setPlotCode(PLOTS[i + 1].code); }}
            className="p-2 hover:bg-stone-100 rounded-lg disabled:opacity-30" disabled={plotIdx >= PLOTS.length - 1}>
            <Icon name="chevron_right" size={16} />
          </button>
        </div>
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg px-3 py-2 text-xs flex items-center gap-3 pointer-events-auto">
          <div><span className="text-stone-500">ต้นทั้งหมด</span> <b className="ml-1">{plotTrees.length}</b></div>
          <div className="w-px h-4 bg-stone-200" />
          <div><span className="text-stone-500">รอด</span> <b className="ml-1" style={{ color: 'var(--mris-brand-700)' }}>{plotTrees.filter(t => t.status === 'alive').length}</b></div>
          <div><span className="text-stone-500">ตาย</span> <b className="ml-1 text-red-600">{plotTrees.filter(t => t.status === 'dead').length}</b></div>
          {selectedIds.size > 0 && <>
            <div className="w-px h-4 bg-stone-200" />
            <div><span className="text-stone-500">เลือก</span> <b className="ml-1" style={{ color: 'var(--mris-brand-700)' }}>{selectedIds.size}</b></div>
            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-red-600 hover:underline">ยกเลิก</button>
          </>}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 z-[500] text-xs">
        <div className="font-bold uppercase tracking-[.16em] text-stone-500 mb-2 text-[10px]">Legend</div>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setColorMode('status')}
            className={`px-2 py-1 rounded text-[11px] ${colorMode === 'status' ? 'bg-[var(--mris-brand-700)] text-white' : 'bg-stone-100'}`}>สถานะ</button>
          <button onClick={() => setColorMode('species')}
            className={`px-2 py-1 rounded text-[11px] ${colorMode === 'species' ? 'bg-[var(--mris-brand-700)] text-white' : 'bg-stone-100'}`}>ชนิดพืช</button>
        </div>
        {colorMode === 'status' ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#3f8a56' }} />รอด</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#f6b400' }} />ติดดอก/ผล</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: '#c0392b' }} />ตาย</div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {CATEGORIES.map(c => (
              <div key={c.id} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: c.color }} />{c.th}</div>
            ))}
          </div>
        )}
      </div>

      {/* Focused tree popover */}
      {focusedTree && (
        <div className="absolute top-20 right-3 w-80 card shadow-2xl z-[700] anim-in">
          <div className="px-4 py-3 border-b border-stone-200 flex items-start justify-between" style={{ background: 'var(--mris-brand-50)' }}>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-stone-500">Tree</div>
              <div className="font-bold text-base" style={{ color: 'var(--mris-brand-800)' }}>{focusedTree.tree_code}</div>
              <div className="text-xs text-stone-600 mt-0.5">{focusedTree.species_name} · #{focusedTree.tree_number}</div>
            </div>
            <button onClick={() => setFocusTreeId(null)} className="p-1 hover:bg-white/60 rounded"><Icon name="x" size={16} /></button>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 text-xs">
            <Field label="แปลง" value={focusedTree.plot_code} />
            <Field label="ต้นที่" value={focusedTree.tree_number} />
            <Field label="สถานะ" value={focusedTree.status === 'alive' ? 'รอด' : 'ตาย'} chip={focusedTree.status === 'alive' ? 'chip-ok' : 'chip-err'} />
            <Field label="ติดดอก/ผล" value={focusedTree.flowering === 'yes' ? 'มี' : '—'} />
            <Field label="RCD" value={focusedTree.rcd_cm ? focusedTree.rcd_cm + ' cm' : '—'} mono />
            <Field label="สูง" value={focusedTree.height_m ? focusedTree.height_m + ' m' : '—'} mono />
            <Field label="UTM E" value={focusedTree.utm_x} mono />
            <Field label="UTM N" value={focusedTree.utm_y} mono />
            <Field label="ผู้บันทึก" value={focusedTree.recorder} full />
            <Field label="วันที่สำรวจ" value={focusedTree.survey_date} full />
            {focusedTree.notes && <Field label="หมายเหตุ" value={focusedTree.notes} full />}
          </div>
          <div className="px-4 py-3 border-t border-stone-200 bg-stone-50 flex gap-2">
            <button className="mris-btn flex-1" onClick={() => onEdit(focusedTree)}>
              <Icon name="edit" size={14} /> แก้ไขข้อมูล
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
