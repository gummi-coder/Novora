import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Company extends Model {
  public id!: number;
  public name!: string;
  public plan!: 'Basic' | 'Premium' | 'Enterprise';
  public users!: number;
  public activeUsers!: number;
  public billingCycle!: 'Monthly' | 'Annual';
  public status!: 'Active' | 'Payment Failed' | 'Inactive';
  public nextPayment!: Date;
  public surveysSent!: number;
  public responsesCollected!: number;
  public eNPS!: number;
  public totalEmployees!: number;
  public managers!: number;
  public departments!: number;
  public industry!: string;
  public companySize!: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  public foundedYear!: number;
  public headquarters!: string;
  public website!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan: {
      type: DataTypes.ENUM('Basic', 'Premium', 'Enterprise'),
      defaultValue: 'Basic',
    },
    users: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    activeUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    billingCycle: {
      type: DataTypes.ENUM('Monthly', 'Annual'),
      defaultValue: 'Monthly',
    },
    status: {
      type: DataTypes.ENUM('Active', 'Payment Failed', 'Inactive'),
      defaultValue: 'Active',
    },
    nextPayment: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    surveysSent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responsesCollected: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    eNPS: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalEmployees: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    managers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    departments: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    industry: {
      type: DataTypes.STRING,
      defaultValue: 'Other',
    },
    companySize: {
      type: DataTypes.ENUM('Small', 'Medium', 'Large', 'Enterprise'),
      defaultValue: 'Small',
    },
    foundedYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    headquarters: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Company',
  }
);

export default Company; 