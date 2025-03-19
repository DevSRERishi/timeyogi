import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db';

class Task extends Model {
  public id!: string;
  public title!: string;
  public description?: string;
  public dueDate?: Date;
  public priority?: 'low' | 'medium' | 'high';
  public status!: 'todo' | 'in-progress' | 'completed';
  public category!: 'daily' | 'weekly' | 'monthly' | 'yearly';
  public prevStatus?: 'todo' | 'in-progress';
  
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'completed'),
      allowNull: false,
      defaultValue: 'todo'
    },
    category: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'daily'
    },
    prevStatus: {
      type: DataTypes.ENUM('todo', 'in-progress'),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    timestamps: true
  }
);

export default Task; 