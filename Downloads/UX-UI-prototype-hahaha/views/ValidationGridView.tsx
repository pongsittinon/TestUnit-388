import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  FileSpreadsheet,
  Info,
  Loader2,
  UploadCloud,
  XCircle,
} from 'lucide-react';

type ValidationStatus = 'pass' | 'warning' | 'error';
type ValidationErrorType = 'tree_code' | 'height' | null;

interface ValidationRow {
  id: number;
  tree_no: string;
  tree_code: string;
  species: string;
  survival: 'รอด' | 'ตาย';
  rcd: string;
  height: string;
  note: string;
  isAcknowledged: boolean;
}

interface ValidationGridViewProps {
  groupLabel: string;
  fileName: string;
  isBusy: boolean;
  onBack: () => void;
  onSubmit: (message: string) => void;
}

const INITIAL_ROWS: ValidationRow[] = [
  {
    id: 1,
    tree_no: '014',
    tree_code: 'P01A02014',
    species: 'กระถินลูกผสม',
    survival: 'ตาย',
    rcd: '-',
    height: '-',
    note: '',
    isAcknowledged: false,
  },
  {
    id: 2,
    tree_no: '015',
    tree_code: 'P01A02015',
    species: 'กระถินลูกผสม',
    survival: 'รอด',
    rcd: '1.21',
    height: '0.55',
    note: '',
    isAcknowledged: false,
  },
  {
    id: 3,
    tree_no: '128',
    tree_code: 'P01A02128',
    species: 'กระถินลูกผสม',
    survival: 'รอด',
    rcd: '14.5',
    height: '1.25',
    note: '',
    isAcknowledged: false,
  },
  {
    id: 4,
    tree_no: '129',
    tree_code: 'P01A14129',
    species: 'ขี้เหล็กบ้าน',
    survival: 'รอด',
    rcd: '0.77',
    height: '0..6',
    note: '',
    isAcknowledged: false,
  },
  {
    id: 5,
    tree_no: '130',
    tree_code: '',
    species: 'ขี้เหล็กบ้าน',
    survival: 'รอด',
    rcd: '1.21',
    height: '1.00',
    note: '',
    isAcknowledged: false,
  },
];

const isNumericMeasurement = (value: string) => /^\d+(\.\d+)?$/.test(value.trim());

const getRowState = (row: ValidationRow): { status: ValidationStatus; errorType: ValidationErrorType; message: string } => {
  if (!row.tree_code.trim()) {
    return {
      status: 'error',
      errorType: 'tree_code',
      message: 'ระบุรหัสต้นไม้ไม่ครบถ้วน',
    };
  }

  if (row.survival === 'รอด' && !isNumericMeasurement(row.height)) {
    return {
      status: 'error',
      errorType: 'height',
      message: 'รูปแบบตัวเลขความสูงไม่ถูกต้อง',
    };
  }

  if (row.survival === 'รอด' && isNumericMeasurement(row.rcd) && Number(row.rcd) > 10) {
    return {
      status: 'warning',
      errorType: null,
      message: 'ค่า RCD สูงผิดปกติเมื่อเทียบกับข้อมูลแถวนี้',
    };
  }

  return {
    status: 'pass',
    errorType: null,
    message: row.survival === 'ตาย' ? 'งดเก็บข้อมูลการเติบโต' : 'ข้อมูลสมบูรณ์',
  };
};

const ValidationGridView: React.FC<ValidationGridViewProps> = ({
  groupLabel,
  fileName,
  isBusy,
  onBack,
  onSubmit,
}) => {
  const [rows, setRows] = useState<ValidationRow[]>(INITIAL_ROWS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const evaluation = useMemo(
    () => rows.map((row) => ({ row, result: getRowState(row) })),
    [rows]
  );

  const counts = useMemo(() => {
    return evaluation.reduce(
      (acc, item) => {
        acc[item.result.status] += 1;
        return acc;
      },
      { pass: 0, warning: 0, error: 0 }
    );
  }, [evaluation]);

  const hasError = counts.error > 0;
  const warningsReady = evaluation
    .filter((item) => item.result.status === 'warning')
    .every((item) => item.row.isAcknowledged && item.row.note.trim() !== '');
  const canSubmit = !hasError && warningsReady;

  const updateRow = (id: number, patch: Partial<ValidationRow>) => {
    setRows((currentRows) =>
      currentRows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting || isBusy) {
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(`นำเข้าข้อมูลสำเร็จ ${rows.length} รายการจากไฟล์ ${fileName}`);
    }, 900);
  };

  return (
    <div className="flex-1 overflow-auto bg-[linear-gradient(180deg,_#f5f6f2_0%,_#fafaf8_100%)]">
      <div className="max-w-[1440px] mx-auto px-4 py-5 md:px-8 md:py-8 pb-24">
        <section className="bg-white/95 backdrop-blur rounded-[28px] border border-stone-200 shadow-[0_24px_80px_-40px_rgba(41,37,36,0.45)] overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur px-5 py-4 md:px-8 md:py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={onBack}
                  className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 transition-colors hover:bg-stone-100"
                  aria-label="ย้อนกลับไปขั้นตอนอัปโหลด"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">
                    Validation Grid
                  </div>
                  <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight text-stone-900">ตารางตรวจสอบความถูกต้อง</h2>
                  <p className="mt-2 max-w-3xl text-sm text-stone-600">
                    ขั้นตอนสุดท้ายก่อนบันทึกข้อมูลเข้าสู่ระบบ ตรวจสอบรายการที่เป็น Error และยืนยัน Warning ให้ครบทุกแถวเพื่อปลดล็อกการบันทึก
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-500">
                    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                      {fileName}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">
                      กลุ่มพืช: {groupLabel}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5">
                      {rows.length} รายการ
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-end">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-700">Workflow</p>
                    <p className="font-semibold text-emerald-900">Step 2 of 2</p>
                  </div>
                </div>

                <div className="flex gap-2 text-sm font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" /> {counts.pass} ผ่าน
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                    <AlertTriangle className="w-4 h-4" /> {counts.warning} เตือน
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                    <AlertOctagon className="w-4 h-4" /> {counts.error} ผิดพลาด
                  </span>
                </div>

                {!hasError && (
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isSubmitting || isBusy}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                      canSubmit && !isSubmitting && !isBusy
                        ? 'mris-brand-button shadow-lg shadow-emerald-950/10'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting || isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    บันทึกข้อมูลเข้าระบบ
                  </button>
                )}
              </div>
            </div>
          </header>

          <div className="px-5 py-5 md:px-8 md:py-6 space-y-5">
            {hasError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-800">
                <div className="flex items-start gap-3">
                  <AlertOctagon className="w-5 h-5 mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-bold">พบ Error ที่ต้องแก้ไขก่อนบันทึก</p>
                    <p className="mt-1 text-sm text-red-700">
                      ระบบซ่อนปุ่มบันทึกไว้จนกว่าจะแก้ไขช่องที่เป็นสีแดงทั้งหมดให้ถูกต้อง
                    </p>
                  </div>
                </div>
              </div>
            ) : counts.warning > 0 && !warningsReady ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-700" />
                  <div>
                    <p className="text-sm font-bold">ยังมี Warning ที่ต้องยืนยัน</p>
                    <p className="mt-1 text-sm text-amber-800">
                      สำหรับแถวสีเหลือง ต้องติ๊กยืนยันและกรอกหมายเหตุก่อน จึงจะเปิดใช้งานการบันทึกได้
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-bold">ข้อมูลพร้อมบันทึก</p>
                    <p className="mt-1 text-sm text-emerald-800">
                      ไม่พบ Error คงค้าง และ Warning ทุกแถวได้รับการยืนยันพร้อมบันทึกหมายเหตุแล้ว
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
              <div className="max-h-[68vh] overflow-auto">
                <table className="w-full min-w-[1180px] border-collapse text-sm text-left text-stone-700">
                  <thead className="sticky top-0 z-20 bg-stone-100 text-stone-700 shadow-[0_1px_0_#e7e5e4]">
                    <tr>
                      <th className="border-r border-stone-200 px-4 py-3 text-center font-semibold">ต้นที่</th>
                      <th className="border-r border-stone-200 px-4 py-3 font-semibold">รหัสต้นไม้</th>
                      <th className="border-r border-stone-200 px-4 py-3 font-semibold">ชื่อพรรณไม้</th>
                      <th className="border-r border-stone-200 px-4 py-3 text-center font-semibold">สถานะรอดตาย</th>
                      <th className="border-r border-stone-200 px-4 py-3 text-right font-semibold">RCD (ซม.)</th>
                      <th className="border-r border-stone-200 px-4 py-3 text-right font-semibold">ความสูง (ม.)</th>
                      <th className="border-r border-stone-200 px-4 py-3 font-semibold">การตรวจสอบ</th>
                      <th className="px-4 py-3 font-semibold">หมายเหตุ / การยืนยันข้อมูล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {evaluation.map(({ row, result }) => {
                      const isErrorCode = result.status === 'error' && result.errorType === 'tree_code';
                      const isErrorHeight = result.status === 'error' && result.errorType === 'height';
                      const isWarning = result.status === 'warning';
                      const rowClassName =
                        result.status === 'error'
                          ? 'bg-red-50/70'
                          : result.status === 'warning'
                            ? 'bg-amber-50/70'
                            : row.survival === 'ตาย'
                              ? 'bg-stone-50 text-stone-500'
                              : 'bg-white hover:bg-stone-50/80';

                      return (
                        <tr key={row.id} className={rowClassName}>
                          <td className="border-r border-stone-200 px-4 py-3 text-center text-stone-400">{row.tree_no}</td>
                          <td className="border-r border-stone-200 px-4 py-3 align-top">
                            <div className="flex flex-col gap-2">
                              <input
                                value={row.tree_code}
                                onChange={(event) => updateRow(row.id, { tree_code: event.target.value })}
                                className={`w-full rounded-lg border px-3 py-2 font-mono text-sm outline-none transition-all ${
                                  isErrorCode
                                    ? 'border-red-400 bg-red-50 ring-2 ring-red-100'
                                    : 'border-stone-300 bg-white focus:border-emerald-500'
                                } ${row.survival === 'ตาย' ? 'text-stone-400 line-through decoration-stone-300' : ''}`}
                                placeholder="ระบุรหัสต้นไม้"
                              />
                              {isErrorCode && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                                  <XCircle className="w-3.5 h-3.5" /> {result.message}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="border-r border-stone-200 px-4 py-3">{row.species}</td>
                          <td className="border-r border-stone-200 px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                row.survival === 'รอด'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              {row.survival}
                            </span>
                          </td>
                          <td className="border-r border-stone-200 px-4 py-3 text-right font-mono">
                            {isWarning ? (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 font-semibold text-amber-800">
                                <AlertTriangle className="w-3.5 h-3.5" /> {row.rcd}
                              </span>
                            ) : (
                              row.rcd
                            )}
                          </td>
                          <td className="border-r border-stone-200 px-4 py-3 text-right align-top">
                            <div className="flex flex-col items-end gap-2">
                              <input
                                value={row.height}
                                onChange={(event) => updateRow(row.id, { height: event.target.value })}
                                disabled={row.survival === 'ตาย'}
                                className={`w-[120px] rounded-lg border px-3 py-2 text-right font-mono outline-none transition-all ${
                                  isErrorHeight
                                    ? 'border-red-400 bg-red-50 text-red-700 ring-2 ring-red-100'
                                    : 'border-stone-300 bg-white focus:border-emerald-500'
                                } ${row.survival === 'ตาย' ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400' : ''}`}
                                placeholder="0.00"
                              />
                              {isErrorHeight && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                                  <XCircle className="w-3.5 h-3.5" /> {result.message}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="border-r border-stone-200 px-4 py-3 align-top">
                            {result.status === 'pass' && (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <CheckCircle2 className="w-4 h-4" /> {result.message}
                              </span>
                            )}
                            {result.status === 'warning' && (
                              <span className="inline-flex items-center gap-1 font-medium text-amber-800">
                                <AlertTriangle className="w-4 h-4" /> {result.message}
                              </span>
                            )}
                            {result.status === 'error' && (
                              <span className="inline-flex items-center gap-1 font-medium text-red-700">
                                <XCircle className="w-4 h-4" /> {result.message}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top">
                            {result.status === 'warning' ? (
                              <div className="flex min-w-[320px] items-start gap-3">
                                <label className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-stone-700">
                                  <input
                                    type="checkbox"
                                    checked={row.isAcknowledged}
                                    onChange={() =>
                                      updateRow(row.id, {
                                        isAcknowledged: !row.isAcknowledged,
                                        note: row.isAcknowledged ? '' : row.note,
                                      })
                                    }
                                    className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                  />
                                  ยืนยัน
                                </label>
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={row.note}
                                    onChange={(event) => updateRow(row.id, { note: event.target.value })}
                                    disabled={!row.isAcknowledged}
                                    placeholder="ระบุเหตุผลหรือบริบทของค่าผิดปกติ"
                                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${
                                      !row.isAcknowledged
                                        ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
                                        : row.note.trim() === ''
                                          ? 'border-red-400 bg-white ring-2 ring-red-100'
                                          : 'border-stone-300 bg-white focus:border-emerald-500'
                                    }`}
                                  />
                                  {row.isAcknowledged && row.note.trim() === '' && (
                                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-700">
                                      <AlertCircle className="w-3.5 h-3.5" /> ต้องกรอกหมายเหตุก่อนดำเนินการต่อ
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : result.status === 'error' ? (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-red-700">
                                <Info className="w-4 h-4" /> แก้ไขค่าที่ไฮไลต์สีแดงเพื่อปลดล็อกการบันทึก
                              </span>
                            ) : (
                              <span className="text-sm italic text-stone-400">{result.message}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500 md:flex-row md:items-center md:justify-between">
                <span className="inline-flex items-center gap-1">
                  <Info className="w-4 h-4" /> Error ต้องแก้ไขก่อนบันทึก ส่วน Warning ต้องยืนยันพร้อมหมายเหตุทุกแถว
                </span>
                <span>แสดง {rows.length} จาก {rows.length} รายการ</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ValidationGridView;