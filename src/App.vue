<script setup>
import { ref } from 'vue'
import WebGPU from 'src/components/web-gpu.vue';

const hasWebGpu = ref(!!navigator.gpu)

</script>

<template>
  <WebGPU v-if="hasWebGpu" />
  <div v-else>
    该浏览器不支持WebGPU
  </div>
</template>
