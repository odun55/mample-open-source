/**
 * Mample — Content Script
 *
 * Görevleri:
 * - Sayfadaki input alanlarını dinlemek (/mample komutu)
 * - "Teach" modundayken tıklanan elementi kaydetmek
 * - MutationObserver ile elementin DOM'dan kaybolmasını izlemek
 * - SPA (Single Page Application) sayfa geçişlerinde observer'ı yeniden bağlamak
 */

let currentObserver = null;
let isArmed = false;
let teachMode = false;
let currentHostname = window.location.hostname;
let isExtensionEnabled = true;
let isMampleRequested = false;
let autoObserverInterval = null;
let contentDict = {};
let trackingStatus = "NONE";
let trackingErrorMsg = "";
let teachHoverTimeout = null;
let teachTooltip = null;

function updatePopupStatus() {
  try {
    chrome.runtime.sendMessage({ type: "UPDATE_POPUP_TRACKING_STATE", status: trackingStatus, error: trackingErrorMsg }).catch(() => { });
  } catch (e) { }
}

function setTrackingState(isTracking) {
  try {
    chrome.runtime.sendMessage({ type: "SET_TRACKING_STATE", isTracking: isTracking }).catch(() => { });
  } catch (e) { }
}

function t(key, defaultMsg) {
  if (contentDict[key] && contentDict[key].message) {
    return contentDict[key].message;
  }
  return chrome.i18n.getMessage(key) || defaultMsg;
}


async function init() {
  const data = await chrome.storage.local.get(["armed", "customSelectorMap", "activeModeMap", "extension_enabled", "lang"]);
  isExtensionEnabled = data.extension_enabled !== false;

  try {
    const lang = data.lang || "en";
    const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
    contentDict = await res.json();
  } catch (e) { }

  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === 'local') {
      if (changes.lang !== undefined) {
        try {
          const lang = changes.lang.newValue || "en";
          const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
          contentDict = await res.json();
        } catch (e) { }
      }
      if (changes.extension_enabled !== undefined) {
        isExtensionEnabled = changes.extension_enabled.newValue !== false;
        if (!isExtensionEnabled) {
          if (currentObserver) {
            currentObserver.disconnect();
            currentObserver = null;
          }
          if (autoObserverInterval) {
            clearInterval(autoObserverInterval);
            autoObserverInterval = null;
          }
          if (teachMode) {
            handleTeachRightClick(new Event('contextmenu')); // Teach mode açıksa iptal et
          }
        } else {
          chrome.storage.local.get(["activeModeMap", "customSelectorMap"], (data) => {
            const activeModeMap = data.activeModeMap || {};
            const customSelectorMap = data.customSelectorMap || {};
            if (activeModeMap[currentHostname] === "AUTO_MODE" && customSelectorMap[currentHostname]) {
              startObserver(customSelectorMap[currentHostname]);
            }
          });
        }
      }

      if (changes.activeModeMap !== undefined) {
        const newModeMap = changes.activeModeMap.newValue || {};
        if (!newModeMap[currentHostname]) {
          // Tuş silinmişse veya iptal edilmişse observer'ı durdur
          if (currentObserver) {
            currentObserver.disconnect();
            currentObserver = null;
          }
          isArmed = false;
        }
      }
    }
  });

  const customSelectorMap = data.customSelectorMap || {};
  const activeModeMap = data.activeModeMap || {};

  if (activeModeMap[currentHostname] && isExtensionEnabled) {
    isArmed = true;
    await chrome.storage.local.set({ armed: true });
    if (activeModeMap[currentHostname] === "AUTO_MODE" && customSelectorMap[currentHostname]) {
      startObserver(customSelectorMap[currentHostname]);
    }
  } else if (data.armed && isExtensionEnabled) {
    isArmed = true;
  }

  // Input alanlarını dinle (/mample komutu için) - React'ten önce yakalamak için 'true' (Capture) kullanıyoruz
  document.addEventListener("keydown", handleInput, true);

  // Teach mode tıklama dinleyicisi
  document.addEventListener("click", handleTeachClick, true);

  // SPA route değişikliklerini izle
  setupSPARouteListener();
}

function setupSPARouteListener() {
  // document.title veya body mutation ile basit SPA route değişimi takibi
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onRouteChanged();
    }
  }).observe(document, { subtree: true, childList: true });
}

async function onRouteChanged() {
  if (!isExtensionEnabled) return;
  // Eski observer'ı temizle ve gerekirse yeniden başlat
  if (currentObserver) {
    currentObserver.disconnect();
    currentObserver = null;
  }
  if (autoObserverInterval) {
    clearInterval(autoObserverInterval);
    autoObserverInterval = null;
  }

  const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
  const customSelectorMap = data.customSelectorMap || {};
  const activeModeMap = data.activeModeMap || {};

  if (activeModeMap[currentHostname]) {
    isArmed = true;
    await chrome.storage.local.set({ armed: true });
    if (activeModeMap[currentHostname] === "AUTO_MODE" && customSelectorMap[currentHostname]) {
      startObserver(customSelectorMap[currentHostname]);
    }
  }
}

async function handleInput(e) {
  if (!isExtensionEnabled) return;
  if (e.key !== "Enter") return;

  const target = e.target;
  const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
  if (!isInput) return;

  let text = target.value || target.innerText || "";

  if (text.trim().endsWith("/mample")) {
    isMampleRequested = true;
    setTrackingState(true);
    trackingStatus = "WAITING";
    updatePopupStatus();

    // Kullanıcının yazdığı metinden sadece "/mample" kısmını temizle (SENKRON OLMALI)
    const cleanText = text.replace(/\/mample\s*$/, "");
    if (target.isContentEditable) {
      let nodeFound = false;
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) { textNodes.push(node); }
      for (let i = textNodes.length - 1; i >= 0; i--) {
        if (textNodes[i].nodeValue.includes("/mample")) {
          textNodes[i].nodeValue = textNodes[i].nodeValue.replace(/\/mample\s*$/, "");
          nodeFound = true;
          break;
        }
      }
      if (!nodeFound) target.innerText = cleanText;
    } else {
      target.value = cleanText;
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set
        || Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      if (nativeSetter) {
        nativeSetter.call(target, cleanText);
      }
    }

    // React gibi frameworklerin içi boşaltıldığını/değiştiğini anlaması için
    target.dispatchEvent(new Event('input', { bubbles: true }));

    // NOT: e.preventDefault() YAPMIYORUZ! 
    // Böylece Enter tuşu normal çalışmaya devam eder ve kalan metin (deneme 1 2 3) gönderilir.

    const host = window.location.hostname;
    const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
    const customSelectorMap = data.customSelectorMap || {};
    const activeModeMap = data.activeModeMap || {};

    if (customSelectorMap[host]) {
      isArmed = true;
      await chrome.storage.local.set({ armed: true });
      startObserver(customSelectorMap[host]);
      showToast(t("toast_active_selector", "Mample aktif! İşlem bitince haber vereceğim."));
    } else {
      setTimeout(() => {
        startTeachMode();
      }, 700);
    }
  }
}

// ─── TEACH MODE (GÖRSEL SEÇİM EKRANI) ────────────────────────────────────────

let overlay, highlightBox;

function cleanupTeachMode() {
  teachMode = false;
  document.removeEventListener("mousemove", handleTeachMouseMove, true);
  document.removeEventListener("contextmenu", handleTeachRightClick, true);

  if (overlay) { overlay.remove(); overlay = null; }
  if (highlightBox) { highlightBox.remove(); highlightBox = null; }

  if (teachTooltip) {
    teachTooltip.remove();
    teachTooltip = null;
  }
  if (teachHoverTimeout) {
    clearTimeout(teachHoverTimeout);
    teachHoverTimeout = null;
  }
}

function startTeachMode() {
  if (!isExtensionEnabled) {
    showToast(t("toast_extension_disabled", "Mample: Eklenti kapalı, lütfen menüden açın."));
    return;
  }
  if (teachMode) return;
  teachMode = true;

  // 1. Ekranı karartan overlay
  overlay = document.createElement("div");
  overlay.id = "mample-overlay";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2147483646; pointer-events: none;
    cursor: crosshair;
  `;

  // 2. Vurgu kutusu
  highlightBox = document.createElement("div");
  highlightBox.id = "mample-highlight-box";
  highlightBox.style.cssText = `
    position: fixed; border: 2px solid #6C63FF; border-radius: 4px;
    box-shadow: 0 0 10px rgba(108, 99, 255, 0.8), inset 0 0 10px rgba(108, 99, 255, 0.3);
    background: rgba(108, 99, 255, 0.1);
    z-index: 2147483647; pointer-events: none;
    transition: all 0.1s ease; display: none;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(highlightBox);

  showToast(t("toast_teach_start", "Mample: Elementi seçin (İptal için Sağ Tık)"));

  document.addEventListener("mousemove", handleTeachMouseMove, true);
  document.addEventListener("contextmenu", handleTeachRightClick, true);
}

function handleTeachRightClick(e) {
  if (!teachMode) return;
  e.preventDefault();
  cleanupTeachMode();
  showToast(t("toast_teach_cancel", "Mample: Seçim iptal edildi."));
}

function handleTeachMouseMove(e) {
  if (!teachMode) return;
  const target = e.target;

  // UI elemanlarını seçmesini engelle
  if (target.id === "mample-overlay" || target.id === "mample-highlight-box" || target.id === "mample-teach-tooltip" || target.closest('#mample-toast-container')) return;

  const rect = target.getBoundingClientRect();
  highlightBox.style.display = "block";
  highlightBox.style.top = rect.top + "px";
  highlightBox.style.left = rect.left + "px";
  highlightBox.style.width = rect.width + "px";
  highlightBox.style.height = rect.height + "px";

  if (teachTooltip) {
    teachTooltip.remove();
    teachTooltip = null;
  }
  if (teachHoverTimeout) {
    clearTimeout(teachHoverTimeout);
  }

  const interactiveEl = target.closest('button, a, input, [role="button"]') || target;
  // Claude.ai vb. sitelerde kare/ikon hatasını çözmek için aria-label'ı önceliklendir
  let keyName = (interactiveEl.getAttribute('aria-label') || interactiveEl.getAttribute('title') || interactiveEl.innerText || interactiveEl.value || "").trim();
  keyName = keyName.replace(/\s+/g, ' ').substring(0, 30);

  if (keyName) {
    teachHoverTimeout = setTimeout(() => {
      if (!teachMode) return;
      teachTooltip = document.createElement("div");
      teachTooltip.id = "mample-teach-tooltip";
      teachTooltip.style.cssText = `
        position: fixed;
        top: ${e.clientY + 15}px;
        left: ${e.clientX + 15}px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        pointer-events: none;
        z-index: 2147483647;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        white-space: nowrap;
      `;
      teachTooltip.textContent = keyName;
      document.body.appendChild(teachTooltip);
    }, 500);
  }
}

async function handleTeachClick(e) {
  if (!teachMode) return;

  e.preventDefault();
  e.stopPropagation();

  const target = e.target;
  const selector = generateSelector(target);

  // Modu kapat ve UI elemanlarını temizle
  cleanupTeachMode();

  const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
  const customSelectorMap = data.customSelectorMap || {};
  const activeModeMap = data.activeModeMap || {};

  customSelectorMap[currentHostname] = selector;

  await chrome.storage.local.set({ customSelectorMap, armed: true });
  isArmed = true;
  isMampleRequested = true;
  setTrackingState(true);
  trackingStatus = "WAITING";
  updatePopupStatus();

  showToast(t("toast_learned", "Mample öğrendi ve aktif edildi! Tuş kaybolduğunda bildirim gidecek."));

  startObserver(selector);
}

let isElementCurrentlyMissing = false;
let missingElementTimeout = null;

function startObserver(selector) {
  if (!selector) return;

  if (currentObserver) {
    currentObserver.disconnect();
  }

  try {
    const el = document.querySelector(selector);
    isElementCurrentlyMissing = !el || el.style.display === "none" || el.disabled;
  } catch (e) {
    console.warn("Mample: Geçersiz selector", selector);
    return;
  }

  if (missingElementTimeout) clearTimeout(missingElementTimeout);
  if (isMampleRequested && isElementCurrentlyMissing) {
    missingElementTimeout = setTimeout(() => {
      isMampleRequested = false;
      setTrackingState(false);
      trackingStatus = "ERROR";
      trackingErrorMsg = t("toast_key_not_found", "Mample: Tuş bulunamadı, lütfen ekranda işlem yapılırken var olan sonradan kaybolan bir tuş seçimi yapınız.");
      updatePopupStatus();
      showToast(trackingErrorMsg);
    }, 10000);
  }

  // Elementin DOM'dan silinmesini (veya gizlenmesini) izle
  currentObserver = new MutationObserver((mutations) => {
    let el = null;
    try {
      el = document.querySelector(selector);
    } catch (e) {
      return;
    }

    const isMissing = !el || el.style.display === "none" || el.disabled;

    // Eğer element varken yok olduysa
    if (isMissing && !isElementCurrentlyMissing) {
      isElementCurrentlyMissing = true;

      chrome.storage.local.get(["activeModeMap"], (data) => {
        const activeMap = data.activeModeMap || {};
        if (isMampleRequested || activeMap[currentHostname] === "AUTO_MODE") {
          // Arka plana mesaj gönder
          chrome.runtime.sendMessage({
            type: "SEND_NOTIFICATION",
            taskName: "",
            source: document.title
          }, (response) => {
            if (response && !response.success) {
              let errMsg = t(response.error, response.error);
              showToast(`${t("toast_error", "Mample Hata: ")}${errMsg}`);
              trackingStatus = "ERROR";
              trackingErrorMsg = errMsg;
              updatePopupStatus();
            } else {
              showToast(t("toast_process_done", "Mample: İşlem bitti, bildirim gönderildi!"));
              trackingStatus = "SUCCESS";
              updatePopupStatus();
            }
          });
          isMampleRequested = false;
          setTrackingState(false);
        }
      });
    }
    else if (!isMissing && isElementCurrentlyMissing) {
      isElementCurrentlyMissing = false;
      if (missingElementTimeout) clearTimeout(missingElementTimeout);

      chrome.storage.local.get(["activeModeMap"], (data) => {
        const activeMap = data.activeModeMap || {};
        if (isMampleRequested) {
          showToast(t("toast_process_started", "Mample: İşlem başladı. Bittiğinde bildirim alacaksınız."));
        } else if (activeMap[currentHostname] === "AUTO_MODE") {
          isMampleRequested = true;
          setTrackingState(true);
          trackingStatus = "WAITING";
          updatePopupStatus();
          showToast(t("toast_tracking_started", "Mample: İzleme başlatıldı. Bittiğinde bildirim alacaksınız."));
        }
      });
    }
  });

  currentObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "disabled", "class"]
  });
}

function generateSelector(element) {
  // Kullanıcı butonun içindeki svg veya span'a tıklamış olabilir.
  // Bu yüzden en yakın tıklanabilir/anlamlı üst elementi (button, a) arayalım.
  const interactiveEl = element.closest('button, a, input, [role="button"]') || element;
  element = interactiveEl;

  // 1. Önce en sağlam, kasıtlı konulmuş özellikleri (data-testid, aria-label vb.) kontrol et.
  // Çoğu modern sitede (React vb.) ID'ler rastgele üretildiği için ID'den bile güvenilirdirler.
  const attrs = ['data-testid', 'data-test-id', 'data-test', 'aria-label', 'name', 'placeholder'];
  for (let attr of attrs) {
    if (element.hasAttribute(attr)) {
      return `${element.tagName.toLowerCase()}[${attr}="${CSS.escape(element.getAttribute(attr))}"]`;
    }
  }

  // 2. Ardından ID'ye bak (İçinde 3'ten fazla rakam veya rastgele harf yığınları yoksa)
  if (element.id && !/\d{3,}/.test(element.id) && !/_r_/.test(element.id) && !/:[A-Za-z0-9]+:/.test(element.id)) {
    return `#${CSS.escape(element.id)}`;
  }

  // 3. Daha genel özelliklere bak (role, type, vb.)
  const secondaryAttrs = ['role', 'type', 'href'];
  for (let attr of secondaryAttrs) {
    if (element.hasAttribute(attr)) {
      return `${element.tagName.toLowerCase()}[${attr}="${CSS.escape(element.getAttribute(attr))}"]`;
    }
  }

  if (element.className && typeof element.className === 'string') {
    const classes = element.className
      .trim()
      .split(/\s+/)
      .filter(c => c && !/\d/.test(c)) // İçinde sayı olan (dinamik olma ihtimali yüksek) class'ları ele
      .map(c => `.${CSS.escape(c)}`)
      .join("");

    if (classes) {
      return `${element.tagName.toLowerCase()}${classes}`;
    }
  }

  // Eğer hiçbir anlamlı seçici bulunamadıysa nth-child silsilesine (fallback) geç.
  // Ancak fallback yaparken çok uzun silsileler üretmek yerine sadece belirli bir seviyeye kadar çıkılabilir
  // Şimdilik orijinal mantığı koruyoruz ama interaktif elemente çıktığımız için silsile daha kısa/doğru olacaktır.
  let path = [];
  let current = element;
  while (current && current.tagName !== 'BODY' && current.tagName !== 'HTML') {
    let index = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      index++;
      sibling = sibling.previousElementSibling;
    }
    path.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = current.parentElement;
  }
  return path.length > 0 ? path.join(" > ") : element.tagName.toLowerCase();
}

function showToast(message) {
  let container = document.getElementById("mample-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "mample-toast-container";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      z-index: 2147483647;
      pointer-events: none;
      transition: left 0.2s, right 0.2s;
    `;
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "mample-toast-item";
  toast.textContent = message;
  toast.style.cssText = `
    background: #6C63FF;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  `;

  // Fare üzerine geldiğinde tüm container'ı hareket ettir
  toast.addEventListener("mouseenter", () => {
    if (container.style.left === "20px") {
      container.style.left = "auto";
      container.style.right = "20px";
      container.style.alignItems = "flex-end";
    } else {
      container.style.right = "auto";
      container.style.left = "20px";
      container.style.alignItems = "flex-start";
    }
  });

  container.appendChild(toast);

  // Animasyonla görünme
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0) scale(1)";
    });
  });

  // Animasyonla kaybolma
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px) scale(0.95)";
    setTimeout(() => {
      toast.remove();
      // Eğer container'da hiç toast kalmadıysa container'ı da temizle
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 4000);
}



// startAutoObserver silindi, yerine her zaman MutationObserver kullanan startObserver kullanılıyor.

// Popup'tan gelen manuel tetiklemeleri dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TEACH_MODE") {
    startTeachMode();
  } else if (message.type === "STOP_OBSERVER") {
    if (currentObserver) {
      currentObserver.disconnect();
      currentObserver = null;
    }
    isArmed = false;
    isMampleRequested = false;
    setTrackingState(false);
    trackingStatus = "NONE";
    updatePopupStatus();
    showToast(t("toast_selection_cleared", "Mample: Seçim sıfırlandı ve izleyici durduruldu."));

  } else if (message.type === "START_AUTO_MODE") {
    chrome.storage.local.get(["customSelectorMap"], (data) => {
      const customMap = data.customSelectorMap || {};
      if (customMap[currentHostname]) {
        isArmed = true;
        chrome.storage.local.set({ armed: true, is_system_mode: false });
        startObserver(customMap[currentHostname]);
        showToast(t("toast_active_selector", "Mample aktif! İşlem bitince haber vereceğim."));
      }
    });
  } else if (message.type === "SHOW_TOAST") {
    showToast(message.message);
  } else if (message.type === "GET_TRACKING_STATE") {
    sendResponse({ isTracking: isMampleRequested, status: trackingStatus, error: trackingErrorMsg });
  }
});

// Başlat
init();

