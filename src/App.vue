<template>
  <div class="app">
    <header class="app-header">
      <h1 class="app-title">World of Warships Fleet</h1>
      <p class="app-subtitle">Explore the complete ship database</p>
    </header>

    <main class="app-main">
      <div class="search-container">
        <search-bar v-model="searchQuery" />
      </div>

      <div class="content-wrapper">
        <aside class="sidebar">
          <filter-panel
            :ships="allShips"
            :selected-nations="filters.selectedNations"
            :selected-types="filters.selectedTypes"
            :selected-levels="filters.selectedLevels"
            @update-filter="handleFilterUpdate"
            @reset="handleResetFilters"
          />
        </aside>

        <section class="main-content">
          <ship-list
            :ships="finalDisplayedShips"
            :is-loading="isLoading"
            :error="error"
            @retry="loadShips"
          />
        </section>
      </div>
    </main>

    <footer class="app-footer">
      <p>Data source: vortex.worldofwarships.eu</p>
      <p>© 2024 World of Warships. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SearchBar from './components/SearchBar.vue';
import FilterPanel from './components/FilterPanel.vue';
import ShipList from './components/ShipList.vue';
import { wowsApi } from './services/wowsApi';
import type { Ship } from './types/ships';

// State
const allShips = ref<Ship[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const searchQuery = ref('');

// Initialize filters
const filters = ref({
  selectedNations: [] as string[],
  selectedTypes: [] as string[],
  selectedLevels: [] as number[],
});

// Computed - filtered by selections
const filteredShips = computed(() => {
  return allShips.value.filter(ship => {
    const nationMatch = filters.value.selectedNations.length === 0 || 
      filters.value.selectedNations.includes(ship.nation);
    const typeMatch = filters.value.selectedTypes.length === 0 || 
      filters.value.selectedTypes.includes(ship.type);
    const levelMatch = filters.value.selectedLevels.length === 0 || 
      filters.value.selectedLevels.includes(ship.level);

    return nationMatch && typeMatch && levelMatch;
  });
});

// Computed - search in filtered ships
const finalDisplayedShips = computed(() => {
  if (!searchQuery.value.trim()) {
    return filteredShips.value;
  }

  const query = searchQuery.value.toLowerCase();
  return filteredShips.value.filter(ship =>
    ship.name.toLowerCase().includes(query) ||
    ship.nation.toLowerCase().includes(query) ||
    ship.type.toLowerCase().includes(query)
  );
});

// Methods
const loadShips = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const ships = await wowsApi.getVehicles();
    allShips.value = ships;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load ships';
  } finally {
    isLoading.value = false;
  }
};

const handleFilterUpdate = (type: 'nations' | 'types' | 'levels', value: string | number) => {
  const filterKey = type as keyof typeof filters.value;
  const currentValues = filters.value[filterKey] as (string | number)[];
  const index = currentValues.indexOf(value);

  if (index > -1) {
    currentValues.splice(index, 1);
  } else {
    currentValues.push(value);
  }
};

const handleResetFilters = () => {
  filters.value = {
    selectedNations: [],
    selectedTypes: [],
    selectedLevels: [],
  };
};

// Lifecycle
onMounted(() => {
  loadShips();
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a0e27 0%, #16213e 100%);
  color: #fff;
}

.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 3px solid #e94560;
  padding: 32px 20px;
  text-align: center;
}

.app-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #e94560, #ff6b9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  margin: 0;
  font-size: 16px;
  color: #a8b4d4;
}

.app-main {
  flex: 1;
  padding: 32px 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.search-container {
  margin-bottom: 32px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

.sidebar {
  min-width: 0;
}

.main-content {
  min-width: 0;
}

.app-footer {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-top: 2px solid #0f3460;
  padding: 24px 20px;
  text-align: center;
  color: #8a92b2;
  font-size: 14px;
}

.app-footer p {
  margin: 4px 0;
}

@media (max-width: 1024px) {
  .app-main {
    padding: 24px 16px;
  }

  .content-wrapper {
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 24px 16px;
  }

  .app-title {
    font-size: 24px;
  }

  .app-subtitle {
    font-size: 14px;
  }

  .app-main {
    padding: 20px 16px;
  }

  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .search-container {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 16px 12px;
  }

  .app-title {
    font-size: 20px;
  }

  .app-main {
    padding: 16px 12px;
  }
}
</style>
