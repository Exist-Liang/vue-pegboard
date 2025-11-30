export default {
    mounted(el) {
      const robcoCursor = 'url("data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12">
          <defs>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#00ff00" flood-opacity="0.9"/>
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00ff00" flood-opacity="0.5"/>
            </filter>
          </defs>
          <rect x="2" y="2" width="8" height="8" fill="#00ff00" stroke="#00ff00" stroke-width="1" filter="url(#glow)"/>
        </svg>
      `) + '") 6 6, auto'
  
  
      el.style.cursor = robcoCursor
  
      el.style.filter = 'brightness(1.2) saturate(1.5)'
      el.style.transform = 'scale(0.99)'
    },
  
    unmounted(el) {
      el.style.cursor = ''
      el.style.filter = ''
      el.style.transform = ''
    }
  }