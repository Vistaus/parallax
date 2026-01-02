# Parallax

**Trust & Transparency for Ubuntu Touch**

[![OpenStore](https://next.open-store.io/badges/en_US.png)](https://next.open-store.io/app/parallax.pollux/)

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Platform: Ubuntu Touch](https://img.shields.io/badge/Platform-Ubuntu%20Touch-blue.svg)
![Status: Stable](https://img.shields.io/badge/Status-Stable-brightgreen.svg)

---

## Overview

**Parallax** is a privacy-first, on-device trust and transparency utility for **Ubuntu Touch**.  
It helps users understand the trust characteristics of installed applications using clear,
human-readable explanations — without scanning, blocking, or monitoring apps.

Parallax is designed to feel like a natural part of the operating system:
calm, informative, and respectful of user freedom.

---

## Philosophy

Parallax follows a strict **read-only and transparency-first** philosophy.

- It does **not** scan application binaries
- It does **not** monitor runtime behavior
- It does **not** block, restrict, or judge apps
- It does **not** access the internet

Instead, Parallax explains app behavior using **existing metadata and confinement signals**
already present in the Ubuntu Touch security model.

> Transparency over enforcement.  
> Understanding over fear.

---

## Features (v0.1.0)

- System-wide trust overview of installed applications
- Per-app trust scores (0–100)
- Clear, human-readable explanations for trust signals
- Visibility into permissions, update status, and confinement
- Fully offline and privacy-respecting
- Ubuntu Touch native UI (QML / Lomiri)
- No background services or daemons

---

## Screens & UX

Parallax consists of three simple, focused screens:

1. **System Trust Overview** — a calm summary of overall app trust
2. **App List** — risk-oriented list of installed apps
3. **App Detail View** — clear explanations of why an app has its score

The UI is intentionally non-alarmist and accessibility-friendly.

## Screenshots

### System Trust Overview
![System Trust Overview](https://open-store.io/screenshots/parallax.pollux-screenshot-f6665b81-dff5-426c-b588-28adf0990e23.png)

### App List (Risk-Oriented)
![App List](https://open-store.io/screenshots/parallax.pollux-screenshot-faf81588-45bd-4c67-9fb4-8adf86a39443.png)

### App Detail (Explainability View)
![App Detail](https://open-store.io/screenshots/parallax.pollux-screenshot-02ab0a1a-4cb6-4948-9d8a-43925e8808ad.png)

---

## Privacy & Security

Parallax is built with strong privacy guarantees:

- No internet access
- No analytics or telemetry
- No background monitoring
- No data collection
- 100% on-device processing

Your data never leaves your device.

---

## Technology Stack

- **QML / QtQuick** — native Ubuntu Touch UI
- **JavaScript** — deterministic trust engine
- **Clickable** — build & packaging
- **Click manifests & metadata** — trusted system sources

No root access. No kernel hooks. No hacks.

---

## Installation

Parallax is available on the **OpenStore** for Ubuntu Touch:

👉 **Install from OpenStore:**  
https://next.open-store.io/app/parallax.pollux/

---

## Development

### Requirements

- Ubuntu Touch SDK
- Clickable (v8+)
- Node.js (for tooling)

### Build

```bash
clickable build
```

### Run (Emulator / Device)

```bash
clickable desktop
```

---

### Roadmap

Planned future improvements (non-binding):
- Enhanced update freshness analysis
- Community-driven trust indicators
- Optional device health summary
- UX refinements based on user feedback

Parallax will always remain:
- Read-only
- Privacy-first
- Transparent
- Open source

---

### Contributing

Contributions are welcome.

Please ensure that any changes:
- Respect Ubuntu Touch confinement
- Do not introduce network access
- Preserve deterministic behavior
- Maintain a calm, non-alarmist UX

Open an issue or submit a pull request to discuss improvements.

---

### License

MIT License
© Pollux Studio
