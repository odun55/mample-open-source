# Mample CLI — Notifications from your terminal

Send notifications to your Android phone from terminal commands, scripts and AI coding workflows. Mample is free and open source, with no subscription or monthly notification quota. Run the CLI when a task finishes; delivery timing depends on the network, phone settings and backend availability.

## Key Features
- **No email/password registration:** Pair with QR or a Secret Key; the app uses a Firebase anonymous session.
- **Cross-platform:** Works on Windows, macOS, and Linux (bash, zsh, powershell).
- **FCM delivery:** Timing depends on the network, Android settings and service availability.
- **AI workflows:** Assistants with terminal access and execution permission can call the same CLI when they finish a task.

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
mample auth qr
```

`mample auth --qr` remains supported for compatibility; `mample auth` without a key
also opens QR pairing. The QR is a single-use invitation
that expires after 90 seconds. Press **R** to generate a new QR or **Q** to cancel;
no Enter is needed. There is no automatic refresh. The CLI waits up to five
minutes. Without an interactive terminal, rerun the command to renew an expired QR.
Scanning it securely transfers the phone's existing Secret Key to the
terminal, then runs the same authentication and registration as manual key entry.
The saved terminal connection has no expiry and remains until revoked. The QR does
not contain the Secret Key. Reconnecting the same terminal reuses its connection.

QR pairing requires the updated mobile app and the `cliPairing` and
`completeCLIPairing` Firebase functions to be deployed. Existing Secret Key
authentication continues to work with the previous backend.

New mobile installations and key renewal create shorter Secret Keys: `m-`
followed by 26 lowercase letters/digits. Existing long keys continue to work;
copy the complete key exactly as the app displays it. Updating the app does not
rotate your key. If you renew it, reconnect your terminals with the new key or QR.

Then, simply chain the `mample` command to the end of any long-running process:

```bash
npm run build && mample "Build finished successfully! 🚀"
```

Or run it standalone to test:

```bash
mample "Hello from terminal!"
```

## Notification command conventions

Use `mample ""` for the default notification message configured in the app;
use `mample "Task completed"` for a custom message. Bare `mample` also selects
the default. There are no `mample run`, `mample notify` or `mample send` commands.
In Windows CMD use `mample`; if PowerShell blocks the npm `.ps1` launcher, use
`mample.cmd` with the same arguments. Both launch the same global CLI.
Do not change execution policy or loosen credential-file permissions.
Assistant sandbox access follows the environment approval process.
Server acceptance does not confirm display on the phone.

## Use Cases
- **Build Notification:** Get alerted when your Next.js, React, or Flutter build is ready.
- **AI Task Tracking:** Ask your AI assistant (Cursor, Antigravity, Roo Code) to run `mample` when it finishes generating code.
- **Server Alerts:** Use it as a simple webhook alternative to get alerted on server errors or script completions.
- **Download Complete Notification:** Alert yourself when a large `wget` or `curl` download finishes.

## Why Mample?
Mample combines an Android app with a terminal command. Pair once, then call the command after a task or ask an assistant with terminal access and execution permission to call it. Mample does not automatically monitor task completion.

For setup and examples, visit the [mobile & CLI guide](https://mample.app/en/guide).
Browser integrations are a separate development scope; see
[Mample Extension](https://mample.app/en/extension).

## Open source and support

Source is available in [mample-open-source](https://github.com/odun55/mample-open-source)
under MIT. See [CONTRIBUTING.md](../CONTRIBUTING.md) for code and documentation
contributions. You can optionally [support Mample](https://buymeacoffee.com/mample)
to help cover development and infrastructure; it does not unlock paid features.
Installing from npm and linking local source are separate workflows. Check
`mample --version` and `mample auth --help` for the installed package's capabilities.

## Help

Run `mample help` for connection, notification and disconnection examples.
Nothing needs to be typed after `help`. `mample --help` and `mample -h` show the
same guide. `mample auth --help` explains the two connection methods.

## Disconnect this terminal

Run `mample disconnect` to revoke the terminal connection in Firebase and remove the locally saved credentials. Other devices remain connected. If the server cannot confirm disconnection, the local credentials are retained for retry. The new backend endpoint must be deployed before this command can work.
