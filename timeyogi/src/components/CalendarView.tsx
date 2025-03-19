import React, { useEffect, useState } from 'react';

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

type ViewType = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface CalendarViewProps {
  tasks: Task[];
  currentView: ViewType;
  addTask?: (task: Task) => void; // Make addTask optional
  onDateClick?: (date: Date) => void; // Add new prop for date click
  selectedDate?: Date; // Add selected date prop
}

// Helper function to get completion color based on task completion percentage
const getCompletionColor = (tasks: Task[]): string => {
  if (tasks.length === 0) return '';
  
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = completedTasks / tasks.length;
  
  if (completionRate >= 0.7) return 'high-completion'; // Green for high completion (≥70%)
  if (completionRate >= 0.3) return 'medium-completion'; // Brown for medium completion (30-69%)
  return 'low-completion'; // Orange for low completion (<30%)
};

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, currentView, addTask, onDateClick, selectedDate }) => {
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [completionByDate, setCompletionByDate] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Add state for the task popup
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // State for time scroller in the popup
  const [popupAmPm, setPopupAmPm] = useState('AM');

  // Log tasks received to help debug
  useEffect(() => {
    console.log('CalendarView received tasks:', tasks);
  }, [tasks]);

  // Generate calendar days based on current view and date
  useEffect(() => {
    setIsLoading(true);
    let days: Date[] = [];
    
    switch (currentView) {
      case 'daily':
        // Just one day for daily view - the selected date or current date
        days = [new Date(currentDate)];
        break;
        
      case 'weekly':
        // Get start of week (Sunday)
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        // Generate 7 days from Sunday to Saturday
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          days.push(day);
        }
        break;
        
      case 'monthly':
        // Get first day of month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
        const firstDayOfWeek = firstDay.getDay();
        
        // Calculate the date to start the calendar (previous month's days to fill the first week)
        const startDate = new Date(firstDay);
        startDate.setDate(firstDay.getDate() - firstDayOfWeek);
        
        // Generate 42 days (6 weeks) to ensure we always have enough days to display
        for (let i = 0; i < 42; i++) {
          const day = new Date(startDate);
          day.setDate(startDate.getDate() + i);
          days.push(day);
        }
        break;
        
      case 'yearly':
        // Get first day of each month for the current year
        for (let month = 0; month < 12; month++) {
          days.push(new Date(currentDate.getFullYear(), month, 1));
        }
        break;
    }
    
    setCalendarDays(days);
    setIsLoading(false);
  }, [currentView, currentDate]);

  // Group tasks by date
  useEffect(() => {
    const groupedTasks: Record<string, Task[]> = {};
    const completionStatus: Record<string, string> = {};
    
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString();
        if (!groupedTasks[dateKey]) {
          groupedTasks[dateKey] = [];
        }
        groupedTasks[dateKey].push(task);
      }
    });
    
    // Calculate completion status for each date
    for (const dateKey in groupedTasks) {
      completionStatus[dateKey] = getCompletionColor(groupedTasks[dateKey]);
    }
    
    setTasksByDate(groupedTasks);
    setCompletionByDate(completionStatus);
  }, [tasks]);

  // Format 24-hour to 12-hour time with AM/PM for the scroller
  useEffect(() => {
    if (selectedHour !== null) {
      if (selectedHour >= 12) {
        setPopupAmPm('PM');
      } else {
        setPopupAmPm('AM');
      }
    }
  }, [selectedHour]);

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'daily':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'yearly':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Check if a date is today
  const isToday = (date: Date | undefined) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Check if a date is in the current month (for monthly view)
  const isCurrentMonth = (date: Date | undefined) => {
    if (!date) return false;
    return date.getMonth() === currentDate.getMonth();
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Loading...';
    const options: Intl.DateTimeFormatOptions = {};
    
    switch (currentView) {
      case 'daily':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'weekly':
        options.weekday = 'short';
        options.month = 'short';
        options.day = 'numeric';
        break;
      case 'monthly':
        options.day = 'numeric';
        break;
      case 'yearly':
        options.month = 'long';
        break;
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  // Get calendar title
  const getCalendarTitle = () => {
    if (isLoading || calendarDays.length === 0) return 'Loading...';
    
    switch (currentView) {
      case 'daily':
        return formatDate(calendarDays[0]);
      case 'weekly':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(startOfWeek)} - ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(endOfWeek)}`;
      case 'monthly':
        return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);
      case 'yearly':
        return currentDate.getFullYear().toString();
      default:
        return '';
    }
  };

  // Get completion class for a date
  const getCompletionClass = (date: Date | undefined) => {
    if (!date) return '';
    const dateKey = date.toDateString();
    return completionByDate[dateKey] || '';
  };

  // Handle hour slot click - Update to preselect better default minutes
  const handleHourClick = (hour: number) => {
    if (!addTask) return; // Only proceed if addTask is provided
    setSelectedHour(hour);
    
    // Default to common time intervals (0, 15, 30, 45 minutes)
    // Get current minutes and round to nearest 15
    const now = new Date();
    const currentMinutes = now.getMinutes();
    const roundedMinutes = Math.round(currentMinutes / 15) * 15;
    
    // If clicking for the current hour, use rounded current minutes
    // Otherwise start with either 0 or 30 minutes
    if (hour === now.getHours()) {
      setSelectedMinute(roundedMinutes);
    } else {
      setSelectedMinute(0); // Default to start of hour
    }
    
    // Set AM/PM for the popup
    if (hour >= 12) {
      setPopupAmPm('PM');
    } else {
      setPopupAmPm('AM');
    }
    
    setShowTaskPopup(true);
  };

  // Handle adding a new task
  const handleAddTask = () => {
    if (!addTask || selectedHour === null || !calendarDays[0] || !newTaskTitle.trim()) return;
    
    // Create a new date for the selected hour and minute
    const taskDate = new Date(calendarDays[0]);
    taskDate.setHours(selectedHour, selectedMinute, 0, 0);
    
    // Create a new task
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      dueDate: taskDate,
      priority: 'medium',
      status: 'todo',
      category: currentView as 'daily' | 'weekly' | 'monthly' | 'yearly'
    };
    
    // Add the task
    addTask(newTask);
    
    // Reset the form
    setNewTaskTitle('');
    setShowTaskPopup(false);
    setSelectedHour(null);
    setSelectedMinute(0);
  };

  // Format time for display (with hours and minutes)
  const formatTimeWithMinutes = (hour: number, minute: number): string => {
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute < 10 ? `0${minute}` : minute;
    return `${displayHour}:${displayMinute} ${isPM ? 'PM' : 'AM'}`;
  };

  // Generate common minute options for quick selection
  const commonMinuteOptions = [0, 15, 30, 45];

  // Create complete minute options array for the dropdown
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i);

  // Handle time scroller changes
  const handleHourChange = (direction: 'up' | 'down') => {
    if (selectedHour === null) return;
    
    let newHour = selectedHour;
    if (direction === 'up') {
      newHour = (selectedHour + 1) % 24;
    } else {
      newHour = (selectedHour - 1 + 24) % 24;
    }
    
    setSelectedHour(newHour);
    
    // Update AM/PM
    if (newHour >= 12) {
      setPopupAmPm('PM');
    } else {
      setPopupAmPm('AM');
    }
  };
  
  const handleMinuteChange = (direction: 'up' | 'down') => {
    let newMinute = selectedMinute;
    
    // Increment/decrement by 5 minutes
    if (direction === 'up') {
      newMinute = (selectedMinute + 5) % 60;
    } else {
      newMinute = (selectedMinute - 5 + 60) % 60;
    }
    
    setSelectedMinute(newMinute);
  };
  
  const handleAmPmToggle = () => {
    if (selectedHour === null) return;
    
    const newAmPm = popupAmPm === 'AM' ? 'PM' : 'AM';
    setPopupAmPm(newAmPm);
    
    // Adjust hour based on AM/PM toggle
    // If going from AM to PM, add 12 hours (unless it's noon)
    // If going from PM to AM, subtract 12 hours (unless it's midnight)
    let newHour = selectedHour;
    if (newAmPm === 'PM' && selectedHour < 12) {
      newHour = selectedHour + 12;
    } else if (newAmPm === 'AM' && selectedHour >= 12) {
      newHour = selectedHour - 12;
    }
    
    setSelectedHour(newHour);
  };
  
  const handleQuickMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
  };

  // Render calendar based on current view
  const renderCalendar = () => {
    if (isLoading || calendarDays.length === 0) {
      return <div className="loading-calendar">Loading calendar...</div>;
    }
    
    switch (currentView) {
      case 'daily':
        // Create an array of hours for the day
        const hours = Array.from({ length: 24 }, (_, i) => i);
        
        // Group tasks by hour
        const tasksByHour: Record<number, Task[]> = {};
        
        if (calendarDays[0] && tasksByDate[calendarDays[0]?.toDateString()]) {
          tasksByDate[calendarDays[0]?.toDateString()].forEach(task => {
            if (task.dueDate) {
              const hour = new Date(task.dueDate).getHours();
              if (!tasksByHour[hour]) {
                tasksByHour[hour] = [];
              }
              tasksByHour[hour].push(task);
            }
          });
        }
        
        return (
          <div className="daily-calendar">
            {calendarDays[0] ? (
              <div className={`calendar-day ${getCompletionClass(calendarDays[0])}`}>
                <div className="day-header">
                  <h3>{formatDate(calendarDays[0])}</h3>
                </div>
                
                <div className="day-summary">
                  {calendarDays[0] && tasksByDate[calendarDays[0]?.toDateString()] ? (
                    <div className="task-summary">
                      <div className="task-count">
                        {tasksByDate[calendarDays[0]?.toDateString()].length} tasks
                      </div>
                      <div className="completion-summary">
                        {tasksByDate[calendarDays[0]?.toDateString()].filter(task => task.status === 'completed').length} completed
                      </div>
                      <div className="category-summary">
                        {Object.entries(
                          tasksByDate[calendarDays[0]?.toDateString()].reduce((acc, task) => {
                            acc[task.category] = (acc[task.category] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([category, count]) => (
                          <span key={category} className={`category-badge category-${category}`}>
                            {category}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="no-tasks">No tasks for today</p>
                  )}
                </div>
                
                <div className="hourly-view">
                  {hours.map(hour => {
                    const formattedHour = hour === 0 ? '12 AM' : 
                                          hour < 12 ? `${hour} AM` : 
                                          hour === 12 ? '12 PM' : 
                                          `${hour - 12} PM`;
                    
                    const tasksForHour = tasksByHour[hour] || [];
                    // Sort tasks by minutes within the hour
                    tasksForHour.sort((a, b) => {
                      const aMinutes = a.dueDate ? new Date(a.dueDate).getMinutes() : 0;
                      const bMinutes = b.dueDate ? new Date(b.dueDate).getMinutes() : 0;
                      return aMinutes - bMinutes;
                    });
                    
                    const isCurrentHour = new Date().getHours() === hour && calendarDays[0] && isToday(calendarDays[0]);
                    
                    return (
                      <div 
                        key={hour} 
                        className={`hour-slot ${isCurrentHour ? 'current-hour' : ''} ${addTask ? 'clickable' : ''}`}
                        onClick={() => addTask && handleHourClick(hour)}
                      >
                        <div className="hour-label">{formattedHour}</div>
                        <div className="hour-tasks">
                          {tasksForHour.length > 0 ? (
                            tasksForHour.map(task => (
                              <div 
                                key={task.id} 
                                className={`hour-task priority-${task.priority} status-${task.status} category-${task.category}`}
                                style={{
                                  borderLeftColor: task.priority === 'high' ? '#e74c3c' : 
                                                  task.priority === 'medium' ? '#f39c12' : '#3498db'
                                }}
                              >
                                <span className="task-time">
                                  {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : ''}
                                </span>
                                <span className="task-title">{task.title}</span>
                                <span className="task-status">{task.status}</span>
                              </div>
                            ))
                          ) : (
                            <div className="no-hour-tasks"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="loading-calendar">Loading calendar...</div>
            )}
          </div>
        );

      case 'weekly':
        return (
          <div className="weekly-calendar">
            <div className="week-days">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`week-day ${isToday(day) ? 'today' : ''} ${getCompletionClass(day)} ${onDateClick ? 'clickable' : ''}`}
                  onClick={() => onDateClick && onDateClick(day)}
                >
                  <div className="day-header">
                    <h3>{formatDate(day)}</h3>
                  </div>
                  <div className="day-tasks-compact">
                    {tasksByDate[day.toDateString()] ? (
                      <div className="task-summary">
                        <div className="task-count">
                          {tasksByDate[day.toDateString()].length} tasks
                        </div>
                        <div className="completion-summary">
                          {tasksByDate[day.toDateString()].filter(task => task.status === 'completed').length} completed
                        </div>
                        <div className="category-summary">
                          {Object.entries(
                            tasksByDate[day.toDateString()].reduce((acc, task) => {
                              acc[task.category] = (acc[task.category] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)
                          ).map(([category, count]) => (
                            <span key={category} className={`category-badge category-${category}`}>
                              {category}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="no-tasks">No tasks</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'monthly':
        return (
          <div className="monthly-calendar">
            <div className="weekday-headers">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday-header">{day}</div>
              ))}
            </div>
            <div className="month-days">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`month-day ${isToday(day) ? 'today' : ''} ${isCurrentMonth(day) ? 'current-month' : 'other-month'} ${getCompletionClass(day)} ${onDateClick ? 'clickable' : ''}`}
                  onClick={() => onDateClick && onDateClick(day)}
                >
                  <div className="day-number">{day.getDate()}</div>
                  <div className="day-tasks">
                    {day && tasksByDate[day.toDateString()] && (
                      <div className="task-count-small">
                        {tasksByDate[day.toDateString()].length}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'yearly':
        return (
          <div className="yearly-calendar">
            <div className="months">
              {calendarDays.map((day, index) => {
                if (!day) return null;
                
                // Calculate completion class for the month
                const monthStart = new Date(day.getFullYear(), day.getMonth(), 1);
                const monthEnd = new Date(day.getFullYear(), day.getMonth() + 1, 0);
                
                let monthTasks: Task[] = [];
                for (const dateKey in tasksByDate) {
                  const taskDate = new Date(dateKey);
                  if (taskDate >= monthStart && taskDate <= monthEnd) {
                    monthTasks = [...monthTasks, ...tasksByDate[dateKey]];
                  }
                }
                
                const completionClass = getCompletionColor(monthTasks);
                
                return (
                  <div key={index} className={`year-month ${completionClass}`}>
                    <div className="month-header">
                      <h3>{formatDate(day)}</h3>
                    </div>
                    <div className="month-task-count">
                      {monthTasks.length > 0 ? (
                        <div className="task-summary">
                          <div className="task-count">
                            {monthTasks.length} tasks
                          </div>
                          <div className="completion-summary">
                            {monthTasks.filter(task => task.status === 'completed').length} completed
                          </div>
                          <div className="category-summary">
                            {Object.entries(
                              monthTasks.reduce((acc, task) => {
                                acc[task.category] = (acc[task.category] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>)
                            ).map(([category, count]) => (
                              <span key={category} className={`category-badge category-${category}`}>
                                {category}: {count}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="no-tasks">No tasks</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default:
        return <div className="loading-calendar">Invalid view type</div>;
    }
  };

  // When selected date changes, update the currentDate
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={goToPrevious}>Previous</button>
        <h2>{getCalendarTitle()}</h2>
        <button onClick={goToNext}>Next</button>
      </div>
      
      {renderCalendar()}
      
      {/* Task Popup with Time Selection */}
      {showTaskPopup && selectedHour !== null && (
        <div className="task-popup-overlay">
          <div className="task-popup">
            <h3>Add Task for {formatTimeWithMinutes(selectedHour, selectedMinute)}</h3>
            
            {/* Time Scroller */}
            <div className="time-scroller-group popup-time-scroller">
              <label>Select Time: <span className="current-time">{formatTimeWithMinutes(selectedHour, selectedMinute)}</span></label>
              <div className="time-scroller">
                <div className="scroller-section hour-scroller">
                  <button 
                    type="button" 
                    className="scroller-btn up"
                    onClick={() => handleHourChange('up')}
                  >
                    ▲
                  </button>
                  <div className="scroller-display">
                    {selectedHour === 0 || selectedHour === 12 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour}
                  </div>
                  <button 
                    type="button" 
                    className="scroller-btn down"
                    onClick={() => handleHourChange('down')}
                  >
                    ▼
                  </button>
                </div>
                
                <div className="time-separator">:</div>
                
                <div className="scroller-section minute-scroller">
                  <button 
                    type="button" 
                    className="scroller-btn up"
                    onClick={() => handleMinuteChange('up')}
                  >
                    ▲
                  </button>
                  <div className="scroller-display">
                    {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                  </div>
                  <button 
                    type="button" 
                    className="scroller-btn down"
                    onClick={() => handleMinuteChange('down')}
                  >
                    ▼
                  </button>
                </div>
                
                <div className="scroller-section ampm-scroller">
                  <button 
                    type="button" 
                    className="scroller-btn up"
                    onClick={handleAmPmToggle}
                  >
                    ▲
                  </button>
                  <div className="scroller-display">
                    {popupAmPm}
                  </div>
                  <button 
                    type="button" 
                    className="scroller-btn down"
                    onClick={handleAmPmToggle}
                  >
                    ▼
                  </button>
                </div>
              </div>
              
              {/* Fine-tune minute controls */}
              <div className="minute-fine-tune">
                <button type="button" className="minute-btn" onClick={() => handleQuickMinuteSelect(0)}>:00</button>
                <button type="button" className="minute-btn" onClick={() => handleQuickMinuteSelect(15)}>:15</button>
                <button type="button" className="minute-btn" onClick={() => handleQuickMinuteSelect(30)}>:30</button>
                <button type="button" className="minute-btn" onClick={() => handleQuickMinuteSelect(45)}>:45</button>
              </div>
            </div>
            
            <div className="time-selector">
              <select 
                value={selectedHour}
                onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              >
                {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                  <option key={`hour-${hour}`} value={hour}>
                    {hour === 0 ? '12 AM' : 
                     hour < 12 ? `${hour} AM` : 
                     hour === 12 ? '12 PM' : 
                     `${hour - 12} PM`}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedMinute}
                onChange={(e) => setSelectedMinute(parseInt(e.target.value))}
              >
                {/* Show common minute values at the top for easy access */}
                <optgroup label="Common Times">
                  {commonMinuteOptions.map(minute => (
                    <option key={`common-minute-${minute}`} value={minute}>
                      {minute < 10 ? `0${minute}` : minute}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="All Minutes">
                  {minuteOptions.map(minute => (
                    <option key={`minute-${minute}`} value={minute}>
                      {minute < 10 ? `0${minute}` : minute}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Enter task name"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              autoFocus
            />
            
            <div className="task-popup-actions">
              <button onClick={() => setShowTaskPopup(false)}>Cancel</button>
              <button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView; 