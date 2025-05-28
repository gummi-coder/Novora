import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface AlertAttributes {
  id: number;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  source: string;
  status: 'active' | 'resolved' | 'acknowledged';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

class Alert extends Model<AlertAttributes> implements AlertAttributes {
  public id!: number;
  public type!: 'error' | 'warning' | 'info' | 'success';
  public title!: string;
  public message!: string;
  public source!: string;
  public status!: 'active' | 'resolved' | 'acknowledged';
  public priority!: 'low' | 'medium' | 'high' | 'critical';
  public createdAt!: Date;
  public updatedAt!: Date;
  public resolvedAt?: Date;
  public acknowledgedAt?: Date;
  public acknowledgedBy?: string;
}

Alert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.ENUM('error', 'warning', 'info', 'success'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'resolved', 'acknowledged'),
      allowNull: false,
      defaultValue: 'active',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    acknowledgedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Alert',
    tableName: 'alerts',
  }
);

export default Alert; 