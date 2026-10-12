'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CodeBlock.module.css';

export default function CodeBlock({ children, html, lang, task, suffix }) {
  const content = useRef(null);
  const [status, setStatus] = useState('idle');
  const tr = lang === 'tr';
  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content.current.textContent.trim());
      setStatus('copied');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className={styles.block}>
      <div className={styles.toolbar}>
        <span>Terminal</span>
        <button type="button" onClick={copy}>
          {status === 'copied' ? (tr ? 'Kopyalandı' : 'Copied') : (tr ? 'Kopyala' : 'Copy')}
        </button>
      </div>
      <pre className={styles.command}>
        {task !== undefined ? <code ref={content}><span className={styles.task}>{task}</span><span className={styles.notification}>{suffix}</span></code> : html ? <code ref={content} dangerouslySetInnerHTML={{ __html: html }} /> : <code ref={content}>{children}</code>}
      </pre>
      <span className={styles.status} role="status">
        {status === 'error' ? (tr ? 'Kopyalanamadı. Komutu seçerek kopyalayabilirsiniz.' : 'Could not copy. Select the command to copy it manually.') : status === 'copied' ? (tr ? 'Komut kopyalandı.' : 'Command copied.') : ''}
      </span>
    </div>
  );
}
