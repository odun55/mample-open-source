'use client';

import { useState, useEffect } from 'react';
import styles from './HeroTitle.module.css';

export default function HeroTitle({ lang }) {
  const [index, setIndex] = useState(0);
  const [hasRotated, setHasRotated] = useState(false);

  const words = lang === 'tr'
    ? ['Derlemelerin', 'Yapay Zekâ Görevlerin', 'Terminal Görevlerin']
    : ['Builds', 'AI Tasks', 'Terminal Tasks'];

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 900px)');
    let interval;
    const update = () => {
      clearInterval(interval);
      // Mobile keeps the phrases rotating; CSS removes movement when requested.
      if (document.hidden || (motion.matches && !mobile.matches)) return;
      interval = setInterval(() => {
        setHasRotated(true);
        setIndex((prev) => (prev + 1) % words.length);
      }, 2500);
    };
    update();
    document.addEventListener('visibilitychange', update);
    motion.addEventListener('change', update);
    mobile.addEventListener('change', update);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', update);
      motion.removeEventListener('change', update);
      mobile.removeEventListener('change', update);
    };
  }, [words.length]);

  return (
    <h1 className={styles.title}>
      {lang === 'en' && <>Know When Your<br /></>}
      <span className={styles.wrapper}>
        {words.map((word, i) => {
          const isCurrent = i === index;
          const isPrevious = hasRotated && i === (index - 1 + words.length) % words.length;

          let className = styles.hiddenWord;
          if (isCurrent) className = hasRotated ? styles.word : styles.initialWord;
          else if (isPrevious) className = styles.wordOut;

          return (
            <span
              key={word}
              className={className}
              aria-hidden={!isCurrent}
            >
              {word}
            </span>
          );
        })}
      </span>
      <br />
      {lang === 'en' ? 'Are Done.' : 'Bittiğinde Haberin Olsun.'}
    </h1>
  );
}
