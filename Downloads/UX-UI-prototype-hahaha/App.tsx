// ====== ROOT APP — MRIS ======
// Ported from mris/app.jsx to Vite/TypeScript
import React, { useState, useEffect } from 'react';
import './styles/mris.css';
import { ViewType, TreeRecord, SessionUser, PlantCategory } from './types';
import { TREES as INITIAL_TREES } from './data';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import CmdK from './components/CmdK';
import { Modal, Toast, useToasts } from './components/Modal';

// Views
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import MapView from './views/MapView';
import TreesTableView from './views/TreesTableView';
import TreeEditDrawer from './views/TreeEditDrawer';
import ImportViewNew from './views/ImportViewNew';
import ExportView from './views/ExportView';
import AdminView from './views/AdminView';

const App: React.FC = () => {
  // --- Auth ---
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const v = localStorage.getItem('mris_user');
      return v ? JSON.parse(v) : null;
    } catch { return null; }
  });

  // --- Navigation ---
  const [active, setActive] = useState<ViewType>('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  // --- Data ---
  const [trees, setTrees] = useState<TreeRecord[]>(INITIAL_TREES);
  const [editTree, setEditTree] = useState<TreeRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCat, setDrawerCat] = useState<PlantCategory>('forest');
  const [confirm, setConfirm] = useState<{
    title: string;
    body: string;
    danger: boolean;
    confirm: string;
    onConfirm: () => void;
  } | null>(null);
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState<{ tree: TreeRecord; ts: number } | null>(null);
  const { toasts, push } = useToasts();

  // --- Persist active page ---
  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem('mris_active') as ViewType | null;
    if (saved) setActive(saved);
  }, [user]);
  useEffect(() => {
    if (user) localStorage.setItem('mris_active', active);
  }, [active, user]);

  // --- Global hotkeys ---
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdkOpen(v => !v); }
      if (e.key === 'Escape') { setCmdkOpen(false); setDrawerOpen(false); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // --- Auth Handlers ---
  function handleLogin(u: SessionUser) {
    setUser(u);
    try {
      localStorage.setItem('mris_user', JSON.stringify(u));
      localStorage.setItem('mris_token', u.token);
    } catch {}
  }

  function handleLogout() {
    setUser(null);
    localStorage.removeItem('mris_user');
    localStorage.removeItem('mris_token');
  }

  // --- Tree CRUD ---
  function openEdit(t: TreeRecord) {
    setEditTree(t);
    setDrawerCat(t.category);
    setDrawerOpen(true);
  }

  function openAdd(cat: PlantCategory) {
    setEditTree(null);
    setDrawerCat(cat || 'forest');
    setDrawerOpen(true);
  }

  function saveTree(draft: any) {
    if (draft.id) {
      setTrees(prev => prev.map(x =>
        x.id === draft.id
          ? { ...x, ...draft, rcd_cm: Number(draft.rcd_cm) || x.rcd_cm, height_m: Number(draft.height_m) || x.height_m }
          : x
      ));
      push({ type: 'ok', title: 'บันทึกการแก้ไขสำเร็จ' });
    } else {
      const id = Math.max(...trees.map(t => t.id)) + 1;
      const newT = { ...draft, id, color: '#3f8a56' };
      setTrees(prev => [newT, ...prev]);
      push({ type: 'ok', title: 'เพิ่มต้นใหม่สำเร็จ' });
    }
    setDrawerOpen(false);
  }

  function askDelete(t: TreeRecord) {
    setConfirm({
      title: 'ยืนยันการลบ',
      body: `ลบต้น ${t.tree_code} (${t.species_name}) ออกจากระบบหรือไม่?`,
      danger: true,
      confirm: 'ลบ',
      onConfirm: () => {
        setTrees(prev => prev.filter(x => x.id !== t.id));
        push({ type: 'err', title: 'ลบรายการแล้ว' });
        setConfirm(null);
      },
    });
  }

  function locateOnMap(t: TreeRecord) {
    setMapFocus({ tree: t, ts: Date.now() });
    setActive('map');
  }

  // --- Login Gate ---
  if (!user) return <LoginView onLogin={handleLogin} />;

  // --- Main Layout ---
  return (
    <div className="h-full w-full flex bg-stone-100">
      <Sidebar
        active={active}
        onSelect={setActive}
        user={user}
        onLogout={handleLogout}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar active={active} onCmdK={() => setCmdkOpen(true)} />
        <main className="flex-1 min-h-0 overflow-hidden bg-stone-100">
          {active === 'dashboard' && <DashboardView onJumpMap={() => setActive('map')} />}
          {active === 'map' && <MapView trees={trees} focus={mapFocus} onEdit={openEdit} />}
          {active === 'trees' && <TreesTableView trees={trees} onEdit={openEdit} onDelete={askDelete} onLocateOnMap={locateOnMap} onAdd={openAdd} />}
          {active === 'import' && <ImportViewNew />}
          {active === 'export' && <ExportView />}
          {active === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Drawer backdrop */}
      {drawerOpen && <div className="fixed inset-0 bg-black/30 z-[8400]" onClick={() => setDrawerOpen(false)} />}
      <TreeEditDrawer tree={editTree} open={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={saveTree} defaultCat={drawerCat} />

      {/* Confirm modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.title}
        confirmLabel={confirm?.confirm}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
      >
        <p>{confirm?.body}</p>
      </Modal>

      {/* CmdK */}
      <CmdK open={cmdkOpen} onClose={() => setCmdkOpen(false)} onSelect={locateOnMap} trees={trees} />

      {/* Toasts */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default App;
