import React from 'react';
import Image from 'next/image';
import { getDictionary } from '../../../getDictionary';

export const metadata = {
  robots: { index: false, follow: false },
};

const WindowsBrowserHeaderDark = ({ title, url }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: '32px', background: '#1c1c1c', display: 'flex', alignItems: 'center', padding: '0', userSelect: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', flex: 1, marginTop: '8px' }}>
        <div style={{ background: '#383838', height: '32px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '240px', width: '100%' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #ccc' }}></div>
          <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'Segoe UI, sans-serif' }}>{title}</span>
        </div>
      </div>
      <div style={{ display: 'flex', color: '#ccc', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ width: '46px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>─</div>
        <div style={{ width: '46px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>□</div>
        <div style={{ width: '46px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>✕</div>
      </div>
    </div>
    <div style={{ height: '36px', background: '#383838', borderBottom: '1px solid #1c1c1c', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px' }}>
      <div style={{ color: '#ccc', display: 'flex', gap: '16px', fontSize: '14px' }}>
        <span>←</span><span>→</span><span style={{fontSize:'16px'}}>↻</span>
      </div>
      <div style={{ flex: 1, background: '#1c1c1c', height: '24px', borderRadius: '12px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
        <span style={{ color: '#ccc', fontSize: '12px', fontFamily: 'Segoe UI, sans-serif' }}>{url}</span>
      </div>
    </div>
  </div>
);

const RealExtensionPopup = ({ t }) => (
  <div style={{ width: '300px', background: '#f8f9fa', color: '#333', padding: '10px 14px 14px 14px', borderRadius: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.6)', border: '1px solid #e0e0e0', position: 'relative', zIndex: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
      <div style={{ fontSize: '12px', display:'flex', alignItems:'center', gap:'4px' }}><span style={{fontWeight:'bold'}}>TR</span> <span style={{fontSize:'8px', color:'#666'}}>▼</span></div>
      <h2 style={{ margin: 0, fontSize: '16px', color: '#88D49E', fontWeight: 'bold' }}>Mample</h2>
      <div style={{ color: '#6C63FF', fontSize: '18px', fontWeight: 'bold' }}>≡</div>
    </div>
    
    <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '8px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', left: '16px', color: '#6C63FF', background: '#f0f0f5', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '14px' }}>?</div>
      <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#6C63FF', fontSize: '16px', fontWeight: 'bold' }}>↻</div>
      
      <div style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px' }}>{t.sa_ext_connected}</div>
      <div style={{ width: '140px', height: '140px', background: '#fff', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: '3px' }}>
          <div style={{ gridColumn: '1 / 3', gridRow: '1 / 3', backgroundColor: '#000', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '50%', height: '50%', backgroundColor: '#fff' }}></div></div>
          <div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div>
          <div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#fff' }}></div>
          <div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#fff' }}></div>
          <div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div>
          <div style={{ gridColumn: '1 / 3', gridRow: '4 / 6', backgroundColor: '#000', borderRadius: '2px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '50%', height: '50%', backgroundColor: '#fff' }}></div></div>
          <div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div>
          <div style={{ backgroundColor: '#fff' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div><div style={{ backgroundColor: '#000', borderRadius: '2px' }}></div>
      </div>
      <p style={{ fontSize: '13px', color: '#666', marginTop: '16px', marginBottom: 0 }}>{t.sa_ext_scan_qr}</p>
    </div>
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '12px 14px', marginBottom: '8px', color: '#2e7d32', fontWeight: 'bold', fontSize: '13px' }}>
      <span>{t.sa_ext_download_notif}</span>
      <input type="checkbox" checked readOnly style={{ accentColor: '#9A95FF', width: '16px', height: '16px' }} />
    </div>
    
    <div style={{ display: 'flex', gap: '6px' }}>
      <div style={{ flex: 1, padding: '10px', background: '#e8eaf6', color: '#3f51b5', border: '1px solid #c5cae9', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>{t.sa_ext_custom_button}</div>
      <div style={{ padding: '10px', background: '#e8eaf6', color: '#3f51b5', border: '1px solid #c5cae9', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>{t.sa_ext_select_button}</div>
    </div>
  </div>
);

export default async function StoreAssets(props) {
  const params = await props.params;
  const lang = params.lang || 'en';
  const t = await getDictionary(lang);

  return (
    <div style={{ background: '#000', padding: '50px', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '80px', alignItems: 'center', color: 'white', fontFamily: 'var(--font-geist-sans), sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Chrome Web Store Assets Generator</h1>
        <p style={{ color: '#A1A1AA' }}>Buraların ekran görüntüsünü alıp (Capture node screenshot) mağazaya yükleyebilirsiniz.</p>
      </div>

      {/* 1. Store Icon (128x128) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>1. Mağaza Simgesi (128x128)</h2>
        <div id="store-icon" style={{
          width: '128px', height: '128px', 
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          position: 'relative'
        }}>
          {/* Chrome Web Store requires square icons without rounded corners */}
          <svg width="128" height="128" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1024" height="1024" fill="rgba(136, 212, 158, 0.2)" />
            <rect x="284" y="284" width="456" height="456" rx="114" fill="#88D49E" />
          </svg>
        </div>
      </div>

      {/* 2. Small Promo (440x280) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>2. Küçük Promosyon Görseli (440x280)</h2>
        <div id="small-promo" style={{
          width: '440px', height: '280px', 
          background: 'linear-gradient(135deg, #1E1E20 0%, #0A0A0B 100%)', 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: '#88D49E', filter: 'blur(100px)', opacity: 0.2, borderRadius: '50%' }}></div>
          <Image src="/images/logo.png" width={90} height={90} alt="Logo" priority />
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '16px', letterSpacing: '-1px' }}>Mample</h1>
          <p style={{ color: '#88D49E', fontSize: '16px', fontWeight: '500', marginTop: '6px' }}>{t.sa_promo_title}</p>
        </div>
      </div>

      {/* 3. Marquee Promo (1400x560) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>{t.sa_marquee_promo_header}</h2>
        <div id="marquee-promo" style={{
          width: '1400px', height: '560px', 
          background: '#121214',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 120px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '100px', left: '-100px', width: '500px', height: '500px', background: '#88D49E', filter: 'blur(200px)', opacity: 0.15, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-200px', right: '100px', width: '600px', height: '600px', background: '#88D49E', filter: 'blur(250px)', opacity: 0.1, borderRadius: '50%' }}></div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1, maxWidth: '600px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Image src="/images/logo.png" width={56} height={56} alt="Logo" priority />
              <span style={{ fontSize: '40px', fontWeight: 'bold', letterSpacing: '-1px' }}>Mample</span>
            </div>
            <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-2px' }}>
              {t.sa_promo_marquee_title_1}<br/>
              <span style={{ color: '#88D49E' }}>{t.sa_promo_marquee_title_2}</span>
            </h1>
            <p style={{ fontSize: '22px', color: '#A1A1AA', lineHeight: '1.5' }}>
              {t.sa_promo_marquee_desc}
            </p>
          </div>

          <div style={{ zIndex: 1, position: 'relative', transform: 'rotate(2deg)' }}>
             <RealExtensionPopup t={t} />
          </div>
        </div>
      </div>

      {/* 4. Screenshot 1 (1280x800) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>4. Ekran Görüntüsü 1 (1280x800) - AI Takibi (Gerçekçi Windows + ChatGPT)</h2>
        <div id="screenshot-1" style={{
          width: '1280px', height: '800px', 
          background: 'linear-gradient(135deg, #121214 0%, #1A1A1C 100%)', 
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 50% -20%, rgba(136, 212, 158, 0.15) 0%, transparent 70%)' }}></div>
          
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '16px', zIndex: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{t.sa_ss1_title}</h1>
          <p style={{ fontSize: '24px', color: '#A1A1AA', marginBottom: '64px', zIndex: 1 }}>{t.sa_ss1_desc}</p>
          
          <div style={{ width: '960px', height: '480px', background: '#1E1E20', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1, textAlign: 'left' }}>
            <WindowsBrowserHeaderDark title="ChatGPT" url="https://chatgpt.com" />
            
            <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
              {/* Sidebar */}
              <div style={{ width: '220px', background: '#171717', borderRight: '1px solid #2f2f2f', padding: '16px' }}>
                <div style={{ height: '32px', background: '#2f2f2f', borderRadius: '8px', marginBottom: '24px' }}></div>
                <div style={{ color: '#666', fontSize: '11px', fontWeight: 'bold', marginBottom: '12px', textTransform: 'uppercase' }}>{t.sa_ss1_chat_today}</div>
                <div style={{ height: '20px', width: '80%', background: '#2f2f2f', borderRadius: '4px', marginBottom: '12px' }}></div>
                <div style={{ height: '20px', width: '90%', background: '#2f2f2f', borderRadius: '4px', marginBottom: '12px' }}></div>
                <div style={{ height: '20px', width: '60%', background: '#2f2f2f', borderRadius: '4px', marginBottom: '12px' }}></div>
              </div>
              
              {/* Main Chat */}
              <div style={{ flex: 1, background: '#212121', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, padding: '40px', overflow: 'hidden' }}>
                  <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '16px' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#10A37F', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Image src="/images/logo.png" width={16} height={16} alt="AI" style={{filter: 'brightness(0) invert(1)'}} />
                    </div>
                    <div style={{ flex: 1, color: '#ececec', fontSize: '14px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: t.sa_ss1_chat_text + '<span style="display: inline-block; width: 8px; height: 14px; background: #ececec; margin-left: 4px; vertical-align: middle; animation: blink 1s step-end infinite"></span>' }}>
                    </div>
                  </div>
                </div>
                {/* Input area */}
                <div style={{ padding: '24px' }}>
                  <div style={{ maxWidth: '600px', margin: '0 auto', height: '48px', background: '#2f2f2f', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                </div>
              </div>

              {/* Fake Extension Popup overlayed realistically */}
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                <RealExtensionPopup t={t} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Screenshot 2 (1280x800) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>5. Ekran Görüntüsü 2 (1280x800) - CLI Takibi (Gerçekçi Windows Terminal)</h2>
        <div id="screenshot-2" style={{
          width: '1280px', height: '800px', 
          background: 'linear-gradient(135deg, #121214 0%, #0F172A 100%)', 
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', background: '#3B82F6', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%' }}></div>
          
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '16px', zIndex: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{t.sa_ss2_title}</h1>
          <p style={{ fontSize: '24px', color: '#A1A1AA', marginBottom: '64px', zIndex: 1 }}>{t.sa_ss2_desc}</p>
          
          <div style={{ width: '960px', height: '480px', background: '#0c0c0c', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1, textAlign: 'left', fontFamily: 'Consolas, "Courier New", monospace' }}>
            
            {/* Windows Terminal Header */}
            <div style={{ height: '40px', background: '#1c1c1c', display: 'flex', alignItems: 'center', padding: '0', userSelect: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', flex: 1, marginTop: '8px' }}>
                <div style={{ background: '#0c0c0c', height: '32px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '240px', width: '100%' }}>
                  <span style={{ color: '#0078D7', fontSize: '14px' }}>&gt;_</span>
                  <span style={{ fontSize: '12px', color: '#ccc', fontFamily: 'Segoe UI, sans-serif' }}>Windows PowerShell</span>
                </div>
                <div style={{ color: '#ccc', padding: '0 12px', fontSize: '18px' }}>+</div>
              </div>
              <div style={{ display: 'flex', color: '#ccc', fontFamily: 'Segoe UI, sans-serif' }}>
                <div style={{ width: '46px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>─</div>
                <div style={{ width: '46px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>□</div>
                <div style={{ width: '46px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>✕</div>
              </div>
            </div>

            <div style={{ flex: 1, padding: '24px', color: '#cccccc', fontSize: '15px', lineHeight: '1.6' }}>
              <div><span style={{ color: '#16c60c' }}>PS C:\Projects\mample&gt;</span> {t.sa_ss2_cli_command}</div>
              <br/>
              <div>&gt; mample build</div>
              <div>&gt; next build</div>
              <br/>
              <div style={{ color: '#f9f1a5' }}>warn  - No build cache found. Please configure build caching for faster rebuilds.</div>
              <div>info  - Creating an optimized production build...</div>
              <div>info  - Compiled successfully</div>
              <div>info  - Collecting page data...</div>
              <div>info  - Generating static pages (12/12)</div>
              <div>info  - Finalizing page optimization...</div>
              <br/>
              <div>Route (app)                              Size     First Load JS</div>
              <div><span style={{color:'#16c60c'}}>┌</span> ○ /                                    5.4 kB         89.2 kB</div>
              <div><span style={{color:'#16c60c'}}>├</span> ○ /_not-found                          871 B          84.7 kB</div>
              <div><span style={{color:'#16c60c'}}>└</span> ○ /guide                               4.2 kB         88.1 kB</div>
              <br/>
              <div style={{ color: '#3b78ff' }}>{t.sa_ss2_cli_success}</div>
              <div style={{ marginTop: '16px' }}><span style={{ color: '#16c60c' }}>PS C:\Projects\mample&gt;</span> <span style={{ display: 'inline-block', width: '8px', height: '16px', background: '#ccc', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }}></span></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 6. Screenshot 3 (1280x800) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>6. Ekran Görüntüsü 3 (1280x800) - Element Seçici (Gerçekçi Arayüz)</h2>
        <div id="screenshot-3" style={{
          width: '1280px', height: '800px', 
          background: 'linear-gradient(135deg, #121214 0%, #1E1A24 100%)', 
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: '#D946EF', filter: 'blur(200px)', opacity: 0.08, borderRadius: '50%' }}></div>
          
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '16px', zIndex: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{t.sa_ss3_title}</h1>
          <p style={{ fontSize: '24px', color: '#A1A1AA', marginBottom: '64px', zIndex: 1 }}>{t.sa_ss3_desc}</p>
          
          <div style={{ width: '960px', height: '480px', background: '#0f0f11', borderRadius: '12px 12px 0 0', border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 1, textAlign: 'left' }}>
            <WindowsBrowserHeaderDark title="VideoCloud Editor" url="https://editor.videocloud.com/project/final" />
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                 {/* Video Preview */}
                 <div style={{ width: '560px', height: '315px', background: '#000', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid #1f1f22', display:'flex', justifyContent:'center', alignItems:'center' }}>
                    <Image src="/images/logo.png" width={80} height={80} alt="Video" style={{ opacity: 0.1 }} />
                    <div style={{ position:'absolute', bottom:'16px', left:'16px', color:'#fff', fontSize:'12px', fontWeight:'bold' }}>00:14:32 / 01:20:00</div>
                 </div>
              </div>
              <div style={{ height: '70px', background: '#141416', borderTop: '1px solid #1f1f22', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
                 <div style={{ color: '#fff', fontSize: '13px', display:'flex', flexDirection:'column', gap:'4px' }}>
                   <span style={{fontWeight:'bold'}}>Rendering final_v2.mp4</span>
                   <span style={{color:'#9ca3af'}}>Estimated time remaining: 12 minutes</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ width: '240px', height: '8px', background: '#1f1f22', borderRadius: '4px', overflow: 'hidden' }}>
                     <div style={{ width: '68%', height: '100%', background: '#3b82f6' }}></div>
                   </div>
                   <span style={{ color: '#fff', fontSize: '14px', fontWeight:'bold' }}>68%</span>
                   
                   {/* Selected Element */}
                   <div style={{ position: 'relative', marginLeft: '12px' }}>
                     <div style={{ background: '#1f1f22', color: '#9ca3af', padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', border: '2px solid #88D49E', cursor: 'not-allowed' }}>
                       Cancel Render
                     </div>
                     <div style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#121214', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #333', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                       <Image src="/images/logo.png" width={14} height={14} alt="Logo" />
                       {t.sa_ss3_selected}
                       <div style={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '8px', height: '8px', background: '#121214', borderRight: '1px solid #333', borderBottom: '1px solid #333' }}></div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 7. Screenshot 4 (1280x800) */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px', color: '#A1A1AA' }}>7. Ekran Görüntüsü 4 (1280x800) - Telefon Bildirimi</h2>
        <div id="screenshot-4" style={{
          width: '1280px', height: '800px', 
          background: 'linear-gradient(135deg, #121214 0%, #15111A 100%)', 
          position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '800px', height: '800px', background: '#6C63FF', filter: 'blur(250px)', opacity: 0.1, borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '800px', height: '800px', background: '#88D49E', filter: 'blur(250px)', opacity: 0.1, borderRadius: '50%' }}></div>
          
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '16px', zIndex: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{t.sa_ss4_title}</h1>
          <p style={{ fontSize: '24px', color: '#A1A1AA', marginBottom: '64px', zIndex: 1 }}>{t.sa_ss4_desc}</p>
          
          <div style={{ zIndex: 1, position: 'relative' }}>
             {/* Realistic Phone Mockup */}
             <div style={{ width: '360px', height: '540px', background: '#000', borderRadius: '48px 48px 0 0', border: '12px solid #222', borderBottom: 'none', boxShadow: '0 40px 80px rgba(0,0,0,0.8), inset 0 0 0 2px #444', overflow: 'hidden', position: 'relative' }}>
               
               {/* Lock Screen Background */}
               <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #1A1B26 0%, #0D0E15 100%)' }}></div>
               
               {/* Top Notch/Dynamic Island */}
               <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '32px', background: '#000', borderRadius: '16px', zIndex: 10 }}></div>
               
               {/* Time */}
               <div style={{ position: 'absolute', top: '100px', width: '100%', textAlign: 'center', color: '#fff', fontSize: '72px', fontWeight: '200', letterSpacing: '-2px' }}>
                 14:32
               </div>
               
               {/* Notification */}
               <div style={{ position: 'absolute', top: '220px', left: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '16px', display: 'flex', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ width: '48px', height: '48px', background: '#121214', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                    <Image src="/images/logo.png" width={28} height={28} alt="Logo" />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#000', fontWeight: 'bold', fontSize: '15px' }}>Mample</span>
                      <span style={{ color: '#666', fontSize: '12px' }}>{t.sa_ss4_now}</span>
                    </div>
                    <div style={{ color: '#000', fontWeight: 'bold', fontSize: '15px' }}>{t.sa_ss4_notif_title}</div>
                    <div style={{ color: '#333', fontSize: '14px', lineHeight: '1.4' }}>{t.sa_ss4_notif_body}</div>
                  </div>
               </div>

             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
