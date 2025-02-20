import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { User } from "@/types/user";
import type { BankInformation, ProfessionalExperience, DocumentUpload, EmployeeDocument, SalaryInformation } from "@/types/employee";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

const EmployeePerformance = () => {
  // ... (keep all existing state and other functions)

  const updatePersonalInfo = async (formData: any) => {
    try {
      if (!employeeId) return;

      // First check if the profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", employeeId)
        .single();

      const profileData = {
        id: employeeId, // Important: Include the id in the upsert
        name: formData.name,
        email: formData.email,
        date_of_birth: formData.date_of_birth,
        fathers_name: formData.fathers_name,
        mothers_name: formData.mothers_name,
        address: formData.address,
        contact_number: formData.contact_number,
        emergency_contact: formData.emergency_contact,
        date_of_joining: formData.date_of_joining,
        updated_at: new Date().toISOString(), // Add updated_at timestamp
      };

      let error;
      
      if (existingProfile) {
        // If profile exists, use update
        const { error: updateError } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("id", employeeId);
        error = updateError;
      } else {
        // If profile doesn't exist, use insert
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([profileData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      
      await fetchEmployeeData();
    } catch (error: any) {
      console.error("Error updating personal info:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update personal information",
        variant: "destructive",
      });
    }
  };

  // ... (keep rest of the component code)
};

export default EmployeePerformance;
