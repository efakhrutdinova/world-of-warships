import axios from 'axios';
import type { ApiVehicle, ApiNation, ApiShipType, Ship, Nation, ShipType } from '../types/ships';

const API_BASE = 'https://vortex.worldofwarships.eu/api/encyclopedia/en';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

interface ApiCache {
  vehicles?: ApiVehicle;
  nations?: ApiNation;
  types?: ApiShipType;
  timestamp: number;
}

const cache: ApiCache = { timestamp: 0 };
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const wowsApi = {
  async getVehicles(): Promise<Ship[]> {
    try {
      if (cache.vehicles && Date.now() - cache.timestamp < CACHE_DURATION) {
        return parseVehicles(cache.vehicles);
      }

      const { data } = await apiClient.get<ApiVehicle>('/vehicles/');
      cache.vehicles = data;
      cache.timestamp = Date.now();

      return parseVehicles(data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      throw new Error('Failed to load ships. Please try again later.');
    }
  },

  async getNations(): Promise<Nation[]> {
    try {
      if (cache.nations && Date.now() - cache.timestamp < CACHE_DURATION) {
        return parseNations(cache.nations);
      }

      const { data } = await apiClient.get<ApiNation>('/nations/');
      cache.nations = data;
      cache.timestamp = Date.now();

      return parseNations(data);
    } catch (error) {
      console.error('Failed to fetch nations:', error);
      throw new Error('Failed to load nations. Please try again later.');
    }
  },

  async getShipTypes(): Promise<ShipType[]> {
    try {
      if (cache.types && Date.now() - cache.timestamp < CACHE_DURATION) {
        return parseShipTypes(cache.types);
      }

      const { data } = await apiClient.get<ApiShipType>('/vehicle_types_common/');
      cache.types = data;
      cache.timestamp = Date.now();

      return parseShipTypes(data);
    } catch (error) {
      console.error('Failed to fetch ship types:', error);
      throw new Error('Failed to load ship types. Please try again later.');
    }
  },

  async getMediaPath(): Promise<string> {
    try {
      const { data } = await apiClient.get<{ media_path: string }>('/media_path/');
      return data.media_path || '';
    } catch (error) {
      console.error('Failed to fetch media path:', error);
      return '';
    }
  },
};

function parseVehicles(data: ApiVehicle): Ship[] {
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

function parseNations(data: ApiNation): Nation[] {
  return Object.entries(data).map(([id, nation]) => ({
    id: parseInt(id),
    name: nation.name,
    color: nation.color,
  }));
}

function parseShipTypes(data: ApiShipType): ShipType[] {
  return Object.entries(data).map(([id, type]) => ({
    id: parseInt(id),
    name: type.name || type.name_i18n || id,
    name_i18n: type.name_i18n,
    icon: type.icon,
  }));
}
