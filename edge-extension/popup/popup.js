/**
 * Mample — Popup Script
 */

const CHECK_PAIRING_URL = "https://europe-west1-mample-fca3c.cloudfunctions.net/checkPairing";
const REGISTER_EXTENSION_URL = "https://europe-west1-mample-fca3c.cloudfunctions.net/registerExtensionConnection";
const DISCONNECT_URL = "https://europe-west1-mample-fca3c.cloudfunctions.net/disconnectExtension";
let pollingInterval = null;
let qrTimeout = null;
const QR_EXPIRE_TIME = 2 * 60 * 1000; // 2 minutes
let popupDict = {};

function t(key, params = []) {
  let msg = popupDict[key]?.message || key;
  params.forEach((param, index) => {
    msg = msg.replace(`$${index + 1}`, param);
  });
  return msg;
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function init() {
  const data = await chrome.storage.local.get(["connection_id", "paired", "extension_enabled", "lang"]);
  let connectionId = data.connection_id;
  let isPaired = data.paired || false;

  const mainContent = document.getElementById("main-content");

  // Language settings
  let currentLang = data.lang || "en";

  async function loadTranslations(lang) {
    try {
      const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
      popupDict = await res.json();

      document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n'));
      });
      document.querySelectorAll('[data-i18n-attr]').forEach(el => {
        const parts = el.getAttribute('data-i18n-attr').split('|');
        if (parts.length === 2) {
          el.setAttribute(parts[0], t(parts[1]));
        }
      });

      // Update toggle button text

      const codeEl = document.getElementById('current-lang-code');
      if (codeEl) {
        codeEl.innerHTML = lang === 'tr' ? 'TR' : 'EN';
      }

      // Re-render sites list if it's currently open
      renderSitesLists();
    } catch (e) {
      console.error("Localization error", e);
    }
  }

  await loadTranslations(currentLang);

  const langBtn = document.getElementById('lang-toggle-btn');
  const langDropdown = document.getElementById('lang-dropdown');

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.style.display = langDropdown.style.display === 'flex' ? 'none' : 'flex';
    });

    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', async (e) => {
        const selectedLang = e.currentTarget.getAttribute('data-lang');
        if (selectedLang !== currentLang) {
          currentLang = selectedLang;
          await chrome.storage.local.set({ lang: currentLang });
          await loadTranslations(currentLang);
        }
        langDropdown.style.display = 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!langBtn.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.style.display = 'none';
      }
      const infoIcon = document.querySelector('.info-icon');
      if (infoIcon && !infoIcon.contains(e.target)) {
        infoIcon.classList.remove('active');
      }
    });
  }

  const infoIcon = document.querySelector('.info-icon');
  if (infoIcon) {
    infoIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      infoIcon.classList.toggle('active');
    });
  }

  if (!connectionId) {
    // Yeni UUID oluştur
    connectionId = generateUUID();
    await chrome.storage.local.set({ connection_id: connectionId, paired: false });
    isPaired = false;
  }

  // QR Kodu oluştur (qrcode.js kütüphanesini kullanır)
  const qrContainer = document.getElementById("qrcode");
  const refreshBtn = document.getElementById("qr-refresh-btn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      const newId = generateUUID();
      await chrome.storage.local.set({ connection_id: newId, paired: false });
      window.location.reload();
    });
  }

  if (!isPaired) {
    qrContainer.innerHTML = ""; // loader'ı temizle
    new QRCode(qrContainer, {
      text: connectionId,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    const qrWrapper = document.getElementById("qrcode-container");
    if (qrWrapper) qrWrapper.style.display = "inline-block";
    if (refreshBtn) refreshBtn.style.display = "flex";
  } else {
    qrContainer.innerHTML = ""; // Paired ise QR gösterme
    const qrWrapper = document.getElementById("qrcode-container");
    if (qrWrapper) qrWrapper.style.display = "none";
    if (refreshBtn) refreshBtn.style.display = "none";
  }

  const manualGroup = document.querySelector('.manual-connect-group');
  const disconnectBtn = document.getElementById('disconnect-btn');

  if (isPaired) {
    handlePaired();
  } else {
    const statusText = document.getElementById("status-text");
    statusText.setAttribute("data-i18n", "connecting");
    statusText.textContent = t("connecting");
    statusText.className = "unpaired";
    if (manualGroup) manualGroup.style.display = 'flex';
    if (disconnectBtn) disconnectBtn.style.display = 'none';
  }

  // Bağlantıyı Kes butonu
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      // confirm string will be handled by fetching current dictionary or basic translation.
      const confirmStr = document.getElementById("disconnect-btn").getAttribute("data-confirm-text") || "Bağlantıyı kesmek istediğinize emin misiniz?";
      if (confirm(confirmStr)) {
        try {
          // Firebase'den de sil (böylece mobilde anında yok olur)
          await fetch(DISCONNECT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connection_id: connectionId })
          });
        } catch (e) {
          console.error("Firebase silme hatası", e);
        }
        await chrome.storage.local.remove("connection_id");
        await chrome.storage.local.set({ paired: false });
        window.location.reload(); // Arayüzü sıfırlamak için yeniden yükle
      }
    });
  }

  // Eşleşmeyi kontrol et
  startPolling(connectionId);
  if (!isPaired) {
    startQRTimeout();
  }

  // Geçerli site için seçim var mı kontrol et (Sıfırlama butonu için)
  checkCurrentSite();

  // Manuel Bağlantı Kutusu
  const manualInput = document.getElementById("manual-key-input");
  const manualBtn = document.getElementById("manual-connect-btn");

  if (manualInput && manualBtn) {
    manualInput.addEventListener("input", (e) => {
      manualBtn.disabled = e.target.value.trim().length < 5;
    });

    manualBtn.addEventListener("click", async () => {
      const secretKey = manualInput.value.trim();
      if (!secretKey) return;

      manualBtn.disabled = true;
      manualBtn.textContent = "Bekle...";

      try {
        const response = await fetch(REGISTER_EXTENSION_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cli_secret_key: secretKey })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.connection_id) {
            // Mevcut connection_id'yi sunucudan gelenle değiştirip eşleşmiş sayıyoruz
            await chrome.storage.local.set({
              connection_id: resData.connection_id,
              paired: true
            });
            handlePaired();
          } else {
            alert("Sunucu yanıtı geçersiz.");
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          alert(errData.error || "Hatalı Secret Key!");
        }
      } catch (err) {
        alert("Bağlantı hatası: " + err.message);
      } finally {
        manualBtn.disabled = false;
        manualBtn.textContent = "Bağlan";
      }
    });
  }

  const autoNotifToggle = document.getElementById("auto-notif-toggle");
  if (autoNotifToggle) {
    autoNotifToggle.addEventListener("change", async (e) => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0] && tabs[0].id) {
          const url = new URL(tabs[0].url);
          const hostname = url.hostname;
          const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
          const customSelectorMap = data.customSelectorMap || {};
          const activeModeMap = data.activeModeMap || {};

          if (!e.target.checked) {
            delete activeModeMap[hostname];
            await chrome.storage.local.set({ activeModeMap });
            chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_OBSERVER" });
            chrome.runtime.sendMessage({ type: "SYNC_ICONS" });
            checkCurrentSite();
          } else {
            if (!customSelectorMap[hostname]) {
              // Show toast on webpage
              chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_TOAST", message: t('toast_no_custom_key') });
              e.target.checked = false;
            } else {
              activeModeMap[hostname] = "AUTO_MODE";
              await chrome.storage.local.set({ activeModeMap });
              chrome.tabs.sendMessage(tabs[0].id, { type: "START_AUTO_MODE" });
              chrome.runtime.sendMessage({ type: "SYNC_ICONS" });
              checkCurrentSite();
            }
          }
        }
      });
    });
  }

  const teachActionBtn = document.getElementById("teach-action-btn");
  if (teachActionBtn) {
    teachActionBtn.onclick = async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0] && tabs[0].id) {
          const mode = teachActionBtn.getAttribute("data-mode");
          if (mode === "delete") {
            const url = new URL(tabs[0].url);
            const hostname = url.hostname;
            const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
            const customSelectorMap = data.customSelectorMap || {};
            const activeModeMap = data.activeModeMap || {};
            delete customSelectorMap[hostname];
            if (activeModeMap[hostname] === "AUTO_MODE") {
              delete activeModeMap[hostname];
            }
            await chrome.storage.local.set({ customSelectorMap, activeModeMap });
            chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_OBSERVER" });
            chrome.runtime.sendMessage({ type: "SYNC_ICONS" });
            checkCurrentSite();
          } else {
            chrome.tabs.sendMessage(tabs[0].id, { type: "START_TEACH_MODE" });
            setTimeout(() => { window.close(); }, 100);
          }
        }
      });
    };
  }


  // İndirmeler toggle ve limit
  const downloadsToggle = document.getElementById("downloads-toggle");
  const downloadsThresholdInput = document.getElementById("downloads-threshold");
  if (downloadsToggle && downloadsThresholdInput) {
    const data = await chrome.storage.local.get(["downloads_enabled", "downloads_threshold"]);
    let isDownloadsEnabled = !!data.downloads_enabled;
    let downloadsThreshold = data.downloads_threshold || 40;

    downloadsToggle.checked = isDownloadsEnabled;
    downloadsThresholdInput.value = downloadsThreshold;

    downloadsToggle.addEventListener("change", async (e) => {
      isDownloadsEnabled = e.target.checked;
      await chrome.storage.local.set({ downloads_enabled: isDownloadsEnabled });
    });

    downloadsThresholdInput.addEventListener("change", async (e) => {
      let val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) val = 40;
      downloadsThreshold = val;
      downloadsThresholdInput.value = downloadsThreshold;
      await chrome.storage.local.set({ downloads_threshold: downloadsThreshold });
    });
  }
  // System Dinleme butonu işlevi checkCurrentSite içine taşındı.

  // Tracking status cancel click
  const trackingStatusContainer = document.getElementById("tracking-status");
  if (trackingStatusContainer) {
    let originalWaitingText = "";
    
    trackingStatusContainer.addEventListener("mouseenter", () => {
      const status = trackingStatusContainer.getAttribute("data-status");
      const isCancelling = trackingStatusContainer.getAttribute("data-cancelling") === "true";
      const isTr = document.getElementById('current-lang-code')?.innerText === "TR";

      if (status === "WAITING" && !isCancelling) {
        // Query textSpan that is NOT the hover icon, just in case
        const textSpans = trackingStatusContainer.querySelectorAll("span");
        let textSpan = null;
        textSpans.forEach(s => { if (!s.classList.contains("hover-cancel-icon")) textSpan = s; });
        
        const loader = trackingStatusContainer.querySelector(".loader");

        if (loader) loader.style.display = "none";
        
        if (textSpan) {
          originalWaitingText = textSpan.textContent;
          textSpan.textContent = isTr ? "İptal etmek için tıklayın" : "Click to cancel";
          textSpan.style.color = "#d32f2f";
        }
        
        if (!trackingStatusContainer.querySelector(".hover-cancel-icon")) {
          const icon = document.createElement("span");
          icon.className = "hover-cancel-icon";
          icon.innerHTML = "✖";
          icon.style.color = "#d32f2f";
          icon.style.fontSize = "14px";
          icon.style.marginRight = "5px";
          trackingStatusContainer.insertBefore(icon, textSpan);
        }
      }
    });

    trackingStatusContainer.addEventListener("mouseleave", () => {
      const status = trackingStatusContainer.getAttribute("data-status");
      const isCancelling = trackingStatusContainer.getAttribute("data-cancelling") === "true";
      
      if (status === "WAITING" && !isCancelling) {
        const textSpans = trackingStatusContainer.querySelectorAll("span");
        let textSpan = null;
        textSpans.forEach(s => { if (!s.classList.contains("hover-cancel-icon")) textSpan = s; });
        const loader = trackingStatusContainer.querySelector(".loader");
        
        if (loader) loader.style.display = "block";
        
        if (textSpan && originalWaitingText) {
          textSpan.textContent = originalWaitingText;
          textSpan.style.color = "#666";
        }

        const icon = trackingStatusContainer.querySelector(".hover-cancel-icon");
        if (icon) icon.remove();
      }
    });

    trackingStatusContainer.addEventListener("click", () => {
      const status = trackingStatusContainer.getAttribute("data-status");
      const isCancelling = trackingStatusContainer.getAttribute("data-cancelling") === "true";

      if (status === "WAITING" && !isCancelling) {
        trackingStatusContainer.setAttribute("data-cancelling", "true");

        // Arka planda işlemi durdur
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_OBSERVER" });
          }
        });

        // Hemen gizle
        trackingStatusContainer.setAttribute("data-cancelling", "false");
        trackingStatusContainer.style.display = "none";
        trackingStatusContainer.setAttribute("data-status", "NONE");

      } else if ((status === "SUCCESS" || status === "ERROR") && !isCancelling) {
        trackingStatusContainer.style.display = "none";
        trackingStatusContainer.setAttribute("data-status", "NONE");
      }
    });
  }

  // Menu panel toggle
  const menuToggleBtn = document.getElementById("menu-toggle-btn");
  const backBtn = document.getElementById("back-btn");
  const sitesPanel = document.getElementById("sites-panel");

  if (menuToggleBtn && backBtn && mainContent && sitesPanel) {
    menuToggleBtn.addEventListener("click", () => {
      mainContent.style.display = "none";
      sitesPanel.style.display = "block";
      renderSitesLists();
    });

    backBtn.addEventListener("click", () => {
      sitesPanel.style.display = "none";
      mainContent.style.display = "block";
      checkCurrentSite(); // refresh main view state
    });
  }
}

async function renderSitesLists() {
  const customList = document.getElementById("custom-sites-list");
  if (!customList) return;

  // Render Custom Sites
  customList.innerHTML = "";

  const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
  const customSelectorMap = data.customSelectorMap || {};
  const activeModeMap = data.activeModeMap || {};

  const customHosts = Object.keys(customSelectorMap);

  if (customHosts.length === 0) {
    customList.innerHTML = `
      <div style="font-size: 12px; color: #999; text-align: center; padding: 12px 0;">
        ${t('no_custom_sites')}
      </div>
    `;
  } else {
    customHosts.forEach(host => {
      const item = document.createElement("div");
      item.className = "site-item";

      const nameSpan = document.createElement("span");
      nameSpan.className = "site-name";
      nameSpan.textContent = host;
      nameSpan.title = customSelectorMap[host]; // show selector on hover

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-site-btn";
      deleteBtn.textContent = t('delete_btn');
      deleteBtn.addEventListener("click", async () => {
        if (confirm(t('confirm_delete', [host]))) {
          delete customSelectorMap[host];
          if (activeModeMap[host] === "AUTO_MODE") {
            delete activeModeMap[host];
          }
          await chrome.storage.local.set({ customSelectorMap, activeModeMap });

          // Stop observer if currently active on this tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].url) {
              try {
                const url = new URL(tabs[0].url);
                if (url.hostname === host) {
                  chrome.tabs.sendMessage(tabs[0].id, { type: "STOP_OBSERVER" }).catch(() => { });
                }
              } catch (e) { }
            }
          });

          renderSitesLists(); // Re-render lists
        }
      });

      item.appendChild(nameSpan);
      item.appendChild(deleteBtn);
      customList.appendChild(item);
    });
  }
}

function checkCurrentSite() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (!tabs[0] || !tabs[0].url) return;

    try {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;

      const data = await chrome.storage.local.get(["customSelectorMap", "activeModeMap"]);
      const customSelectorMap = data.customSelectorMap || {};
      const activeModeMap = data.activeModeMap || {};

      const teachActionBtn = document.getElementById("teach-action-btn");
      const customActionGroup = document.getElementById("custom-action-group");

      if (customActionGroup) {
        customActionGroup.style.display = "flex";

        // Right button (Teach / Delete)
        if (customSelectorMap[hostname]) {
          teachActionBtn.textContent = t('delete_key');
          teachActionBtn.setAttribute('data-mode', 'delete');
          teachActionBtn.style.backgroundColor = "#fff0f0";
          teachActionBtn.style.color = "#d32f2f";
          teachActionBtn.style.borderColor = "#ffcdd2";
        } else {
          teachActionBtn.textContent = t('select_key');
          teachActionBtn.setAttribute('data-mode', 'teach');
          teachActionBtn.style.backgroundColor = "";
          teachActionBtn.style.color = "";
          teachActionBtn.style.borderColor = "";
        }

        const autoNotifToggle = document.getElementById("auto-notif-toggle");
        if (autoNotifToggle) {
          autoNotifToggle.checked = (activeModeMap[hostname] === "AUTO_MODE");
        }
      }

      // Check tracking state
      chrome.tabs.sendMessage(tabs[0].id, { type: "GET_TRACKING_STATE" }, (response) => {
        if (chrome.runtime.lastError) {
          updateTrackingStatusUI({ status: "NONE" });
          return;
        }

        if (response && !response.status) {
          response.status = response.isTracking ? "WAITING" : "NONE";
        }

        updateTrackingStatusUI(response);
      });

    } catch (e) {
      // URL parse edilemezse sessizce geç
    }
  });
}

function startQRTimeout() {
  if (qrTimeout) clearTimeout(qrTimeout);
  qrTimeout = setTimeout(async () => {
    if (pollingInterval) clearInterval(pollingInterval);
    await chrome.storage.local.remove("connection_id");
    await chrome.storage.local.set({ paired: false });
    document.getElementById("status-text").textContent = "QR Kod Süresi Doldu. Yenileyin.";
    document.getElementById("status-text").className = "unpaired";
    document.getElementById("qrcode").innerHTML = "";
    const qrWrapper = document.getElementById("qrcode-container");
    if (qrWrapper) qrWrapper.style.display = "inline-block";
    const refreshBtn = document.getElementById("qr-refresh-btn");
    if (refreshBtn) refreshBtn.style.display = "flex";
  }, QR_EXPIRE_TIME);
}

function startPolling(connectionId) {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(async () => {
    try {
      const response = await fetch(`${CHECK_PAIRING_URL}?connection_id=${connectionId}`);
      if (response.status === 200) {
        const result = await response.json();
        if (result.paired) {
          handlePaired();
        } else {
          // Eğer sunucu "paired: false" döndüyse ama biz daha önce eşleştiğimizi sanıyorsak (Telefondan silinmiş demektir)
          const data = await chrome.storage.local.get(["paired"]);
          if (data.paired) {
            clearInterval(pollingInterval);
            await chrome.storage.local.remove("connection_id");
            await chrome.storage.local.set({ paired: false, armed: false });

            // Arka plandaki ikonları da grileştir
            chrome.runtime.sendMessage({ type: "SYNC_ICONS" }); // İsteğe bağlı

            document.getElementById("status-text").textContent = "Bağlantı koptu. Yeniden QR okutun.";
            document.getElementById("status-text").className = "unpaired";
            document.getElementById("qrcode").innerHTML = "";
            const qrWrapper = document.getElementById("qrcode-container");
            if (qrWrapper) qrWrapper.style.display = "inline-block";
            const refreshBtn = document.getElementById("qr-refresh-btn");
            if (refreshBtn) refreshBtn.style.display = "flex";
            const disconnectBtn = document.getElementById('disconnect-btn');
            if (disconnectBtn) disconnectBtn.style.display = 'none';
          }
        }
      } else if (response.status === 410) {
        // Süresi doldu
        clearInterval(pollingInterval);
        await chrome.storage.local.remove("connection_id");
        await chrome.storage.local.set({ paired: false });
        document.getElementById("status-text").textContent = "Eski bağlantı silindi.";
        document.getElementById("status-text").className = "unpaired";
        document.getElementById("qrcode").innerHTML = "";
        const qrWrapper = document.getElementById("qrcode-container");
        if (qrWrapper) qrWrapper.style.display = "inline-block";
        const refreshBtn = document.getElementById("qr-refresh-btn");
        if (refreshBtn) refreshBtn.style.display = "flex";
      }
    } catch (e) {
      console.error("Polling hatası:", e);
    }
  }, 3000); // 3 saniyede bir sor
}

async function handlePaired() {
  if (qrTimeout) clearTimeout(qrTimeout);
  await chrome.storage.local.set({ paired: true });

  const statusText = document.getElementById("status-text");
  statusText.setAttribute("data-i18n", "connected");
  statusText.textContent = t("connected");
  statusText.className = "paired";

  const instruction = document.getElementById("instruction");
  if (instruction) {
    instruction.setAttribute("data-i18n", "ready_instruction");
    instruction.textContent = t("ready_instruction");
  }

  const qrContainerWrapper = document.getElementById("qrcode-container");
  if (qrContainerWrapper) qrContainerWrapper.style.display = "none";

  const qrContainer = document.getElementById("qrcode");
  if (qrContainer) qrContainer.innerHTML = "";

  const refreshBtn = document.getElementById("qr-refresh-btn");
  if (refreshBtn) refreshBtn.style.display = "none";

  const manualGroup = document.querySelector('.manual-connect-group');
  if (manualGroup) manualGroup.style.display = 'none';

  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) disconnectBtn.style.display = 'block';
}

function updateTrackingStatusUI(response) {
  const trackingStatus = document.getElementById("tracking-status");
  if (!trackingStatus) return;
  const loader = trackingStatus.querySelector(".loader");
  
  // Exclude hover icon from textSpan selection
  const textSpans = trackingStatus.querySelectorAll("span");
  let textSpan = null;
  textSpans.forEach(s => { if (!s.classList.contains("hover-cancel-icon")) textSpan = s; });
  
  const hoverIcon = trackingStatus.querySelector(".hover-cancel-icon");

  if (!response || response.status === "NONE") {
    if (trackingStatus.getAttribute("data-cancelling") === "true") return;
    trackingStatus.style.display = "none";
    trackingStatus.setAttribute("data-status", "NONE");
    return;
  }

  trackingStatus.style.display = "flex";
  trackingStatus.setAttribute("data-status", response.status);

  const isTr = document.getElementById('current-lang-code')?.innerText === "TR";

  if (response.status === "WAITING") {
    if (loader) loader.style.display = "block";
    if (hoverIcon) hoverIcon.remove();
    if (textSpan) {
      textSpan.style.color = "#666";
      textSpan.textContent = t("waiting_process");
    }
    trackingStatus.style.cursor = "pointer";
    trackingStatus.title = "";
  } else if (response.status === "SUCCESS") {
    if (loader) loader.style.display = "none";
    if (hoverIcon) hoverIcon.remove();
    if (textSpan) {
      textSpan.style.color = "#4CAF50";
      textSpan.textContent = t("process_success");
    }
    trackingStatus.style.cursor = "pointer";
    trackingStatus.title = isTr ? "Kapatmak için tıklayın" : "Click to dismiss";
  } else if (response.status === "ERROR") {
    if (loader) loader.style.display = "none";
    if (hoverIcon) hoverIcon.remove();
    if (textSpan) {
      textSpan.style.color = "#d32f2f";
      textSpan.textContent = response.error || t("process_error");
    }
    trackingStatus.style.cursor = "pointer";
    trackingStatus.title = isTr ? "Kapatmak için tıklayın" : "Click to dismiss";
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_POPUP_TRACKING_STATE") {
    updateTrackingStatusUI(msg);
  }
});

document.addEventListener("DOMContentLoaded", init);
