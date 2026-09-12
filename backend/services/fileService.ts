import fs from 'fs';
import path from 'path';
import { db, StoredFileMetadata } from '../db/database';

export class FileService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  public ensureUploadsDir() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[FileService] Failed to create uploads directory:', e);
    }
  }

  public getUploadsDir(): string {
    this.ensureUploadsDir();
    return this.uploadsDir;
  }

  /**
   * Format byte sizes into readable string (e.g. "1.2 MB" or "45.6 KB")
   */
  public formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.max(0.1, bytes / 1024).toFixed(1)} KB`;
  }

  /**
   * Save a binary file buffer to the uploads/ folder and persist metadata in DB
   */
  public saveUploadedBuffer(
    buffer: Buffer,
    originalName: string,
    targetPath: string,
    parentId?: string
  ): StoredFileMetadata {
    this.ensureUploadsDir();

    const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase() : '';
    const safeExt = ext ? `.${ext}` : '';
    const uniqueId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const sanitizedBase = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${uniqueId}-${sanitizedBase}`;
    const diskPath = path.join(this.uploadsDir, diskFileName);

    // Save actual file to persistent uploads/ folder
    fs.writeFileSync(diskPath, buffer);

    const sizeBytes = buffer.length;
    const sizeStr = this.formatFileSize(sizeBytes);
    const resolvedParentId = parentId || targetPath.substring(0, targetPath.lastIndexOf('/')) || 'C:/Users/Anish Jethva/Documents';

    // Store metadata in database
    const metadata: StoredFileMetadata = {
      id: uniqueId,
      name: originalName,
      path: targetPath,
      parentId: resolvedParentId,
      type: 'file',
      extension: ext || 'txt',
      size: sizeStr,
      sizeBytes,
      modified: new Date().toISOString().split('T')[0],
      url: `/uploads/${diskFileName}`,
      diskPath,
      uploadedAt: new Date().toISOString(),
    };

    return db.saveFileMetadata(metadata);
  }

  /**
   * Save a file from JSON payload (base64 dataURL or text) to disk and DB
   */
  public saveFile(file: Partial<StoredFileMetadata> & { name: string; path: string }): StoredFileMetadata {
    this.ensureUploadsDir();

    const uniqueId = file.id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const originalName = file.name;
    const ext = file.extension || (originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase() : 'txt');
    const sanitizedBase = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${uniqueId}-${sanitizedBase}`;
    const diskPath = path.join(this.uploadsDir, diskFileName);

    let sizeBytes = 0;

    if (file.content) {
      if (file.content.startsWith('data:')) {
        const matches = file.content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const buffer = Buffer.from(matches[2], 'base64');
          fs.writeFileSync(diskPath, buffer);
          sizeBytes = buffer.length;
        } else {
          fs.writeFileSync(diskPath, file.content, 'utf-8');
          sizeBytes = Buffer.byteLength(file.content, 'utf-8');
        }
      } else {
        fs.writeFileSync(diskPath, file.content, 'utf-8');
        sizeBytes = Buffer.byteLength(file.content, 'utf-8');
      }
    } else {
      // Empty file
      fs.writeFileSync(diskPath, Buffer.alloc(0));
      sizeBytes = 0;
    }

    const sizeStr = file.size || this.formatFileSize(sizeBytes);
    const resolvedParentId = file.parentId || file.path.substring(0, file.path.lastIndexOf('/')) || 'C:/Users/Anish Jethva/Documents';

    const stored: StoredFileMetadata = {
      id: uniqueId,
      name: originalName,
      path: file.path,
      parentId: resolvedParentId,
      type: file.type || 'file',
      extension: ext,
      size: sizeStr,
      sizeBytes,
      modified: file.modified || new Date().toISOString().split('T')[0],
      url: `/uploads/${diskFileName}`,
      diskPath,
      content: file.content,
      uploadedAt: new Date().toISOString(),
    };

    return db.saveFileMetadata(stored);
  }

  public getFileById(id: string): StoredFileMetadata | undefined {
    return db.getFileById(id);
  }

  public getAllFiles(): StoredFileMetadata[] {
    return db.getFiles();
  }

  public deleteFile(id: string): boolean {
    const file = db.getFileById(id);
    if (file && file.diskPath && fs.existsSync(file.diskPath)) {
      try {
        fs.unlinkSync(file.diskPath);
      } catch (e) {
        console.warn('[FileService] Failed to delete disk file:', e);
      }
    }
    return db.deleteFileMetadata(id);
  }

  public syncBulk(files: StoredFileMetadata[]): number {
    let count = 0;
    for (const f of files) {
      if (f && f.id) {
        db.saveFileMetadata(f);
        count++;
      }
    }
    return count;
  }
}

export const fileService = new FileService();
