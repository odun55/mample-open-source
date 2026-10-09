/**
 * Mample — Background Service Worker
 *
 * Görevleri:
 * - Uzun ömürlü state tutmak (chrome.storage.local)
 * - Firebase'e notification trigger isteği atmak
 * - Popup ile iletişimi sağlamak
 */

const FIREBASE_FUNCTION_URL = "https://europe-west1-mample-fca3c.cloudfunctions.net/triggerNotification";

// Varsayılan state'i başlat
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get(["armed", "selectorMap", "connection_id", "paired"]);
  if (data.armed === undefined) await chrome.storage.local.set({ armed: false });
  if (data.paired === undefined) await chrome.storage.local.set({ paired: false });
  if (!data.selectorMap) await chrome.storage.local.set({ selectorMap: {} });
  updateAllTabsIcons();
});

// Storage değişikliklerini dinle ve ikonu güncelle
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && (changes.selectorMap || changes.paired || changes.armed || changes.extension_enabled)) {
    updateAllTabsIcons();
  }
});

// Yeni sekme yüklendiğinde ikonu kontrol et
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.storage.local.get(["trackingTabs"]).then(data => {
      const trackingTabs = data.trackingTabs || {};
      if (trackingTabs[tabId]) {
        delete trackingTabs[tabId];
        chrome.storage.local.set({ trackingTabs });
      }
    });
  }
  if (changeInfo.status === 'complete' || changeInfo.url) {
    updateIconForTab(tab);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get(["trackingTabs"]).then(data => {
    const trackingTabs = data.trackingTabs || {};
    if (trackingTabs[tabId]) {
      delete trackingTabs[tabId];
      chrome.storage.local.set({ trackingTabs });
    }
  });
});

// Tüm sekmelerdeki ikonu güncelle
async function updateAllTabsIcons() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    updateIconForTab(tab);
  }
}

async function updateIconForTab(tab) {
  if (!tab.id) return;
  const data = await chrome.storage.local.get(["paired", "extension_enabled", "trackingTabs"]);
  const isPaired = data.paired || false;
  const isExtensionEnabled = data.extension_enabled !== false;
  const trackingTabs = data.trackingTabs || {};
  const isTracking = trackingTabs[tab.id];

  let outlineColor = "#9e9e9e";
  if (!isExtensionEnabled) {
    outlineColor = "#f44336";
  } else if (isTracking) {
    outlineColor = "#4CAF50"; 
  }

  const innerColor = !isExtensionEnabled ? "#f44336" : (isPaired ? "#4CAF50" : "#9e9e9e");

  // 16x16 eklenti ikonu için canvas
  const canvas = new OffscreenCanvas(16, 16);
  const ctx = canvas.getContext('2d');

  // Kenarları yuvarlatılmış dış boş kare çizimi
  const x = 2;
  const y = 2;
  const width = 12;
  const height = 12;
  const radius = 3;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  ctx.lineWidth = 2;
  ctx.strokeStyle = outlineColor;
  ctx.stroke();

  // Kenarları yuvarlatılmış iç dolu kare çizimi (her zaman çizilecek)
  const ix = 5;
  const iy = 5;
  const iw = 6;
  const ih = 6;
  const ir = 1.5;

  ctx.beginPath();
  ctx.moveTo(ix + ir, iy);
  ctx.lineTo(ix + iw - ir, iy);
  ctx.quadraticCurveTo(ix + iw, iy, ix + iw, iy + ir);
  ctx.lineTo(ix + iw, iy + ih - ir);
  ctx.quadraticCurveTo(ix + iw, iy + ih, ix + iw - ir, iy + ih);
  ctx.lineTo(ix + ir, iy + ih);
  ctx.quadraticCurveTo(ix, iy + ih, ix, iy + ih - ir);
  ctx.lineTo(ix, iy + ir);
  ctx.quadraticCurveTo(ix, iy, ix + ir, iy);
  ctx.closePath();

  ctx.fillStyle = innerColor;
  ctx.fill();

  // Çizimi ilgili sekmenin eklenti ikonuna uygula
  const imageData = ctx.getImageData(0, 0, 16, 16);

  chrome.action.setBadgeText({ text: "", tabId: tab.id });
  chrome.action.setIcon({ imageData: imageData, tabId: tab.id });
}

// Content script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_NATIVE_NOTIFICATION") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
      title: "Mample",
      message: message.message
    });
    return;
  }

  if (message.type === "SET_TRACKING_STATE" && sender.tab) {
    chrome.storage.local.get(["trackingTabs"]).then(data => {
      const trackingTabs = data.trackingTabs || {};
      if (message.isTracking) {
        trackingTabs[sender.tab.id] = true;
      } else {
        delete trackingTabs[sender.tab.id];
      }
      chrome.storage.local.set({ trackingTabs }).then(() => {
        updateIconForTab(sender.tab);
      });
    });
    return;
  }

  if (message.type === "SEND_NOTIFICATION") {
    handleNotificationTrigger(message.taskName, message.source)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Asenkron response için gerekli
  }

  if (message.type === "REQUEST_HOST_PERMISSION") {
    // Permission request sadece kullanıcı etkileşimi anında (örn. popup) yapılabilir.
    // O yüzden Content Script'te bir iframe/uyarı veya popup üzerinden istemek daha sağlıklıdır.
    // Basitlik adına, şimdilik bildirimi döndürüyoruz. Content script kendi izin isteyemez.
    // İleride bunu popup'a taşıyabiliriz.
  }
});

async function handleNotificationTrigger(taskName, source) {
  const data = await chrome.storage.local.get(["connection_id", "extension_enabled"]);
  if (data.extension_enabled === false) {
    throw new Error("ERROR_EXTENSION_DISABLED");
  }
  if (!data.connection_id) {
    throw new Error("ERROR_NOT_CONNECTED");
  }

  try {
    const response = await fetch(FIREBASE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: data.connection_id,
        task_name: taskName,
        source: source
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errorMsg = errData.error || `Sunucu hatası: ${response.status}`;

      if (response.status === 401 || errorMsg.includes("Geçersiz bağlantı") || errorMsg.includes("süresi dolmuş")) {
        await chrome.storage.local.remove(["connection_id"]);
        await chrome.storage.local.set({ paired: false, armed: false });
        updateAllTabsIcons();
        throw new Error("ERROR_CONNECTION_LOST");
      }

      throw new Error(errorMsg);
    }

    console.log("Bildirim başarıyla tetiklendi:", taskName);
  } catch (error) {
    console.error("Bildirim gönderilirken hata:", error);
    throw error;
  }
}

// İndirme bildirimleri (40MB üstü)
if (chrome.downloads) {
  chrome.downloads.onChanged.addListener(async (downloadDelta) => {
    if (downloadDelta.state && downloadDelta.state.current === "complete") {
      try {
        const { downloads_enabled, extension_enabled = true, downloads_threshold = 40 } = await chrome.storage.local.get(["downloads_enabled", "extension_enabled", "downloads_threshold"]);
        if (downloads_enabled && extension_enabled) {
          const downloads = await chrome.downloads.search({ id: downloadDelta.id });
          if (downloads && downloads.length > 0) {
            const file = downloads[0];
            const fileSize = file.fileSize || 0;
            const threshold = downloads_threshold * 1024 * 1024; // Custom MB

            if (fileSize > threshold) {
              const filename = file.filename ? file.filename.split(/[\\/]/).pop() : "Dosya";
              await handleNotificationTrigger(`${filename} indirmesi tamamlandı`, "Web").catch(console.error);
            }
          }
        }
      } catch (err) {
        console.error("İndirme bildirimi hatası:", err);
      }
    }
  });
}

