<script setup>
import { ref, onMounted } from 'vue'
import { vertex, fragment } from 'src/js/wgsl.js'

const canvas = ref(null)

//获取浏览器默认的颜色格式
const format = navigator.gpu.getPreferredCanvasFormat();

/**
 * 获取gpu设备对象
 * 通过GPU设备对象device的WebGPU API可以控制GPU渲染过程
 * @returns {Promise<GPUDevice>} gpu设备对象
 */
const getGpuDevice = async () => {
  // 浏览器请求GPU适配器
  const adapter = await navigator.gpu.requestAdapter();
  // 获取GPU设备对象，通过GPU设备对象device的WebGPU API可以控制GPU渲染过程
  return await adapter.requestDevice();
}

/**
 * 获取顶点缓冲区对象
 * @param {GPUDevice} device gpu设备对象
 * @returns {GPUBuffer} 顶点缓冲区对象
 */
const getVertexBuffer = (device) => {
  const vertexArray = new Float32Array([
    // 三角形三个顶点坐标的x、y、z值
    0.0, 0.0, 0.0,//顶点1坐标
    0.5, 0.0, 0.0,//顶点2坐标
    0.0, 0.5, 0.0,//顶点3坐标
  ]);
  // 在gpu显存中创建一个缓冲区（顶点缓冲区）
  const vertexBuffer = device.createBuffer({
    size: vertexArray.byteLength, // //顶点数据的字节长度
    // usage设置该缓冲区的用途(作为顶点缓冲区|可以写入顶点数据)
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  /**
 * 把vertexArray里面的顶点数据写入到vertexBuffer对应的GPU显存缓冲区中
 * 参数2的0表示从vertexArray的数据开头读取数据。
 */
  device.queue.writeBuffer(vertexBuffer, 0, vertexArray)
  return vertexBuffer
}

/**
 * 获取渲染管线
 * @param {GPUDevice} device gpu设备对象
 * @returns {GPURenderPipeline} 渲染管线
 */
const getRenderPipeline = (device) => {
  // 创建渲染管线
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      buffers: [ // 顶点所有的缓冲区模块设置
        { // 其中一个顶点缓冲区设置
          arrayStride: 3 * 4,// 一个顶点数据占用的字节长度，该缓冲区一个顶点包含xyz三个分量，每个数字是4字节浮点数，3*4字节长度
          attributes: [
            { // 顶点缓冲区属性
              shaderLocation: 0,// GPU显存上顶点缓冲区标记存储位置
              format: "float32x3",// 格式：float32x3表示一个顶点数据包含3个32位浮点数
              offset: 0 // arrayStride表示每组顶点数据间隔字节数，offset表示读取改组的偏差字节数，没特殊需要一般设置0
            }
          ]
        }
      ],
      // 顶点着色器
      module: device.createShaderModule({ code: vertex }),
      entryPoint: "main"
    },
    fragment: {
      // 片元着色器
      module: device.createShaderModule({ code: fragment }),
      entryPoint: "main",
      targets: [
        {
          format //和WebGPU上下文配置的颜色格式保持一致
        }
      ]
    },
    primitive: {
      topology: "triangle-list",//三角形绘制顶点数据
    }
  });
  return pipeline
}


onMounted(async () => {
  const device = await getGpuDevice()
  const vertexBuffer = getVertexBuffer(device)
  const pipeline = getRenderPipeline(device)
  const context = canvas.value.getContext('webgpu')
  context.configure({
    device,//WebGPU渲染器使用的GPU设备对象
    format, //颜色格式
  })
  // 创建GPU命令编码器对象
  const commandEncoder = device.createCommandEncoder();
  // 创建渲染通道
  const renderPass = commandEncoder.beginRenderPass({
    // 给渲染通道指定颜色缓冲区，配置指定的缓冲区
    colorAttachments: [
      {
        /**
         * 指向用于Canvas画布的纹理视图对象(Canvas对应的颜色缓冲区)
         * 该渲染通道renderPass输出的像素数据会存储到Canvas画布对应的颜色缓冲区(纹理视图对象)
         */
        view: context.getCurrentTexture().createView(),
        storeOp: 'store',//像素数据写入颜色缓冲区
        loadOp: 'clear',
        clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 }, //背景颜色
      }
    ]
  });
  // 设置该渲染通道控制渲染管线
  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer(0, vertexBuffer);
  // 绘制命令.draw()绘制顶点数据
  renderPass.draw(3);
  // 渲染通道结束命令.end()
  renderPass.end();
  // 命令编码器.finish()创建命令缓冲区(生成GPU指令存入缓冲区)
  const commandBuffer = commandEncoder.finish();
  // 命令编码器缓冲区中命令传入GPU设备对象的命令队列.queue
  device.queue.submit([commandBuffer]);
})

</script>

<template>
<div>
  <h3>画一个三角形</h3>
  <canvas ref="canvas" class="container" />
</div>
</template>