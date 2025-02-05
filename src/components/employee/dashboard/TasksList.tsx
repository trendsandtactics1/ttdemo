
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/user";

interface TasksListProps {
  tasks: Task[];
}

export const TasksList = ({ tasks }: TasksListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-lg">
              <div className="space-y-1">
                <p className="font-medium line-clamp-1">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(task.due_date || '').toLocaleDateString()}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs w-fit ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {task.status}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="text-muted-foreground text-center">No tasks assigned yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
