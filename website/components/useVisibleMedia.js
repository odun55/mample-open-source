"use client";
import { useEffect, useState } from 'react';

// Loading is sticky; playback follows viewport and tab visibility separately.
export default function useVisibleMedia(ref) {
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = false;
    const update = () => setVisible(inView && !document.hidden);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.3 });
    const loading = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLoaded(true);
      loading.disconnect();
    }, { rootMargin: '200px' });
    visibility.observe(element);
    loading.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      visibility.disconnect();
      loading.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [ref]);
  return { loaded, visible };
}
