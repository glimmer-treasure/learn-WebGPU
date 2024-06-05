// 顶点着色器代码
export const vertex = /* wgsl */ `
@vertex
fn main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32>{
    return vec4<f32>(pos, 1.0); // 返回顶点数据，渲染管线下个环节使用
}
`

// 片元着色器代码
export const fragment = /* wgsl */ `
@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0); // 片元设置为红色
}
`