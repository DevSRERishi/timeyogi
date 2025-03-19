// Define the Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
  prevStatus?: 'todo' | 'in-progress'; // Add prevStatus to store previous state
}

// Simple Task Summary component to replace ProgressChart
const TaskSummary: React.FC<{ 
  tasks: Task[]; 
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask?: (id: string) => void; // Add deleteTask function as an optional prop
}> = ({ tasks, updateTask, deleteTask }) => {
  // Function to toggle task status between todo and in-progress (play/pause)
  const togglePlayPause = (task: Task) => {
    const newStatus = task.status === 'in-progress' ? 'todo' : 'in-progress';
    updateTask(task.id, { status: newStatus });
  };

  // Function to cycle through priority levels
  const cyclePriority = (task: Task) => {
    console.log('TaskSummary - Current task priority:', task.priority);
    
    const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const currentIndex = task.priority ? priorities.indexOf(task.priority) : 0;
    
    console.log('TaskSummary - Current priority index:', currentIndex);
    
    const nextIndex = (currentIndex + 1) % priorities.length;
    const newPriority = priorities[nextIndex];
    
    console.log('TaskSummary - New priority:', newPriority);
    
    updateTask(task.id, { priority: newPriority });
  };

  // Function to handle task completion toggle
  const completeTask = (task: Task) => {
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
    <div className="task-summary-container">
      <h3>All Tasks</h3>
      {tasks.length === 0 ? (
        <p className="no-tasks">No tasks available</p>
      ) : (
        <div className="task-summary-list">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`task-summary-item priority-${task.priority} status-${task.status}`}
            >
              <div className="task-summary-title">{task.title}</div>
              <div className="task-summary-details">
                <span className={`task-status status-${task.status}`}>
                  {task.status}
                </span>
                {task.priority && (
                  <span className={`task-priority priority-${task.priority}`}>
                    {task.priority}
                  </span>
                )}
                {task.dueDate && (
                  <span className="task-due-date">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
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
                
                <button 
                  className="action-btn complete-btn"
                  onClick={() => completeTask(task)}
                  title={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.status === 'completed' ? '↩️' : '✓'}
                </button>
                
                {/* Add delete button */}
                {deleteTask && (
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSummary; 