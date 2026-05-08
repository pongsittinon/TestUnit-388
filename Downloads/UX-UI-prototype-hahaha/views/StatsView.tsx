import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CalendarRange,
  Download,
  FileSpreadsheet,
  Grid3X3,
  LineChart as LineChartIcon,
  Trees,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { PLOT_LIST } from '../constants';
import { TreeRecord } from '../types';

interface StatsViewProps {
  stats: {
    total: number;
    alive: number;
    dead: number;
    alivePct: number;
    deadPct: number;
    speciesData: any[];
    plotData: any[];
  };
  records: TreeRecord[];
}

const StatsView: React.FC<StatsViewProps> = ({ stats, records }) => {
  const [selectedSpecies, setSelectedSpecies] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'1' | '2' | '3' | 'all'>('3');

  const getRcdValue = (record: TreeRecord) => {
    if (record.dbh_cm && !Number.isNaN(Number(record.dbh_cm))) {
      return Number(record.dbh_cm);
    }

    const bambooValues = [record.dbh_1_cm, record.dbh_2_cm, record.dbh_3_cm]
      .map((value) => Number(value))
      .filter((value) => !Number.isNaN(value) && value > 0);

    if (bambooValues.length > 0) {
      return bambooValues.reduce((sum, value) => sum + value, 0) / bambooValues.length;
    }

    return 0;
  };

  const getTreeTypeMeta = (record: TreeRecord) => {
    const name = record.species_name || '';

    if (name.includes('สมุนไพร')) {
      return { tree_type_code: 'herb', growth_table: 'growth_herb' };
    }
    if (name.includes('กล้วย')) {
      return { tree_type_code: 'banana', growth_table: 'growth_banana' };
    }
    if (name.includes('ไผ่')) {
      return { tree_type_code: 'bamboo', growth_table: 'growth_bamboo' };
    }
    if (name.includes('ยางพารา')) {
      return { tree_type_code: 'rubber', growth_table: 'growth_rubber' };
    }
    if (record.species_group === 'B') {
      return { tree_type_code: 'fruit', growth_table: 'growth_fruit' };
    }

    return { tree_type_code: 'forest', growth_table: 'growth_forest' };
  };

  const aliveRcdRecords = useMemo(() => {
    return records
      .filter((record) => record.status === 'alive')
      .map((record) => {
        const rcd = getRcdValue(record);
        const date = new Date(record.survey_date);
        const isDateValid = !Number.isNaN(date.getTime());
        return {
          ...record,
          rcd,
          surveyDateObject: isDateValid ? date : null,
          surveyYear: isDateValid ? date.getFullYear() : null,
        };
      })
      .filter((record) => record.rcd > 0 && record.surveyDateObject !== null && record.surveyYear !== null);
  }, [records]);

  const speciesOptions = useMemo(() => {
    const map = new Map<string, { speciesCode: string; count: number }>();

    aliveRcdRecords.forEach((record) => {
      if (!map.has(record.species_name)) {
        map.set(record.species_name, { speciesCode: record.species_code, count: 0 });
      }
      map.get(record.species_name)!.count += 1;
    });

    return Array.from(map.entries())
      .map(([speciesName, info]) => ({ speciesName, speciesCode: info.speciesCode, count: info.count }))
      .sort((a, b) => b.count - a.count || a.speciesName.localeCompare(b.speciesName));
  }, [aliveRcdRecords]);

  useEffect(() => {
    if (!selectedSpecies && speciesOptions.length > 0) {
      setSelectedSpecies(speciesOptions[0].speciesName);
    }
  }, [selectedSpecies, speciesOptions]);

  const latestSurveyYear = useMemo(() => {
    const years = aliveRcdRecords.map((record) => record.surveyYear || 0).filter((year) => year > 0);
    if (years.length === 0) {
      return null;
    }
    return Math.max(...years);
  }, [aliveRcdRecords]);

  const filteredRecords = useMemo(() => {
    if (!latestSurveyYear || rangeFilter === 'all') {
      return aliveRcdRecords;
    }

    const periodYears = Number(rangeFilter);
    const minYear = latestSurveyYear - periodYears + 1;

    return aliveRcdRecords.filter((record) => {
      return (record.surveyYear || 0) >= minYear;
    });
  }, [aliveRcdRecords, latestSurveyYear, rangeFilter]);

  const plotComparisonData = useMemo(() => {
    const selected = filteredRecords.filter((record) => record.species_name === selectedSpecies);
    const selectedAvg =
      selected.length > 0
        ? Number((selected.reduce((sum, record) => sum + record.rcd, 0) / selected.length).toFixed(2))
        : 0;

    return PLOT_LIST.map((plot) => {
      const inPlot = selected.filter((record) => record.plot_code === plot.code);
      const avgRcd =
        inPlot.length > 0
          ? Number((inPlot.reduce((sum, record) => sum + record.rcd, 0) / inPlot.length).toFixed(2))
          : 0;
      return {
        plotCode: plot.code,
        shortName: plot.short,
        avgRcd,
        sampleCount: inPlot.length,
        overallAvg: selectedAvg,
      };
    });
  }, [filteredRecords, selectedSpecies]);

  const trendSpecies = useMemo(() => {
    return speciesOptions.slice(0, 4).map((item) => item.speciesName);
  }, [speciesOptions]);

  const trendData = useMemo(() => {
    const yearSpeciesMap = new Map<number, Map<string, { sum: number; count: number }>>();

    filteredRecords.forEach((record) => {
      if (!record.surveyYear) {
        return;
      }

      if (!yearSpeciesMap.has(record.surveyYear)) {
        yearSpeciesMap.set(record.surveyYear, new Map());
      }

      const speciesMap = yearSpeciesMap.get(record.surveyYear)!;
      if (!speciesMap.has(record.species_name)) {
        speciesMap.set(record.species_name, { sum: 0, count: 0 });
      }

      const current = speciesMap.get(record.species_name)!;
      current.sum += record.rcd;
      current.count += 1;
    });

    return Array.from(yearSpeciesMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([year, speciesMap]) => {
        const point: Record<string, string | number | null> = {
          year: String(year),
        };

        trendSpecies.forEach((speciesName) => {
          const value = speciesMap.get(speciesName);
          point[speciesName] = value ? Number((value.sum / value.count).toFixed(2)) : null;
        });

        return point;
      });
  }, [filteredRecords, trendSpecies]);

  const heatmapSpecies = useMemo(() => {
    return speciesOptions.slice(0, 8).map((item) => item.speciesName);
  }, [speciesOptions]);

  const heatmapData = useMemo(() => {
    return PLOT_LIST.map((plot) => {
      const row: Record<string, string | number | null> = {
        plotCode: plot.code,
      };

      heatmapSpecies.forEach((speciesName) => {
        const values = filteredRecords
          .filter((record) => record.plot_code === plot.code && record.species_name === speciesName)
          .map((record) => record.rcd);

        row[speciesName] =
          values.length > 0
            ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2))
            : null;
      });

      return row;
    });
  }, [filteredRecords, heatmapSpecies]);

  const heatmapRange = useMemo(() => {
    const values = heatmapData
      .flatMap((row) => heatmapSpecies.map((speciesName) => row[speciesName]))
      .filter((value): value is number => typeof value === 'number');

    if (values.length === 0) {
      return { min: 0, max: 0 };
    }

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }, [heatmapData, heatmapSpecies]);

  const getHeatColor = (value: number | null) => {
    if (value === null || heatmapRange.max === heatmapRange.min) {
      return '#f5f5f4';
    }

    const ratio = (value - heatmapRange.min) / (heatmapRange.max - heatmapRange.min);
    const lightness = 95 - ratio * 55;
    return `hsl(145, 62%, ${lightness.toFixed(1)}%)`;
  };

  const schemaRows = useMemo(() => {
    const minYear =
      rangeFilter === 'all' || !latestSurveyYear
        ? Number.NEGATIVE_INFINITY
        : latestSurveyYear - Number(rangeFilter) + 1;

    return records
      .map((record) => {
        const parsedDate = new Date(record.survey_date);
        if (Number.isNaN(parsedDate.getTime())) {
          return null;
        }

        const measuredYear = parsedDate.getFullYear();
        if (measuredYear < minYear) {
          return null;
        }

        const meta = getTreeTypeMeta(record);
        const rcd = getRcdValue(record);
        const numericHeight = Number(record.height_m);

        return {
          measured_at: record.survey_date,
          tree_code: record.tree_code,
          plot_code: record.plot_code,
          species_code: record.species_code,
          species_name_th: record.species_name,
          tree_type_code: meta.tree_type_code,
          growth_table: meta.growth_table,
          recorder_name: record.recorder || '',
          survival_status: record.status === 'alive',
          rcd_cm: rcd > 0 ? Number(rcd.toFixed(2)) : '',
          height_m: Number.isNaN(numericHeight) ? '' : Number(numericHeight.toFixed(2)),
          flowering_status: record.flowering === 'yes' ? 'มี' : 'ไม่มี',
          notes: record.note || '',
        };
      })
      .filter((row): row is {
        measured_at: string;
        tree_code: string;
        plot_code: string;
        species_code: string;
        species_name_th: string;
        tree_type_code: string;
        growth_table: string;
        recorder_name: string;
        survival_status: boolean;
        rcd_cm: number | '';
        height_m: number | '';
        flowering_status: 'มี' | 'ไม่มี';
        notes: string;
      } => row !== null)
      .sort((a, b) => {
        if (a.measured_at !== b.measured_at) {
          return a.measured_at.localeCompare(b.measured_at);
        }
        return a.tree_code.localeCompare(b.tree_code);
      });
  }, [records, rangeFilter, latestSurveyYear]);

  const handleExportCsv = () => {
    if (schemaRows.length === 0) {
      return;
    }

    const headers = [
      'measured_at',
      'tree_code',
      'plot_code',
      'species_code',
      'species_name_th',
      'tree_type_code',
      'growth_table',
      'recorder_name',
      'survival_status',
      'rcd_cm',
      'height_m',
      'flowering_status',
      'notes',
    ];

    const escapeCell = (value: string | number | boolean) => {
      const text = String(value ?? '');
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const lines = [
      headers.join(','),
      ...schemaRows.map((row) => headers.map((header) => escapeCell((row as Record<string, string | number | boolean>)[header])).join(',')),
    ];

    const csvContent = `\uFEFF${lines.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mris_rcd_annual_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectedSpeciesAverage = useMemo(() => {
    const withSpecies = filteredRecords.filter((record) => record.species_name === selectedSpecies);
    if (withSpecies.length === 0) {
      return 0;
    }
    return Number((withSpecies.reduce((sum, record) => sum + record.rcd, 0) / withSpecies.length).toFixed(2));
  }, [filteredRecords, selectedSpecies]);

  const coveredPlots = useMemo(() => {
    return new Set(filteredRecords.map((record) => record.plot_code)).size;
  }, [filteredRecords]);

  const trendLinePalette = ['#166534', '#0f766e', '#b45309', '#1d4ed8'];

  return (
    <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_right,_rgba(22,101,52,0.12),_transparent_35%),linear-gradient(180deg,_#f5f6f2_0%,_#fafaf8_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-7xl pb-20">
        <section className="overflow-hidden rounded-[28px] border border-stone-200 bg-white/95 shadow-[0_24px_80px_-40px_rgba(41,37,36,0.45)]">
          <header className="border-b border-stone-200 px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">
                  Growth Intelligence
                </div>
                <h2 className="mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
                  <BarChart3 className="h-7 w-7 text-emerald-700" /> Dashboard เปรียบเทียบการเติบโต (RCD)
                </h2>
                <p className="mt-2 max-w-3xl text-sm text-stone-600">
                  ข้อมูลรายปี (1 ปีเก็บ 1 ครั้ง) สำหรับวิเคราะห์ RCD ข้าม 12 แปลงทดลอง พร้อมมุมมอง Heatmap และไฟล์ส่งออกที่พร้อมใช้ต่อใน SPSS
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
                Last update: {new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </header>

          <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">เลือกชนิดไม้</span>
                  <select
                    value={selectedSpecies}
                    onChange={(event) => setSelectedSpecies(event.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-emerald-500"
                  >
                    {speciesOptions.map((item) => (
                      <option key={item.speciesName} value={item.speciesName}>
                        {item.speciesName} ({item.speciesCode})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">ช่วงปีที่ใช้วิเคราะห์</span>
                  <select
                    value={rangeFilter}
                    onChange={(event) => setRangeFilter(event.target.value as '1' | '2' | '3' | 'all')}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-emerald-500"
                  >
                    <option value="1">ย้อนหลัง 1 ปี</option>
                    <option value="2">ย้อนหลัง 2 ปี</option>
                    <option value="3">ย้อนหลัง 3 ปี</option>
                    <option value="all">ทั้งหมด</option>
                  </select>
                </label>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">RCD เฉลี่ยชนิดที่เลือก</p>
                  <p className="mt-1 text-2xl font-bold">{selectedSpeciesAverage} cm</p>
                  <p className="mt-1 text-xs text-emerald-700">คำนวณจากต้นที่สถานะรอดเท่านั้น</p>
                </div>
              </div>

              <button
                onClick={handleExportCsv}
                disabled={schemaRows.length === 0}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all ${
                  schemaRows.length > 0
                    ? 'mris-brand-button shadow-lg shadow-emerald-950/10'
                    : 'cursor-not-allowed bg-stone-200 text-stone-400'
                }`}
              >
                <Download className="h-4 w-4" /> Export CSV for SPSS
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">จำนวนข้อมูลทั้งหมด</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{stats.total}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">ข้อมูล RCD ที่ใช้วิเคราะห์</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{filteredRecords.length}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-stone-500">ความครอบคลุมแปลง</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{coveredPlots}/12</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
              <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-stone-700">
                    <Trees className="h-4 w-4 text-emerald-700" /> เปรียบเทียบ RCD รายแปลง (12 แปลง)
                  </h3>
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
                    ชนิดไม้: {selectedSpecies || '-'}
                  </span>
                </div>

                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={plotComparisonData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ecebe7" vertical={false} />
                      <XAxis dataKey="shortName" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" cm" />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === 'overallAvg') {
                            return [`${value} cm`, 'ค่าเฉลี่ยรวมชนิดไม้'];
                          }
                          return [`${value} cm`, 'RCD เฉลี่ย'];
                        }}
                        labelFormatter={(label) => `แปลง ${label}`}
                        contentStyle={{ borderRadius: 12, borderColor: '#d6d3d1' }}
                      />
                      <Legend />
                      <Bar name="RCD เฉลี่ย" dataKey="avgRcd" fill="#15803d" radius={[6, 6, 0, 0]} maxBarSize={28} />
                      <Line name="ค่าเฉลี่ยรวมชนิดไม้" dataKey="overallAvg" type="monotone" stroke="#b45309" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-stone-700">
                  <Activity className="h-4 w-4 text-emerald-700" /> ความหนาแน่นตัวอย่างรายแปลง
                </h3>
                <div className="overflow-auto">
                  <table className="w-full min-w-[360px] text-sm">
                    <thead>
                      <tr className="bg-stone-100 text-left text-xs uppercase tracking-[0.14em] text-stone-600">
                        <th className="rounded-l-xl px-3 py-2">แปลง</th>
                        <th className="px-3 py-2 text-right">n</th>
                        <th className="rounded-r-xl px-3 py-2 text-right">Avg RCD (cm)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {plotComparisonData.map((row) => (
                        <tr key={row.plotCode}>
                          <td className="px-3 py-2 font-medium text-stone-800">{row.plotCode}</td>
                          <td className="px-3 py-2 text-right font-mono text-stone-500">{row.sampleCount}</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700">{row.avgRcd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-stone-700">
                  <LineChartIcon className="h-4 w-4 text-emerald-700" /> แนวโน้มระยะยาวรายปี (RCD)
                </h3>
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
                  <CalendarRange className="h-3.5 w-3.5" /> Trend ของชนิดไม้ตัวอย่างมากสุด 4 อันดับแรก
                </span>
              </div>

              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 8, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ecebe7" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit=" cm" />
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#d6d3d1' }} />
                    <Legend />
                    {trendSpecies.map((speciesName, index) => (
                      <Line
                        key={speciesName}
                        type="monotone"
                        dataKey={speciesName}
                        name={speciesName}
                        stroke={trendLinePalette[index % trendLinePalette.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-stone-700">
                  <Grid3X3 className="h-4 w-4 text-emerald-700" /> Heatmap Plot x Species (Avg RCD)
                </h3>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
                  ค่าสีเข้ม = RCD สูง
                </span>
              </div>

              <div className="overflow-auto">
                <table className="w-full min-w-[720px] border-separate border-spacing-1 text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs uppercase tracking-[0.14em] text-stone-500">Plot</th>
                      {heatmapSpecies.map((speciesName) => (
                        <th key={speciesName} className="px-3 py-2 text-right text-xs uppercase tracking-[0.12em] text-stone-500">
                          {speciesName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((row) => (
                      <tr key={String(row.plotCode)}>
                        <td className="rounded-lg bg-stone-100 px-3 py-2 font-semibold text-stone-700">{row.plotCode}</td>
                        {heatmapSpecies.map((speciesName) => {
                          const value = row[speciesName] as number | null;
                          return (
                            <td
                              key={`${row.plotCode}-${speciesName}`}
                              className="rounded-lg px-3 py-2 text-right font-mono text-xs font-semibold"
                              style={{ backgroundColor: getHeatColor(value), color: value !== null ? '#064e3b' : '#78716c' }}
                            >
                              {value !== null ? value.toFixed(2) : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                ช่วงค่า Heatmap: {heatmapRange.min.toFixed(2)} - {heatmapRange.max.toFixed(2)} cm
              </p>
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-stone-700">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-700" /> ตารางข้อมูลตาม DB Schema (growth_logs + child)
                </h3>
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-500">
                  {schemaRows.length} rows
                </span>
              </div>

              <div className="overflow-auto rounded-xl border border-stone-200">
                <table className="w-full min-w-[1400px] text-sm">
                  <thead className="bg-stone-100 text-xs uppercase tracking-[0.14em] text-stone-600">
                    <tr>
                      <th className="px-3 py-2 text-left">measured_at</th>
                      <th className="px-3 py-2 text-left">tree_code</th>
                      <th className="px-3 py-2 text-left">plot_code</th>
                      <th className="px-3 py-2 text-left">species_code</th>
                      <th className="px-3 py-2 text-left">species_name_th</th>
                      <th className="px-3 py-2 text-left">tree_type_code</th>
                      <th className="px-3 py-2 text-left">growth_table</th>
                      <th className="px-3 py-2 text-left">recorder_name</th>
                      <th className="px-3 py-2 text-center">survival_status</th>
                      <th className="px-3 py-2 text-right">rcd_cm</th>
                      <th className="px-3 py-2 text-right">height_m</th>
                      <th className="px-3 py-2 text-center">flowering_status</th>
                      <th className="px-3 py-2 text-left">notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {schemaRows.slice(0, 20).map((row) => (
                      <tr key={`${row.measured_at}-${row.tree_code}`}>
                        <td className="px-3 py-2 font-mono text-stone-700">{row.measured_at}</td>
                        <td className="px-3 py-2 font-mono text-stone-700">{row.tree_code}</td>
                        <td className="px-3 py-2 font-semibold text-stone-700">{row.plot_code}</td>
                        <td className="px-3 py-2 font-mono text-stone-700">{row.species_code}</td>
                        <td className="px-3 py-2 text-stone-700">{row.species_name_th}</td>
                        <td className="px-3 py-2 text-stone-700">{row.tree_type_code}</td>
                        <td className="px-3 py-2 font-mono text-stone-600">{row.growth_table}</td>
                        <td className="px-3 py-2 text-stone-700">{row.recorder_name}</td>
                        <td className="px-3 py-2 text-center text-stone-700">{row.survival_status ? 'true' : 'false'}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700">{row.rcd_cm === '' ? '-' : row.rcd_cm}</td>
                        <td className="px-3 py-2 text-right font-mono text-stone-600">{row.height_m === '' ? '-' : row.height_m}</td>
                        <td className="px-3 py-2 text-center text-stone-700">{row.flowering_status}</td>
                        <td className="px-3 py-2 text-stone-600">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-stone-500">
                Export จะดาวน์โหลดทุกแถวในตารางนี้เป็น UTF-8 CSV (มี BOM) รองรับภาษาไทยใน SPSS
              </p>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StatsView;
