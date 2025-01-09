import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  designation: string;
  profile_photo?: string;
}

const EmployeeProfile = () => {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Get current user from localStorage (temporary solution)
      const currentUser = JSON.parse(localStorage.getItem('workstream_current_user') || '{}');
      
      if (!currentUser.email) {
        throw new Error('No user found');
      }

      // Fetch user data from Supabase
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single();

      if (error) throw error;

      setProfile(userData);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.id) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result as string;
          
          const { error } = await supabase
            .from('users')
            .update({ profile_photo: base64String })
            .eq('id', profile.id);

          if (error) throw error;

          setProfile(prev => ({ ...prev, profile_photo: base64String }));
          toast({
            title: "Success",
            description: "Profile photo updated successfully",
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast({
          title: "Error",
          description: "Failed to update profile photo",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile.id) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
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
                onChange={(e) => handleUpdateProfile({ designation: e.target.value })}
                placeholder="Designation"
              />
            </div>
            <div>
              <Input 
                value={profile.employee_id || ""} 
                disabled 
                placeholder="Employee ID" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeProfile;