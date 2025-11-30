let floatingEl = null
let mouseMoveHandler = null

export function showClickPreview({ icon = '📦', width = 40, height = 40 }) {
  removeClickPreview()

  const preview = document.createElement('div')
  preview.style.cssText = `
    width: ${width}px;
    height: ${height}px;
    background: radial-gradient(circle, rgba(0,0,0,0.85), rgba(0,0,0,0));
    color: white;
    font-size: 24px;
    font-weight: bold;
    line-height: 1;
    border-radius: 8px;
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
  `
  preview.textContent = icon
  preview.setAttribute('data-floating-preview', '')

  document.body.appendChild(preview)
  floatingEl = preview

  mouseMoveHandler = (e) => {
    preview.style.left = e.clientX + 'px'
    preview.style.top = e.clientY + 'px'
    preview.style.transform = 'translate(-50%, -50%)'
  }
  window.addEventListener('mousemove', mouseMoveHandler)
}

export function removeClickPreview() {
  if (floatingEl) {
    document.body.removeChild(floatingEl)
    floatingEl = null
  }
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler)
    mouseMoveHandler = null
  }
}