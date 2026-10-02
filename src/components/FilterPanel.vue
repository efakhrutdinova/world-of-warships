<template>
  <div class="filter-panel">
    <div class="filter-header">
      <h3>Filters</h3>
      <button
        v-if="hasActiveFilters"
        @click="$emit('reset')"
        class="reset-btn"
      >
        Reset All
      </button>
    </div>

    <div class="filter-section">
      <h4>Nation</h4>
      <div class="filter-options">
        <label v-for="nation in nations" :key="nation" class="filter-option">
          <input
            :checked="selectedNations.includes(nation)"
            @change="toggleFilter('nations', nation)"
            type="checkbox"
          />
          <span>{{ nation }}</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <h4>Type</h4>
      <div class="filter-options">
        <label v-for="type in types" :key="type" class="filter-option">
          <input
            :checked="selectedTypes.includes(type)"
            @change="toggleFilter('types', type)"
            type="checkbox"
          />
          <span>{{ type }}</span>
        </label>
      </div>
    </div>

    <div class="filter-section">
      <h4>Tier</h4>
      <div class="filter-options">
        <label v-for="level in levels" :key="level" class="filter-option">
          <input
            :checked="selectedLevels.includes(level)"
            @change="toggleFilter('levels', level)"
            type="checkbox"
          />
          <span>{{ level }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ship } from '../types/ships';

interface Props {
  ships: Ship[];
  selectedNations: string[];
  selectedTypes: string[];
  selectedLevels: number[];
}

interface Emits {
  'update-filter': [type: 'nations' | 'types' | 'levels', value: string | number];
  'reset': [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const nations = computed(() => {
  const unique = new Set(props.ships.map(s => s.nation));
  return Array.from(unique).sort();
});

const types = computed(() => {
  const unique = new Set(props.ships.map(s => s.type));
  return Array.from(unique).sort();
});

const levels = computed(() => {
  const unique = new Set(props.ships.map(s => s.level));
  return Array.from(unique).sort((a, b) => a - b);
});

const hasActiveFilters = computed(() => {
  return (
    props.selectedNations.length > 0 ||
    props.selectedTypes.length > 0 ||
    props.selectedLevels.length > 0
  );
});

const toggleFilter = (type: 'nations' | 'types' | 'levels', value: string | number) => {
  emit('update-filter', type, value);
};
</script>

<style scoped>
.filter-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #0f3460;
  border-radius: 8px;
  padding: 16px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #0f3460;
}

.filter-header h3 {
  margin: 0;
  font-size: 18px;
  color: #fff;
}

.reset-btn {
  background: linear-gradient(135deg, #e94560 0%, #d63447 100%);
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #e94560;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-option {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #a8b4d4;
  transition: color 0.3s ease;
  font-size: 14px;
}

.filter-option:hover {
  color: #e94560;
}

.filter-option input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #e94560;
}

@media (max-width: 768px) {
  .filter-panel {
    position: static;
    max-height: none;
    margin-bottom: 20px;
  }
}
</style>
