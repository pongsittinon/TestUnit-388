// TopBar — ported from mris/app.jsx
import React from 'react';
import Icon from './Icon';
import { ViewType } from '../types';
import { NAV } from './Sidebar';

const apiMap: Record<string, string> = {
  dashboard: 'GET /api/dashboard/*',
  map: 'GET /api/map/orthophoto + /api/trees',
  trees: 'GET /api/trees/{group}',
  import: 'POST /api/import/{group}',
  export: 'GET /api/Export',
  admin: 'GET /api/admin/*',
};

interface TopBarProps {
  active: ViewType;
  onCmdK: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ active, onCmdK }) => {
  const cur = NAV.find(n => n.id === active);
  return (
    <header className="flex-shrink-0 h-14 bg-white border-b border-stone-200 flex items-center px-5 gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-stone-400">MRIS</span>
        <Icon name="chevron_right" size={12} className="text-stone-300" />
        <span className="font-semibold">{cur?.th}</span>
      </div>
      <div className="flex-1" />
      <button onClick={onCmdK} className="flex items-center gap-2 text-xs text-stone-500 px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50">
        <Icon name="search" size={12} />
        <span>ค้นหา รหัสต้นไม้, แปลง, ชนิดพรรณไม้</span>
        <kbd className="ml-2 px-1.5 py-0.5 bg-stone-100 rounded text-[10px]">⌘K</kbd>
      </button>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"><Icon name="bell" size={16} /></button>
        <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"><Icon name="settings" size={16} /></button>
      </div>
    </header>
  );
};

export default TopBar;
