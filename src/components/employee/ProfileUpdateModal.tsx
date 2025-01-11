import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { localStorageService } from "@/services/localStorageService";
import { Employee } from "@/services/localStorageService";
import { Upload, User } from "lucide-react";

const ProfileUpdateModal = () => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Partial<Employee>>({
    name: "",
    email: "",
    employeeId: "",
    designation: "",
    profilePhoto: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const employees = localStorageService.getEmployees();
    // In a real app, this would come from auth context
    const currentEmployee = employees[0];
    if (currentEmployee) {
      setProfile(currentEmployee);
    }
  }, [open]); // Refresh profile data when modal opens

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfile(prev => ({ ...prev, profilePhoto: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (!profile.employeeId) return;
    
    localStorageService.updateEmployee(profile.employeeId, profile as Employee);
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    setOpen(false);
    
    // Dispatch an event to notify other components of the update
    window.dispatchEvent(new Event('profile-updated'));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <User className="h-4 w-4 mr-2" />
          Update Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profilePhoto} />
                <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 p-1 bg-primary rounded-full cursor-pointer"
              >
                <Upload className="h-4 w-4 text-primary-foreground" />
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={profile.name || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={profile.designation || ""}
              onChange={(e) => setProfile(prev => ({ ...prev, designation: e.target.value }))}
              placeholder="Your designation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={profile.employeeId || ""}
              disabled
              placeholder="Employee ID"
            />
          </div>
          <Button onClick={handleUpdateProfile} className="w-full">
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileUpdateModal;