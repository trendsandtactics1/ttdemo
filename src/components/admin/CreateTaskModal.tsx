import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { localStorageService } from "@/services/localStorageService";
import { useState } from "react";
import TaskDatePicker from "./TaskDatePicker";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

const CreateTaskModal = ({
  open,
  onOpenChange,
  onTaskCreated,
}: CreateTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedDate, setAssignedDate] = useState<Date>();
  const [dueDate, setDueDate] = useState<Date>();
  const { toast } = useToast();

  const employees = localStorageService.getEmployees();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !assignedTo || !assignedDate || !dueDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorageService.addTask({
        title,
        description,
        assignedTo,
        status: "pending",
        dueDate: dueDate.toISOString(),
        assignedDate: assignedDate.toISOString(),
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setAssignedDate(undefined);
      setDueDate(undefined);

      // Close modal
      onOpenChange(false);

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
  };

  const handleAssignedDateChange = (date: Date | undefined) => {
    setAssignedDate(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Assign To
            </label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TaskDatePicker
            date={assignedDate}
            onDateChange={handleAssignedDateChange}
            label="Assigned Date"
          />

          <TaskDatePicker
            date={dueDate}
            onDateChange={handleDueDateChange}
            label="Due Date"
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;