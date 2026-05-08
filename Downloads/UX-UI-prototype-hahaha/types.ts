
// ============================================================
// Types for MRIS — Multipurpose Reforestation Information System
// ============================================================

// --- Navigation ---
export type ViewType = 'dashboard' | 'map' | 'trees' | 'import' | 'export' | 'admin';

export interface NavItem {
  id: ViewType;
  th: string;
  icon: string;
  group: 'main' | 'data' | 'sys';
}

// --- Plot ---
export interface Plot {
  code: string;
  name: string;
  short: string;
  area_rai: number;
  anchor_utm: [number, number];
  rotation_deg: number;
}

// --- Species ---
export interface Species {
  code: string;
  name: string;
  group: 'A' | 'B';
  cat: PlantCategory;
  color: string;
}

// --- Category ---
export type PlantCategory = 'forest' | 'fruit' | 'rubber' | 'bamboo' | 'banana' | 'herb';

export interface Category {
  id: PlantCategory;
  th: string;
  color: string;
}

// --- Tree (rcd-based, matches mris/ data model) ---
export interface TreeRecord {
  id: number;
  log_id: string;
  tree_code: string;
  plot_code: string;
  species_code: string;
  species_name: string;
  species_group: 'A' | 'B';
  category: PlantCategory;
  color: string;
  tree_number: number;
  status: 'alive' | 'dead';
  flowering: 'yes' | 'no';
  spacing: string;

  // Common measurements
  rcd_cm: number | null;
  height_m: number | null;

  // Bamboo specifics
  culm_count: number | null;
  rcd_cm_1: number | null;
  rcd_cm_2: number | null;
  rcd_cm_3: number | null;

  // Banana specifics
  total_count: number | null;
  sucker_count: number | null;
  plant_count: number | null;
  productivity_bunches: number | null;
  productivity_combs: number | null;
  price_per_comb: number | null;

  // Herb specifics
  new_shoot_count: number | null;
  produce_length_1_cm: number | null;
  produce_length_2_cm: number | null;
  produce_length_3_cm: number | null;
  price_per_kg: number | null;

  // Notes
  notes: string;
  recorder: string;
  survey_date: string;

  // Coordinates
  utm_x: number;
  utm_y: number;
  local_x: number;
  local_y: number;
}

// --- User ---
export interface User {
  user_id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'surveyor' | 'analyst' | 'viewer';
  created_at: string;
  token?: string;
}

// --- Import History ---
export interface ImportRecord {
  id: string;
  file: string;
  cat: PlantCategory;
  total: number;
  passed: number;
  soft: number;
  hard: number;
  by: string;
  at: string;
}

// --- Auth User (session) ---
export interface SessionUser {
  username: string;
  full_name: string;
  role: string;
  token: string;
}

// --- Growth Series ---
export interface GrowthSeriesItem {
  cat: PlantCategory;
  th: string;
  color: string;
  series: Array<{ year: number; avg_rcd: number; avg_height: number }>;
}

// --- Survival Series ---
export interface SurvivalSeriesItem {
  plot: string;
  series: Array<{ year: number; rate: number }>;
}

// ==============================================
// Legacy types (kept for backward compat)
// ==============================================

export interface SpeciesInfo {
  code: string;
  name: string;
  group: 'A' | 'B';
}

export interface GrowthFormData {
  plotCode: string;
  treeNumber: string;
  speciesCode: string;

  // Common
  heightM: string;
  status: 'alive' | 'dead' | null;
  flowering: 'yes' | 'no' | null;
  note: string;
  recorder: string;
  surveyDate: string;

  // Standard (Forest/Rubber/Fruit)
  dbhCm: string;

  // Bamboo
  bambooCulms: string;
  dbh1Cm: string;
  dbh2Cm: string;
  dbh3Cm: string;

  // Banana
  bananaTotal: string;
  banana1yr: string;
  yieldBunches: string;
  yieldHands: string;
  pricePerHand: string;
}

export type LegacyViewType = 'import' | 'stats' | 'table';
