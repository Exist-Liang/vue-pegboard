<template>
  <div class="test-widget">
    <span>{{ displayText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: String,
  type: {
    type: String,
    required: true
  },
  sizeKey: {
    type: String,
    required: true
  },
  x: Number,
  y: Number,
  w: {
    type: Number,
    required: true
  },
  h: {
    type: Number,
    required: true
  }
})


const displayText = computed(() => `${props.type} (${props.sizeKey})`)
</script>

<style scoped>
.test-widget {
  background-color: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: bold;
  width: 100%;
  height: 100%;
}
</style>