<script setup>
import { ref } from 'vue'
import DrawRectangle from 'src/components/draw-rectangle.vue';
import DrawTriangle from 'src/components/draw-triangle.vue';

const hasWebGpu = ref(!!navigator.gpu)

</script>

<template>
  <template v-if="hasWebGpu">
    <DrawRectangle />
    <DrawTriangle />
  </template>
  <WebGPU v-if="hasWebGpu" />
  <div v-else>
    该浏览器不支持WebGPU
  </div>
</template>
