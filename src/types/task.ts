export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  assigned_by: string | null;
  assigned_date: string;
  due_date: string;
  status: TaskStatus;
  created_at: string;
}