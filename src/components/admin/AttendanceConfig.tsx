import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { useToast } from "@/components/ui/use-toast";

const AttendanceConfig = () => {
  const [scriptUrl, setScriptUrl] = useState(attendanceService.getScriptUrl() || '');
  const { toast } = useToast();

  const handleSave = () => {
    attendanceService.setScriptUrl(scriptUrl);
    toast({
      title: "Settings saved",
      description: "Google Apps Script configuration has been updated.",
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Google Apps Script Configuration</h3>
      <div className="space-y-2">
        <label className="text-sm font-medium">Apps Script Web App URL</label>
        <Input
          value={scriptUrl}
          onChange={(e) => setScriptUrl(e.target.value)}
          placeholder="Enter your Google Apps Script Web App URL"
        />
        <p className="text-sm text-muted-foreground">
          Deploy your Apps Script as a web app and paste the URL here
        </p>
      </div>
      <Button onClick={handleSave}>Save Configuration</Button>
    </div>
  );
};

export default AttendanceConfig;