import { Router, Response } from 'express';
import { db, TaskItem } from '../db/database';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

export const tasksRouter = Router();

/**
 * GET /api/tasks
 */
tasksRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId || 'usr_admin_anish';
  const userTasks = Array.from(db.tasks.values()).filter(
    (t) => t.userId === userId || t.userId === 'usr_admin_anish'
  );

  res.json({
    success: true,
    tasks: userTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    total: userTasks.length,
  });
});

/**
 * POST /api/tasks
 */
tasksRouter.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'usr_admin_anish';
    const { title, description, priority, category, dueDate, tags } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newTask: TaskItem = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      title: title.trim(),
      description: description?.trim() || '',
      status: 'pending',
      priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
      category: ['Work', 'Portfolio', 'Personal', 'Bug', 'Feature'].includes(category) ? category : 'Portfolio',
      dueDate: dueDate || undefined,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.tasks.set(newTask.id, newTask);
    db.saveDiskAsync();

    res.status(201).json({ success: true, task: newTask });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create task' });
  }
});

/**
 * PUT /api/tasks/:id
 */
tasksRouter.put('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const task = db.tasks.get(id);

  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const { title, description, status, priority, category, dueDate, tags } = req.body;

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (['pending', 'in_progress', 'completed'].includes(status)) {
    task.status = status;
    if (status === 'completed' && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    } else if (status !== 'completed') {
      task.completedAt = undefined;
    }
  }
  if (['low', 'medium', 'high', 'urgent'].includes(priority)) task.priority = priority;
  if (['Work', 'Portfolio', 'Personal', 'Bug', 'Feature'].includes(category)) task.category = category;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (Array.isArray(tags)) task.tags = tags;

  task.updatedAt = new Date().toISOString();
  db.tasks.set(task.id, task);
  db.saveDiskAsync();

  res.json({ success: true, task });
});

/**
 * DELETE /api/tasks/:id
 */
tasksRouter.delete('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (!db.tasks.has(id)) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  db.tasks.delete(id);
  db.saveDiskAsync();

  res.json({ success: true, message: 'Task removed' });
});
