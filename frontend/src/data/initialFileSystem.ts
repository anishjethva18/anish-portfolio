import { FileItem } from '../types';

export const INITIAL_FILES: FileItem[] = [
  // Root Drive C: and D: Hierarchy (Total 472 GB SSD)
  { id: 'drive-c', name: 'Local Disk (C:)', path: 'C:', type: 'folder', parentId: 'This PC', modified: '2026-08-10' },
  { id: 'drive-d', name: 'New Volume (D:)', path: 'D:', type: 'folder', parentId: 'This PC', modified: '2026-08-10' },

  // Items in Drive D: (New Volume D:)
  { id: 'folder-d-creative-coding', name: 'Creative Coding', path: 'D:/Creative Coding', type: 'folder', parentId: 'D:', modified: '2026-08-10' },
  { id: 'folder-d-documents', name: 'Documents', path: 'D:/Documents', type: 'folder', parentId: 'D:', modified: '2026-08-10' },
  { id: 'folder-d-backups', name: 'Backups', path: 'D:/Backups', type: 'folder', parentId: 'D:', modified: '2026-08-01' },
  { id: 'folder-d-datasets', name: 'Datasets', path: 'D:/Datasets', type: 'folder', parentId: 'D:', modified: '2026-08-02' },
  { id: 'd-file-creative1', name: 'Generative_Shader_Canvas.ts', path: 'D:/Creative Coding/Generative_Shader_Canvas.ts', type: 'file', extension: 'ts', parentId: 'D:/Creative Coding', size: '4.2 KB', modified: '2026-08-10', content: '// WebGL Shader Art Pipeline\nexport function initShaderArt() { console.log("Shader Canvas running"); }' },
  { id: 'd-file-creative2', name: 'Synth_Audio_Visualizer.js', path: 'D:/Creative Coding/Synth_Audio_Visualizer.js', type: 'file', extension: 'js', parentId: 'D:/Creative Coding', size: '6.1 KB', modified: '2026-08-10', content: '// Web Audio API Visualizer with frequency analyzer' },
  { id: 'd-file-backup1', name: 'Portfolio_Archive_2026.zip', path: 'D:/Backups/Portfolio_Archive_2026.zip', type: 'file', extension: 'zip', parentId: 'D:/Backups', size: '32.4 MB', modified: '2026-08-01', content: 'ZIP_ARCHIVE_DATA' },
  { id: 'd-file-backup2', name: 'System_Config_Backup.json', path: 'D:/Backups/System_Config_Backup.json', type: 'file', extension: 'json', parentId: 'D:/Backups', size: '480 KB', modified: '2026-08-01', content: '{"os": "portfolio-os", "version": "2.4.0"}' },
  { id: 'd-file-dataset1', name: 'Developer_Telemetry_2026.csv', path: 'D:/Datasets/Developer_Telemetry_2026.csv', type: 'file', extension: 'csv', parentId: 'D:/Datasets', size: '18.6 MB', modified: '2026-08-02', content: 'timestamp,metric,value\n2026-08-01T00:00:00Z,cpu_load,0.12' },
  { id: 'd-file-dataset2', name: 'Neural_Embeddings_Weights.bin', path: 'D:/Datasets/Neural_Embeddings_Weights.bin', type: 'file', extension: 'bin', parentId: 'D:/Datasets', size: '24.1 MB', modified: '2026-08-02', content: 'EMBEDDINGS_BINARY_WEIGHTS' },
  { id: 'folder-users', name: 'Users', path: 'C:/Users', type: 'folder', parentId: 'C:', modified: '2026-08-10' },
  { id: 'folder-programfiles', name: 'Program Files', path: 'C:/Program Files', type: 'folder', parentId: 'C:', modified: '2026-08-10' },
  { id: 'folder-windows', name: 'Windows', path: 'C:/Windows', type: 'folder', parentId: 'C:', modified: '2026-08-10' },
  { id: 'folder-anish-user', name: 'Anish Jethva', path: 'C:/Users/Anish Jethva', type: 'folder', parentId: 'C:/Users', modified: '2026-08-10' },
  { id: 'folder-public-user', name: 'Public', path: 'C:/Users/Public', type: 'folder', parentId: 'C:/Users', modified: '2026-08-10' },

  // Anish Jethva User Folders (Matching User Profile)
  { id: 'folder-aj-desktop', name: 'Desktop', path: 'C:/Users/Anish Jethva/Desktop', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-documents', name: 'Documents', path: 'C:/Users/Anish Jethva/Documents', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-downloads', name: 'Downloads', path: 'C:/Users/Anish Jethva/Downloads', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-pictures', name: 'Pictures', path: 'C:/Users/Anish Jethva/Pictures', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-music', name: 'Music', path: 'C:/Users/Anish Jethva/Music', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-videos', name: 'Videos', path: 'C:/Users/Anish Jethva/Videos', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-projects', name: 'Projects', path: 'C:/Users/Anish Jethva/Projects', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-certificates', name: 'Certificates', path: 'C:/Users/Anish Jethva/Certificates', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },
  { id: 'folder-aj-aboutme', name: 'About Me', path: 'C:/Users/Anish Jethva/About Me', type: 'folder', parentId: 'C:/Users/Anish Jethva', modified: '2026-08-10' },

  // Items inside Downloads Folder
  {
    id: 'download-windows11-dark',
    name: 'Windows11.jpg',
    path: 'C:/Users/Anish Jethva/Downloads/Windows11.jpg',
    type: 'file',
    extension: 'jpg',
    parentId: 'C:/Users/Anish Jethva/Downloads',
    size: '311 KB',
    modified: '2026-09-06',
    content: '/downloads/Windows11.jpg',
  },
  {
    id: 'download-windows11-light',
    name: 'Windows_11.jpg',
    path: 'C:/Users/Anish Jethva/Downloads/Windows_11.jpg',
    type: 'file',
    extension: 'jpg',
    parentId: 'C:/Users/Anish Jethva/Downloads',
    size: '405 KB',
    modified: '2026-09-06',
    content: '/downloads/Windows_11.jpg',
  },

  // Items inside Music Folder
  {
    id: 'music-lofi-1',
    name: 'Lofi_Midnight_Chill.mp3',
    path: 'C:/Users/Anish Jethva/Music/Lofi_Midnight_Chill.mp3',
    type: 'file',
    extension: 'mp3',
    parentId: 'C:/Users/Anish Jethva/Music',
    size: '4.8 MB',
    modified: '2026-08-10',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    poster: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'music-synth-1',
    name: 'Synthwave_Sunset.mp3',
    path: 'C:/Users/Anish Jethva/Music/Synthwave_Sunset.mp3',
    type: 'file',
    extension: 'mp3',
    parentId: 'C:/Users/Anish Jethva/Music',
    size: '5.2 MB',
    modified: '2026-08-10',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'music-acoustic-1',
    name: 'Acoustic_Melody.mp3',
    path: 'C:/Users/Anish Jethva/Music/Acoustic_Melody.mp3',
    type: 'file',
    extension: 'mp3',
    parentId: 'C:/Users/Anish Jethva/Music',
    size: '3.6 MB',
    modified: '2026-08-10',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    poster: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'music-ambient-1',
    name: 'Ambient_Dreamscape.wav',
    path: 'C:/Users/Anish Jethva/Music/Ambient_Dreamscape.wav',
    type: 'file',
    extension: 'wav',
    parentId: 'C:/Users/Anish Jethva/Music',
    size: '8.4 MB',
    modified: '2026-08-10',
    content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    poster: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pic-aj-cyberpunk-gif',
    name: 'Cyberpunk_City_Loop.gif',
    path: 'C:/Users/Anish Jethva/Pictures/Cyberpunk_City_Loop.gif',
    type: 'file',
    extension: 'gif',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '2.1 MB',
    modified: '2026-08-10',
    content: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
  },

  // Pictures inside Anish Jethva / Pictures
  {
    id: 'pic-aj-profile',
    name: 'Profile_Portrait.png',
    path: 'C:/Users/Anish Jethva/Pictures/Profile_Portrait.png',
    type: 'file',
    extension: 'png',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '1.2 MB',
    modified: '2026-08-10',
    content: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pic-aj-workspace',
    name: 'Desk_Setup.png',
    path: 'C:/Users/Anish Jethva/Pictures/Desk_Setup.png',
    type: 'file',
    extension: 'png',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '2.4 MB',
    modified: '2026-08-10',
    content: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
  },

  // Items inside Desktop folder
  { id: 'desk-about', name: 'About Me.lnk', path: 'C:/Users/Anish Jethva/Desktop/About Me.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:about' },
  { id: 'desk-projects', name: 'Projects.lnk', path: 'C:/Users/Anish Jethva/Desktop/Projects.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:projects' },
  { id: 'desk-skills', name: 'Skills & Tech.lnk', path: 'C:/Users/Anish Jethva/Desktop/Skills & Tech.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:skills' },
  { id: 'desk-resume', name: 'Resume CV.pdf', path: 'C:/Users/Anish Jethva/Desktop/Resume CV.pdf', type: 'file', extension: 'pdf', parentId: 'C:/Users/Anish Jethva/Desktop', size: '145 KB', modified: '2026-08-10', content: 'PDF_DOCUMENT_RESUME' },
  { id: 'desk-contact', name: 'Contact Me.lnk', path: 'C:/Users/Anish Jethva/Desktop/Contact Me.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:contact' },
  { id: 'desk-terminal', name: 'Terminal.lnk', path: 'C:/Users/Anish Jethva/Desktop/Terminal.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:terminal' },
  { id: 'desk-browser', name: 'Web Browser.lnk', path: 'C:/Users/Anish Jethva/Desktop/Web Browser.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:browser' },
  { id: 'desk-settings', name: 'Settings.lnk', path: 'C:/Users/Anish Jethva/Desktop/Settings.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:settings' },
  { id: 'desk-recycle', name: 'Recycle Bin.lnk', path: 'C:/Users/Anish Jethva/Desktop/Recycle Bin.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:recycle' },
  { id: 'desk-minesweeper', name: 'Minesweeper.lnk', path: 'C:/Users/Anish Jethva/Desktop/Minesweeper.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:minesweeper' },
  { id: 'desk-snake', name: 'Retro Snake.lnk', path: 'C:/Users/Anish Jethva/Desktop/Retro Snake.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Users/Anish Jethva/Desktop', size: '1 KB', modified: '2026-08-10', content: 'app:snake' },

  // Files inside Documents
  {
    id: 'doc-bio',
    name: 'About_Anish_Jethva.txt',
    path: 'C:/Users/Anish Jethva/Documents/About_Anish_Jethva.txt',
    type: 'file',
    extension: 'txt',
    parentId: 'C:/Users/Anish Jethva/Documents',
    size: '2.4 KB',
    modified: '2026-08-01',
    content: `Anish Jethva - Senior Full Stack & AI Engineer
==============================================
Location: San Francisco, CA
Email: anish.jethva2006@gmail.com

Summary:
Full Stack Engineer with 6+ years of experience constructing resilient cloud web applications, AI copilots, and user interfaces. Deep focus on React, TypeScript, Node.js, and GenAI models.

Career Goals:
- Build human-centered AI products that boost developer creativity.
- Architect high-scale, zero-downtime distributed systems.
- Create aesthetic, accessible software experiences.
`,
  },
  {
    id: 'doc-career-goals',
    name: 'Career_Goals_2026.md',
    path: 'C:/Users/Anish Jethva/Documents/Career_Goals_2026.md',
    type: 'file',
    extension: 'md',
    parentId: 'C:/Users/Anish Jethva/Documents',
    size: '1.8 KB',
    modified: '2026-08-05',
    content: `# Career Goals & Technical Roadmap 2026

## 1. Generative AI Engineering
- Master Agentic Frameworks (Function calling, stateful tools).
- Deepen understanding of WebAssembly vector search engines.

## 2. Open Source
- Maintain top developer tools on GitHub.
- Publish modern UI libraries for Windows & macOS web experiences.

## 3. Systems Architecture
- Build low-latency event-driven microservices with Redis & PostgreSQL.
`,
  },
  {
    id: 'doc-resume-pdf',
    name: 'Alex_Rivera_Resume_2026.pdf',
    path: 'C:/Users/Anish Jethva/Documents/Alex_Rivera_Resume_2026.pdf',
    type: 'file',
    extension: 'pdf',
    parentId: 'C:/Users/Anish Jethva/Documents',
    size: '145 KB',
    modified: '2026-08-08',
    content: 'PDF_DOCUMENT_RESUME',
  },
  {
    id: 'doc-resume-docx',
    name: 'Anish_Jethva_Resume_2026.docx',
    path: 'C:/Users/Anish Jethva/Documents/Anish_Jethva_Resume_2026.docx',
    type: 'file',
    extension: 'docx',
    parentId: 'C:/Users/Anish Jethva/Documents',
    size: '84 KB',
    modified: '2026-08-08',
    content: 'DOCX_DOCUMENT_RESUME',
  },
  {
    id: 'doc-project-spec-docx',
    name: 'Technical_Portfolio_Architecture.docx',
    path: 'C:/Users/Anish Jethva/Documents/Technical_Portfolio_Architecture.docx',
    type: 'file',
    extension: 'docx',
    parentId: 'C:/Users/Anish Jethva/Documents',
    size: '112 KB',
    modified: '2026-08-09',
    content: 'DOCX_PORTFOLIO_SPECIFICATION',
  },

  // Files inside Projects
  {
    id: 'proj-aether',
    name: 'Aether_AI_Spec.txt',
    path: 'C:/Users/Anish Jethva/Projects/Aether_AI_Spec.txt',
    type: 'file',
    extension: 'txt',
    parentId: 'C:/Users/Anish Jethva/Projects',
    size: '4.2 KB',
    modified: '2026-07-28',
    content: `Aether Code AI - Technical Architecture
--------------------------------------
Stack: React 19, TypeScript, Express, Gemini API, Tailwind CSS

Features:
- Live browser preview frame with HMR handling.
- AST parsing for code diagnostics.
- Streamed responses with step-by-step diff applying.
- Multi-file workspace support.
`,
  },
  {
    id: 'proj-nexus',
    name: 'Nexus_Telemetry_Overview.md',
    path: 'C:/Users/Anish Jethva/Projects/Nexus_Telemetry_Overview.md',
    type: 'file',
    extension: 'md',
    parentId: 'C:/Users/Anish Jethva/Projects',
    size: '3.1 KB',
    modified: '2026-07-15',
    content: `# Nexus Cloud Telemetry Dashboard
Real-time microservices metrics visualizer built with D3.js and WebSockets.
`,
  },

  // General Pictures inside Pictures
  {
    id: 'pic-bloom',
    name: 'Windows_Bloom_Wallpaper.jpg',
    path: 'C:/Users/Anish Jethva/Pictures/Windows_Bloom_Wallpaper.jpg',
    type: 'file',
    extension: 'jpg',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '3.1 MB',
    modified: '2026-08-01',
    content: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pic-neon-city',
    name: 'Cyberpunk_Cityscape.webp',
    path: 'C:/Users/Anish Jethva/Pictures/Cyberpunk_Cityscape.webp',
    type: 'file',
    extension: 'webp',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '1.8 MB',
    modified: '2026-08-03',
    content: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pic-nature',
    name: 'Mountain_Sunrise.svg',
    path: 'C:/Users/Anish Jethva/Pictures/Mountain_Sunrise.svg',
    type: 'file',
    extension: 'svg',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '420 KB',
    modified: '2026-08-04',
    content: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pic-retrogif',
    name: 'Pixel_Synthwave.gif',
    path: 'C:/Users/Anish Jethva/Pictures/Pixel_Synthwave.gif',
    type: 'file',
    extension: 'gif',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '4.6 MB',
    modified: '2026-08-04',
    content: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pic-raw-tiff',
    name: 'Architectural_Render.tiff',
    path: 'C:/Users/Anish Jethva/Pictures/Architectural_Render.tiff',
    type: 'file',
    extension: 'tiff',
    parentId: 'C:/Users/Anish Jethva/Pictures',
    size: '14.2 MB',
    modified: '2026-08-05',
    content: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },

  // Code files (.py, .js, .ts, .java, .c, .cpp, .cs, .rb, .go, .rs, .php, .swift)
  {
    id: 'code-python',
    name: 'ai_copilot_engine.py',
    path: 'C:/Users/Anish Jethva/Projects/ai_copilot_engine.py',
    type: 'file',
    extension: 'py',
    parentId: 'C:/Users/Anish Jethva/Projects',
    size: '3.8 KB',
    modified: '2026-08-10',
    content: `"""
AI Copilot Orchestration Engine
Powered by Gemini Models and Tool Function Calling
"""
import os
import json
from typing import Dict, Any, List

class AICopilotEngine:
    def __init__(self, model_name: str = "gemini-3.7-flash"):
        self.model_name = model_name
        self.conversation_history: List[Dict[str, Any]] = []
        print(f"Initialized AI Copilot Engine on {self.model_name}")

    def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatches verified system commands."""
        print(f"Executing tool {tool_name} with params {arguments}")
        return {"status": "success", "result": f"Executed {tool_name}"}

if __name__ == "__main__":
    copilot = AICopilotEngine()
`,
  },
  {
    id: 'code-typescript',
    name: 'server_state_manager.ts',
    path: 'C:/Users/Anish Jethva/Projects/server_state_manager.ts',
    type: 'file',
    extension: 'ts',
    parentId: 'C:/Users/Anish Jethva/Projects',
    size: '2.9 KB',
    modified: '2026-08-10',
    content: `export interface SystemEventPayload<T = unknown> {
  type: string;
  timestamp: number;
  data: T;
}

export class ReactiveStateStore<T extends Record<string, any>> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  public getState(): T {
    return { ...this.state };
  }

  public setState(updater: Partial<T> | ((prev: T) => Partial<T>)): void {
    const nextUpdates = typeof updater === 'function' ? updater(this.state) : updater;
    this.state = { ...this.state, ...nextUpdates };
    this.listeners.forEach((fn) => fn(this.state));
  }
}
`,
  },
  {
    id: 'code-javascript',
    name: 'web_worker_pipeline.js',
    path: 'C:/Users/Anish Jethva/Projects/web_worker_pipeline.js',
    type: 'file',
    extension: 'js',
    parentId: 'C:/Users/Anish Jethva/Projects',
    size: '1.9 KB',
    modified: '2026-08-10',
    content: `// Web Worker High-Throughput Matrix Multiplier
self.onmessage = function(e) {
  const { matrixA, matrixB, dimension } = e.data;
  const result = new Float64Array(dimension * dimension);
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      let sum = 0;
      for (let k = 0; k < dimension; k++) {
        sum += matrixA[i * dimension + k] * matrixB[k * dimension + j];
      }
      result[i * dimension + j] = sum;
    }
  }
  self.postMessage({ result }, [result.buffer]);
};`,
  },

  // --- Portfolio OS Project File Structure (Frontend & Backend) ---
  { id: 'port-os-root', name: 'Portfolio OS', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects', modified: '2026-09-08' },
  
  // Frontend Folder Structure
  { id: 'port-os-fe', name: 'frontend', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },
  { id: 'port-os-fe-src', name: 'src', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend', modified: '2026-09-08' },
  { id: 'port-os-fe-src-components', name: 'components', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/components', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', modified: '2026-09-08' },
  { id: 'port-os-fe-src-context', name: 'context', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/context', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', modified: '2026-09-08' },
  { id: 'port-os-fe-src-data', name: 'data', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/data', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', modified: '2026-09-08' },
  { id: 'port-os-fe-src-hooks', name: 'hooks', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/hooks', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', modified: '2026-09-08' },
  { id: 'port-os-fe-src-services', name: 'services', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/services', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', modified: '2026-09-08' },
  { id: 'port-os-fe-src-utils', name: 'utils', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/utils', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src', modified: '2026-09-08' },
  { id: 'port-os-fe-public', name: 'public', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/public', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend', modified: '2026-09-08' },
  { id: 'port-os-fe-assets', name: 'assets', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/assets', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend', modified: '2026-09-08' },
  { id: 'port-os-fe-app', name: 'app', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/app', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend', modified: '2026-09-08' },

  // Frontend Files
  {
    id: 'port-os-fe-app-tsx',
    name: 'App.tsx',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/App.tsx',
    type: 'file',
    extension: 'tsx',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src',
    size: '14.5 KB',
    modified: '2026-09-08',
    content: `import React from 'react';
import { useOS } from './context/OSContext';
import Desktop from './components/desktop/Desktop';
import Taskbar from './components/taskbar/Taskbar';
import WindowManager from './components/window/WindowManager';

export const App: React.FC = () => {
  const { powerState, settings } = useOS();

  if (powerState === 'off' || powerState === 'shutdown') {
    return <div className="bg-black w-screen h-screen" />;
  }

  return (
    <div className={\`w-screen h-screen overflow-hidden relative select-none \${settings.theme === 'dark' ? 'dark' : ''}\`}>
      <Desktop />
      <WindowManager />
      <Taskbar />
    </div>
  );
};

export default App;`
  },
  {
    id: 'port-os-fe-main-tsx',
    name: 'main.tsx',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src/main.tsx',
    type: 'file',
    extension: 'tsx',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/src',
    size: '1.2 KB',
    modified: '2026-09-08',
    content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { OSProvider } from './context/OSContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OSProvider>
      <App />
    </OSProvider>
  </React.StrictMode>
);`
  },
  {
    id: 'port-os-fe-index-html',
    name: 'index.html',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/index.html',
    type: 'file',
    extension: 'html',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend',
    size: '1.1 KB',
    modified: '2026-09-08',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Windows 11 Portfolio OS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
  },
  {
    id: 'port-os-fe-vite-config',
    name: 'vite.config.ts',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/vite.config.ts',
    type: 'file',
    extension: 'ts',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend',
    size: '1.4 KB',
    modified: '2026-09-08',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});`
  },
  {
    id: 'port-os-fe-package-json',
    name: 'package.json',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend/package.json',
    type: 'file',
    extension: 'json',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/frontend',
    size: '1.2 KB',
    modified: '2026-09-08',
    content: `{
  "name": "portfolio-os-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.450.0",
    "motion": "^12.0.0"
  }
}`
  },

  // Backend Folder Structure
  { id: 'port-os-be', name: 'backend', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },
  { id: 'port-os-be-config', name: 'config', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/config', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', modified: '2026-09-08' },
  { id: 'port-os-be-db', name: 'db', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/db', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', modified: '2026-09-08' },
  { id: 'port-os-be-middleware', name: 'middleware', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/middleware', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', modified: '2026-09-08' },
  { id: 'port-os-be-routes', name: 'routes', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/routes', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', modified: '2026-09-08' },
  { id: 'port-os-be-services', name: 'services', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/services', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', modified: '2026-09-08' },
  { id: 'port-os-be-tests', name: 'tests', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/tests', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend', modified: '2026-09-08' },

  // Backend Files
  {
    id: 'port-os-be-server-ts',
    name: 'server.ts',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend/server.ts',
    type: 'file',
    extension: 'ts',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS/backend',
    size: '3.4 KB',
    modified: '2026-09-08',
    content: `import express from 'express';\nimport cors from 'cors';\nimport cookieParser from 'cookie-parser';\nimport { filesRouter } from './routes/files';\nimport { authRouter } from './routes/auth';\n\nconst app = express();\nconst PORT = 3000;\n\napp.use(cors({ origin: true, credentials: true }));\napp.use(cookieParser());\napp.use(express.json());\n\napp.use('/api/files', filesRouter);\napp.use('/api/auth', authRouter);\n\napp.listen(PORT, '0.0.0.0', () => {\n  console.log(\\\`Backend Portfolio Server running on port \\\${PORT}\\\`);\n});`
  },

  // Root-Level Folders/Files of Portfolio OS project
  { id: 'port-os-data-dir', name: '.data', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/.data', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },
  { id: 'port-os-app-dir', name: 'app', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/app', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },
  { id: 'port-os-assets-dir', name: 'assets', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/assets', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },
  { id: 'port-os-public-dir', name: 'public', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/public', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },
  { id: 'port-os-src-dir', name: 'src', path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/src', type: 'folder', parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS', modified: '2026-09-08' },

  {
    id: 'port-os-env-example',
    name: '.env.example',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/.env.example',
    type: 'file',
    extension: 'example',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS',
    size: '220 B',
    modified: '2026-09-08',
    content: `GEMINI_API_KEY=\\nNODE_ENV=development\\nPORT=3000`
  },
  {
    id: 'port-os-gitignore',
    name: '.gitignore',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/.gitignore',
    type: 'file',
    extension: 'gitignore',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS',
    size: '150 B',
    modified: '2026-09-08',
    content: `node_modules/\\ndist/\\n.env\\n.data/`
  },
  {
    id: 'port-os-bun-lock',
    name: 'bun.lock',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/bun.lock',
    type: 'file',
    extension: 'lock',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS',
    size: '12 KB',
    modified: '2026-09-08',
    content: `# Bun lockfile v1\\n...`
  },
  {
    id: 'port-os-docker-compose',
    name: 'docker-compose.yml',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/docker-compose.yml',
    type: 'file',
    extension: 'yml',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS',
    size: '340 B',
    modified: '2026-09-08',
    content: `version: '3.8'\\nservices:\\n  app:\\n    build: .\\n    ports:\\n      - "3000:3000"\\n    environment:\\n      - NODE_ENV=production`
  },
  {
    id: 'port-os-dockerfile',
    name: 'Dockerfile',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/Dockerfile',
    type: 'file',
    extension: 'Dockerfile',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS',
    size: '420 B',
    modified: '2026-09-08',
    content: `FROM node:20-alpine\\nWORKDIR /app\\nCOPY package*.json ./\\nRUN npm install\\nCOPY . .\\nRUN npm run build\\nEXPOSE 3000\\nCMD ["npm", "start"]`
  },
  {
    id: 'port-os-metadata-json',
    name: 'metadata.json',
    path: 'C:/Users/Anish Jethva/Projects/Portfolio OS/metadata.json',
    type: 'file',
    extension: 'json',
    parentId: 'C:/Users/Anish Jethva/Projects/Portfolio OS',
    size: '280 B',
    modified: '2026-09-08',
    content: `{\\n  "name": "Windows 11 Portfolio OS",\\n  "description": "Interactive Web OS and portfolio showcase",\\n  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]\\n}`
  },
    // Videos (IT & Software Engineering Videos)
  {
    id: 'vid-demo',
    name: 'React_Debug_Walkthrough.mp4',
    path: 'C:/Users/Anish Jethva/Videos/React_Debug_Walkthrough.mp4',
    type: 'file',
    extension: 'mp4',
    parentId: 'C:/Users/Anish Jethva/Videos',
    size: '2.9 MB',
    modified: '2026-09-06',
    content: '/videos/React_Debug_Walkthrough.mp4',
  },
  {
    id: 'vid-tutorial',
    name: 'Software_Engineering_Overview.mp4',
    path: 'C:/Users/Anish Jethva/Videos/Software_Engineering_Overview.mp4',
    type: 'file',
    extension: 'mp4',
    parentId: 'C:/Users/Anish Jethva/Videos',
    size: '1.5 MB',
    modified: '2026-09-06',
    content: '/videos/Software_Engineering_Overview.mp4',
  },

  // Program Files (All Applications .exe and .lnk)
  { id: 'prog-chrome-dir', name: 'Google Chrome', path: 'C:/Program Files/Google Chrome', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-chrome-exe', name: 'chrome.exe', path: 'C:/Program Files/Google Chrome/chrome.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Google Chrome', size: '3.4 MB', modified: '2026-08-01', content: 'app:browser' },
  { id: 'prog-chrome-lnk', name: 'Google Chrome.lnk', path: 'C:/Program Files/Google Chrome/Google Chrome.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Google Chrome', size: '2 KB', modified: '2026-08-01', content: 'app:browser' },

  { id: 'prog-about-dir', name: 'About Me', path: 'C:/Program Files/About Me', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-about-exe', name: 'AboutMe.exe', path: 'C:/Program Files/About Me/AboutMe.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/About Me', size: '2.1 MB', modified: '2026-08-01', content: 'app:about' },
  { id: 'prog-about-lnk', name: 'About Me.lnk', path: 'C:/Program Files/About Me/About Me.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/About Me', size: '2 KB', modified: '2026-08-01', content: 'app:about' },

  { id: 'prog-projects-dir', name: 'Projects', path: 'C:/Program Files/Projects', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-projects-exe', name: 'Projects.exe', path: 'C:/Program Files/Projects/Projects.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Projects', size: '2.8 MB', modified: '2026-08-01', content: 'app:projects' },
  { id: 'prog-projects-lnk', name: 'Projects.lnk', path: 'C:/Program Files/Projects/Projects.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Projects', size: '2 KB', modified: '2026-08-01', content: 'app:projects' },

  { id: 'prog-skills-dir', name: 'Skills', path: 'C:/Program Files/Skills', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-skills-exe', name: 'Skills.exe', path: 'C:/Program Files/Skills/Skills.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Skills', size: '1.9 MB', modified: '2026-08-01', content: 'app:skills' },
  { id: 'prog-skills-lnk', name: 'Skills.lnk', path: 'C:/Program Files/Skills/Skills.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Skills', size: '2 KB', modified: '2026-08-01', content: 'app:skills' },

  { id: 'prog-resume-dir', name: 'Resume', path: 'C:/Program Files/Resume', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-resume-exe', name: 'Resume.exe', path: 'C:/Program Files/Resume/Resume.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Resume', size: '2.0 MB', modified: '2026-08-01', content: 'app:resume' },
  { id: 'prog-resume-lnk', name: 'Resume.lnk', path: 'C:/Program Files/Resume/Resume.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Resume', size: '2 KB', modified: '2026-08-01', content: 'app:resume' },

  { id: 'prog-contact-dir', name: 'Contact', path: 'C:/Program Files/Contact', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-contact-exe', name: 'Contact.exe', path: 'C:/Program Files/Contact/Contact.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Contact', size: '1.6 MB', modified: '2026-08-01', content: 'app:contact' },
  { id: 'prog-contact-lnk', name: 'Contact.lnk', path: 'C:/Program Files/Contact/Contact.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Contact', size: '2 KB', modified: '2026-08-01', content: 'app:contact' },

  { id: 'prog-explorer-dir', name: 'File Explorer', path: 'C:/Program Files/File Explorer', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-explorer-exe', name: 'explorer.exe', path: 'C:/Program Files/File Explorer/explorer.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/File Explorer', size: '4.5 MB', modified: '2026-08-01', content: 'app:explorer' },
  { id: 'prog-explorer-lnk', name: 'File Explorer.lnk', path: 'C:/Program Files/File Explorer/File Explorer.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/File Explorer', size: '2 KB', modified: '2026-08-01', content: 'app:explorer' },

  { id: 'prog-terminal-dir', name: 'Terminal', path: 'C:/Program Files/Terminal', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-terminal-exe', name: 'cmd.exe', path: 'C:/Program Files/Terminal/cmd.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Terminal', size: '2.4 MB', modified: '2026-08-01', content: 'app:terminal' },
  { id: 'prog-terminal-lnk', name: 'Terminal.lnk', path: 'C:/Program Files/Terminal/Terminal.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Terminal', size: '2 KB', modified: '2026-08-01', content: 'app:terminal' },

  { id: 'prog-settings-dir', name: 'Settings', path: 'C:/Program Files/Settings', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-settings-exe', name: 'settings.exe', path: 'C:/Program Files/Settings/settings.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Settings', size: '3.1 MB', modified: '2026-08-01', content: 'app:settings' },
  { id: 'prog-settings-lnk', name: 'Settings.lnk', path: 'C:/Program Files/Settings/Settings.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Settings', size: '2 KB', modified: '2026-08-01', content: 'app:settings' },

  { id: 'prog-taskmgr-dir', name: 'Task Manager', path: 'C:/Program Files/Task Manager', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-taskmgr-exe', name: 'taskmgr.exe', path: 'C:/Program Files/Task Manager/taskmgr.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Task Manager', size: '2.2 MB', modified: '2026-08-01', content: 'app:taskmanager' },
  { id: 'prog-taskmgr-lnk', name: 'Task Manager.lnk', path: 'C:/Program Files/Task Manager/Task Manager.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Task Manager', size: '2 KB', modified: '2026-08-01', content: 'app:taskmanager' },

  { id: 'prog-minesweeper-dir', name: 'Minesweeper', path: 'C:/Program Files/Minesweeper', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-minesweeper-exe', name: 'minesweeper.exe', path: 'C:/Program Files/Minesweeper/minesweeper.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Minesweeper', size: '1.5 MB', modified: '2026-08-01', content: 'app:minesweeper' },
  { id: 'prog-minesweeper-lnk', name: 'Minesweeper.lnk', path: 'C:/Program Files/Minesweeper/Minesweeper.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Minesweeper', size: '2 KB', modified: '2026-08-01', content: 'app:minesweeper' },

  { id: 'prog-snake-dir', name: 'Retro Snake', path: 'C:/Program Files/Retro Snake', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-snake-exe', name: 'snake.exe', path: 'C:/Program Files/Retro Snake/snake.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Retro Snake', size: '1.4 MB', modified: '2026-08-01', content: 'app:snake' },
  { id: 'prog-snake-lnk', name: 'Retro Snake.lnk', path: 'C:/Program Files/Retro Snake/Retro Snake.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Retro Snake', size: '2 KB', modified: '2026-08-01', content: 'app:snake' },

  { id: 'prog-calculator-dir', name: 'Calculator', path: 'C:/Program Files/Calculator', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-calculator-exe', name: 'calc.exe', path: 'C:/Program Files/Calculator/calc.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Calculator', size: '1.2 MB', modified: '2026-08-01', content: 'app:calculator' },
  { id: 'prog-calculator-lnk', name: 'Calculator.lnk', path: 'C:/Program Files/Calculator/Calculator.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Calculator', size: '2 KB', modified: '2026-08-01', content: 'app:calculator' },

  { id: 'prog-camera-dir', name: 'Camera', path: 'C:/Program Files/Camera', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-camera-exe', name: 'camera.exe', path: 'C:/Program Files/Camera/camera.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Camera', size: '2.5 MB', modified: '2026-08-01', content: 'app:camera' },
  { id: 'prog-camera-lnk', name: 'Camera.lnk', path: 'C:/Program Files/Camera/Camera.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Camera', size: '2 KB', modified: '2026-08-01', content: 'app:camera' },

  { id: 'prog-media-dir', name: 'Media', path: 'C:/Program Files/Media', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-media-exe', name: 'media.exe', path: 'C:/Program Files/Media/media.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Media', size: '3.0 MB', modified: '2026-08-01', content: 'app:photos' },
  { id: 'prog-media-lnk', name: 'Media.lnk', path: 'C:/Program Files/Media/Media.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Media', size: '2 KB', modified: '2026-08-01', content: 'app:photos' },

  { id: 'prog-notepad-dir', name: 'Notepad', path: 'C:/Program Files/Notepad', type: 'folder', parentId: 'C:/Program Files', modified: '2026-08-01' },
  { id: 'prog-notepad-exe', name: 'notepad.exe', path: 'C:/Program Files/Notepad/notepad.exe', type: 'file', extension: 'exe', parentId: 'C:/Program Files/Notepad', size: '1.8 MB', modified: '2026-08-01', content: 'app:notepad' },
  { id: 'prog-notepad-lnk', name: 'Notepad.lnk', path: 'C:/Program Files/Notepad/Notepad.lnk', type: 'file', extension: 'lnk', parentId: 'C:/Program Files/Notepad', size: '2 KB', modified: '2026-08-01', content: 'app:notepad' },

  // Windows
  { id: 'win-system32', name: 'System32', path: 'C:/Windows/System32', type: 'folder', parentId: 'C:/Windows', modified: '2026-08-01' },
  { id: 'win-cmd', name: 'cmd.exe', path: 'C:/Windows/System32/cmd.exe', type: 'file', extension: 'exe', parentId: 'C:/Windows/System32', size: '2.4 MB', modified: '2026-08-01', content: 'app:terminal' },
  { id: 'win-explorer', name: 'explorer.exe', path: 'C:/Windows/explorer.exe', type: 'file', extension: 'exe', parentId: 'C:/Windows', size: '5.1 MB', modified: '2026-08-01', content: 'app:explorer' },
];
