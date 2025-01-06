import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { localStorageService } from "@/services/localStorageService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

const EmployeeProfile = () => {
  const [profile, setProfile] = useState({
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
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUpdateProfile({ profilePhoto: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = (updates: Partial<typeof profile>) => {
    const updatedProfile = { ...profile, ...updates };
    localStorageService.updateEmployee(profile.employeeId, updatedProfile);
    setProfile(updatedProfile);
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-6">
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
          <div className="grid gap-4">
            <div>
              <Input
                value={profile.name}
                onChange={(e) => handleUpdateProfile({ name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div>
              <Input
                value={profile.email}
                onChange={(e) => handleUpdateProfile({ email: e.target.value })}
                placeholder="Email"
                type="email"
              />
            </div>
            <div>
              <Input
                value={profile.designation}
                onChange={(e) =>
                  handleUpdateProfile({ designation: e.target.value })
                }
                placeholder="Designation"
              />
            </div>
            <div>
              <Input value={profile.employeeId} disabled placeholder="Employee ID" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;