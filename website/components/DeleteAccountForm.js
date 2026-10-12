'use client';

import { useState } from 'react';
import styles from './DeleteAccountForm.module.css';

export default function DeleteAccountForm({ t }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [deleted, setDeleted] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setBusy(true);
    setStatus('');
    try {
      const input = form.elements.namedItem('secret');
      const key = input.value.trim();
      const response = await fetch('/api/delete-account', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cli_secret_key: key, confirm: true }),
      });
      const result = await response.json();
      if (response.ok && result.success === true) {
        input.value = '';
        setDeleted(true);
        setStatus(t.delete_web_success);
      } else {
        setStatus(response.status === 401 ? t.delete_web_invalid
          : response.status === 409 ? t.delete_web_conflict
          : response.status === 429 ? t.delete_web_rate : t.delete_web_error);
      }
    } catch {
      setStatus(t.delete_web_error);
    } finally {
      setBusy(false);
    }
  }
  return <form className={styles.form} onSubmit={submit}>
    {!deleted && <>
      <label htmlFor="deletion-secret">{t.delete_web_key_label}</label>
      <input id="deletion-secret" name="secret" type="password" autoComplete="off"
        autoCapitalize="none" spellCheck={false} maxLength={256} required disabled={busy}
        aria-describedby="deletion-key-help" placeholder="mample-…" />
      <p id="deletion-key-help">{t.delete_web_key_help}</p>
      <label className={styles.confirm}>
        <input name="confirm" type="checkbox" required disabled={busy} />
        <span>{t.delete_web_confirm}</span>
      </label>
      <button type="submit" disabled={busy}>{busy ? t.delete_web_busy : t.delete_web_button}</button>
    </>}
    <p role="status" aria-live="polite">{status}</p>
  </form>;
}
