export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to?: string;
  assigned_by?: string;
  due_date: string;
  assigned_date: string;
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
}