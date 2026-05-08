// Modal + Toast system — ported from mris/ui.jsx
import React, { useState, useCallback } from 'react';
import Icon from './Icon';

// --- Confirm Modal ---
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm?: () => void;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, confirmLabel, danger, onConfirm }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 anim-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded"><Icon name="x" /></button>
        </div>
        <div className="p-6 text-sm text-stone-700">{children}</div>
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-2">
          <button onClick={onClose} className="mris-btn-ghost mris-btn">ยกเลิก</button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`mris-btn ${danger ? '!bg-red-600 hover:!bg-red-700' : ''}`}
              style={danger ? { background: '#dc2626' } : undefined}
            >
              {confirmLabel || 'ยืนยัน'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- StatCard ---
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent = 'var(--mris-brand-600)' }) => {
  return (
    <div className="card p-4">
      <div className="text-[11px] uppercase tracking-[.16em] text-stone-500 font-semibold">{label}</div>
      <div className="mt-1.5 text-3xl font-bold" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-stone-500 mt-1">{sub}</div>}
    </div>
  );
};

// --- Toast ---
export interface ToastItem {
  id: number;
  type: 'ok' | 'err' | 'info';
  title?: string;
  msg?: string;
}

interface ToastProps {
  toasts: ToastItem[];
}

export const Toast: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="anim-in pointer-events-auto bg-white shadow-2xl border border-stone-200 rounded-xl px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-[360px]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
            style={{ background: t.type === 'ok' ? 'var(--mris-brand-600)' : t.type === 'err' ? '#dc2626' : '#475569' }}
          >
            <Icon name={t.type === 'ok' ? 'check' : t.type === 'err' ? 'alert' : 'info'} size={14} />
          </div>
          <div className="min-w-0">
            {t.title && <div className="font-bold text-sm">{t.title}</div>}
            {t.msg && <div className="text-xs text-stone-500 break-all">{t.msg}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- useToasts hook ---
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const push = useCallback(({ type = 'info', title, msg }: { type?: 'ok' | 'err' | 'info'; title?: string; msg?: string }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3600);
  }, []);
  return { toasts, push };
}
