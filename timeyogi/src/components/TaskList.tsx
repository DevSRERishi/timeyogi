import React from 'react';

// Import the Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
  prevStatus?: 'todo' | 'in-progress';
}

interface TaskListProps {
  tasks: Task[];
  updateTask?: (id: string, updates: Partial<Task>) => void;
  deleteTask?: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, updateTask, deleteTask }) => {
  // Function to format date
  const formatDate = (date?: Date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString();
  };

  // Function to get priority class
  const getPriorityClass = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return '';
    }
  };

  // Function to handle status change
  const handleStatusChange = (id: string, status: 'todo' | 'in-progress' | 'completed') => {
    if (updateTask) {
      // Find the current task to get its current status
      const currentTask = tasks.find(task => task.id === id);
      
      if (currentTask) {
        if (status === 'completed') {
          // Store the current status as prevStatus when marking as completed
          updateTask(id, { 
            status: 'completed', 
            prevStatus: currentTask.status === 'completed' ? undefined : currentTask.status 
          });
        } else if (currentTask.status === 'completed' && (status === 'todo' || status === 'in-progress')) {
          // When changing from completed to another status, clear prevStatus
          updateTask(id, { 
            status: status, 
            prevStatus: undefined 
          });
        } else {
          // For other status changes, just update the status
          updateTask(id, { status: status });
        }
      }
    }
  };

  // Function to handle category change
  const handleCategoryChange = (id: string, category: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    if (updateTask) {
      updateTask(id, { category });
    }
  };

  // Function to toggle task status between todo and in-progress (play/pause)
  const togglePlayPause = (task: Task) => {
    if (!updateTask) return;
    const newStatus = task.status === 'in-progress' ? 'todo' : 'in-progress';
    updateTask(task.id, { status: newStatus });
  };

  // Function to cycle through priority levels
  const cyclePriority = (task: Task) => {
    if (!updateTask) {
      console.log('updateTask function is not available');
      return;
    }
    
    console.log('Current task priority:', task.priority);
    
    const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const currentIndex = task.priority ? priorities.indexOf(task.priority) : 0;
    
    console.log('Current priority index:', currentIndex);
    
    const nextIndex = (currentIndex + 1) % priorities.length;
    const newPriority = priorities[nextIndex];
    
    console.log('New priority:', newPriority);
    
    updateTask(task.id, { priority: newPriority });
  };

  // Function to handle task completion toggle
  const completeTask = (task: Task) => {
    if (!updateTask) return;
    
    // Toggle between completed and previous state (todo or in-progress)
    const newStatus = task.status === 'completed' 
      ? (task.prevStatus || 'todo') // Use previous status if available, otherwise 'todo'
      : 'completed';
    
    // Save the current status as prevStatus only when marking as completed
    const prevStatus = task.status === 'completed' ? undefined : task.status;
    
    updateTask(task.id, { 
      status: newStatus,
      prevStatus: prevStatus
    });
  };

  return (
    <div className="task-list">
      <h2>Tasks</h2>
      
      {tasks.length === 0 ? (
        <p>No tasks available. Add a task to get started!</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <li key={task.id} className={`task-item ${task.status}`}>
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-badges">
                  <span className={`priority ${getPriorityClass(task.priority)}`}>
                    {task.priority || 'No priority'}
                  </span>
                  <span className={`category category-${task.category}`}>
                    {task.category}
                  </span>
                </div>
              </div>
              
              <p className="task-description">{task.description || 'No description'}</p>
              
              <div className="task-footer">
                <span className="due-date">Due: {formatDate(task.dueDate)}</span>
                
                <div className="task-actions">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(
                      task.id, 
                      e.target.value as 'todo' | 'in-progress' | 'completed'
                    )}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  <select
                    value={task.category}
                    onChange={(e) => handleCategoryChange(
                      task.id, 
                      e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                    )}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  
                  {deleteTask && (
                    <button 
                      className="delete-btn" 
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              
              <div className="task-summary-actions">
                <button 
                  className={`action-btn play-pause-btn ${task.status === 'in-progress' ? 'pause' : 'play'}`}
                  onClick={() => togglePlayPause(task)}
                  title={task.status === 'in-progress' ? 'Pause task' : 'Start task'}
                  disabled={task.status === 'completed'}
                >
                  {task.status === 'in-progress' ? '⏸️' : '▶️'}
                </button>
                
                <button 
                  className={`action-btn priority-flag-btn priority-${task.priority}`}
                  onClick={() => cyclePriority(task)}
                  title={`Current priority: ${task.priority || 'none'} - Click to change`}
                >
                  {task.priority === 'high' ? '🔴' : 
                   task.priority === 'medium' ? '🟠' : 
                   task.priority === 'low' ? '🟢' : '🚩'}
                </button>
                
                <div className="complete-divide-dropdown">
                  <button 
                    className="action-btn complete-btn"
                    onClick={() => completeTask(task)}
                    title={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    {task.status === 'completed' ? '↩️' : '✓'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList; 