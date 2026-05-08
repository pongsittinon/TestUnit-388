
import React from 'react';
import { Trees, Loader2, RotateCcw, ClipboardList, BarChart3, UploadCloud } from 'lucide-react';
import { ViewType } from '../types';

interface HeaderProps {
  stats: { total: number; alive: number; dead: number };
  isLoading: boolean;
  onRefresh: () => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${
      active 
        ? 'text-white bg-white/5' 
        : 'text-white/60 border-transparent hover:text-white/80'
    }`}
    style={active ? { borderBottomColor: 'var(--mris-brand-200)' } : undefined}
  >
    {icon}
    {label}
  </button>
);

const Header: React.FC<HeaderProps> = ({ stats, isLoading, onRefresh, activeView, setActiveView }) => {
  return (
    <header className="text-white shadow-lg z-50 relative shrink-0" style={{ backgroundColor: 'var(--mris-brand-900)' }}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Trees size={24} style={{ color: 'var(--mris-brand-100)' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">MRIS</h1>
            <p className="text-xs text-white/70 font-light">Multipurpose Reforestation Information System</p>
            <p className="text-[10px] mt-0.5 font-light opacity-90" style={{ color: 'var(--mris-brand-100)' }}>* RCD (Root Collar Diameter) = ความโตที่ระดับคอราก</p>
          </div>
        </div>
        {/* Desktop Stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-xs text-white/60 mr-2">ทั้งหมด:</span>
            <span className="font-mono font-bold text-yellow-400">{stats.total}</span>
          </div>
          <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-xs text-white/60 mr-2">รอด:</span>
            <span className="font-mono font-bold" style={{ color: 'var(--mris-brand-100)' }}>{stats.alive}</span>
          </div>
          <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
            <span className="text-xs text-white/60 mr-2">ตาย:</span>
            <span className="font-mono font-bold text-red-400">{stats.dead}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <RotateCcw size={20} />}
          </button>
        </div>
      </div>
      {/* Desktop Navigation */}
      <nav className="border-t border-white/10 hidden md:block">
        <div className="container mx-auto px-4 flex overflow-x-auto no-scrollbar">
          <TabButton active={activeView === 'import'} onClick={() => setActiveView('import')} icon={<UploadCloud size={18} />} label="นำเข้าข้อมูล" />
          <TabButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<BarChart3 size={18} />} label="สถิติ" />
          <TabButton active={activeView === 'table'} onClick={() => setActiveView('table')} icon={<ClipboardList size={18} />} label="ตารางข้อมูล" />
        </div>
      </nav>
    </header>
  );
};

export default Header;
