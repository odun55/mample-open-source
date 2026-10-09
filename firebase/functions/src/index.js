/**
 * Mample — Firebase Cloud Functions Entry Point (Gen 2)
 */

const { initializeApp, getApps } = require("firebase-admin/app");

// Çift başlatmayı önle
if (!getApps().length) {
  initializeApp();
}

exports.triggerNotification = require("./triggerNotification").triggerNotification;
exports.checkPairing = require("./checkPairing").checkPairing;
exports.registerCLIConnection = require("./registerCLIConnection").registerCLIConnection;
exports.registerExtensionConnection = require("./registerExtensionConnection").registerExtensionConnection;
exports.disconnectExtension = require("./disconnectExtension").disconnectExtension;
exports.sendPendingNotification = require("./sendPendingNotification").sendPendingNotification;



exports.disconnectCLIConnection = require("./disconnectCLIConnection").disconnectCLIConnection;
exports.cliPairing = require("./cliPairing").cliPairing;
exports.completeCLIPairing = require("./cliPairing").completeCLIPairing;
