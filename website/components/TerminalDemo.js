"use client";

import { useEffect, useRef, useState } from 'react';
import styles from './InteractiveGif.module.css';
import useVisibleMedia from './useVisibleMedia';
import { terminalDemo, terminalChapterProgress } from '../lib/terminalDemo';

export default function TerminalDemo({ steps, lang, media = terminalDemo, title: mediaTitle }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const { loaded, visible } = useVisibleMedia(wrapperRef);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [activeCard, setActiveCard] = useState(media.activeCard);
  const tr = lang === 'tr';
  const title = mediaTitle || (tr ? 'Mample terminal kullanım demosu' : 'Mample terminal demo');
  const action = paused || !playing
    ? (tr ? 'Videoyu oynat' : 'Play video')
    : (tr ? 'Videoyu duraklat' : 'Pause video');
  function updateChapter(video) {
    const chapter = terminalChapterProgress(media.chapterStarts, steps.length, video.duration, video.currentTime);
    const next = chapter?.active ?? media.activeCard;
    if (next !== activeCard) setActiveCard(next);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Handle media events that occurred before hydration.
    if (video.error) setMissing(true);
    else if (video.readyState >= 1) {
      setReady(true);
      updateChapter(video);
    }
  }, [loaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (visible && ready && !paused && !missing) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [visible, ready, paused, missing]);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video || !ready || missing) return;
    if (video.paused) {
      setPaused(false);
      video.play().catch(() => setPlaying(false));
    } else {
      setPaused(true);
      video.pause();
    }
  }

  return <div ref={wrapperRef} className={styles.wrapper}>
    <div className={styles.gifWrapper}>
      <div className={styles.container}>
        <button type="button" className={`${styles.gifWindow} ${styles.videoToggle}`}
          aria-label={action} disabled={!ready || missing} onClick={togglePlayback}>
          {!missing && <video ref={videoRef} src={loaded ? media.src : undefined} poster={loaded ? media.poster : undefined} muted playsInline loop preload={loaded ? "metadata" : "none"}
            className={`${styles.media} ${styles.terminalMedia}`} aria-label={title}
            onLoadedMetadata={event => {
              setReady(true);
              updateChapter(event.currentTarget);
            }}
            onDurationChange={event => updateChapter(event.currentTarget)}
            onTimeUpdate={event => updateChapter(event.currentTarget)}
            onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
            onError={() => { setMissing(true); setReady(false); setPlaying(false); }} />}
          {(!ready || missing) && <span className={styles.demoPlaceholder}>
            <span>{title}</span>
            <small>{missing ? (tr ? 'Video hazırlanıyor' : 'Video in preparation') : (tr ? 'Video yükleniyor' : 'Loading video')}</small>
          </span>}
          {ready && !missing && <span className={styles.playbackHint} aria-hidden="true">
            {playing ? 'Ⅱ' : '▶'} {action}
          </span>}
        </button>
      </div>
    </div>
    <div className={styles.textContainer}>
      {steps.map((step, index) => <div key={index}
        className={`${styles.textContent} ${styles.staticCard}${activeCard === index ? ' ' + styles.activeText : ''}`}>
        <h3>{step.title}</h3><p>{step.description}</p>
      </div>)}
    </div>
  </div>;
}
