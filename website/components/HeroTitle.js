'use client';

import { useState, useEffect } from 'react';
import styles from './HeroTitle.module.css';

export default function HeroTitle({ lang }) {
  const [index, setIndex] = useState(0);

  const words = lang === 'tr'
    ? ['Terminal Görevlerin', 'Yapay Zekâ Görevlerin', 'Derlemelerin']
    : ['Terminal Tasks', 'AI Tasks', 'Builds'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 1500); // 1.5 seconds per word
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <h1>
      {lang === 'en' && 'Get Notified When Your '}
      <span 
        className={styles.wrapper} 
        style={{ 
          textAlign: lang === 'tr' ? 'center' : 'left',
          justifyItems: lang === 'tr' ? 'center' : 'start'
        }}
      >
        {words.map((word, i) => {
          const isCurrent = i === index;
          const isPrevious = i === (index - 1 + words.length) % words.length;

          let className = styles.hiddenWord;
          if (isCurrent) className = styles.word;
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
      {lang === 'en' ? ' Finish' : ' Bittiğinde Bildirim Al'}
    </h1>
  );
}
