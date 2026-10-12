'use client';

import styles from './GuideContents.module.css';

export default function GuideContents({ children, lang }) {
  return (
    <details className={styles.contents}>
      <summary>{lang === 'tr' ? 'Bu sayfada' : 'On this page'}</summary>
      <nav aria-label={lang === 'tr' ? 'Rehber bölümleri' : 'Guide sections'} onClick={event => {
        const link = event.target.closest('a');
        if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        event.currentTarget.closest('details').open = false;
        window.location.hash = link.hash;
      }}>{children}</nav>
    </details>
  );
}
