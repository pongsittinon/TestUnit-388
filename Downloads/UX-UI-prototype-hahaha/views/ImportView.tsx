import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Lock, CheckCircle2, AlertCircle, ArrowRight, FolderUp } from 'lucide-react';
import { PLANT_GROUPS } from '../constants';
import { PlantCategory } from '../types';
import ValidationGridView from './ValidationGridView';

interface ImportViewProps {
  isBusy: boolean;
  onAdvance: (message: string) => void;
}

const ACCEPTED_EXTENSIONS = ['xlsx', 'csv'];

const getFileExtension = (filename: string) => filename.split('.').pop()?.toLowerCase() || '';

const ImportView: React.FC<ImportViewProps> = ({ isBusy, onAdvance }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<PlantCategory | ''>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const isUploadLocked = !selectedGroup || isBusy;

  const validateAndStoreFile = (file: File) => {
    const extension = getFileExtension(file.name);

    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadedFile(null);
      setFileError('ระบบรองรับเฉพาะไฟล์ .xlsx และ .csv สำหรับขั้นตอนนี้');
      return;
    }

    setUploadedFile(file);
    setFileError(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isUploadLocked) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (isUploadLocked) {
      return;
    }

    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndStoreFile(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndStoreFile(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setFileError(null);
    setCurrentStep(1);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (currentStep === 2 && uploadedFile && selectedGroup) {
    return (
      <ValidationGridView
        groupLabel={PLANT_GROUPS.find((group) => group.category === selectedGroup)?.label || selectedGroup}
        fileName={uploadedFile.name}
        isBusy={isBusy}
        onBack={() => setCurrentStep(1)}
        onSubmit={onAdvance}
      />
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[radial-gradient(circle_at_top_left,_rgba(34,74,44,0.10),_transparent_32%),linear-gradient(180deg,_#f5f6f2_0%,_#fafaf8_100%)]">
      <div className="max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-8 pb-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_360px] items-start">
          <section className="bg-white/90 backdrop-blur rounded-[28px] border border-stone-200 shadow-[0_24px_80px_-40px_rgba(41,37,36,0.45)] overflow-hidden">
            <div className="text-white px-6 py-6 md:px-8 border-b border-white/10" style={{ backgroundColor: 'var(--mris-brand-900)' }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: 'var(--mris-brand-100)' }}>
                    Smart Bulk Import
                  </div>
                  <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">การนำเข้าข้อมูล</h2>
                  <p className="mt-2 max-w-2xl text-sm text-white/80">
                    ขั้นตอนแรกของการนำเข้าข้อมูลแบบกลุ่ม เริ่มจากเลือกกลุ่มพืชที่ถูกต้องก่อน แล้วจึงแนบไฟล์ Excel หรือ CSV เพื่อเข้าสู่หน้าตรวจสอบข้อมูล
                  </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-black/15 px-4 py-3 border border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" style={{ color: 'var(--mris-brand-100)' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--mris-brand-100)' }}>Workflow</p>
                    <p className="font-semibold">Step 1 of 2</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 md:px-8 md:py-8 space-y-8">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-3">
                    1. เลือกกลุ่มพืช <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedGroup}
                      onChange={(event) => {
                        setSelectedGroup(event.target.value as PlantCategory);
                        setFileError(null);
                      }}
                      className={`mris-input w-full appearance-none rounded-2xl px-4 py-4 pr-12 text-sm transition-all ${
                        selectedGroup ? 'bg-white' : 'border-stone-300 hover:border-stone-400'
                      }`}
                      style={selectedGroup ? { borderColor: 'var(--mris-brand-600)', boxShadow: '0 0 0 4px rgba(63, 138, 86, 0.12)' } : undefined}
                    >
                      <option value="" disabled>-- กรุณาเลือกกลุ่มพืช (1 ใน 6 กลุ่ม) --</option>
                      {PLANT_GROUPS.map((group) => (
                        <option key={group.id} value={group.category}>{group.label}</option>
                      ))}
                    </select>
                    {selectedGroup && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--mris-brand-600)' }} />}
                  </div>
                  {!selectedGroup && (
                    <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      ต้องเลือกกลุ่มพืชก่อน จึงจะเปิดพื้นที่อัปโหลดไฟล์ได้
                    </p>
                  )}
                </div>

                <aside className="rounded-2xl border p-4 text-sm mris-brand-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.24em]">เงื่อนไขไฟล์</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6">
                    <li>รองรับเฉพาะไฟล์ .xlsx และ .csv</li>
                    <li>นำเข้าได้สูงสุด 500 รายการต่อครั้ง</li>
                    <li>ระบบจะตรวจสอบความถูกต้องในขั้นตอนถัดไป</li>
                  </ul>
                </aside>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 gap-3">
                  <label className="text-sm font-bold text-stone-800">
                    2. อัปโหลดไฟล์ข้อมูล <span className="text-red-500">*</span>
                  </label>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                    isUploadLocked ? 'border-stone-200 bg-stone-100 text-stone-500' : 'mris-brand-soft'
                  }`}>
                    {isUploadLocked ? <Lock className="w-3.5 h-3.5" /> : <FolderUp className="w-3.5 h-3.5" />}
                    {isUploadLocked ? 'ล็อกจนกว่าจะเลือกกลุ่มพืช' : 'พร้อมรับไฟล์'}
                  </span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative min-h-[320px] rounded-[28px] border-2 border-dashed px-6 py-8 md:px-10 md:py-10 text-center transition-all ${
                    isUploadLocked
                      ? 'border-stone-200 bg-stone-100/80 opacity-80'
                      : isDragging
                        ? 'bg-[var(--mris-brand-50)] shadow-inner'
                        : 'border-stone-300 bg-stone-50/70 hover:bg-white'
                  }`}
                  style={isDragging ? { borderColor: 'var(--mris-brand-600)' } : undefined}
                >
                  {isUploadLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[28px] bg-stone-100/85 backdrop-blur-[1px]">
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-stone-200 flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-stone-500" />
                      </div>
                      <p className="font-semibold text-stone-700">กรุณาเลือกกลุ่มพืชก่อนเริ่มอัปโหลด</p>
                      <p className="mt-1 text-sm text-stone-500">เมื่อเลือกแล้ว พื้นที่นี้จะพร้อมรับไฟล์ทันที</p>
                    </div>
                  )}

                  <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx,.csv"
                    onChange={handleFileChange}
                    disabled={isUploadLocked}
                    className="hidden"
                    id="smart-import-file"
                  />

                  {!uploadedFile ? (
                    <label htmlFor="smart-import-file" className={isUploadLocked ? 'pointer-events-none' : 'cursor-pointer'}>
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] text-white shadow-lg shadow-emerald-950/10" style={{ backgroundColor: 'var(--mris-brand-900)' }}>
                        <UploadCloud className="h-10 w-10" />
                      </div>
                      <h3 className="mt-6 text-xl font-bold text-stone-800">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</h3>
                      <p className="mt-2 text-sm text-stone-500">รองรับไฟล์ .xlsx / .csv สำหรับนำเข้าข้อมูลครั้งละไม่เกิน 500 รายการ</p>
                      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                        <AlertCircle className="w-4 h-4" />
                        ตรวจสอบชนิดไฟล์ก่อนเข้าสู่ขั้นตอน Validation Grid
                      </div>
                    </label>
                  ) : (
                    <div className="flex h-full min-h-[240px] flex-col items-center justify-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] mris-brand-soft">
                        <FileSpreadsheet className="h-10 w-10" />
                      </div>
                      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] mris-brand-text">File Ready</p>
                      <h3 className="mt-2 text-xl font-bold text-stone-900 break-all">{uploadedFile.name}</h3>
                      <p className="mt-2 text-sm mris-brand-text">แนบไฟล์สำเร็จ พร้อมเข้าสู่หน้าตรวจสอบข้อมูล</p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-500">
                        <span className="rounded-full bg-stone-100 px-3 py-1.5 border border-stone-200">กลุ่มพืช: {PLANT_GROUPS.find((group) => group.category === selectedGroup)?.label || selectedGroup}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1.5 border border-stone-200">ชนิดไฟล์: .{getFileExtension(uploadedFile.name)}</span>
                      </div>
                      <button
                        onClick={clearFile}
                        className="mt-6 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        ยกเลิกและเลือกไฟล์ใหม่
                      </button>
                    </div>
                  )}
                </div>

                {fileError && (
                  <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-stone-200 bg-stone-50 px-6 py-4 md:px-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-stone-500">
                ขั้นตอนถัดไปจะเป็นการตรวจสอบความถูกต้องของข้อมูลแบบตาราง ก่อนอนุญาตให้บันทึกเข้าสู่ระบบ
              </p>
              <button
                onClick={() => uploadedFile && setCurrentStep(2)}
                disabled={!uploadedFile || isBusy}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                  uploadedFile && !isBusy
                    ? 'mris-brand-button shadow-lg shadow-emerald-950/10'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                ถัดไป: ตรวจสอบข้อมูล
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Step Overview</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border px-4 py-3 mris-brand-soft">
                  <p className="text-sm font-semibold">1. Upload</p>
                  <p className="mt-1 text-xs opacity-80">เลือกกลุ่มพืชและแนบไฟล์ต้นฉบับ</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="text-sm font-semibold text-stone-700">2. Validation Grid</p>
                  <p className="mt-1 text-xs text-stone-500">ตรวจสอบ Error, Warning, Notes และยืนยันก่อนบันทึก</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">Prototype Notes</p>
              <div className="mt-4 space-y-3 text-sm text-stone-600 leading-6">
                <p>หน้าจอนี้เป็น frontend prototype จึงยังไม่ parse ไฟล์จริงหรือเช็กจำนวนแถวในสเปรดชีต</p>
                <p>ระบบจะล็อกการอัปโหลดไว้จนกว่าจะเลือกกลุ่มพืช เพื่อกันการนำเข้าผิดกลุ่มตั้งแต่ต้นทาง</p>
                <p>รูปแบบการแจ้งเตือนและปุ่ม CTA ถูกจัดให้รองรับการต่อยอดไปยัง Step 2 ได้ตรงจาก flow นี้</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ImportView;
