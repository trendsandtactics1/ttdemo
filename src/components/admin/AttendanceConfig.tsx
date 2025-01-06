import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { attendanceService } from "@/services/attendanceService";
import { useToast } from "@/components/ui/use-toast";

const AttendanceConfig = () => {
  const [apiKey, setApiKey] = useState(attendanceService.getApiKey() || '');
  const [sheetId, setSheetId] = useState(localStorage.getItem('sheets_id') || '');
  const { toast } = useToast();

  const handleSave = () => {
    attendanceService.setApiKey(apiKey);
    attendanceService.setSheetId(sheetId);
    toast({
      title: "Settings saved",
      description: "Google Sheets configuration has been updated.",
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Google Sheets Configuration</h3>
      <div className="space-y-2">
        <label className="text-sm font-medium">API Key</label>
        <Input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Google Sheets API Key"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Sheet ID</label>
        <Input
          value={sheetId}
          onChange={(e) => setSheetId(e.target.value)}
          placeholder="Enter your Google Sheet ID"
        />
      </div>
      <Button onClick={handleSave}>Save Configuration</Button>
    </div>
  );
};

export default AttendanceConfig;