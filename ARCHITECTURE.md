# Windows 11 Portfolio OS — Architecture & File Directory Guide

Welcome to the official, exhaustive architecture guide for the **Windows 11 Portfolio OS**. This guide catalogs **every single folder and file** in your repository, details their exact technical responsibilities, and explains how they interact to form a functional, full-stack browser-based operating system.

---

## 🗃️ 1. Local Database & State Store `/.data`
The system implements a durable, light, server-side flat-file JSON storage engine located in the root `/.data` directory. This serves as the primary relational persistence system for storing user-created files, user registry details, direct messages, simulated operating system processes, and visitor analytics.

*   **`analytics.json`**: Stores visitor telemetry data, total visits, geolocation estimates, browser strings, timestamps, and chart indices used to draw system performance graphs.
*   **`contacts.json`**: Logs all direct forms, sender names, subject titles, and messages sent via the mailbox/contact application.
*   **`files.json`**: Serializes and backs up the entire Virtual File System (VFS). Tracks all folders, text documents, image coordinates, and modified dates created by guests or portfolio explorers.
*   **`projects.json`**: Lists showcase personal portfolio entries, GitHub integration spotlights, repository summaries, and tech tags.
*   **`tasks.json`**: Stores simulated background processes, resource allocations, active worker threads, and execution diagnostics.
*   **`users.json`**: Stores encrypted lock screen authentication PINs, profiles, guest settings, and active session verification tokens.

---

## 📂 2. Backend Service `/backend`
The backend handles persistent states, analytics tracking, external system proxying, and secure API endpoints. It runs concurrently with Vite in development and acts as a static host + API router in production.

### ⚙️ `/backend/config`
*   **`emailConfig.ts`**: Configures the email transport pipeline with Google OAuth 2.0 as the primary direct HTTPS delivery method (using `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_EMAIL`, and `GOOGLE_REFRESH_TOKEN`) and Gmail SMTP (`SMTP_USER`, `SMTP_PASS`) as a resilient fallback. Provides detailed diagnostic inspection for the Contact Me app.

### 🗄️ `/backend/db`
*   **`database.ts`**: Implements your local JSON/SQLite state engine. Standardizes the structured tables and schemas (users, messages, session-keys, and guest-preferences) used across all routing files.

### 🛡️ `/backend/middleware`
*   **`auth.ts`**: A route guard middleware. Validates incoming headers or cookies for valid JSON Web Tokens (JWT) and login PIN matches, ensuring that secure administrative actions can only be executed by authorized visitors.
*   **`rateLimiter.ts`**: Protects backend service APIs from request floods or spam. Places client-IP limits on contact forms and lock screen PIN entry operations.
*   **`security.ts`**: Intercepts inbound calls to log visitor data, client browsers, approximate geographical regions, and device types directly to your telemetry store.
*   **`validation.ts`**: A data integrity checker. Uses sanitization rules to filter, scrub, and validate incoming requests (such as mailbox inputs or directory structures) before database execution.

### 🛣️ `/backend/routes`
*   **`analytics.ts`**: Powers the **TaskManager** dashboard. Fetches live server logs, calculates performance indices, and provides active visitor statistics.
*   **`auth.ts`**: Manages credentials, sign-in flows, lock-screen authentication, and persistent browser cookie validation.
*   **`browse.ts`**: Bypasses browser CORS constraints. Proxies standard Web searches and renders compatible pages inside your virtual browser's iframe seamlessly.
*   **`contact.ts`**: Registers user messages and forms, dispatches email notifications, and saves entries to the database.
*   **`docs.ts`**: Streams, downloads, and renders resumes and portfolio documents.
*   **`files.ts`**: Performs read/write synchronizations of the user's Virtual File System (VFS), allowing visitors to save and reload customized desktop files.
*   **`profile.ts`**: Manages personal workspace profile settings (e.g., locking preferences, custom wallpapers, and taskbar alignments).
*   **`tasks.ts`**: Runs telemetry diagnostics, allowing the system to track and manage simulated background workflows.

### 🔌 `/backend/services`
*   **`authService.ts`**: Houses the cryptographic mechanisms for encrypting PIN inputs, signing session hashes, and issuing secure access tokens.
*   **`contentProxy.ts`**: Cleans and strips header restrictions from external websites (like Wikipedia or YouTube), making them compatible with browser views.
*   **`emailService.ts`**: Formats professional, modern responsive HTML card templates for visitor submissions and automatic sender confirmations, and dispatches messages via Google OAuth 2.0 HTTPS API with automated Gmail SMTP fallback.
*   **`fileService.ts`**: Translates folder lists into flat indexes to serialize and backup file systems.
*   **`geminiSearchService.ts`**: Connects directly to server-side Gemini models to power smart desktop searches, natural language inputs, and virtual AI assistants.
*   **`githubService.ts`**: Pulls statistics from your repositories (stars, forks, commits) using the GitHub API.
*   **`searchService.ts`**: Crawls your portfolio directory files and database records to return cross-application search queries instantly.

### 🧪 `/backend/tests`
*   **`backend.test.ts`**: Contains automated tests to verify routing responses, authentication states, and database stability.

### 🚀 Root Server Entry
*   **`server.ts`**: The main entry point of the backend. Combines CORS, security headers, rate-limiting rules, Express routing, and Vite middleware.

---

## 🖥️ 3. Frontend Application `/frontend`

The frontend is a complete Single Page Application (SPA) built using React 19, Vite, and Tailwind CSS.

### 🎨 `/frontend/assets`
*   Contains custom system wallpapers, icons, and logo assets.

### 🌐 `/frontend/public`
*   **`/downloads`**: Houses static file formats, worksheets, and documents.
*   **`/videos`**: Hosts boot-animations and dynamic workspace background feeds.
*   **`manifest.json`**: Provides web parameters required to run as an installable Progressive Web App (PWA).
*   **`robots.txt`**: Gives SEO instructions to index search engine bots.
*   **`sitemap.xml`**: Lists search index links to optimize your page's visibility.
*   **`sw.js`**: Orchestrates service workers to cache resources, supporting offline usage.

### ⚙️ `/frontend/src/context`
*   **`AuthContext.tsx`**: Manages active login statuses, lockscreen PIN matching state, visitor profile parameters, and session tracking.
*   **`OSContext.tsx`**: The core state manager. Coordinates opened windows, taskbar tray configurations, file structure indexes, audio synth triggers, and customization settings.

### 💾 `/frontend/src/data`
*   **`initialFileSystem.ts`**: Configures the initial default files and folders of the Virtual File System (VFS), such as the desktop icons, documents, system programs, and your resume files.
*   **`portfolioData.ts`**: Houses your personal bio details, project lists, and professional timelines.

### 🪝 `/frontend/src/hooks`
*   **`useNetworkInfo.ts`**: Monitors the browser's internet connectivity and triggers real-time status notifications on the desktop.
*   **`useTouchSensitivity.ts`**: Optimizes click-and-drag parameters, window scaling, and desktop grids for touch-screen mobile devices.

### 📦 `/frontend/src/services`
*   **`storageService.ts`**: Interlaces with IndexedDB or local storage to save, delete, read, and write Virtual File System actions instantly.
*   **`terminalEngine.ts`**: Parses and runs command inputs (such as `ls`, `cd`, `cat`, `mkdir`, `rm`, `help`) inside the command terminal.

### 🛠️ `/frontend/src/utils`
*   **`browser.ts`**: Verifies user-agents and browser capabilities (e.g. checks if webcam capture or microphone recording is supported).
*   **`cameraFilters.ts`**: Provides dynamic visual filters (e.g., Grayscale, Sepia, Retro, Cyberpunk) for the Camera app.
*   **`fileAssociations.ts`**: Maps file extensions (.txt, .md, .png) to their respective system applications (e.g., opening a text file launches Notepad).
*   **`fileDownloader.ts`**: Handles client-side file packaging and downloads.
*   **`haptics.ts`**: Triggers standard physical haptic feedback (vibrations) on compatible touch devices.
*   **`sound.ts`**: Leverages the Web Audio API to synthesize system sound effects natively (clicks, warnings, error tones, and Windows 11 boot chords).
*   **`storageMetrics.ts`**: Calculates Virtual File System volume capacities.
*   **`useLongPress.ts`**: Translates long-press gestures into right-clicks on mobile touch devices.
*   **`weather.ts`**: Parses external weather structures into desktop widgets.

### 🧩 `/frontend/src/components`

#### 📂 `/frontend/src/components/apps`
*   **`/browser`**: Nested files powering the Virtual Browser application:
    *   `ChromeHeader.tsx`: Renders the browser toolbar (back/forward keys, URL address bar, refresh keys, search options).
    *   `ChromeNewTab.tsx`: Renders the default homepage (Google search bars, recommended shortcuts).
    *   `DevCommunityView.tsx`: Displays simulated tech feeds and dev news.
    *   `GoogleLensModal.tsx`: Opens an interactive image search scanner.
    *   `GoogleSearchResultsView.tsx`: Renders simulated search engine outputs.
    *   `VoiceSearchModal.tsx`: Renders speech recognition animations.
    *   `WebContentView.tsx`: Controls the target website viewport.
    *   `WikipediaView.tsx`: Displays clean wikipedia articles.
    *   `YouTubeBrowserView.tsx`: Renders responsive embedded YouTube players.
    *   `types.ts`: Local types for browser states.
*   **`AboutApp.tsx`**: Displays your professional bio, experience timelines, and career summary.
*   **`AppRegistry.tsx`**: Defines configurations (window bounds, names, icons, shortcuts) for all desktop apps.
*   **`BrowserApp.tsx`**: Master wrapper for the browser simulator.
*   **`CalculatorApp.tsx`**: A functional scientific calculator with historical equations log.
*   **`CameraApp.tsx`**: Links with client webcams, allowing photo captures with customizable visual filters.
*   **`ContactApp.tsx`**: Validates and dispatches contact messages to your mailbox.
*   **`FileExplorerApp.tsx`**: A Windows-style File Explorer with navigation folders, breadcrumbs, search, and file property panels.
*   **`MediaApp.tsx`**: Media center supporting dynamic video displays and photo sliders.
*   **`MinesweeperApp.tsx`**: Classic retro Minesweeper game with custom grids and leaderboards.
*   **`NotepadApp.tsx`**: Text editor supporting editing, saving, and printing files directly inside the VFS.
*   **`ProjectsApp.tsx`**: Showcases your personal github projects with interactive source links.
*   **`RecycleBinApp.tsx`**: Represents your system's temporary file deletion storage.
*   **`ResumeViewerApp.tsx`**: Incorporates responsive layout frames, zoom, and print options for your CV.
*   **`SettingsApp.tsx`**: Controls personalization preferences (wallpapers, themes, taskbar positions, widgets).
*   **`SkillsApp.tsx`**: Renders interactive graphs of your technical skills.
*   **`SnakeApp.tsx`**: Retro snake game with scores, highscores, speed adjustments, and audio.
*   **`TaskManagerApp.tsx`**: Monitors active system processes, threads, CPU usage, and memory levels.
*   **`TerminalApp.tsx`**: Advanced command shell supporting comprehensive directories navigation.

#### 🛠️ `/frontend/src/components/common`
*   **`AppIcon.tsx`**: Renders dynamic visual vectors, matching apps to their system icons.
*   **`BatteryIndicator.tsx`**: Displays real-time device battery percentages.
*   **`BottomSheet.tsx`**: Controls sliding navigation panels for mobile screens.
*   **`ClipboardHistoryModal.tsx`**: Tracks and lists recent copy-paste entries.
*   **`ErrorBoundary.tsx`**: Catches client-side errors and prevents desktop crashes.
*   **`GameBarOverlay.tsx`**: Renders an interactive game bar overlay (Win + G).
*   **`HeaderClockBanner.tsx`**: Renders the desktop calendar clock.
*   **`MediaThumbnail.tsx`**: Generates hover preview images.
*   **`MobileStatusBar.tsx`**: Mimics cellular, wifi, and notification icons on mobile views.
*   **`NightLightFilter.tsx`**: Adds eye-saving blue-light filters.
*   **`PowerScreen.tsx`**: Shows shutdown, restart, and sleep screens.
*   **`PropertiesModal.tsx`**: Shows detailed system properties for files and directories.
*   **`SaveAsModal.tsx`**: Controls save prompts for editors (such as Notepad).
*   **`ShareModal.tsx`**: Shares your portfolio links on social media platforms.
*   **`SleepScreen.tsx`**: Displays a responsive sleeping wallpaper screen.
*   **`SnippingToolOverlay.tsx`**: Screen-capture utility with customizable save actions.
*   **`ToastNotificationOverlay.tsx`**: Renders incoming system alerts.
*   **`TopProgressBar.tsx`**: Animated loading progress indicator.
*   **`TouchKeyboard.tsx`**: Dynamic keyboard overlay for touchscreen users.

#### 🖥️ `/frontend/src/components/desktop`
*   **`AltTabOverlay.tsx`**: Facilitates multi-task switching using shortcuts (Alt + Tab).
*   **`ContextMenu.tsx`**: Custom right-click options menu (Refresh, Sort, Wallpaper, Pin).
*   **`Desktop.tsx`**: Integrates icons, taskbars, lockscreens, and overlays.
*   **`DesktopIcon.tsx`**: Draggable desktop shortcuts with active state styling.
*   **`LockScreen.tsx`**: Login page featuring time indicators, password verification, and biometric entries.
*   **`Wallpaper.tsx`**: Background canvas with customizable static and video layers.

#### 🥚 `/frontend/src/components/easter`
*   **`BSODScreen.tsx`**: Blue Screen of Death trigger, mimicking a windows crash.

#### ⚓ `/frontend/src/components/taskbar`
*   **`NotificationCenter.tsx`**: Consolidated system tray notifications.
*   **`SearchFlyout.tsx`**: Start menu smart search with index lookups.
*   **`StartMenu.tsx`**: Windows 11 Start Menu displaying pinned apps, recommended docs, and power toggles.
*   **`SystemTrayPanels.tsx`**: Quick settings dashboard (Wifi, Bluetooth, Volume, Battery, Brightness).
*   **`Taskbar.tsx`**: The main taskbar with center app alignments and tray icons.

#### 📊 `/frontend/src/components/widgets`
*   **`WidgetsBoard.tsx`**: Left-side panel widget board (Weather, Stocks, Calendar, Tech News).

#### 🔲 `/frontend/src/components/window`
*   **`SnapDockPreviewOverlay.tsx`**: Windows snap layout alignment animations.
*   **`SnapLayoutMenu.tsx`**: Hover menus to snap and position desktop windows.
*   **`WindowFrame.tsx`**: Master wrapper giving windows dragging, scaling, snapping, and acrylic styling.

---

### 🚀 Core Front-end Entry
*   **`App.tsx`**: Orchestrates boot-cycles, wallpaper canvases, desktop icons, taskbars, and active window processes.
*   **`index.css`**: Renders global CSS declarations and Tailwind definitions.
*   **`main.tsx`**: Renders the React DOM tree inside `/frontend/index.html`.
*   **`types.ts`**: Shares definitions (`WindowItem`, `FileItem`, `Theme`, `NotificationItem`) across all components.

---

## 📁 4. Workspace Root & Configuration Files
These are essential workspace-level orchestrations, templates, system parameters, dependencies, and temporary storage folders at the root of the project:

*   **`/uploads`**: Temporary server-side file folder where visitor-uploaded files or Snipping Tool captures are securely written during active browser sessions.
*   **`.env.example`**: Documents template environment variables, API key declarations (e.g. `GEMINI_API_KEY`), Google OAuth 2.0 credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_EMAIL`, `GOOGLE_REFRESH_TOKEN`), Gmail SMTP fallback parameters, and configuration guidelines for full-stack deployments.
*   **`.gitignore`**: Defines system-wide directory exclusions (e.g., `node_modules/`, `dist/`, `.env`, temporary file dumps, logs, and database runtimes) that must never be tracked or committed to version control.
*   **`bun.lock`**: A binary lockfile containing speed-boot parameters and exact dependency versions for developers running Bun as their primary bundler tool.
*   **`metadata.json`**: Describes metadata properties (such as app title, description, permissions, and major capability tags) that govern container environments.
*   **`package.json`**: The master manifest of the full-stack system. Defines runtime environments, custom build pipelines (e.g., bundling and starting production Express servers), and external packages.
