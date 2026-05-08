// LoginView — ported from mris/screens.jsx
import React, { useState } from 'react';
import Icon from '../components/Icon';
import { SessionUser } from '../types';

interface LoginViewProps {
  onLogin: (user: SessionUser) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('demo');
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onLogin({ username: u, full_name: 'อิทธิพล แสงโอภาส', role: 'admin', token: 'demo.jwt.token' });
    }, 600);
  }

  return (
    <div className="h-full w-full flex items-stretch" style={{ background: 'linear-gradient(135deg,#19361f 0%, #2b5a35 50%, #3f8a56 100%)' }}>
      <div className="flex-1 hidden md:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><Icon name="leaf" size={22} /></div>
            <div>
              <div className="font-bold text-lg tracking-wider">MRIS</div>
              <div className="text-xs opacity-70">Multipurpose Reforestation Information System</div>
            </div>
          </div>
        </div>
        <div className="space-y-4 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">ติดตามผังปลูกบนภาพถ่ายโดรน<br />พร้อมข้อมูลทุกต้น ทุกแปลง</h1>
          <p className="text-white/80">การจัดการข้อมูลการปลูกป่าอเนกประสงค์ — รองรับไม้ป่า ไม้ผล ยางพารา ไผ่ กล้วย และสมุนไพร พร้อมแดชบอร์ดเปรียบเทียบรายปี</p>
          <div className="flex gap-2 pt-2">
            {['ไม้ป่า', 'ไม้ผล', 'ยางพารา', 'ผลผลิตไผ่', 'กล้วย', 'สมุนไพร'].map(t => (
              <span key={t} className="text-[11px] bg-white/10 border border-white/20 rounded-full px-3 py-1">{t}</span>
            ))}
          </div>
        </div>
        <div className="text-xs opacity-60">© 2569 โครงการเพิ่มศักยภาพพื้นที่ คทช. โดยการปลูกป่าอเนกประสงค์ สำนักวิจัยและพัฒนาการป่าไม้ กรมป่าไม้</div>
        <svg className="absolute -right-20 -bottom-20 opacity-10" width="500" height="500" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" stroke="white" strokeWidth=".3" fill="none" />
          <circle cx="50" cy="50" r="32" stroke="white" strokeWidth=".3" fill="none" />
          <circle cx="50" cy="50" r="16" stroke="white" strokeWidth=".3" fill="none" />
        </svg>
      </div>
      <div className="w-full md:w-[460px] bg-white p-10 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-1">เข้าสู่ระบบ</h2>
        <p className="text-sm text-stone-500 mb-8">กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเริ่มใช้งาน</p>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-stone-600">ชื่อผู้ใช้</span>
            <input className="mris-input mt-1" value={u} onChange={e => setU(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-stone-600">รหัสผ่าน</span>
            <input type="password" className="mris-input mt-1" value={p} onChange={e => setP(e.target.value)} required />
          </label>
          <button type="submit" className="mris-btn w-full justify-center py-3" disabled={busy}>
            {busy ? 'กำลังเข้าสู่ระบบ…' : <><Icon name="lock" size={14} /> เข้าสู่ระบบ</>}
          </button>
        </form>
        <div className="mt-6 p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-600">
          <b>Demo:</b> ใช้ค่าใดก็ได้เพื่อเข้าสู่ระบบ — token จะถูกเก็บใน localStorage และแนบทุก request
        </div>
      </div>
    </div>
  );
};

export default LoginView;
