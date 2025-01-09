import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { attendanceService } from "@/services/attendanceService";
import { useToast } from "@/components/ui/use-toast";

const AttendanceConfig = () => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [sheetId, setSheetId] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadConfig = async () => {
      const storedScriptUrl = await attendanceService.getScriptUrl();
      const storedSheetId = await attendanceService.getSheetId();
      if (storedScriptUrl) setScriptUrl(storedScriptUrl);
      if (storedSheetId) setSheetId(storedSheetId);
    };
    loadConfig();
  }, []);

  const handleSaveScript = async () => {
    try {
      await attendanceService.setScriptUrl(scriptUrl);
      toast({
        title: "Settings saved",
        description: "Google Apps Script configuration has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Google Apps Script configuration.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSheet = async () => {
    try {
      await attendanceService.setSheetId(sheetId);
      toast({
        title: "Settings saved",
        description: "Google Sheet ID has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Google Sheet ID.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Attendance Data Configuration</h3>
      
      <Tabs defaultValue="sheet" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sheet">Google Sheet</TabsTrigger>
          <TabsTrigger value="script">Apps Script</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sheet" className="space-y-4">
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
          <Button onClick={handleSaveSheet}>Save Sheet Configuration</Button>
        </TabsContent>
        
        <TabsContent value="script" className="space-y-4">
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
          <Button onClick={handleSaveScript}>Save Script Configuration</Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AttendanceConfig;