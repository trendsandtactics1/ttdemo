import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserListProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
}

const UserList = ({ users, onDeleteUser }: UserListProps) => {
  const { toast } = useToast();

  const handleDelete = async (userId: string) => {
    try {
      await onDeleteUser(userId);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (!users || users.length === 0) {
    return <p className="text-muted-foreground">No users found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Employee ID</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.employee_id}</TableCell>
            <TableCell>{user.designation}</TableCell>
            <TableCell>
              {user.user_roles && user.user_roles[0]?.role ? user.user_roles[0].role : 'N/A'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserList;