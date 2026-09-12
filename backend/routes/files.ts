import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileService } from '../services/fileService';

export const filesRouter = Router();

// Configure multer memory storage for file uploads (up to 50MB per file)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// POST /api/files/upload - Handle file upload (Supports both multipart FormData and JSON payload)
filesRouter.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    // 1. Multipart Form-Data upload via req.file
    if (req.file) {
      const originalName = req.file.originalname || 'uploaded_file';
      const targetFolder = req.body.targetFolder || req.body.parentId || 'C:/Users/Anish Jethva/Documents';
      const cleanPath = (req.body.path || `${targetFolder}/${originalName}`).replace(/\/\//g, '/');

      const saved = fileService.saveUploadedBuffer(
        req.file.buffer,
        originalName,
        cleanPath,
        targetFolder
      );

      return res.status(201).json({
        success: true,
        message: 'File uploaded and stored in uploads/ directory successfully',
        file: saved,
      });
    }

    // 2. JSON Body upload (content can be base64 or text)
    const { name, path: filePath, content, extension, size, type, parentId } = req.body;
    if (!name || !filePath) {
      return res.status(400).json({ error: 'Missing name or path in upload payload.' });
    }

    const saved = fileService.saveFile({
      name,
      path: filePath,
      parentId: parentId || filePath.substring(0, filePath.lastIndexOf('/')),
      content,
      extension,
      size,
      type: type || 'file',
    });

    return res.status(201).json({
      success: true,
      message: 'File saved and stored in uploads/ directory successfully',
      file: saved,
    });
  } catch (err: any) {
    console.error('[FilesRouter] Upload error:', err);
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// GET /api/files/download/:id
filesRouter.get('/download/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const file = fileService.getFileById(id);
  if (!file) {
    return res.status(404).send('File not found');
  }

  // If diskPath exists and is readable, stream the file
  if (file.diskPath && fs.existsSync(file.diskPath)) {
    return res.download(file.diskPath, file.name);
  }

  // Fallback to content string
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(file.content || '');
});

// DELETE /api/files/:id - Remove file from server and disk
filesRouter.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = fileService.deleteFile(id);
  if (!deleted) {
    return res.status(404).json({ error: 'File not found on server' });
  }
  res.json({ success: true, message: `File ${id} deleted from server` });
});

// POST /api/files/sync - Bulk sync files from frontend to backend
filesRouter.post('/sync', (req: Request, res: Response) => {
  try {
    const { files } = req.body;
    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'Invalid files array' });
    }
    const count = fileService.syncBulk(files);
    res.json({ success: true, count, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// GET /api/files/list - List all server backed files
filesRouter.get('/list', (req: Request, res: Response) => {
  const files = fileService.getAllFiles();
  res.json({ count: files.length, files });
});
