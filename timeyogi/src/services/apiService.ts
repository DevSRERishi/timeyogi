import axios from 'axios';

// Define the Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
  prevStatus?: 'todo' | 'in-progress';
  createdAt?: Date;
  updatedAt?: Date;
}

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Task API functions
export const TaskAPI = {
  // Get all tasks
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks');
      
      // Convert string dates to Date objects
      const tasks = response.data.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
      
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },
  
  // Get task by ID
  getTaskById: async (id: string): Promise<Task> => {
    try {
      const response = await api.get(`/tasks/${id}`);
      // Convert dueDate string to Date object
      return {
        ...response.data,
        dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
      };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new task
  createTask: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    try {
      // Remove any client-side generated id if it exists
      const { id, ...taskData } = task as any;
      
      const response = await api.post('/tasks', taskData);
      const newTask = {
        ...response.data,
        dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
      };
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },
  
  // Update a task
  updateTask: async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> => {
    try {
      const response = await api.put(`/tasks/${id}`, updates);
      const updatedTask = {
        ...response.data,
        dueDate: response.data.dueDate ? new Date(response.data.dueDate) : undefined,
      };
      
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a task
  deleteTask: async (id: string): Promise<void> => {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.error(`Error deleting task with ID ${id}:`, error);
      throw error;
    }
  },
};

export default TaskAPI; 