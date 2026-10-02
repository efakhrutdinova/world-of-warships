/**
 * Type definitions for World of Warships data
 */

export interface Ship {
  id: number;
  name: string;
  nation: string;
  type: string;
  level: number;
  tier: number;
  image_url?: string;
  description?: string;
  is_premium?: boolean;
  cost_credit?: number;
  cost_gold?: number;
}

export interface Nation {
  id: number;
  name: string;
  color?: string;
}

export interface ShipType {
  id: number;
  name: string;
  name_i18n?: string;
  icon?: string;
}

export interface ApiVehicle {
  [key: string]: {
    name: string;
    description: string;
    nation: string;
    type: string;
    tier: number;
    is_premium: boolean;
    cost_credit?: number;
    cost_gold?: number;
    images?: {
      small?: string;
      medium?: string;
      large?: string;
    };
  };
}

export interface ApiNation {
  [key: string]: {
    name: string;
    color?: string;
  };
}

export interface ApiShipType {
  [key: string]: {
    name: string;
    name_i18n?: string;
    icon?: string;
  };
}

export interface FilterOptions {
  nations: string[];
  types: string[];
  levels: number[];
}

export interface SearchState {
  query: string;
  filters: FilterOptions;
}
