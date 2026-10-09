"use client";
import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      // Process only internal hash links
      if (href && href.startsWith('#') && href.length > 1) {
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return null;
}
