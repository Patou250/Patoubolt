import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function usePreviewGate() {
  const location = useLocation();
  const path = location.pathname;
  
  // ✅ Ne JAMAIS bloquer l'espace parent ni le player
  if (path.startsWith('/parent') || path.startsWith('/player')) {
    return { mustGate: false, location };
  }
  
  const enabled = import.meta.env.VITE_PREVIEW_ENABLED === 'true';
  const pass = import.meta.env.VITE_PREVIEW_PASS as string | undefined;

  const mustGate = useMemo(() => {
    if (!enabled) return false;
    if (location.hostname === 'localhost') return false;
    if (location.hostname && location.hostname.includes('bolt.new')) return false;
    if (localStorage.getItem('patou_preview_ok') === '1') return false;
    return true;
  }, [enabled]);

  // Auto-unlock via ?pass=...
  useEffect(() => {
    if (!enabled) return;
    const q = new URLSearchParams(location.search);
    const qp = q.get('pass');
    if (qp && pass && qp === pass) {
      localStorage.setItem('patou_preview_ok','1');
      q.delete('pass');
      const url = `${location.pathname}?${q.toString()}`.replace(/\?$/, '');
      window.history.replaceState({}, '', url);
      location.reload();
    }
  }, [enabled, pass]);

  return { mustGate, location };
}