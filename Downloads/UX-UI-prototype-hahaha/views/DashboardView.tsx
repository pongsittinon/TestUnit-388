// DashboardView — ported from mris/screens.jsx
import React from 'react';
import Icon from '../components/Icon';
import { StatCard } from '../components/Modal';
import { TREES, SPECIES, PLOTS, CATEGORIES, YEARS, GROWTH_SERIES, SURVIVAL_SERIES } from '../data';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area, Cell,
} from 'recharts';

interface DashboardViewProps {
  onJumpMap: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ onJumpMap }) => {
  const total = TREES.length;
  const alive = TREES.filter(t => t.status === 'alive').length;
  const dead = total - alive;
  const rcdTrees = TREES.filter(t => t.rcd_cm != null);
  const avgRcd = rcdTrees.length > 0
    ? (rcdTrees.reduce((s, t) => s + (t.rcd_cm || 0), 0) / rcdTrees.length).toFixed(2)
    : '—';

  const growthByYear = YEARS.map(y => {
    const point: Record<string, string | number | null> = { year: String(y) };
    GROWTH_SERIES.forEach(g => {
      const r = g.series.find(s => s.year === y);
      point[g.th] = r?.avg_rcd ?? null;
    });
    return point;
  });

  const survivalByYear = YEARS.map(y => {
    const point: Record<string, string | number> = { year: String(y) };
    SURVIVAL_SERIES.forEach(s => {
      const r = s.series.find(x => x.year === y);
      point[s.plot] = r ? Number((r.rate * 100).toFixed(1)) : 0;
    });
    return point;
  });

  const speciesCounts = SPECIES.map(s => ({
    name: s.name,
    count: TREES.filter(t => t.species_code === s.code).length,
    color: s.color,
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-auto h-full scroll-thin">
      <div className="flex items-end justify-between">
        <div>
          <div className="chip chip-ok">หน้าสรุปข้อมูล</div>
          <h1 className="text-3xl font-bold mt-2">ภาพรวมการปลูกป่า แม่แจ่ม</h1>
          <p className="text-stone-600 mt-1 text-sm">12 แปลง · 6 กลุ่มพืช · ข้อมูลล่าสุด 15 พฤศจิกายน 2570</p>
        </div>
        <button onClick={onJumpMap} className="mris-btn"><Icon name="map" size={14} /> เปิดแผนที่ผังปลูก</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="ต้นไม้ทั้งหมด" value={total.toLocaleString()} />
        <StatCard label="อัตราการรอด" value={`${((alive / total) * 100).toFixed(1)}%`} />
        <StatCard label="แปลงที่ติดตาม" value={`${PLOTS.length}/12`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold mb-3">RCD เฉลี่ยรายปี ตามกลุ่มพืช</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthByYear} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="cm" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {GROWTH_SERIES.map(g => (
                  <Line key={g.cat} dataKey={g.th} stroke={g.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold mb-3">อัตราการรอดรายแปลง (ปี 68-70)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={survivalByYear} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" domain={[70, 100]} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {SURVIVAL_SERIES.slice(0, 6).map((s, idx) => (
                  <Line key={s.plot} dataKey={s.plot} stroke={['#3f8a56', '#a35a1c', '#7a5d2d', '#4d6b1f', '#d29a1f', '#5c7a1c'][idx % 6]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="font-bold mb-1">จำนวนต้นต่อชนิดไม้ (Top 8)</h3>
          <p className="text-xs text-stone-500 mb-3">รวมทุกแปลง</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={speciesCounts} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {speciesCounts.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
