<template>
  <div class="ship-list-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loader"></div>
      <p>Loading ships...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>{{ error }}</h3>
      <button @click="retry" class="retry-btn">Retry</button>
    </div>

    <template v-else>
      <div v-if="displayedShips.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No ships found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>

      <div v-else class="ships-grid">
        <ship-card
          v-for="ship in displayedShips"
          :key="ship.id"
          :ship="ship"
        />
      </div>

      <div v-if="displayedShips.length > 0" class="results-info">
        Showing {{ displayedShips.length }} of {{ allShips.length }} ships
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ShipCard from './ShipCard.vue';
import type { Ship } from '../types/ships';

interface Props {
  ships: Ship[];
  isLoading: boolean;
  error: string | null;
}

interface Emits {
  'retry': [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const allShips = computed(() => props.ships);

const displayedShips = computed(() => {
  return allShips.value;
});

const retry = () => {
  emit('retry');
};
</script>

<style scoped>
.ship-list-container {
  flex: 1;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #a8b4d4;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid #0f3460;
  border-top-color: #e94560;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  background: rgba(233, 69, 96, 0.1);
  border: 2px solid #e94560;
  border-radius: 8px;
  padding: 32px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  margin: 0 0 16px 0;
  color: #fff;
  font-size: 18px;
}

.retry-btn {
  background: linear-gradient(135deg, #e94560 0%, #d63447 100%);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 12px;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
}

.empty-state {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #0f3460;
  border-radius: 8px;
  padding: 32px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  color: #8a92b2;
}

.ships-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.results-info {
  text-align: center;
  color: #8a92b2;
  font-size: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 1px solid #0f3460;
  border-radius: 6px;
}

@media (max-width: 1024px) {
  .ships-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .ships-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .loading-state,
  .error-state,
  .empty-state {
    min-height: 300px;
  }
}
</style>
