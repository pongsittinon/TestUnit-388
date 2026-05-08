// CmdK — Command palette — ported from mris/app.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Icon from './Icon';
import { TreeRecord } from '../types';

interface CmdKProps {
  open: boolean;
  onClose: () => void;
  onSelect: (tree: TreeRecord) => void;
  trees: TreeRecord[];
}

const CmdK: React.FC<CmdKProps> = ({ open, onClose, onSelect, trees }) => {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const matches = useMemo(() => {
    if (!q) return trees.slice(0, 8);
    const ql = q.toLowerCase();
    return trees
      .filter(t =>
        t.tree_code.toLowerCase().includes(ql) ||
        t.species_name.includes(q) ||
        t.plot_code.toLowerCase().includes(ql)
      )
      .slice(0, 12);
  }, [q, trees]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9000] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[640px] max-w-[90vw] overflow-hidden anim-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
          <Icon name="search" size={16} className="text-stone-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="พิมพ์ tree_code, แปลง, ชนิดไม้…"
            className="flex-1 outline-none text-sm"
          />
          <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-[10px]">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-auto scroll-thin">
          {matches.length === 0 && (
            <div className="p-8 text-center text-stone-400 text-sm">ไม่พบรายการที่ตรงกับ "{q}"</div>
          )}
          {matches.map(t => (
            <button
              key={t.id}
              onClick={() => { onSelect(t); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--mris-brand-50)] border-b border-stone-100 text-left"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: t.color + '33', color: t.color }}
              >
                <Icon name="leaf" size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: 'var(--mris-brand-800)' }}>{t.tree_code}</div>
                <div className="text-xs text-stone-500 truncate">{t.species_name} · {t.plot_code} · row {t.row_main}{t.row_sub}</div>
              </div>
              <Icon name="map" size={14} className="text-stone-400" />
            </button>
          ))}
        </div>
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
          <span>↵ เปิดบนแผนที่</span>
          <span>{matches.length} รายการ</span>
        </div>
      </div>
    </div>
  );
};

export default CmdK;
