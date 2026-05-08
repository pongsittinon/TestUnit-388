
import { TreeRecord, SpeciesInfo, PlantCategory } from '../types';

export const getPlantCategory = (speciesName: string, speciesGroup: string): PlantCategory => {
  if (!speciesName) return 'ไม้ป่า'; // Default
  
  const name = speciesName.toLowerCase();

  if (name.includes('ยางพารา')) return 'ยางพารา';
  if (name.includes('ไผ่')) return 'ผลผลิตไผ่';
  if (name.includes('กล้วย')) return 'กล้วย';
  if (name.includes('สมุนไพร')) return 'สมุนไพร';
  
  // Logic for others
  if (speciesGroup === 'B') return 'ไม้ผล';
  
  return 'ไม้ป่า'; // Default for Group A (Forest)
};

export const getCategoryFromRecord = (record: TreeRecord): PlantCategory => {
  return getPlantCategory(record.species_name, record.species_group);
};

export const getCategoryFromInfo = (info: SpeciesInfo): PlantCategory => {
  return getPlantCategory(info.name, info.group);
};

export const getCategoryColor = (category: PlantCategory) => {
  switch (category) {
    case 'ไม้ป่า': return 'bg-[#edf5ef] text-[#224a2c] border-[#cfe0d3]';
    case 'ไม้ผล': return 'bg-[#f7efe7] text-[#8c5a2b] border-[#edd7c0]';
    case 'ยางพารา': return 'bg-[#edf3f8] text-[#365f86] border-[#cedaea]';
    case 'ผลผลิตไผ่': return 'bg-[#f8f4e8] text-[#7d6831] border-[#e9ddbb]';
    case 'กล้วย': return 'bg-[#f4f6e8] text-[#61743a] border-[#dde5bf]';
    case 'สมุนไพร': return 'bg-[#eef4ec] text-[#49654b] border-[#d2dfd0]';
    default: return 'bg-gray-100 text-gray-800';
  }
};
