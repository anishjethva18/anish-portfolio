import React from 'react';
import { AppId } from '../../types';
import { AboutApp } from './AboutApp';
import { ProjectsApp } from './ProjectsApp';
import { SkillsApp } from './SkillsApp';
import { ResumeViewerApp } from './ResumeViewerApp';
import { ContactApp } from './ContactApp';
import { FileExplorerApp } from './FileExplorerApp';
import { TerminalApp } from './TerminalApp';
import { BrowserApp } from './BrowserApp';
import { NotepadApp } from './NotepadApp';
import { SettingsApp } from './SettingsApp';
import { TaskManagerApp } from './TaskManagerApp';
import { RecycleBinApp } from './RecycleBinApp';
import { MinesweeperApp } from './MinesweeperApp';
import { SnakeApp } from './SnakeApp';
import { CalculatorApp } from './CalculatorApp';
import { CameraApp } from './CameraApp';
import { MediaApp } from './MediaApp';

interface RenderAppProps {
  appId: AppId;
  args?: Record<string, any>;
  windowId?: string;
}

export const RenderApp: React.FC<RenderAppProps> = ({ appId, args, windowId }) => {
  switch (appId) {
    case 'about':
      return <AboutApp />;
    case 'projects':
      return <ProjectsApp />;
    case 'skills':
      return <SkillsApp />;
    case 'resume':
      return <ResumeViewerApp />;
    case 'contact':
      return (
        <ContactApp
          initialMessage={args?.message}
          initialSubject={args?.subject}
          initialAttachments={args?.attachments || (args?.file ? [args.file] : undefined)}
        />
      );
    case 'explorer':
      return <FileExplorerApp windowId={windowId} initialPath={args?.initialPath || args?.path} />;
    case 'terminal':
      return <TerminalApp />;
    case 'browser':
      return <BrowserApp initialUrl={args?.initialUrl} windowId={windowId} />;
    case 'notepad':
      return <NotepadApp filePath={args?.filePath} fileContent={args?.fileContent} windowId={windowId} />;
    case 'settings':
      return <SettingsApp initialTab={args?.tab} />;
    case 'taskmanager':
      return <TaskManagerApp />;
    case 'recycle':
      return <RecycleBinApp />;
    case 'minesweeper':
      return <MinesweeperApp />;
    case 'snake':
      return <SnakeApp />;
    case 'calculator':
      return <CalculatorApp />;
    case 'camera':
      return <CameraApp />;
    case 'photos':
      return <MediaApp filePath={args?.filePath} initialMediaId={args?.mediaId} />;
    default:
      return (
        <div className="p-8 text-center text-xs text-slate-400">
          Application {appId} is under development.
        </div>
      );
  }
};

