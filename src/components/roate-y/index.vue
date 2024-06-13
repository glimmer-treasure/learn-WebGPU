<script>
import setup from './setup.js';
export default {
  setup
}
</script>

<template>
<div>
  <h3>绕Y轴旋转</h3>
  <canvas ref="canvas" class="container" />
</div>
</template>

<style scoped>
.container {
  width: 640px;
  height: 640px;
}
</style>
