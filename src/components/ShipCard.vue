<template>
  <div class="ship-card">
    <div class="ship-image-wrapper">
      <img
        v-if="ship.image_url"
        :src="ship.image_url"
        :alt="ship.name"
        class="ship-image"
        loading="lazy"
      />
      <div v-else class="ship-image-placeholder">No Image</div>
    </div>
    
    <div class="ship-info">
      <div class="ship-header">
        <h3 class="ship-name">{{ ship.name }}</h3>
        <span v-if="ship.is_premium" class="premium-badge">Premium</span>
      </div>
      
      <div class="ship-meta">
        <span class="meta-item">
          <strong>Nation:</strong> {{ ship.nation }}
        </span>
        <span class="meta-item">
          <strong>Type:</strong> {{ ship.type }}
        </span>
        <span class="meta-item">
          <strong>Tier:</strong> {{ ship.level }}
        </span>
      </div>
      
      <p v-if="ship.description" class="ship-description">{{ ship.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ship } from '../types/ships';

defineProps<{
  ship: Ship;
}>();
</script>

<style scoped>
.ship-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 2px solid #0f3460;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ship-card:hover {
  border-color: #e94560;
  box-shadow: 0 8px 24px rgba(233, 69, 96, 0.2);
  transform: translateY(-4px);
}

.ship-image-wrapper {
  width: 100%;
  padding-top: 66.67%;
  position: relative;
  background: #0a0e27;
  overflow: hidden;
}

.ship-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.ship-card:hover .ship-image {
  transform: scale(1.05);
}

.ship-image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.ship-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ship-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.ship-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  flex: 1;
  word-break: break-word;
}

.premium-badge {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #000;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.ship-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.meta-item {
  color: #a8b4d4;
  display: flex;
  align-items: center;
}

.meta-item strong {
  color: #e94560;
  margin-right: 6px;
  min-width: 60px;
}

.ship-description {
  margin: 0;
  color: #8a92b2;
  font-size: 12px;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 640px) {
  .ship-card {
    border: 1px solid #0f3460;
  }

  .ship-name {
    font-size: 14px;
  }

  .ship-info {
    padding: 12px;
  }

  .ship-meta {
    font-size: 12px;
  }
}
</style>
