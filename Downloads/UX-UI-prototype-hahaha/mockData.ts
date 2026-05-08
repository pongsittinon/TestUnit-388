
import { TreeRecord, CoordRecord } from './types';
import { PLOT_LIST, SPECIES_LIST } from './constants';

const SURVEY_YEARS = [2023, 2024, 2025];
const SEEDED_SPECIES_CODES = ['A01', 'A02', 'A19', 'A20', 'B03', 'B12', 'B15'];
const RECORDER_NAMES = ['สมชาย', 'วิชัย', 'จารุวรรณ', 'ดวงพร'];

const SPECIES_BASE_RCD: Record<string, number> = {
  A01: 8.8,
  A02: 7.6,
  A19: 6.4,
  A20: 5.5,
  B03: 6.1,
  B12: 4.4,
  B15: 3.9,
};

const SPECIES_YEARLY_GAIN: Record<string, number> = {
  A01: 0.9,
  A02: 0.75,
  A19: 0.7,
  A20: 0.6,
  B03: 0.58,
  B12: 0.5,
  B15: 0.4,
};

const seededSpecies = SEEDED_SPECIES_CODES.map((code) => {
  const species = SPECIES_LIST.find((item) => item.code === code);
  if (!species) {
    throw new Error(`Species code not found in constants: ${code}`);
  }
  return species;
});

let runningId = 1;

export const MOCK_TREE_RECORDS: TreeRecord[] = PLOT_LIST.flatMap((plot, plotIndex) => {
  return seededSpecies.flatMap((species, speciesIndex) => {
    const treeNumber = speciesIndex * 10 + plotIndex + 1;
    const treeCode = `${plot.code}${species.code}${String(treeNumber).padStart(3, '0')}`;
    const subRow = ['A', 'B', 'C', 'D'][speciesIndex % 4];
    const baseRcd = SPECIES_BASE_RCD[species.code] + plotIndex * 0.22;
    const recorder = RECORDER_NAMES[(plotIndex + speciesIndex) % RECORDER_NAMES.length];

    return SURVEY_YEARS.map((year, yearIndex) => {
      const growthNoise = ((plotIndex * 3 + speciesIndex * 5 + yearIndex) % 4) * 0.08;
      const rcd = Number((baseRcd + SPECIES_YEARLY_GAIN[species.code] * yearIndex + growthNoise).toFixed(2));
      const status = year >= 2024 && (plotIndex + speciesIndex + yearIndex) % 11 === 0 ? 'dead' : 'alive';
      const height = Number((2.2 + yearIndex * 0.45 + plotIndex * 0.06 + speciesIndex * 0.14).toFixed(2));
      const isBamboo = species.code === 'A20';
      const isBanana = species.code === 'B12';
      const isHerb = species.code === 'B15';
      const flowering = species.group === 'B' && !isHerb && yearIndex >= 1 ? 'yes' : 'no';

      const record: TreeRecord = {
        id: runningId,
        log_id: `log-${year}-${String(runningId).padStart(4, '0')}`,
        tree_code: treeCode,
        tag_label: `${String(treeNumber).padStart(3, '0')} ${plot.short} ${String(plotIndex + 1).padStart(2, '0')} (${subRow}) ${species.name}`,
        plot_code: plot.code,
        species_code: species.code,
        species_group: species.group,
        species_name: species.name,
        tree_number: treeNumber,
        row_main: String(plotIndex + 1).padStart(2, '0'),
        row_sub: subRow,
        height_m: status === 'alive' ? height : null,
        status,
        flowering,
        note: status === 'dead' ? 'ต้นโทรม/ยืนต้นตาย' : isHerb ? `สำรวจสมุนไพรรอบปี ${year}` : `สำรวจรอบปี ${year}`,
        recorder,
        survey_date: `${year}-11-15`,
        timestamp: `${year}-11-15T08:00:00Z`,
        dbh_cm: status === 'alive' && !isBamboo ? rcd : null,
        bamboo_culms: isBamboo && status === 'alive' ? 8 + yearIndex + (plotIndex % 3) : null,
        dbh_1_cm: isBamboo && status === 'alive' ? Number((rcd - 0.25).toFixed(2)) : null,
        dbh_2_cm: isBamboo && status === 'alive' ? Number(rcd.toFixed(2)) : null,
        dbh_3_cm: isBamboo && status === 'alive' ? Number((rcd + 0.28).toFixed(2)) : null,
        banana_total: isBanana ? 4 + (plotIndex % 3) + yearIndex : null,
        banana_1yr: isBanana ? 2 + (yearIndex % 2) : null,
        yield_bunches: isBanana && yearIndex >= 2 ? 1 + (plotIndex % 2) : null,
        yield_hands: isBanana && yearIndex >= 2 ? 6 + yearIndex + (plotIndex % 3) : null,
        price_per_hand: isBanana && yearIndex >= 2 ? 22 + yearIndex : null,
      };

      runningId += 1;
      return record;
    });
  });
});

export const MOCK_COORD_RECORDS: CoordRecord[] = [];
