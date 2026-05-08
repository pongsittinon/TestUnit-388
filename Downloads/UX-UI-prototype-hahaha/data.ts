// ============================================================
// Mock data — Mae Chaem reforestation plots
// Ported from mris/data.jsx to TypeScript
// ============================================================

import {
  Plot, Species, Category, TreeRecord, User, ImportRecord,
  GrowthSeriesItem, SurvivalSeriesItem, PlantCategory,
} from './types';

// --- Plots ---
export const PLOTS: Plot[] = [
  { code: 'P01', name: 'นางจันทร์คำ เจริญผล', short: 'P1', area_rai: 5.2, anchor_utm: [491230, 2074180], rotation_deg: 6 },
  { code: 'P02', name: 'นายสงัด งามช่วง', short: 'P2', area_rai: 4.8, anchor_utm: [491510, 2074210], rotation_deg: -2 },
  { code: 'P03', name: 'นายสมชาย บันดาลสกุล', short: 'P3', area_rai: 6.1, anchor_utm: [491820, 2074120], rotation_deg: 4 },
  { code: 'P04', name: 'นายสมเดช บันดาลสกุล', short: 'P4', area_rai: 5.0, anchor_utm: [491230, 2073920], rotation_deg: 0 },
  { code: 'P05', name: 'นางขันแก้ว ต๊ะสม', short: 'P5', area_rai: 4.4, anchor_utm: [491540, 2073900], rotation_deg: 8 },
  { code: 'P06', name: 'นายศักดิ์ จิตสุข', short: 'P6', area_rai: 5.5, anchor_utm: [491820, 2073860], rotation_deg: -3 },
  { code: 'P07', name: 'นายสุภาพ นิปุณะ', short: 'P7', area_rai: 6.2, anchor_utm: [491230, 2073660], rotation_deg: 0 },
  { code: 'P08', name: 'นายดำรงค์ ศรีเที่ยง', short: 'P8', area_rai: 5.0, anchor_utm: [491540, 2073640], rotation_deg: 5 },
  { code: 'P12', name: 'นายจันทร์ติ๊บ แสงแก้ว', short: 'P12', area_rai: 6.8, anchor_utm: [491820, 2073600], rotation_deg: -4 },
  { code: 'P13', name: 'นายบุญเลิศ จันตา...', short: 'P13', area_rai: 5.7, anchor_utm: [491230, 2073400], rotation_deg: 2 },
  { code: 'P14', name: 'นายโสภณวิชญ์ กาไว', short: 'P14', area_rai: 4.9, anchor_utm: [491540, 2073380], rotation_deg: 0 },
  { code: 'P15', name: 'นางมะลิวัลย์ ปินคำ', short: 'P15', area_rai: 5.3, anchor_utm: [491820, 2073360], rotation_deg: -2 },
];

// --- Species ---
export const SPECIES: Species[] = [
  { code: 'A01', name: 'สัก', group: 'A', cat: 'forest', color: '#2b5a35' },
  { code: 'A02', name: 'กระถินลูกผสม', group: 'A', cat: 'forest', color: '#356f41' },
  { code: 'A03', name: 'ตะเคียนทอง', group: 'A', cat: 'forest', color: '#1f4d2a' },
  { code: 'A04', name: 'ยางนา', group: 'A', cat: 'forest', color: '#274d33' },
  { code: 'A07', name: 'ประดู่', group: 'A', cat: 'forest', color: '#3a6b44' },
  { code: 'A19', name: 'ยางพารา', group: 'A', cat: 'rubber', color: '#7a5d2d' },
  { code: 'A20', name: 'ไผ่', group: 'A', cat: 'bamboo', color: '#4d6b1f' },
  { code: 'B03', name: 'ลำไย', group: 'B', cat: 'fruit', color: '#a35a1c' },
  { code: 'B06', name: 'มะม่วง', group: 'B', cat: 'fruit', color: '#c8741b' },
  { code: 'B10', name: 'ทุเรียน', group: 'B', cat: 'fruit', color: '#8a4a13' },
  { code: 'B12', name: 'กล้วย', group: 'B', cat: 'banana', color: '#d29a1f' },
  { code: 'B15', name: 'สมุนไพรฟ้าทะลายโจร', group: 'B', cat: 'herb', color: '#5c7a1c' },
];

// --- Categories ---
export const CATEGORIES: Category[] = [
  { id: 'forest', th: 'ไม้ป่า', color: '#2b5a35' },
  { id: 'fruit', th: 'ไม้ผล', color: '#a35a1c' },
  { id: 'rubber', th: 'ยางพารา', color: '#7a5d2d' },
  { id: 'bamboo', th: 'ผลผลิตไผ่', color: '#4d6b1f' },
  { id: 'banana', th: 'กล้วย', color: '#d29a1f' },
  { id: 'herb', th: 'สมุนไพร', color: '#5c7a1c' },
];

// --- Recorders ---
export const RECORDERS = ['สมชาย ใจดี', 'วิชัย ปกครอง', 'จารุวรรณ พึ่งบุญ', 'ดวงพร เพชรงาม', 'ภานุพงษ์ ทอดสนิท'];

// --- Tree Generator ---
function genTrees(): TreeRecord[] {
  const out: TreeRecord[] = [];
  let id = 1;
  PLOTS.forEach((plot, pi) => {
    const mix = pi % 3 === 0 ? ['A01', 'A02', 'A07', 'B03'] :
      pi % 3 === 1 ? ['A19', 'A20', 'B12', 'B15'] :
        ['A04', 'B06', 'B10', 'B03'];
    const cols = 8, rows = 12;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const spCode = mix[(r + c) % mix.length];
        const sp = SPECIES.find(s => s.code === spCode)!;
        const treeNumber = r * cols + c + 1;
        const tree_code = `${plot.code}${spCode}${String(treeNumber).padStart(3, '0')}`;
        const dx = c * 3.0 + (r % 2 === 0 ? 0 : 1.5);
        const dy = r * 4.5;
        const ang = plot.rotation_deg * Math.PI / 180;
        const ux = plot.anchor_utm[0] + dx * Math.cos(ang) - dy * Math.sin(ang);
        const uy = plot.anchor_utm[1] - (dx * Math.sin(ang) + dy * Math.cos(ang));
        const status: 'alive' | 'dead' = (pi * 7 + r * 3 + c * 2) % 17 === 0 ? 'dead' : 'alive';
        const yearGain = 0.7 + ((id * 13) % 9) / 10;
        const rcd = status === 'alive' ? Number((4.5 + yearGain * 2 + ((id * 7) % 10) / 10).toFixed(2)) : null;
        const height = status === 'alive' ? Number((2.4 + yearGain * 1.2 + ((id * 3) % 9) / 10).toFixed(2)) : null;
        out.push({
          id,
          log_id: `log-${String(id).padStart(5, '0')}`,
          tree_code,
          plot_code: plot.code,
          species_code: spCode,
          species_name: sp.name,
          species_group: sp.group,
          category: sp.cat,
          color: sp.color,
          tree_number: treeNumber,
          status,
          flowering: sp.group === 'B' && status === 'alive' && (id % 4 === 0) ? 'yes' : 'no',
          rcd_cm: rcd,
          height_m: height,
          spacing: '3x4.5',
          culm_count: sp.cat === 'bamboo' && status === 'alive' ? 6 + (id % 6) : null,
          rcd_cm_1: sp.cat === 'bamboo' && rcd ? Number((rcd - 0.3).toFixed(2)) : null,
          rcd_cm_2: sp.cat === 'bamboo' ? rcd : null,
          rcd_cm_3: sp.cat === 'bamboo' && rcd ? Number((rcd + 0.4).toFixed(2)) : null,
          total_count: sp.cat === 'banana' ? 8 + (id % 6) : (sp.cat === 'herb' ? 12 + (id % 8) : null),
          sucker_count: sp.cat === 'banana' ? 3 + (id % 4) : null,
          plant_count: sp.cat === 'banana' ? 5 + (id % 4) : null,
          productivity_bunches: sp.cat === 'banana' ? 1 + (id % 3) : null,
          productivity_combs: sp.cat === 'banana' ? 6 + (id % 6) : null,
          price_per_comb: sp.cat === 'banana' ? 60 + (id % 30) : null,
          new_shoot_count: sp.cat === 'herb' ? 3 + (id % 5) : null,
          produce_length_1_cm: sp.cat === 'herb' ? 12 + (id % 6) : null,
          produce_length_2_cm: sp.cat === 'herb' ? 14 + (id % 6) : null,
          produce_length_3_cm: sp.cat === 'herb' ? 11 + (id % 6) : null,
          price_per_kg: sp.cat === 'herb' ? 80 + (id % 40) : null,
          notes: status === 'dead' ? 'ต้นโทรม/ยืนต้นตาย' : '',
          recorder: RECORDERS[id % RECORDERS.length],
          survey_date: '2570-11-15',
          utm_x: Number(ux.toFixed(2)),
          utm_y: Number(uy.toFixed(2)),
          local_x: Number(dx.toFixed(2)),
          local_y: Number(dy.toFixed(2)),
        });
        id++;
      }
    }
  });
  return out;
}

export const TREES = genTrees();

// --- Year-on-year growth series ---
export const YEARS = [2568, 2569, 2570];

export const GROWTH_SERIES: GrowthSeriesItem[] = SPECIES.slice(0, 8).map(s => ({
  cat: s.code,
  th: s.name,
  color: s.color,
  series: YEARS.map((y, i) => ({
    year: y,
    avg_rcd: Number((3.5 + i * 1.8 + (s.name.length % 5) * 0.4).toFixed(2)),
    avg_height: Number((2.2 + i * 1.5).toFixed(2)),
  })),
}));

export const SURVIVAL_SERIES: SurvivalSeriesItem[] = PLOTS.map((p, i) => ({
  plot: p.code,
  series: YEARS.map((y, k) => ({
    year: y,
    rate: k === 0 ? 1.0 : Number((0.98 - (k - 1) * 0.04 - (i % 5) * 0.01).toFixed(3)),
  })),
}));

// --- Users ---
export const USERS: User[] = [
  { user_id: 'u-001', username: 'admin', full_name: 'อิทธิพล แสงโอภาส', role: 'admin', created_at: '2568-01-12' },
  { user_id: 'u-002', username: 'surveyor1', full_name: 'สมชาย ใจดี', role: 'surveyor', created_at: '2568-05-20' },
  { user_id: 'u-003', username: 'surveyor2', full_name: 'จารุวรรณ พึ่งบุญ', role: 'surveyor', created_at: '2569-02-04' },
  { user_id: 'u-004', username: 'analyst', full_name: 'วิชัย ปกครอง', role: 'analyst', created_at: '2569-03-15' },
];

// --- Import History ---
export const IMPORT_HISTORY: ImportRecord[] = [
  { id: 'imp-2570-01', file: 'maechaem_forest_2570Q1.xlsx', cat: 'forest', total: 312, passed: 298, soft: 9, hard: 5, by: 'สมชาย ใจดี', at: '2570-04-22 14:02' },
  { id: 'imp-2569-03', file: 'rubber_p3_p4_2569Q1.xlsx', cat: 'rubber', total: 96, passed: 96, soft: 0, hard: 0, by: 'วิชัย ปกครอง', at: '2569-11-30 09:48' },
  { id: 'imp-2568-02', file: 'banana_p7_p8_2568Q3.csv', cat: 'banana', total: 48, passed: 42, soft: 6, hard: 0, by: 'จารุวรรณ', at: '2568-08-18 11:12' },
];
