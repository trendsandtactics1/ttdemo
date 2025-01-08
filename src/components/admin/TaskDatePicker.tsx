import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface TaskDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
}

const TaskDatePicker = ({ date, onDateChange, label }: TaskDatePickerProps) => {
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Ensure we're working with a valid Date object
      const newDate = new Date(selectedDate);
      onDateChange(newDate);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskDatePicker;