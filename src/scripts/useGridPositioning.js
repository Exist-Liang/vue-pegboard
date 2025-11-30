import { computed, toRef } from 'vue'

export function useGridPositioning(columns, rows, cellSize = 140, cellGap = 16) {
  const _cellSize = toRef(cellSize)
  const _cellGap = toRef(cellGap)

  const step = computed(() => _cellSize.value + _cellGap.value)

  /**
    根据网格坐标计算实际像素位置与尺寸
   @param {number} x - 网格起始列 (0-based)
   @param {number} y - 网格起始行 (0-based)
   @param {number} w - 跨越列数
   @param {number} h - 跨越行数
   @returns {object} { x, y, width, height } - 像素坐标与尺寸
   */
  function getRect(x, y, w = 1, h = 1) {
    return {
      x: Math.round(x * step.value),
      y: Math.round(y * step.value),
      width: Math.round(w * _cellSize.value + (w - 1) * _cellGap.value),
      height: Math.round(h * _cellSize.value + (h - 1) * _cellGap.value)
    }
  }

  return {
    getRect,
    step
  }
}