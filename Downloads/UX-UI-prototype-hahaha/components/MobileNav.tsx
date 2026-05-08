
import React from 'react';
import { ClipboardList, BarChart3, UploadCloud } from 'lucide-react';
import { ViewType } from '../types';

interface MobileNavProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

const MobileNavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors active:scale-95 ${
      active ? 'bg-[var(--mris-brand-50)] text-[var(--mris-brand-700)]' : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    <div className={active ? 'text-[var(--mris-brand-600)]' : 'text-gray-400'}>{icon}</div>
    <span className="text-[9px] font-medium mt-1 whitespace-nowrap">{label}</span>
  </button>
);

const MobileNav: React.FC<MobileNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[3000] flex overflow-x-auto no-scrollbar shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <MobileNavButton active={activeView === 'import'} onClick={() => setActiveView('import')} icon={<UploadCloud size={20} />} label="นำเข้า" />
      <MobileNavButton active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<BarChart3 size={20} />} label="สถิติ" />
      <MobileNavButton active={activeView === 'table'} onClick={() => setActiveView('table')} icon={<ClipboardList size={20} />} label="ตาราง" />
    </nav>
  );
};

export default MobileNav;
