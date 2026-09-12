# Anish Jethva — Windows 11 Portfolio OS

An interactive, pixel-perfect clone of the Windows 11 Operating System, serving as an advanced, full-stack personal portfolio for Anish Jethva. Built using modern React 19, TypeScript, Tailwind CSS, and a resilient Node.js/Express backend.

---

## 📂 Exhaustive Project Directory Structure

Every single file and folder in the project is structured with a strict separation between client-side user experience and backend services:

```text
/ (Workspace Root)
├── .data/                         # Local database folder storing JSON data files
│   ├── analytics.json             # Logs visitor telemetry, page counts, and activity charts
│   ├── contacts.json              # Logs direct visitor messages and forms
│   ├── files.json                 # Backs up the Virtual File System (VFS) folders & files
│   ├── projects.json              # Houses custom github projects showcase data
│   ├── tasks.json                 # Simulated task list and background telemetry processes
│   └── users.json                 # Contains encrypted PIN codes and active profiles
├── backend/                       # Server-side full-stack service (Express)
│   ├── config/
│   │   └── emailConfig.ts         # Google OAuth 2.0 & Gmail SMTP email dispatcher config
│   ├── db/
│   │   └── database.ts            # Local JSON database connector
│   ├── middleware/
│   │   ├── auth.ts                # Session PIN verification and JWT validation
│   │   ├── rateLimiter.ts         # Protects endpoints against flood triggers
│   │   ├── security.ts            # Adds visitor analytics tracking logs
│   │   └── validation.ts          # Sanitizes incoming request bodies
│   ├── routes/
│   │   ├── analytics.ts           # Tracks visitor logs and CPU/Mem telemetry charts
│   │   ├── auth.ts                # Controls login PIN, status, and permissions
│   │   ├── browse.ts              # Simulates and proxies external web endpoints
│   │   ├── contact.ts             # Direct message inbox endpoint
│   │   ├── docs.ts                # Services PDF CV downloads and reports
│   │   ├── files.ts               # Local VFS synchronizer
│   │   ├── profile.ts             # Guest preference profiles
│   │   └── tasks.ts               # Runs background task execution telemetry
│   ├── services/
│   │   ├── authService.ts         # Cryptographic hashing & token verification
│   │   ├── contentProxy.ts        # Proxies YouTube, Wikipedia, and external webs
│   │   ├── emailService.ts        # Google OAuth 2.0 & Gmail SMTP responsive mail dispatcher
│   │   ├── fileService.ts         # Saves VFS directories back to database
│   │   ├── geminiSearchService.ts # Server-side Gemini AI assistance capabilities
│   │   ├── githubService.ts       # Live GitHub repository API metrics
│   │   └── searchService.ts       # Full-text system-wide indices crawler
│   ├── tests/
│   │   └── backend.test.ts        # Integration testing suite
│   └── server.ts                  # Backend Express server entry-point
│
├── frontend/                      # Client-side user interface (React + Vite)
│   ├── assets/                    # Project visual images, icons, and wallpapers
│   ├── public/                    # Static assets served directly to browsers
│   │   ├── downloads/             # Standard downloadable document sheets
│   │   ├── videos/                # Multimedia elements
│   │   ├── manifest.json          # PWA descriptors
│   │   ├── robots.txt             # Web crawler permissions
│   │   ├── sitemap.xml            # SEO indexes map
│   │   └── sw.js                  # Background PWA service worker handler
│   ├── src/                       # React core components
│   │   ├── components/            # UI components
│   │   │   ├── apps/              # Desktop applications
│   │   │   │   ├── browser/       # Built-in simulator browser sub-panels
│   │   │   │   │   ├── ChromeHeader.tsx
│   │   │   │   │   ├── ChromeNewTab.tsx
│   │   │   │   │   ├── DevCommunityView.tsx
│   │   │   │   │   ├── GoogleLensModal.tsx
│   │   │   │   │   ├── GoogleSearchResultsView.tsx
│   │   │   │   │   ├── VoiceSearchModal.tsx
│   │   │   │   │   ├── WebContentView.tsx
│   │   │   │   │   ├── WikipediaView.tsx
│   │   │   │   │   ├── YouTubeBrowserView.tsx
│   │   │   │   │   └── types.ts
│   │   │   │   ├── AboutApp.tsx
│   │   │   │   ├── AppRegistry.tsx
│   │   │   │   ├── BrowserApp.tsx
│   │   │   │   ├── CalculatorApp.tsx
│   │   │   │   ├── CameraApp.tsx
│   │   │   │   ├── ContactApp.tsx
│   │   │   │   ├── FileExplorerApp.tsx
│   │   │   │   ├── MediaApp.tsx
│   │   │   │   ├── MinesweeperApp.tsx
│   │   │   │   ├── NotepadApp.tsx
│   │   │   │   ├── ProjectsApp.tsx
│   │   │   │   ├── RecycleBinApp.tsx
│   │   │   │   ├── ResumeViewerApp.tsx
│   │   │   │   ├── SettingsApp.tsx
│   │   │   │   ├── SkillsApp.tsx
│   │   │   │   ├── SnakeApp.tsx
│   │   │   │   ├── TaskManagerApp.tsx
│   │   │   │   └── TerminalApp.tsx
│   │   │   ├── common/            # Custom reusable components
│   │   │   │   ├── AppIcon.tsx
│   │   │   │   ├── BatteryIndicator.tsx
│   │   │   │   ├── BottomSheet.tsx
│   │   │   │   ├── ClipboardHistoryModal.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── GameBarOverlay.tsx
│   │   │   │   ├── HeaderClockBanner.tsx
│   │   │   │   ├── MediaThumbnail.tsx
│   │   │   │   ├── MobileStatusBar.tsx
│   │   │   │   ├── NightLightFilter.tsx
│   │   │   │   ├── PowerScreen.tsx
│   │   │   │   ├── PropertiesModal.tsx
│   │   │   │   ├── SaveAsModal.tsx
│   │   │   │   ├── ShareModal.tsx
│   │   │   │   ├── SleepScreen.tsx
│   │   │   │   ├── SnippingToolOverlay.tsx
│   │   │   │   ├── ToastNotificationOverlay.tsx
│   │   │   │   ├── TopProgressBar.tsx
│   │   │   │   └── TouchKeyboard.tsx
│   │   │   ├── desktop/           # Desktop interaction layout
│   │   │   │   ├── AltTabOverlay.tsx
│   │   │   │   ├── ContextMenu.tsx
│   │   │   │   ├── Desktop.tsx
│   │   │   │   ├── DesktopIcon.tsx
│   │   │   │   ├── LockScreen.tsx
│   │   │   │   └── Wallpaper.tsx
│   │   │   ├── easter/            # Custom retro easter eggs
│   │   │   │   └── BSODScreen.tsx
│   │   │   ├── taskbar/           # Navigation & systems dock
│   │   │   │   ├── NotificationCenter.tsx
│   │   │   │   ├── SearchFlyout.tsx
│   │   │   │   ├── StartMenu.tsx
│   │   │   │   ├── SystemTrayPanels.tsx
│   │   │   │   └── Taskbar.tsx
│   │   │   ├── widgets/           # Desktop information cards
│   │   │   │   └── WidgetsBoard.tsx
│   │   │   └── window/            # Drag, resize, layouts
│   │   │       ├── SnapDockPreviewOverlay.tsx
│   │   │       ├── SnapLayoutMenu.tsx
│   │   │       └── WindowFrame.tsx
│   │   ├── context/               # States store engines
│   │   │   ├── AuthContext.tsx
│   │   │   └── OSContext.tsx
│   │   ├── data/                  # Standard definitions
│   │   │   ├── initialFileSystem.ts
│   │   │   └── portfolioData.ts
│   │   ├── hooks/                 # Native custom hooks
│   │   │   ├── useNetworkInfo.ts
│   │   │   └── useTouchSensitivity.ts
│   │   ├── services/              # Core state drivers
│   │   │   ├── storageService.ts
│   │   │   └── terminalEngine.ts
│   │   ├── utils/                 # General helpers and utilities
│   │   │   ├── browser.ts
│   │   │   ├── cameraFilters.ts
│   │   │   ├── fileAssociations.ts
│   │   │   ├── fileDownloader.ts
│   │   │   ├── haptics.ts
│   │   │   ├── sound.ts
│   │   │   ├── storageMetrics.ts
│   │   │   ├── useLongPress.ts
│   │   │   └── weather.ts
│   │   ├── App.tsx                # Master workspace layout framework
│   │   ├── index.css              # Custom styles
│   │   ├── main.tsx               # Applet bootstrap entry-point
│   │   └── types.ts               # Shared types
│   ├── tsconfig.json              # Client Typescript configurations
│   └── vite.config.ts             # Bundler rules
│
├── .env.example                   # template credentials
├── .gitignore                     # system exclusions
├── ARCHITECTURE.md                # System-wide file architecture breakdown
├── bun.lock                       # Speed-boot execution files
├── metadata.json                  # Workspace parameters
├── package.json                   # dependencies framework
└── uploads/                       # Temporary server storage folder for visitor uploads
```

---

## ⚡ Tech Stack

### Frontend (SPA)

- **Framework:** React 19 + TypeScript
- **Styling:** Tailwind CSS (Custom acrylic backdrop modules)
- **Animations:** Motion (Framer Motion)
- **Tooling:** Vite, ESLint, TypeScript Compiler

### Backend

- **Server Framework:** Node.js + Express
- **Database Service:** Unified SQLite-backed / file-backed JSON state storage
- **Utilities:** CORS, cookie-parser, bcryptjs, jsonwebtoken, nodemailer, multer
- **Telemetry:** Custom request log monitoring & visitor flow tracking

---

## 🏗️ Getting Started

### Prerequisites

- Node.js (v20+) or Bun (v1.2+)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/anishjethva18/anish-portfolio.git
   cd anish-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server (runs both Vite and Express concurrently):

   ```bash
   npm run dev
   ```

4. Compile for production:

   ```bash
   npm run build
   ```

5. Start the production build:
   ```bash
   npm run start
   ```

---

## 📧 Email Delivery Configuration (Google OAuth 2.0)

The portfolio contact mailbox uses **Google OAuth 2.0** as its primary transport to deliver incoming messages directly via Google's official HTTPS APIs, with automated **Gmail SMTP** fallback.

### Environment Variables

Configure the following in your environment:

```env
# Recipient Email
CONTACT_RECEIVER_EMAIL="anish.jethva2006@gmail.com"
EMAIL_FROM="Portfolio Contact <anish.jethva2006@gmail.com>"

# Google OAuth 2.0 (Primary Transport)
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_EMAIL="anish.jethva2006@gmail.com"
GOOGLE_REFRESH_TOKEN="1//0...your_refresh_token"

# Gmail SMTP Backup (App Password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="anish.jethva2006@gmail.com"
SMTP_PASS="your_16_char_gmail_app_password"
```

### Generating a Google Refresh Token

1. In **Google Cloud Console &rarr; Credentials &rarr; OAuth 2.0 Client IDs**, add `https://developers.google.com/oauthplayground` to **Authorized redirect URIs**.
2. Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
3. Click the ⚙️ gear icon, check **Use your own OAuth credentials**, and input your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
4. Under Step 1, select **Gmail API v1** (`https://mail.google.com/`) and authorize with your Google account.
5. In Step 2, click **Exchange authorization code for tokens**, copy the token starting with `1//0...`, and set it as `GOOGLE_REFRESH_TOKEN`.

---

_Crafted with 💙 by **Anish Jethva** (anish.jethva2006@gmail.com)_
