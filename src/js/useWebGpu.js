import { shallowRef, provide } from 'vue'

export default function()  {
    /**
     * @type {import('vue/dist/vue').ShallowRef<GPUAdapter|null>}
     */
    let adapter = shallowRef(null)
    /**
     * @type {import('vue/dist/vue').ShallowRef<GPUDevice|null>}
     */
    let device = shallowRef(null)
    navigator.gpu?.requestAdapter().then((adapter) => {
        return adapter.requestDevice()
    }).then((gpuDevice) => {
        device.value = gpuDevice
    });
    const webgpu = {
        adapter, // gpu适配器
        device // gpu设备
    }
    provide('webgpu', webgpu)
    return webgpu
}