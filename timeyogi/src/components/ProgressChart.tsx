import React, { useEffect, useRef } from 'react';

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

interface ProgressChartProps {
  tasks: Task[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ tasks }) => {
  const statusCanvasRef = useRef<HTMLCanvasElement>(null);
  const categoryCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw status chart
  useEffect(() => {
    if (!statusCanvasRef.current) return;

    const canvas = statusCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const todoTasks = tasks.filter(task => task.status === 'todo').length;

    // If no tasks, show a message
    if (totalTasks === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No tasks to display', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Define colors
    const colors = {
      completed: '#4CAF50', // Green
      inProgress: '#2196F3', // Blue
      todo: '#F44336' // Red
    };

    // Draw segments
    let startAngle = 0;
    
    // Completed tasks
    if (completedTasks > 0) {
      const completedAngle = (completedTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + completedAngle);
      ctx.closePath();
      ctx.fillStyle = colors.completed;
      ctx.fill();
      startAngle += completedAngle;
    }
    
    // In-progress tasks
    if (inProgressTasks > 0) {
      const inProgressAngle = (inProgressTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + inProgressAngle);
      ctx.closePath();
      ctx.fillStyle = colors.inProgress;
      ctx.fill();
      startAngle += inProgressAngle;
    }
    
    // Todo tasks
    if (todoTasks > 0) {
      const todoAngle = (todoTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + todoAngle);
      ctx.closePath();
      ctx.fillStyle = colors.todo;
      ctx.fill();
    }

    // Draw legend
    const legendX = 20;
    let legendY = 30;
    const legendSpacing = 25;
    
    // Completed tasks legend
    ctx.fillStyle = colors.completed;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Completed: ${completedTasks}`, legendX + 25, legendY + 12);
    legendY += legendSpacing;
    
    // In-progress tasks legend
    ctx.fillStyle = colors.inProgress;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText(`In Progress: ${inProgressTasks}`, legendX + 25, legendY + 12);
    legendY += legendSpacing;
    
    // Todo tasks legend
    ctx.fillStyle = colors.todo;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText(`To Do: ${todoTasks}`, legendX + 25, legendY + 12);
    
    // Draw completion percentage
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${completionPercentage}% Complete`, centerX, canvas.height - 20);
  }, [tasks]);

  // Draw category chart
  useEffect(() => {
    if (!categoryCanvasRef.current) return;

    const canvas = categoryCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate task statistics by category
    const totalTasks = tasks.length;
    const dailyTasks = tasks.filter(task => task.category === 'daily').length;
    const weeklyTasks = tasks.filter(task => task.category === 'weekly').length;
    const monthlyTasks = tasks.filter(task => task.category === 'monthly').length;
    const yearlyTasks = tasks.filter(task => task.category === 'yearly').length;

    // If no tasks, show a message
    if (totalTasks === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666';
      ctx.textAlign = 'center';
      ctx.fillText('No tasks to display', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Draw pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Define colors
    const colors = {
      daily: '#1976d2', // Blue
      weekly: '#388e3c', // Green
      monthly: '#ffa000', // Amber
      yearly: '#c2185b'  // Pink
    };

    // Draw segments
    let startAngle = 0;
    
    // Daily tasks
    if (dailyTasks > 0) {
      const dailyAngle = (dailyTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + dailyAngle);
      ctx.closePath();
      ctx.fillStyle = colors.daily;
      ctx.fill();
      startAngle += dailyAngle;
    }
    
    // Weekly tasks
    if (weeklyTasks > 0) {
      const weeklyAngle = (weeklyTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + weeklyAngle);
      ctx.closePath();
      ctx.fillStyle = colors.weekly;
      ctx.fill();
      startAngle += weeklyAngle;
    }
    
    // Monthly tasks
    if (monthlyTasks > 0) {
      const monthlyAngle = (monthlyTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + monthlyAngle);
      ctx.closePath();
      ctx.fillStyle = colors.monthly;
      ctx.fill();
      startAngle += monthlyAngle;
    }
    
    // Yearly tasks
    if (yearlyTasks > 0) {
      const yearlyAngle = (yearlyTasks / totalTasks) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + yearlyAngle);
      ctx.closePath();
      ctx.fillStyle = colors.yearly;
      ctx.fill();
    }

    // Draw legend
    const legendX = 20;
    let legendY = 30;
    const legendSpacing = 25;
    
    // Daily tasks legend
    ctx.fillStyle = colors.daily;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Daily: ${dailyTasks}`, legendX + 25, legendY + 12);
    legendY += legendSpacing;
    
    // Weekly tasks legend
    ctx.fillStyle = colors.weekly;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText(`Weekly: ${weeklyTasks}`, legendX + 25, legendY + 12);
    legendY += legendSpacing;
    
    // Monthly tasks legend
    ctx.fillStyle = colors.monthly;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText(`Monthly: ${monthlyTasks}`, legendX + 25, legendY + 12);
    legendY += legendSpacing;
    
    // Yearly tasks legend
    ctx.fillStyle = colors.yearly;
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#000';
    ctx.fillText(`Yearly: ${yearlyTasks}`, legendX + 25, legendY + 12);
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tasks by Category', centerX, canvas.height - 20);
  }, [tasks]);

  return (
    <div className="progress-chart">
      <h2>Task Progress</h2>
      <div className="chart-container">
        <div className="chart">
          <h3>Status Distribution</h3>
          <canvas ref={statusCanvasRef} width={400} height={300} />
        </div>
        <div className="chart">
          <h3>Category Distribution</h3>
          <canvas ref={categoryCanvasRef} width={400} height={300} />
        </div>
      </div>
    </div>
  );
};

export default ProgressChart; 