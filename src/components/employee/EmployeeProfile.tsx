import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client"; // Updated import path
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  designation: string;
  profilePhoto?: string;
}

const EmployeeProfile = () => {
  const [profile, setProfile] = useState<Partial<Employee>>({
    name: "",
    email: "",
    employeeId: "",
    designation: "",
    profilePhoto: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        // Simulate authenticated employee
        const { data: employees, error } = await supabase
          .from("employees")
          .select("*")
          .limit(1); // Replace with proper auth logic to get the current employee

        if (error) throw error;

        const currentEmployee = employees?.[0];
        if (currentEmployee) {
          setProfile({
            ...currentEmployee,
            profilePhoto: currentEmployee.profilePhoto || "",
          });
        }
      } catch (error) {
        console.error("Error fetching employee profile:", error);
      }
    };

    fetchEmployeeProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await handleUpdateProfile({ profilePhoto: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Employee>) => {
    if (!profile.employeeId) return;

    try {
      const updatedProfile = { ...profile, ...updates };

      const { error } = await supabase
        .from("employees")
        .update(updates)
        .eq("employeeId", profile.employeeId);

      if (error) throw error;

      setProfile(updatedProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    }
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
                value={profile.name || ""}
                onChange={(e) => handleUpdateProfile({ name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div>
              <Input
                value={profile.email || ""}
                onChange={(e) => handleUpdateProfile({ email: e.target.value })}
                placeholder="Email"
                type="email"
              />
            </div>
            <div>
              <Input
                value={profile.designation || ""}
                onChange={(e) =>
                  handleUpdateProfile({ designation: e.target.value })
                }
                placeholder="Designation"
              />
            </div>
            <div>
              <Input value={profile.employeeId || ""} disabled placeholder="Employee ID" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;
