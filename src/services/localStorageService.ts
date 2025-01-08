export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  password: string;
  profilePhoto?: string;
}

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
const CURRENT_USER_KEY = 'workstream_current_user';

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

  deleteTask: (taskId: string) => {
    const tasks = localStorageService.getTasks();
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    localStorageService.setTasks(updatedTasks);
  },

  getEmployees: (): Employee[] => {
    const employees = localStorage.getItem(EMPLOYEES_KEY);
    return employees ? JSON.parse(employees) : [];
  },

  getCurrentUser: (): Employee | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  addEmployee: (employee: Omit<Employee, 'id'>) => {
    if (!employee.name || !employee.email || !employee.employeeId || !employee.designation || !employee.password) {
      return null;
    }
    const employees = localStorageService.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
    };
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify([...employees, newEmployee]));
    return newEmployee;
  },

  updateEmployee: (employeeId: string, updates: Partial<Employee>) => {
    const employees = localStorageService.getEmployees();
    const updatedEmployees = employees.map(emp => 
      emp.employeeId === employeeId ? { ...emp, ...updates } : emp
    );
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    window.dispatchEvent(new Event('employees-updated'));
  },

  deleteEmployee: (employeeId: string) => {
    const employees = localStorageService.getEmployees();
    const updatedEmployees = employees.filter(emp => emp.employeeId !== employeeId);
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(updatedEmployees));
    window.dispatchEvent(new Event('employees-updated'));
  },
};