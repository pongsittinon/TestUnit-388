
import React, { useMemo, useState } from 'react';
import { Search, Loader2, Pencil, Trash2, Plus, Sprout, Leaf } from 'lucide-react';
import { PLOT_LIST, PLANT_CATEGORIES } from '../constants';
import { TreeRecord, PlantCategory } from '../types';
import { getCategoryFromRecord, getCategoryColor } from '../utils/classification';

interface TableViewProps {
  records: TreeRecord[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  plotFilter: string;
  setPlotFilter: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  editLogId: string | null;
  onEdit: (r: TreeRecord) => void;
  onDelete: (r: TreeRecord) => void;
  onOpenMobileForm: () => void;
  onClearForm: () => void;
}

const TableView: React.FC<TableViewProps> = ({
  records,
  isLoading,
  searchTerm,
  setSearchTerm,
  plotFilter,
  setPlotFilter,
  statusFilter,
  setStatusFilter,
  editLogId,
  onEdit,
  onDelete,
  onOpenMobileForm,
  onClearForm
}) => {
  const [activeCategory, setActiveCategory] = useState<PlantCategory>(PLANT_CATEGORIES[0]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = !searchTerm || 
        r.tree_code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.species_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlot = !plotFilter || r.plot_code === plotFilter;
      const matchesStatus = !statusFilter || r.status === statusFilter;
      const category = getCategoryFromRecord(r);
      const matchesCategory = category === activeCategory;
      
      return matchesSearch && matchesPlot && matchesStatus && matchesCategory;
    });
  }, [records, searchTerm, plotFilter, statusFilter, activeCategory]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Search and Global Filter Bar */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-white sticky top-0 z-20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="ค้นหา รหัสต้นไม้, ชนิดพรรณไม้, แปลง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mris-input w-full pl-10 pr-4 py-2"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={plotFilter}
            onChange={(e) => setPlotFilter(e.target.value)}
            className="bg-gray-100 border-none rounded-lg px-3 py-2 text-sm flex-1 md:flex-none"
          >
            <option value="">ทุกแปลง</option>
            {PLOT_LIST.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-100 border-none rounded-lg px-3 py-2 text-sm flex-1 md:flex-none"
          >
            <option value="">ทุกสถานะ</option>
            <option value="alive">รอด</option>
            <option value="dead">ตาย</option>
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 pt-2 bg-gray-50 border-b border-gray-200 overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 min-w-max">
           {PLANT_CATEGORIES.map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-4 py-2.5 text-sm font-bold rounded-t-lg transition-all flex items-center gap-2 ${
                 activeCategory === cat 
                   ? 'bg-white text-[var(--mris-brand-700)] border-t-2 shadow-sm' 
                   : 'text-gray-500 hover:text-[var(--mris-brand-700)] hover:bg-gray-100'
               }`}
               style={activeCategory === cat ? { borderTopColor: 'var(--mris-brand-600)' } : undefined}
             >
                {cat === 'ไม้ป่า' && <Sprout size={16} />}
                {cat === 'ยางพารา' && <Leaf size={16} />}
                {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-800 text-white text-[11px] font-bold uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">วันที่ / ผู้บันทึก</th>
              <th className="px-4 py-3 whitespace-nowrap">Code / Tag</th>
              <th className="px-4 py-3 whitespace-nowrap">ชนิด</th>
              <th className="px-4 py-3 whitespace-nowrap">สถานะ</th>
              
              {/* Dynamic Columns based on Category */}
              {(activeCategory === 'ไม้ป่า' || activeCategory === 'ไม้ผล' || activeCategory === 'ยางพารา' || activeCategory === 'สมุนไพร') && (
                <>
                  <th className="px-4 py-3 text-right whitespace-nowrap">RCD (ซม.)</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">สูง (ม.)</th>
                </>
              )}

              {activeCategory === 'ผลผลิตไผ่' && (
                <>
                  <th className="px-4 py-3 text-right whitespace-nowrap">จำนวน (ลำ)</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">RCD 1 (ซม.)</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">RCD 2 (ซม.)</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">RCD 3 (ซม.)</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">สูง (ม.)</th>
                </>
              )}

              {activeCategory === 'กล้วย' && (
                <>
                  <th className="px-4 py-3 text-right whitespace-nowrap">ต้นรวม</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">ต้น 1 ปี</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">สูง (ม.)</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">เครือ</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">หวี</th>
                  <th className="px-4 py-3 text-right whitespace-nowrap">ราคา/หวี</th>
                </>
              )}

              <th className="px-4 py-3 text-center whitespace-nowrap">ดอก/ผล</th>
              <th className="px-4 py-3 whitespace-nowrap">หมายเหตุ</th>
              <th className="px-4 py-3 text-center bg-gray-900 whitespace-nowrap">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r, i) => {
                return (
                  <tr key={r.log_id || i} className={`transition-colors group ${editLogId === r.log_id ? 'bg-amber-50' : 'hover:bg-[var(--mris-brand-50)]'}`}>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                       <div>{r.survey_date}</div>
                       <div className="text-[10px] text-gray-400">{r.recorder}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                       <div className="font-mono text-sm font-bold text-[var(--mris-brand-700)]">{r.tree_code}</div>
                       <div className="text-[10px] text-gray-500 font-mono">{r.tag_label}</div>
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${r.species_group === 'A' ? 'bg-[var(--mris-brand-600)]' : 'bg-orange-600'}`}></span>
                      {r.species_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap ${
                        r.status === 'alive' ? 'bg-[var(--mris-brand-50)] text-[var(--mris-brand-700)]' : 
                        r.status === 'dead' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {r.status === 'alive' ? 'รอด' : r.status === 'dead' ? 'ตาย' : '—'}
                      </span>
                    </td>

                    {/* Dynamic Row Data */}
                    {(activeCategory === 'ไม้ป่า' || activeCategory === 'ไม้ผล' || activeCategory === 'ยางพารา' || activeCategory === 'สมุนไพร') && (
                      <>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.dbh_cm || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.height_m || '-'}</td>
                      </>
                    )}

                    {activeCategory === 'ผลผลิตไผ่' && (
                      <>
                        <td className="px-4 py-3 text-right font-mono text-sm font-bold">{r.bamboo_culms || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{r.dbh_1_cm || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{r.dbh_2_cm || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{r.dbh_3_cm || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.height_m || '-'}</td>
                      </>
                    )}

                    {activeCategory === 'กล้วย' && (
                      <>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.banana_total || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.banana_1yr || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.height_m || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.yield_bunches || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm">{r.yield_hands || '-'}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-[var(--mris-brand-700)] font-bold">{r.price_per_hand || '-'}</td>
                      </>
                    )}
                    
                    <td className="px-4 py-3 text-center">
                       {r.flowering === 'yes' ? '🌸' : <span className="text-gray-200">•</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-[150px]" title={r.note}>{r.note}</td>
                    
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onEdit(r)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-all"
                          title="แก้ไข"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => onDelete(r)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="ลบข้อมูล"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={15} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    {isLoading ? (
                       <Loader2 size={48} className="animate-spin text-[var(--mris-brand-600)]" />
                    ) : (
                       <>
                          <Search size={48} strokeWidth={1} />
                          <p>ไม่พบข้อมูลในกลุ่ม {activeCategory}</p>
                       </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile FAB to Add Tree */}
      <button 
        onClick={() => { onClearForm(); onOpenMobileForm(); }}
        className="md:hidden absolute bottom-6 right-6 w-14 h-14 mris-brand-button text-white rounded-full shadow-lg flex items-center justify-center z-30 transition-colors"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default TableView;
