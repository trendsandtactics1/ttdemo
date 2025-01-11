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
  employee_id: string;
  designation: string;
  profile_photo?: string;
}

const EmployeeProfile = () => {
  const [profile, setProfile] = useState<Partial<Employee>>({
    name: "",
    email: "",
    employee_id: "",
    designation: "",
    profile_photo: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      try {
        const { data: employees, error } = await supabase
          .from("employees")
          .select("*")
          .limit(1);

        if (error) throw error;

        const currentEmployee = employees?.[0];
        if (currentEmployee) {
          setProfile({
            ...currentEmployee,
            profile_photo: currentEmployee.profile_photo || "",
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
        await handleUpdateProfile({ profile_photo: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Employee>) => {
    if (!profile.employee_id) return;

    try {
      const updatedProfile = { ...profile, ...updates };

      const { error } = await supabase
        .from("employees")
        .update(updates)
        .eq("employee_id", profile.employee_id);

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
                <AvatarImage src={profile.profile_photo} />
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
              <Input value={profile.employee_id || ""} disabled placeholder="Employee ID" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;