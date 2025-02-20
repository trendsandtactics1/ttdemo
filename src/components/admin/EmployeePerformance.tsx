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
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bankInfo, setBankInfo] = useState<BankInformation | null>(null);
  const [experiences, setExperiences] = useState<ProfessionalExperience[]>([]);
  const [salaryInfo, setSalaryInfo] = useState<SalaryInformation | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId]);

  const handleError = (error: any, customMessage: string) => {
    console.error(`Error: ${customMessage}`, error);
    toast({
      title: "Error",
      description: error.message || customMessage,
      variant: "destructive",
    });
  };

  const fetchEmployeeData = async () => {
    try {
      if (!employeeId) return;
      setLoading(true);
      
      const { data: employeeData, error: employeeError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;

      if (employeeData) {
        setEmployee(employeeData);
        await Promise.all([
          fetchBankInfo(),
          fetchExperiences(),
          fetchSalaryInfo(),
          fetchDocuments(),
        ]);
      }
    } catch (error) {
      handleError(error, "Failed to fetch employee data");
    } finally {
      setLoading(false);
    }
  };

  const fetchBankInfo = async () => {
    try {
      if (!employeeId) return;
      const { data, error } = await supabase
        .from("bank_information")
        .select("*")
        .eq("employee_id", employeeId)
        .single();
      
      if (error) throw error;
      setBankInfo(data);
    } catch (error) {
      handleError(error, "Failed to fetch bank information");
    }
  };

  const fetchExperiences = async () => {
    try {
      if (!employeeId) return;
      const { data, error } = await supabase
        .from("professional_experience")
        .select("*")
        .eq("employee_id", employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      handleError(error, "Failed to fetch professional experiences");
    }
  };

  const fetchSalaryInfo = async () => {
    try {
      if (!employeeId) return;
      const { data, error } = await supabase
        .from("salary_information")
        .select("*")
        .eq("employee_id", employeeId)
        .single();
      
      if (error) throw error;
      setSalaryInfo(data);
    } catch (error) {
      handleError(error, "Failed to fetch salary information");
    }
  };

  const fetchDocuments = async () => {
    try {
      if (!employeeId) return;
      const { data, error } = await supabase
        .from("employee_documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      handleError(error, "Failed to fetch documents");
    }
  };

  const updatePersonalInfo = async (formData: any) => {
    try {
      if (!employeeId) return;

      const profileData = {
        id: employeeId,
        name: formData.name,
        email: formData.email,
        date_of_birth: formData.date_of_birth,
        fathers_name: formData.fathers_name,
        mothers_name: formData.mothers_name,
        address: formData.address,
        contact_number: formData.contact_number,
        emergency_contact: formData.emergency_contact,
        date_of_joining: formData.date_of_joining,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", employeeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
      
      await fetchEmployeeData();
    } catch (error) {
      handleError(error, "Failed to update personal information");
    }
  };

  const updateBankInfo = async (formData: any) => {
    try {
      if (!employeeId) return;

      const bankData = {
        employee_id: employeeId,
        bank_name: formData.bank_name,
        branch_name: formData.branch_name,
        account_number: formData.account_number,
        ifsc_code: formData.ifsc_code,
        account_type: formData.account_type,
        bank_address: formData.bank_address,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("bank_information")
        .upsert(bankData, { onConflict: 'employee_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bank information updated successfully",
      });
      
      await fetchBankInfo();
    } catch (error) {
      handleError(error, "Failed to update bank information");
    }
  };

  const addExperience = async (formData: any) => {
    try {
      if (!employeeId) return;

      const experienceData = {
        employee_id: employeeId,
        company_name: formData.company_name,
        position: formData.position,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        responsibilities: formData.responsibilities,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("professional_experience")
        .insert([experienceData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Professional experience added successfully",
      });
      
      await fetchExperiences();
    } catch (error) {
      handleError(error, "Failed to add professional experience");
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const { error } = await supabase
        .from("professional_experience")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
      
      await fetchExperiences();
    } catch (error) {
      handleError(error, "Failed to delete experience");
    }
  };

  const uploadDocument = async (file: File, name: string, type: string) => {
    try {
      if (!employeeId) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;
      const filePath = `${employeeId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: employeeId,
          document_name: name,
          document_type: type,
          file_path: filePath,
          uploaded_by: employeeId,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      
      await fetchDocuments();
    } catch (error) {
      handleError(error, "Failed to upload document");
    }
  };

  const deleteDocument = async (docId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('employee-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', docId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
      
      await fetchDocuments();
    } catch (error) {
      handleError(error, "Failed to delete document");
    }
  };

  const updateSalaryInfo = async (formData: any) => {
    try {
      if (!employeeId) return;

      const salaryData = {
        employee_id: employeeId,
        gross_salary: parseFloat(formData.gross_salary),
        epf_percentage: formData.epf_percentage ? parseFloat(formData.epf_percentage) : null,
        net_pay: formData.net_pay ? parseFloat(formData.net_pay) : null,
        total_deduction: formData.total_deduction ? parseFloat(formData.total_deduction) : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("salary_information")
        .upsert(salaryData, { onConflict: 'employee_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary information updated successfully",
      });
      
      await fetchSalaryInfo();
    } catch (error) {
      handleError(error, "Failed to update salary information");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold">Employee not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-5 gap-4 w-full">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="bank">Bank Information</TabsTrigger>
          <TabsTrigger value="experience">Professional Experience</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="salary">Salary Information</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData);
                updatePersonalInfo(data);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={employee.name || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" defaultValue={employee.email || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={employee.date_of_birth || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fathers_name">Father's Name</Label>
                    <Input id="fathers_name" name="fathers_name" defaultValue={employee.fathers_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mothers_name">Mother's Name</Label>
                    <Input id="mothers_name" name="mothers_name" defaultValue={employee.mothers_name || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={employee.address || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input id="contact_number" name="contact_number" defaultValue={employee.contact_number || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input id="emergency_contact" name="emergency_contact" defaultValue={employee.emergency_contact || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_joining">Date of Joining</Label>
                    <Input id="date_of_joining" name="date_of_joining" type="date" defaultValue={employee.date_of_joining || ''} required />
                  </div>
                </div>
                <Button type="submit">Update Personal Information</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input id="bank_name" name="bank_name" defaultValue={bankInfo?.bank_name || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch_name">Branch Name</Label>
                    <Input id="branch_name" name="branch_name" defaultValue={bankInfo?.branch_name || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input id="account_number" name="account_number" defaultValue={bankInfo?.account_number || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifsc_code">IFSC Code</Label>
                    <Input id="ifsc_code" name="ifsc_code" defaultValue={bankInfo?.ifsc_code || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Input id="account_type" name="account_type" defaultValue={bankInfo?.account_type || ''} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_address">Bank Address</Label>
                    <Input id="bank_address" name="bank_address" defaultValue={bankInfo?.bank_address || ''} />
                  </div>
                </div>
                <Button type="submit">Update Bank Information</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Professional Experience</CardTitle>
              <Button onClick={() => document.getElementById('add-experience-form')?.classList.toggle('hidden')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </CardHeader>
            <CardContent>
              <form id="add-experience-form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData);
                addExperience(data);
                e.currentTarget.reset();
                e.currentTarget.classList.add('hidden');
              }} className="space-y-4 hidden border-b pb-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input id="company_name" name="company_name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input id="position" name="position" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" name="start_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" name="end_date" type="date" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="responsibilities">Responsibilities</Label>
                    <Input id="responsibilities" name="responsibilities" />
                  </div>
                </div>
                <Button type="submit">Add Experience</Button>
              </form>

              <div className="space-y-4">
                {experiences.map((exp) => (
                  <Card key={exp.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{exp.company_name}</h3>
                        <p className="text-sm text-gray-600">{exp.position}</p>
                        <p className="text-sm">
                          {new Date(exp.start_date).toLocaleDateString()} - 
                          {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                        </p>
                        {exp.responsibilities && (
                          <p className="text-sm mt-2">{exp.responsibilities}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const file = formData.get('file') as File;
                const name = formData.get('name') as string;
                const type = formData.get('type') as string;
                if (file && name && type) {
                  uploadDocument(file, name, type);
                  e.currentTarget.reset();
                }
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Document Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Document Type</Label>
                    <Input id="type" name="type" required />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="file">File</Label>
                    <Input id="file" name="file" type="file" required />
                  </div>
                </div>
                <Button type="submit">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{doc.document_name}</h3>
                        <p className="text-sm text-gray-600">{doc.document_type}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={async () => {
                            const { data } = await supabase.storage
                              .from('employee-documents')
                              .getPublicUrl(doc.file_path);
                            window.open(data.publicUrl, '_blank');
                          }}
                        >
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteDocument(doc.id, doc.file_path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData);
                updateSalaryInfo(data);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gross_salary">Gross Salary</Label>
                    <Input
                      id="gross_salary"
                      name="gross_salary"
                      type="number"
                      defaultValue={salaryInfo?.gross_salary || ''}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epf_percentage">EPF Percentage</Label>
                    <Input
                      id="epf_percentage"
                      name="epf_percentage"
                      type="number"
                      defaultValue={salaryInfo?.epf_percentage || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_deduction">Total Deduction</Label>
                    <Input
                      id="total_deduction"
                      name="total_deduction"
                      type="number"
                      defaultValue={salaryInfo?.total_deduction || ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="net_pay">Net Pay</Label>
                    <Input
                      id="net_pay"
                      name="net_pay"
                      type="number"
                      defaultValue={salaryInfo?.net_pay || ''}
                      required
                    />
                  </div>
                </div>
                <Button type="submit">Update Salary Information</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeePerformance; 
