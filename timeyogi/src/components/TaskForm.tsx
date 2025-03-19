import React, { useState, useEffect } from 'react';

// Import the Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  category: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface TaskFormProps {
  addTask: (task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ addTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  
  // State for time scroller
  const [hourValue, setHourValue] = useState(9); // Default to 9 AM
  const [minuteValue, setMinuteValue] = useState(0); // Default to 0 minutes
  const [amPm, setAmPm] = useState('AM');
  
  // Set default time to the current hour rounded to the nearest 15 minutes
  useEffect(() => {
    if (!dueTime) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const roundedMinutes = Math.round(minutes / 15) * 15 % 60; // Ensure it's 0, 15, 30, or 45
      
      // Format the time as HH:MM
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = roundedMinutes.toString().padStart(2, '0');
      
      setDueTime(`${formattedHours}:${formattedMinutes}`);
      
      // Also update the scroller values
      if (hours >= 12) {
        setHourValue(hours === 12 ? 12 : hours - 12);
        setAmPm('PM');
      } else {
        setHourValue(hours === 0 ? 12 : hours);
        setAmPm('AM');
      }
      setMinuteValue(roundedMinutes);
    }
  }, []); // Only run once when component mounts

  // Update time input when scroller values change
  useEffect(() => {
    // Convert 12-hour to 24-hour for the input field
    let hours24 = hourValue;
    if (amPm === 'PM' && hourValue !== 12) {
      hours24 = hourValue + 12;
    } else if (amPm === 'AM' && hourValue === 12) {
      hours24 = 0;
    }
    
    // Format time for the input field
    const formattedHours = hours24.toString().padStart(2, '0');
    const formattedMinutes = minuteValue.toString().padStart(2, '0');
    setDueTime(`${formattedHours}:${formattedMinutes}`);
  }, [hourValue, minuteValue, amPm]);

  // Update scroller values when time input changes manually
  useEffect(() => {
    if (dueTime) {
      const [hoursStr, minutesStr] = dueTime.split(':');
      const hours24 = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (!isNaN(hours24) && !isNaN(minutes)) {
        // Set AM/PM
        if (hours24 >= 12) {
          setAmPm('PM');
          setHourValue(hours24 === 12 ? 12 : hours24 - 12);
        } else {
          setAmPm('AM');
          setHourValue(hours24 === 0 ? 12 : hours24);
        }
        setMinuteValue(minutes);
      }
    }
  }, [dueTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new task object
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      dueDate: dueDate ? createDateWithTime(dueDate, dueTime) : undefined,
      priority,
      status: 'todo',
      category
    };
    
    // Add the task
    addTask(newTask);
    
    // Reset form fields
    setTitle('');
    setDescription('');
    setDueDate('');
    
    // Reset time to the current rounded time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.round(minutes / 15) * 15 % 60;
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = roundedMinutes.toString().padStart(2, '0');
    setDueTime(`${formattedHours}:${formattedMinutes}`);
    
    // Reset scroller values
    if (hours >= 12) {
      setHourValue(hours === 12 ? 12 : hours - 12);
      setAmPm('PM');
    } else {
      setHourValue(hours === 0 ? 12 : hours);
      setAmPm('AM');
    }
    setMinuteValue(roundedMinutes);
    
    setPriority('medium');
    setCategory('daily');
  };

  // Helper function to combine date and time
  const createDateWithTime = (dateString: string, timeString: string): Date => {
    const date = new Date(dateString);
    
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number);
      date.setHours(hours || 0);
      date.setMinutes(minutes || 0);
      date.setSeconds(0);
    } else {
      // Default to start of day if no time provided
      date.setHours(0, 0, 0, 0);
    }
    
    return date;
  };

  // Helper function to set common time presets
  const setTimePreset = (preset: string) => {
    let hour = 0;
    let minute = 0;
    let period = 'AM';
    
    switch(preset) {
      case 'morning':
        hour = 9;
        minute = 0;
        period = 'AM';
        break;
      case '11:30':
        hour = 11;
        minute = 30;
        period = 'AM';
        break;
      case 'noon':
        hour = 12;
        minute = 0;
        period = 'PM';
        break;
      case 'afternoon':
        hour = 3;
        minute = 0;
        period = 'PM';
        break;
      case 'evening':
        hour = 6;
        minute = 0;
        period = 'PM';
        break;
      default:
        return;
    }
    
    // Update scroller values
    setHourValue(hour);
    setMinuteValue(minute);
    setAmPm(period);
    
    // Convert to 24-hour for the input
    let hours24 = hour;
    if (period === 'PM' && hour !== 12) {
      hours24 = hour + 12;
    } else if (period === 'AM' && hour === 12) {
      hours24 = 0;
    }
    
    // Format time string for the input field
    const formattedHours = hours24.toString().padStart(2, '0');
    const formattedMinutes = minute.toString().padStart(2, '0');
    setDueTime(`${formattedHours}:${formattedMinutes}`);
  };

  // Generate hour options for scroller (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minute options for scroller (0-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);
  
  // Format display time for the current selection
  const formatDisplayTime = () => {
    const displayMinute = minuteValue < 10 ? `0${minuteValue}` : minuteValue;
    return `${hourValue}:${displayMinute} ${amPm}`;
  };

  return (
    <div className="task-form">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="form-group date-time-group">
          <div className="date-input">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="time-input">
            <label htmlFor="dueTime">Time</label>
            <input
              type="time"
              id="dueTime"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              placeholder="hh:mm"
            />
          </div>
        </div>
        
        {/* Time Scroller */}
        <div className="form-group time-scroller-group">
          <label>Time Scroller: <span className="current-time">{formatDisplayTime()}</span></label>
          <div className="time-scroller">
            <div className="scroller-section hour-scroller">
              <button 
                type="button" 
                className="scroller-btn up"
                onClick={() => setHourValue(prev => prev === 12 ? 1 : prev + 1)}
              >
                ▲
              </button>
              <div className="scroller-display">
                {hourValue}
              </div>
              <button 
                type="button" 
                className="scroller-btn down"
                onClick={() => setHourValue(prev => prev === 1 ? 12 : prev - 1)}
              >
                ▼
              </button>
            </div>
            
            <div className="time-separator">:</div>
            
            <div className="scroller-section minute-scroller">
              <button 
                type="button" 
                className="scroller-btn up"
                onClick={() => setMinuteValue(prev => (prev + 5) % 60)}
              >
                ▲
              </button>
              <div className="scroller-display">
                {minuteValue < 10 ? `0${minuteValue}` : minuteValue}
              </div>
              <button 
                type="button" 
                className="scroller-btn down"
                onClick={() => setMinuteValue(prev => (prev - 5 + 60) % 60)}
              >
                ▼
              </button>
            </div>
            
            <div className="scroller-section ampm-scroller">
              <button 
                type="button" 
                className="scroller-btn up"
                onClick={() => setAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
              >
                ▲
              </button>
              <div className="scroller-display">
                {amPm}
              </div>
              <button 
                type="button" 
                className="scroller-btn down"
                onClick={() => setAmPm(prev => prev === 'AM' ? 'PM' : 'AM')}
              >
                ▼
              </button>
            </div>
          </div>
          
          {/* Fine-tune minute controls */}
          <div className="minute-fine-tune">
            <button type="button" className="minute-btn" onClick={() => setMinuteValue(0)}>:00</button>
            <button type="button" className="minute-btn" onClick={() => setMinuteValue(15)}>:15</button>
            <button type="button" className="minute-btn" onClick={() => setMinuteValue(30)}>:30</button>
            <button type="button" className="minute-btn" onClick={() => setMinuteValue(45)}>:45</button>
          </div>
        </div>
        
        {/* Time Presets */}
        <div className="form-group time-presets">
          <label>Time Presets</label>
          <div className="preset-buttons">
            <button 
              type="button" 
              onClick={() => setTimePreset('morning')}
              className="preset-btn"
            >
              9:00 AM
            </button>
            <button 
              type="button" 
              onClick={() => setTimePreset('11:30')}
              className="preset-btn"
            >
              11:30 AM
            </button>
            <button 
              type="button" 
              onClick={() => setTimePreset('noon')}
              className="preset-btn"
            >
              12:00 PM
            </button>
            <button 
              type="button" 
              onClick={() => setTimePreset('afternoon')}
              className="preset-btn"
            >
              3:00 PM
            </button>
            <button 
              type="button" 
              onClick={() => setTimePreset('evening')}
              className="preset-btn"
            >
              6:00 PM
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <div className="priority-selector">
            <label className={`priority-option priority-low ${priority === 'low' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="priority"
                value="low"
                checked={priority === 'low'}
                onChange={() => setPriority('low')}
              />
              <span className="priority-label">
                <span className="priority-icon">🟢</span> Low
              </span>
            </label>
            
            <label className={`priority-option priority-medium ${priority === 'medium' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="priority"
                value="medium"
                checked={priority === 'medium'}
                onChange={() => setPriority('medium')}
              />
              <span className="priority-label">
                <span className="priority-icon">🟠</span> Medium
              </span>
            </label>
            
            <label className={`priority-option priority-high ${priority === 'high' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="priority"
                value="high"
                checked={priority === 'high'}
                onChange={() => setPriority('high')}
              />
              <span className="priority-label">
                <span className="priority-icon">🔴</span> High
              </span>
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
};

export default TaskForm; 