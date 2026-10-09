# Mample CLI - Push Notifications from Terminal

Get instant push notifications on your phone directly from your terminal, bash, or powershell. Mample is the easiest way to alert yourself when long-running scripts, compilations, or AI tasks (like Claude, Cursor, GitHub Copilot) finish.

## Key Features
- **No email/password registration:** Pair with QR or a Secret Key; the app uses a Firebase anonymous session.
- **Cross-platform:** Works on Windows, macOS, and Linux (bash, zsh, powershell).
- **FCM delivery:** Timing depends on the network, Android settings and service availability.
- **AI Ready:** Designed to work perfectly with autonomous AI coding agents.

## Installation

```bash
npm install -g mample
```

## How to send notifications from bash/powershell?

First, authorize your terminal using the Secret Key from your Mample mobile app:

```bash
mample auth "your-secret-key"
```

Or show a QR code in your terminal and scan it with the Mample mobile app:

```bash
mample auth --qr
```

`mample auth` without a key also opens QR pairing. The QR is a single-use invitation
that expires after 90 seconds and refreshes automatically while you wait (up to five
minutes). Scanning it securely transfers the phone's existing Secret Key to the
terminal, then runs the same authentication and registration as manual key entry.
The saved terminal connection has no expiry and remains until revoked. The QR does
not contain the Secret Key. Reconnecting the same terminal reuses its connection.

QR pairing requires the updated mobile app and the `cliPairing` and
`completeCLIPairing` Firebase functions to be deployed. Existing Secret Key
authentication continues to work with the previous backend.

Then, simply chain the `mample` command to the end of any long-running process:

```bash
npm run build && mample "Build finished successfully! 🚀"
```

Or run it standalone to test:

```bash
mample "Hello from terminal!"
```

## Use Cases
- **Build Notification:** Get alerted when your Next.js, React, or Flutter build is ready.
- **AI Task Tracking:** Ask your AI assistant (Cursor, Antigravity, Roo Code) to run `mample` when it finishes generating code.
- **Server Alerts:** Use it as a simple webhook alternative to get alerted on server errors or script completions.
- **Download Complete Notification:** Alert yourself when a large `wget` or `curl` download finishes.

## Why Mample?
Mample combines an Android app with a terminal command. Pair once, then call the command after a task or ask an assistant with terminal access and execution permission to call it. Mample does not automatically monitor task completion.

For more details, visit [mample.vercel.app](https://mample.vercel.app).

## Disconnect this terminal

Run `mample disconnect` to revoke the terminal connection in Firebase and remove the locally saved credentials. Other devices remain connected. If the server cannot confirm disconnection, the local credentials are retained for retry. The new backend endpoint must be deployed before this command can work.
