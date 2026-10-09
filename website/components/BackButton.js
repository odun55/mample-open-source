"use client";
import { useRouter } from 'next/navigation';

export default function BackButton({ text }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push('/');
        }
      }}
      style={{ 
        background: 'none', 
        border: 'none', 
        padding: 0, 
        cursor: 'pointer', 
        color: '#88D49E', 
        textDecoration: 'none', 
        fontWeight: '600', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontFamily: 'inherit',
        fontSize: '16px',
        width: 'fit-content'
      }}
    >
      {text}
    </button>
  );
}
