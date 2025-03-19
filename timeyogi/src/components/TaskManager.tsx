import React, { useState, useEffect, useCallback } from 'react';
import TaskList from './TaskList';
import Tabs from './Tabs';
import CalendarView from './CalendarView';
import TaskSummary from './TaskSummary';
import TaskAPI from '../services/apiService';

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

type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type DisplayMode = 'list' | 'calendar';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

const TaskManager = () => {
  // Specify the type of tasks as Task[]
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('daily');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('calendar');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch tasks from the API
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await TaskAPI.getAllTasks();
      setTasks(fetchedTasks);
      console.log('Fetched tasks from API:', fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again later.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks when component mounts
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Add task
  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newTask = await TaskAPI.createTask(task);
      setTasks(prevTasks => [...prevTasks, newTask]);
      // Refresh tasks from the server to ensure we have the latest data
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  // Update task
  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setLoading(true);
    setError(null);
    try {
      await TaskAPI.updateTask(id, updates);
      // Refresh tasks from the server to ensure we have the latest data
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await TaskAPI.deleteTask(id);
      // Refresh tasks from the server to ensure we have the latest data
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchTasks]);

  // Handle view change
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  // Handle date click - switches to daily view for the clicked date
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('daily');
  };

  // Toggle display mode between list and calendar
  const toggleDisplayMode = () => {
    setDisplayMode(displayMode === 'list' ? 'calendar' : 'list');
  };

  // Handle priority filter change
  const handlePriorityChange = (priority: PriorityFilter) => {
    setPriorityFilter(priority);
  };

  // Filter tasks based on current view and priority
  useEffect(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    // Calculate start and end of week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Calculate start and end of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Calculate start and end of year
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    
    // Filter tasks based on current view
    let filtered: Task[];
    switch (currentView) {
      case 'daily':
        filtered = tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= startOfDay && dueDate <= endOfDay;
        });
        break;
      case 'weekly':
        filtered = tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= startOfWeek && dueDate <= endOfWeek;
        });
        break;
      case 'monthly':
        filtered = tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= startOfMonth && dueDate <= endOfMonth;
        });
        break;
      case 'yearly':
        filtered = tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= startOfYear && dueDate <= endOfYear;
        });
        break;
      default:
        filtered = tasks;
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    setFilteredTasks(filtered);
  }, [tasks, currentView, priorityFilter]);

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      
      <div className="controls">
        <Tabs
          tabs={[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
          ]}
          activeTab={currentView}
          onTabChange={handleViewChange}
        />
        <div className="display-toggles">
          <button 
            className={`display-toggle ${displayMode === 'calendar' ? 'active' : ''}`} 
            onClick={toggleDisplayMode}
          >
            {displayMode === 'calendar' ? '📅 Calendar' : '📋 List'}
          </button>
          
          <select 
            className="priority-filter" 
            value={priorityFilter} 
            onChange={(e) => handlePriorityChange(e.target.value as PriorityFilter)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <>
          {displayMode === 'list' ? (
            <TaskList 
              tasks={filteredTasks} 
              updateTask={updateTask} 
              deleteTask={deleteTask}
            />
          ) : (
            <CalendarView
              tasks={tasks}
              currentView={currentView}
              addTask={addTask}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          )}
          
          <TaskSummary tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} />
        </>
      )}
    </div>
  );
};

export default TaskManager; 