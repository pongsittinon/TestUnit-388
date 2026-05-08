// Sidebar — ported from mris/app.jsx
import React from 'react';
import Icon from './Icon';
import { ViewType, NavItem as NavItemType, SessionUser } from '../types';

const NAV: NavItemType[] = [
  { id: 'dashboard', th: 'หน้าสรุปข้อมูล', icon: 'gauge', group: 'main' },
  { id: 'map', th: 'แผนที่ผังปลูก', icon: 'map', group: 'main' },
  { id: 'trees', th: 'ตารางต้นไม้', icon: 'list', group: 'main' },
  { id: 'import', th: 'นำเข้าข้อมูล', icon: 'upload', group: 'data' },
  { id: 'export', th: 'ส่งออกข้อมูล', icon: 'download', group: 'data' },
  { id: 'admin', th: 'การจัดการระบบ', icon: 'shield', group: 'sys' },
];

interface NavItemProps {
  item: NavItemType;
  active: boolean;
  onClick: () => void;
  collapsed: boolean;
}

const NavItemButton: React.FC<NavItemProps> = ({ item, active, onClick, collapsed }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
        ? 'bg-[var(--mris-brand-500)] text-white shadow-md shadow-black/20'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`}
      title={collapsed ? item.th : ''}
    >
      <Icon name={item.icon} size={18} />
      {!collapsed && <span>{item.th}</span>}
    </button>
  );
};

interface SidebarProps {
  active: ViewType;
  onSelect: (view: ViewType) => void;
  user: SessionUser;
  onLogout: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onSelect, user, onLogout, collapsed, onToggle }) => {
  return (
    <aside className={`flex-shrink-0 transition-all duration-300 bg-[var(--mris-brand-950)] text-white flex flex-col ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--mris-brand-500)] flex items-center justify-center flex-shrink-0">
          <Icon name="leaf" size={20} />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="font-bold tracking-wider">MRIS</div>
            <div className="text-[10px] opacity-60 leading-tight">การจัดการข้อมูลการปลูกป่าอเนกประสงค์</div>
          </div>
        )}
        <button onClick={onToggle} className="p-1 rounded hover:bg-white/10 flex-shrink-0">
          <Icon name={collapsed ? 'chevron_right' : 'chevron_left'} size={14} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto scroll-thin px-2 py-3 space-y-1">
        {!collapsed && <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest opacity-50">Workspace</div>}
        {NAV.filter(n => n.group === 'main').map(n => (
          <NavItemButton key={n.id} item={n} active={active === n.id} onClick={() => onSelect(n.id)} collapsed={collapsed} />
        ))}
        {!collapsed && <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest opacity-50">Data</div>}
        {NAV.filter(n => n.group === 'data').map(n => (
          <NavItemButton key={n.id} item={n} active={active === n.id} onClick={() => onSelect(n.id)} collapsed={collapsed} />
        ))}
        {!collapsed && <div className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-widest opacity-50">System</div>}
        {NAV.filter(n => n.group === 'sys').map(n => (
          <NavItemButton key={n.id} item={n} active={active === n.id} onClick={() => onSelect(n.id)} collapsed={collapsed} />
        ))}
      </nav>

      {/* User section */}
      <div className={`p-3 border-t border-white/10 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button onClick={onLogout} title="ออกจากระบบ" className="p-2 rounded-lg hover:bg-white/10">
            <Icon name="logout" size={18} />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--mris-brand-500)] flex items-center justify-center font-bold">
              {user.full_name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user.full_name}</div>
              <div className="text-[10px] opacity-60 capitalize">{user.role}</div>
            </div>
            <button onClick={onLogout} title="ออกจากระบบ" className="p-1.5 rounded hover:bg-white/10 text-white/70">
              <Icon name="logout" size={14} />
            </button>
          </div>
        )}
      </div>
    </aside >
  );
};

export default Sidebar;
export { NAV };
