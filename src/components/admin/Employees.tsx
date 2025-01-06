import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Employees = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Employees</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No employees found.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;