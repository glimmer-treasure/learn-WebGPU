import { ref, onMounted, inject } from 'vue'
import { getRotationYMatrix } from 'src/js/homogeneous.js'
import { getRectangle } from 'src/js/vertex.js'

/**
 * @typedef {Object} SetupResult
 * @property {import('vue/dist/vue').Ref<HTMLElement|null>} canvas canvas
 */

const vertexCode = /* wgsl */ `
    @group(0) @binding(0) var<uniform> S:mat4x4<f32>;
    @vertex
    fn main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32>{
      return S * vec4<f32>(pos, 1.0); // 返回顶点数据，渲染管线下个环节使用
    }
`

// 片元着色器代码
const fragmentCode = /* wgsl */ `
  @fragment
  fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0); // 片元设置为红色
  }
`


/**
 * setup函数
 * @param {object} props props 
 * @param {object} context context 
 * @returns {SetupResult} 返回值
 */
export default function (props, context) {
  /**
   * @type {import('vue/dist/vue').Ref<HTMLCanvasElement|null>}
   */
  const canvas = ref(null)
  const webgpu = inject('webgpu')
  const device = webgpu.device.value
  //获取浏览器默认的颜色格式
  const format = navigator.gpu.getPreferredCanvasFormat();
  /**
   * @type {number} 旋转角度
   */
  let angle = 0
  /**
   * @type {number} 步长
   */
  let step = 1
  /**
   * 获取顶点缓冲区对象
   * @returns {GPUBuffer} 顶点缓冲区对象
   */
  const getVertexBuffer = () => {
    const vertexArray = getRectangle(0.64, 0.36);
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
   * 获取uniform缓冲区对象
   * @returns {GPUBuffer} uniform缓冲区对象
   */
  const getUniformBuffer = () => {
    const uniformArray = getRotationYMatrix(angle)
    const uniformBuffer = device.createBuffer({
      size: uniformArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    })
    device.queue.writeBuffer(uniformBuffer, 0, uniformArray)
    angle = angle + step;
    return uniformBuffer
  }
  /**
   * @param {GPURenderPipeline} pipeline 渲染管线
   * @returns {GPUBindGroup} GPUBindGroup
   */
  const getBindGroup = (pipeline) => {
    return device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: { buffer: getUniformBuffer() }
        }
      ]
    })
  }
  /**
   * 获取渲染管线
   * @returns {GPURenderPipeline} 渲染管线
   */
  const getRenderPipeline = () => {
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
        module: device.createShaderModule({ code: vertexCode }),
        entryPoint: "main"
      },
      fragment: {
        // 片元着色器
        module: device.createShaderModule({ code: fragmentCode }),
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
  /**
   * 
   * @returns {GPUCanvasContext}  gpuCanvasContext
   */
  const getWebgpuContext = () => {
    const gpuContext = canvas.value.getContext('webgpu')
    gpuContext.configure({
      device,//WebGPU渲染器使用的GPU设备对象
      format, //颜色格式
    })
    return gpuContext
  }
  /**
   * 执行gpu渲染的方法
   * @param {object} param0 参数对象
   * @param {GPURenderPipeline}  param0.renderPipeline GPU渲染管线
   * @param {GPUCanvasContext} param0.context GPUCanvasContext
   * @param {GPUBuffer} param0.vertexBuffer 顶点缓冲区对象
   */
  const gpuRender = ({ renderPipeline, context, vertexBuffer }) => {
    const bindGroup = getBindGroup(renderPipeline)
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
    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    // 把绑定组里面的uniform数据传递给着色器中uniform变量,参数0和.getBindGroupLayout(0)参数一致
    renderPass.setBindGroup(0, bindGroup);
    // 绘制命令.draw()绘制顶点数据
    renderPass.draw(6);
    // 渲染通道结束命令.end()
    renderPass.end();
    // 命令编码器.finish()创建命令缓冲区(生成GPU指令存入缓冲区)
    const commandBuffer = commandEncoder.finish();
    // 命令编码器缓冲区中命令传入GPU设备对象的命令队列.queue
    device.queue.submit([commandBuffer]);
    requestAnimationFrame(() => gpuRender({ renderPipeline, context, vertexBuffer }))
  }
  onMounted(() => {
    gpuRender({renderPipeline: getRenderPipeline(), context: getWebgpuContext(), vertexBuffer: getVertexBuffer()})
  })
  return {
    canvas
  }
}





