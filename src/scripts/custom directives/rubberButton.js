export default {
    mounted(el) {
      const applyHover = () => {
        el.style.background = 'linear-gradient(to bottom, #ff9999, #cc4444)';
        el.style.transform = 'none';
      };
      const applyActive = () => {
        el.style.background = 'linear-gradient(to bottom, #cc3333, #990000)';
        el.style.boxShadow = 'inset 0 3px 6px rgba(0, 0, 0, 0.5)';
        el.style.transform = 'translateY(1px) scale(0.98)';
      };
      const resetStyle = () => {
        el.style.background = '';
        el.style.boxShadow = '';
        el.style.transform = '';
      };
  
      el.addEventListener('mouseenter', applyHover);
      el.addEventListener('mouseleave', resetStyle);  
      el.addEventListener('mousedown', applyActive);
      el.addEventListener('mouseup', applyHover);
  
      el.__rubberEvents = { applyHover, applyActive, resetStyle };
    },
    unmounted(el) {
      const { applyHover, applyActive, resetStyle } = el.__rubberEvents || {};
      if (applyHover) {
        el.removeEventListener('mouseenter', applyHover);
        el.removeEventListener('mouseleave', resetStyle);
        el.removeEventListener('mousedown', applyActive);
        el.removeEventListener('mouseup', applyHover);
      }
      delete el.__rubberEvents;
    }
  };