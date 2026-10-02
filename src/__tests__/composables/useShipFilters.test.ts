import { describe, it, expect } from 'vitest';
import { useShipFilters } from '../../composables/useShipFilters';
import type { Ship } from '../../types/ships';

const mockShips: Ship[] = [
  {
    id: 1,
    name: 'Battleship A',
    nation: 'USA',
    type: 'Battleship',
    level: 5,
    tier: 5,
  },
  {
    id: 2,
    name: 'Cruiser A',
    nation: 'USSR',
    type: 'Cruiser',
    level: 5,
    tier: 5,
  },
  {
    id: 3,
    name: 'Destroyer A',
    nation: 'USA',
    type: 'Destroyer',
    level: 3,
    tier: 3,
  },
];

describe('useShipFilters', () => {
  it('should filter by nation', () => {
    const { filteredShips, setFilter } = useShipFilters(mockShips);
    
    setFilter('nations', ['USA']);
    
    expect(filteredShips.value).toHaveLength(2);
    expect(filteredShips.value.every(s => s.nation === 'USA')).toBe(true);
  });

  it('should filter by type', () => {
    const { filteredShips, setFilter } = useShipFilters(mockShips);
    
    setFilter('types', ['Cruiser']);
    
    expect(filteredShips.value).toHaveLength(1);
    expect(filteredShips.value[0].type).toBe('Cruiser');
  });

  it('should reset filters', () => {
    const { filteredShips, setFilter, resetFilters } = useShipFilters(mockShips);
    
    setFilter('nations', ['USA']);
    expect(filteredShips.value).toHaveLength(2);
    
    resetFilters();
    expect(filteredShips.value).toHaveLength(3);
  });
});
