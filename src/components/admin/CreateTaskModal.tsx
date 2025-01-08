import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { localStorageService } from "@/services/localStorageService";
import TaskDatePicker from "./TaskDatePicker";

const CreateTaskModal = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [assignedDate, setAssignedDate] = useState<Date>(new Date());
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [assignedDateOpen, setAssignedDateOpen] = useState(false);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    setEmployees(localStorageService.getEmployees());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !assignedTo || !dueDate || !assignedDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
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

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate(undefined);
      setAssignedDate(new Date());
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleAssignedDateChange = (date: Date | undefined) => {
    setAssignedDate(date || new Date());
    setAssignedDateOpen(false);
  };

  const handleDueDateChange = (date: Date | undefined) => {
    setDueDate(date);
    setDueDateOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[95%] mx-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-1">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign To</Label>
            <Select onValueChange={setAssignedTo} value={assignedTo}>
              <SelectTrigger className="w-full">
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
          <div className="space-y-2">
            <Label>Assigned Date</Label>
            <TaskDatePicker
              date={assignedDate}
              onDateChange={handleAssignedDateChange}
              isOpen={assignedDateOpen}
              onOpenChange={setAssignedDateOpen}
              label="Assigned Date"
            />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <TaskDatePicker
              date={dueDate}
              onDateChange={handleDueDateChange}
              isOpen={dueDateOpen}
              onOpenChange={setDueDateOpen}
              label="Due Date"
            />
          </div>
          <Button type="submit" className="w-full">Create Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;