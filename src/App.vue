<script setup>
import useWebGpu from 'src/js/useWebGpu.js'
import DrawRectangle from 'src/components/draw-rectangle.vue';
import DrawTriangle from 'src/components/draw-triangle.vue';
import RoateY from 'src/components/roate-y/index.vue'

const webgpu = useWebGpu()

console.log('webgpu', webgpu)

</script>

<template>
  <template v-if="webgpu.device.value">
    <RoateY />
    <DrawRectangle />
    <DrawTriangle />
  </template>
  <div v-else>
    该浏览器不支持WebGPU
  </div>
</template>

<style>
canvas.container {
  width: 640px;
  height: 640px;
}
</style>
