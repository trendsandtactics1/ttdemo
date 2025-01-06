export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  assignedDate: string;
}

const TASKS_KEY = 'workstream_tasks';
const EMPLOYEES_KEY = 'workstream_employees';

export const localStorageService = {
  getTasks: (): Task[] => {
    const tasks = localStorage.getItem(TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  },

  setTasks: (tasks: Task[]) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasks-updated'));
  },

  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const tasks = localStorageService.getTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorageService.setTasks([...tasks, newTask]);
    return newTask;
  },

  updateTask: (taskId: string, updates: Partial<Task>) => {
    const tasks = localStorageService.getTasks();
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    );
    localStorageService.setTasks(updatedTasks);
  },

  getEmployees: () => {
    const employees = localStorage.getItem(EMPLOYEES_KEY);
    return employees ? JSON.parse(employees) : [];
  },

  addEmployee: (employee: { id: string; name: string }) => {
    const employees = localStorageService.getEmployees();
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...employees, employee]));
  },
};