import { ref, computed } from 'vue';
import type { Ship, FilterOptions } from '../types/ships';

export function useShipFilters(ships: Ship[]) {
  const selectedNations = ref<string[]>([]);
  const selectedTypes = ref<string[]>([]);
  const selectedLevels = ref<number[]>([]);

  const filteredShips = computed(() => {
    return ships.filter(ship => {
      const nationMatch = selectedNations.value.length === 0 || selectedNations.value.includes(ship.nation);
      const typeMatch = selectedTypes.value.length === 0 || selectedTypes.value.includes(ship.type);
      const levelMatch = selectedLevels.value.length === 0 || selectedLevels.value.includes(ship.level);

      return nationMatch && typeMatch && levelMatch;
    });
  });

  const setFilter = (filterName: keyof FilterOptions, values: string[] | number[]) => {
    if (filterName === 'nations') {
      selectedNations.value = values as string[];
    } else if (filterName === 'types') {
      selectedTypes.value = values as string[];
    } else if (filterName === 'levels') {
      selectedLevels.value = values as number[];
    }
  };

  const resetFilters = () => {
    selectedNations.value = [];
    selectedTypes.value = [];
    selectedLevels.value = [];
  };

  return {
    filteredShips,
    selectedNations,
    selectedTypes,
    selectedLevels,
    setFilter,
    resetFilters,
  };
}
