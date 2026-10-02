import { ref, computed } from 'vue';
import type { Ship } from '../types/ships';

export function useShipSearch(ships: Ship[]) {
  const searchQuery = ref('');

  const searchedShips = computed(() => {
    if (!searchQuery.value.trim()) {
      return ships;
    }

    const query = searchQuery.value.toLowerCase();
    return ships.filter(ship =>
      ship.name.toLowerCase().includes(query) ||
      ship.nation.toLowerCase().includes(query) ||
      ship.type.toLowerCase().includes(query)
    );
  });

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
  };

  const clearSearch = () => {
    searchQuery.value = '';
  };

  return {
    searchQuery,
    searchedShips,
    setSearchQuery,
    clearSearch,
  };
}
