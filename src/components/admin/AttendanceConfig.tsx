import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { attendanceService } from "@/services/attendanceService";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const AttendanceConfig = () => {
  const [sheetId, setSheetId] = useState(attendanceService.getSheetId() || '');
  const { toast } = useToast();

  const handleSaveSheet = () => {
    attendanceService.setSheetId(sheetId);
    toast({
      title: "Settings saved",
      description: "Google Sheet ID has been updated.",
    });
  };

  return (
    <Card className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Attendance Data Configuration</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Google Sheet ID</label>
          <Input
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            placeholder="Enter your Google Sheet ID"
          />
          <p className="text-sm text-muted-foreground">
            Enter the ID from your Google Sheet URL: docs.google.com/spreadsheets/d/[Sheet-ID]/edit
          </p>
        </div>
        <Button onClick={handleSaveSheet}>Save Configuration</Button>
      </div>
    </Card>
  );
};

export default AttendanceConfig;