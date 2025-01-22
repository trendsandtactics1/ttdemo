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
    if (!userId) {
      toast({
        title: "Error",
        description: "Invalid user ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await onDeleteUser(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  if (!Array.isArray(users) || users.length === 0) {
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
          <TableRow key={user?.id}>
            <TableCell>{user?.name || 'N/A'}</TableCell>
            <TableCell>{user?.email || 'N/A'}</TableCell>
            <TableCell>{user?.employee_id || 'N/A'}</TableCell>
            <TableCell>{user?.designation || 'N/A'}</TableCell>
            <TableCell>{user?.role || 'N/A'}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => user?.id && handleDelete(user.id)}
                disabled={!user?.id}
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
