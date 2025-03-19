import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController';

const router = express.Router();

// GET all tasks
router.get('/', getAllTasks);

// GET a single task
router.get('/:id', getTaskById);

// POST a new task
router.post('/', createTask);

// PUT/UPDATE a task
router.put('/:id', updateTask);

// DELETE a task
router.delete('/:id', deleteTask);

export default router; 