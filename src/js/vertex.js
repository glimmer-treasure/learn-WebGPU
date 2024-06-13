/**
 * 获取一个矩形的所有顶点
 * 矩形由两个三角形拼成
 * 矩形左下角在原点
 * @param {number} width 矩形的宽
 * @param {number} height 矩形的高
 * @returns {Float32Array} 矩形顶点数组
 */
export const getRectangle = (width, height) => {
    return new Float32Array([
        0.0, 0.0, 0.0,
        0.0, height, 0.0,
        width, 0.0, 0.0,
        0.0, height, 0.0,
        width, height, 0.0,
        width, 0.0, 0.0
    ])
}