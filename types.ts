
export enum EnergyLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  energyRequired: EnergyLevel;
  priority: Priority;
  category: 'Work' | 'Personal' | 'Self-care' | 'Errands' | 'Health';
  isBreakdown?: boolean;
  subtasks?: string[];
  isCompleted: boolean;
}

export interface ScheduledItem {
  startTime: string; // e.g., "09:00"
  endTime: string;
  task: Task;
}

export interface DailyPlan {
  date: string;
  items: ScheduledItem[];
  focusGoal: string;
}

export interface UserInput {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string; // text or base64
  timestamp: Date;
}
