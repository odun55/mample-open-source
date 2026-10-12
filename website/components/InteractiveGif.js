"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './InteractiveGif.module.css';
import { gifDuration } from '../lib/gifDuration';
import useVisibleMedia from './useVisibleMedia';

function Media({ name, title, active, visible, loaded, cycle, onNext, onProgress }) {
  const videoRef = useRef(null);
  const [kind, setKind] = useState('video');
  const [ready, setReady] = useState(false);
  const elapsed = useRef(0);
  const [duration, setDuration] = useState(8000);
  const shouldLoad = loaded && active;

  useEffect(() => {
    if (kind !== 'gif' || !shouldLoad) return;
    const controller = new AbortController();
    fetch('/images/' + name + '.gif', { signal: controller.signal })
      .then(response => { if (!response.ok) throw Error('Missing GIF'); return response.arrayBuffer(); })
      .then(buffer => setDuration(gifDuration(buffer))).catch(() => {});
    return () => controller.abort();
  }, [kind, name, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || kind !== 'video') return;
    // Media events can fire before React attaches during hydration.
    if (video.error) { setKind('gif'); setReady(false); }
    else if (video.readyState >= 2) setReady(true);
  }, [kind]);

  useEffect(() => {
    elapsed.current = 0;
    if (active) onProgress(0);
  }, [active, cycle, onProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || kind !== 'video') return;
    if (active && ready) video.currentTime = 0;
  }, [active, cycle, kind, ready]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || kind !== 'video') return;
    if (active && visible && ready) video.play().catch(() => {});
    else video.pause();
  }, [active, visible, cycle, kind, ready]);

  useEffect(() => {
    if (!active || !visible || kind === 'video' || !ready) return;
    // Pause GIF timing while the demo is outside the viewport.
    let frame;
    let previous = performance.now();
    const tick = (now) => {
      elapsed.current += now - previous;
      previous = now;
      onProgress(Math.min(1, elapsed.current / duration));
      if (elapsed.current >= duration) onNext();
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, visible, cycle, kind, ready, duration, onNext, onProgress]);

  if (kind === 'missing') {
    return <div className={styles.placeholderText}><span>{title}</span><small>Mample</small></div>;
  }
  if (kind === 'gif') {
    return <img key={active ? cycle : 'idle'} src={shouldLoad ? '/images/' + name + '.gif' : undefined} alt={title}
      className={styles.media} onLoad={() => setReady(true)}
      onError={() => { setKind('missing'); setReady(true); }} />;
  }
  return <video ref={videoRef} src={shouldLoad ? '/images/' + name + '.mp4' : undefined} muted playsInline preload={shouldLoad ? "auto" : "none"}
    className={styles.media} aria-label={title}
    onLoadedData={() => setReady(true)}
    onError={() => { setKind('gif'); setReady(false); }}
    onTimeUpdate={(event) => {
      if (active && event.currentTarget.duration > 0) {
        onProgress(event.currentTarget.currentTime / event.currentTarget.duration);
      }
    }}
    onEnded={() => { if (active) onNext(); }} />;
}

export default function InteractiveGif({
  text1Title, text1Desc, text2Title, text2Desc, text3Title, text3Desc,
  startIndex = 1
}) {
  const steps = [
    { title: text1Title, description: text1Desc },
    { title: text2Title, description: text2Desc },
    { title: text3Title, description: text3Desc }
  ].filter(step => step.title);
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [progress, setProgress] = useState(0);
  const wrapperRef = useRef(null);
  const { loaded, visible } = useVisibleMedia(wrapperRef);
  const total = steps.length;



  const select = useCallback((index) => {
    setActive(index);
    setCycle(value => value + 1);
    setProgress(0);
  }, []);
  const next = useCallback(() => {
    setActive(index => (index + 1) % total);
    setCycle(value => value + 1);
    setProgress(0);
  }, [total]);
  const reportProgress = useCallback(value => setProgress(value), []);

  return <div ref={wrapperRef} className={styles.wrapper}>
    <div className={styles.gifWrapper}>
      <div className={styles.container}>
        <div className={styles.gifWindow}>
          {steps.map((step, index) => <div key={startIndex + index}
            className={styles.mediaLayer + (active === index ? ' ' + styles.activeMedia : '')}
            aria-hidden={active !== index}>
            <Media name={'gif_' + (startIndex + index)} title={step.title}
              active={active === index} visible={visible} loaded={loaded} cycle={active === index ? cycle : 0}
              onNext={next} onProgress={reportProgress} />
          </div>)}
        </div>
      </div>
      {total > 1 && <div className={styles.dots}>
        {steps.map((step, index) => <button key={index} type="button"
          className={styles.dot + (active === index ? ' ' + styles.activeDot : '')}
          onClick={() => select(index)} aria-label={step.title} aria-pressed={active === index} />)}
      </div>}
    </div>
    <div className={styles.textContainer}>
      {steps.map((step, index) => <div key={index}
        className={styles.textContent + (active === index ? ' ' + styles.activeText : '')}
        role="button" tabIndex={0} aria-pressed={active === index}
        onClick={() => select(index)} onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(index); }
        }}>
        <h3>{step.title}</h3><p>{step.description}</p>
        {active === index && <div className={styles.progressBar} style={{ width: progress * 100 + '%' }} />}
      </div>)}
    </div>
  </div>;
}
