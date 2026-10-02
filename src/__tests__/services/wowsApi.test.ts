import { describe, it, expect } from 'vitest';
import type { Ship } from '../../types/ships';

// Test data parsing functions separately
function parseVehicles(data: Record<string, any>): Ship[] {
  return Object.entries(data).map(([id, vehicle]) => ({
    id: parseInt(id),
    name: vehicle.name,
    nation: vehicle.nation,
    type: vehicle.type,
    level: vehicle.tier,
    tier: vehicle.tier,
    description: vehicle.description,
    is_premium: vehicle.is_premium,
    cost_credit: vehicle.cost_credit,
    cost_gold: vehicle.cost_gold,
    image_url: vehicle.images?.medium || vehicle.images?.small,
  }));
}

describe('Ship Data Parsing', () => {
  it('should parse vehicles correctly', () => {
    const mockData = {
      '1': {
        name: 'Battleship A',
        description: 'A powerful ship',
        nation: 'USSR',
        type: 'Battleship',
        tier: 5,
        is_premium: false,
        images: {
          medium: 'http://example.com/image.jpg',
        },
      },
    };

    const ships = parseVehicles(mockData);
    
    expect(ships).toHaveLength(1);
    expect(ships[0].name).toBe('Battleship A');
    expect(ships[0].nation).toBe('USSR');
    expect(ships[0].level).toBe(5);
    expect(ships[0].image_url).toBe('http://example.com/image.jpg');
  });

  it('should handle multiple vehicles', () => {
    const mockData = {
      '1': {
        name: 'Ship A',
        nation: 'USA',
        type: 'Battleship',
        tier: 5,
        is_premium: false,
      },
      '2': {
        name: 'Ship B',
        nation: 'USSR',
        type: 'Cruiser',
        tier: 3,
        is_premium: true,
      },
    };

    const ships = parseVehicles(mockData);
    
    expect(ships).toHaveLength(2);
    expect(ships[0].is_premium).toBe(false);
    expect(ships[1].is_premium).toBe(true);
  });

  it('should handle missing images gracefully', () => {
    const mockData = {
      '1': {
        name: 'Ship A',
        nation: 'USA',
        type: 'Destroyer',
        tier: 2,
        is_premium: false,
      },
    };

    const ships = parseVehicles(mockData);
    
    expect(ships[0].image_url).toBeUndefined();
  });
});
