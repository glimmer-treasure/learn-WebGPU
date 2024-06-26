/**
 * 获取三维空间中一个点的齐次坐标
 * @param {number} x x轴坐标 
 * @param {number} y y轴坐标
 * @param {number} z z轴坐标
 * @returns {Float32Array} 三维空间中点的齐次坐标
 */
const getPoint = (x, y, z) => {
    return new Float32Array([x, y, z, 1.0])
}

/**
 * 获取三维空间中一个向量的齐次坐标
 * @param {number} x x轴坐标 
 * @param {number} y y轴坐标
 * @param {number} z z轴坐标
 * @returns {Float32Array} 三维空间中向量的齐次坐标
 */
const getVector = (x, y, z) => {
    return new Float32Array([x, y, z, 0.0])
}

/**
 * 获取平移矩阵
 * @param {number} x x轴平移量
 * @param {number} y y轴平移量
 * @param {number} z z轴平移量
 * @returns {Float32Array} 平移矩阵
 */
export const getTranslationMatrix = (x, y, z) => {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    ])
}

/**
 * 获取缩放矩阵
 * @param {number} factor 缩放因子
 * @returns {Float32Array} 缩放矩阵
 */
const getScalingMatrix = (factor) => {
    const f = factor
    return new Float32Array([
        f, 0, 0, 0,
        0, f, 0, 0,
        0, 0, f, 0,
        0, 0, 0, 1,
    ])
}

/**
 * 获取绕x轴旋转的旋转矩阵
 * @param {number} angle 旋转角度
 * @returns {Float32Array} 绕x轴旋转的旋转矩阵
 */
export const getRotationXMatrix = (angle) => {
    const radians = angle / 180 * Math.PI
    const s = Math.sin(radians)
    const c = Math.cos(radians)
    return new Float32Array([
        1,  0,  0,  0,
        0,  c,  s,  0,
        0, -s,  c,  0,
        0,  0,  0,  1,
    ])
}

/**
 * 获取绕y轴旋转的旋转矩阵
 * @param {number} angle 旋转角度
 * @returns {Float32Array} 绕y轴旋转的旋转矩阵
 */
export const getRotationYMatrix = (angle) => {
    const radians = angle / 180 * Math.PI
    const s = Math.sin(radians)
    const c = Math.cos(radians)
    return new Float32Array([
        c,  0, -s,  0,
        0,  1,  0,  0,
        s,  0,  c,  0,
        0,  0,  0,  1,
    ])
}

/**
 * 获取绕z轴旋转的旋转矩阵
 * @param {number} angle 旋转角度
 * @returns {Float32Array} 绕z轴旋转的旋转矩阵
 */
export const getRotationZMatrix = (angle) => {
    const radians = angle / 180 * Math.PI
    const s = Math.sin(radians)
    const c = Math.cos(radians)
    return new Float32Array([
         c,  s,  0,  0,
        -s,  c,  0,  0,
         0,  0,  1,  0,
         0,  0,  0,  1,
    ])
}

export const multiply = (...matrixs) => {
    const twoMultiple = (matrixA, matrixB) => {
        let result = new Float32Array(16);
        result[0] = matrixA[0] * matrixB[0] + matrixA[0] * matrixB[4] + matrixA[2] * matrixB[8] + matrixA[3] * matrixB[12]
        result.forEach((_, index) => {
            const row = Math.floor(index / 4)
            const col = index - row * 4
            const rows = [matrixA[row * 4 + 0], matrixA[row * 4 + 1], matrixA[row * 4 + 2], matrixA[row * 4 + 3]]
            const cols = [matrixB[col + 0], matrixB[col + 4], matrixA[col + 8], matrixA[col + 12]]
            result[index] = rows.reduce((pre, cur, index) => {
                pre += cur * cols[index]
                return pre
            }, 0.0)
        })
        return result
    }
    if (matrixs.length === 1) {
        return matrixs[0]
    }
    if (matrixs.length > 1) {
        return matrixs.slice(1).reduce((prev, cur) => {
            return twoMultiple(prev, cur)
        }, matrixs[0])
    }
}

/**
 * 矩阵乘向量
 * @param {Float32Array} matrix 矩阵
 * @param {Float32Array} vector 向量
 * @returns {Float32Array} 向量
 */
const multipleVector = (matrix, vector) => {
    let result = new Float32Array(4)
    result.forEach((_, index) => {
        result[index] = matrix[index * 4 + 0] * vector[0] +  matrix[index * 4 + 1] * vector[1] + matrix[index * 4 + 2] * vector[2] + matrix[index * 4 + 3] * vector[3]
    })
    return result
} 