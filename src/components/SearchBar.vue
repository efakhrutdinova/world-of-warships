<template>
  <div class="search-bar">
    <input
      :value="modelValue"
      @input="handleInput"
      type="text"
      placeholder="Search by ship name, nation, or type..."
      class="search-input"
      autocomplete="off"
    />
    <button
      v-if="modelValue"
      @click="$emit('update:modelValue', '')"
      class="clear-btn"
      title="Clear search"
    >
      ✕
    </button>
    <span class="search-icon">🔍</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<style scoped>
.search-bar {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  font-size: 16px;
  border: 2px solid #0f3460;
  border-radius: 6px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #e94560;
  box-shadow: 0 0 16px rgba(233, 69, 96, 0.2);
}

.search-input::placeholder {
  color: #666;
}

.search-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #888;
}

.clear-btn {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  transition: color 0.3s ease;
}

.clear-btn:hover {
  color: #e94560;
}

@media (max-width: 640px) {
  .search-input {
    padding: 10px 40px 10px 12px;
    font-size: 14px;
  }
}
</style>
