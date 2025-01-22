import { User } from "@/types/user";
import { Button } from "@/components/ui/button";

interface UserListProps {
  users: User[];
  onDeleteUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onDeleteUser }) => {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border px-4 py-2">Name</th>
          <th className="border px-4 py-2">Email</th>
          <th className="border px-4 py-2">Employee ID</th>
          <th className="border px-4 py-2">Designation</th>
          <th className="border px-4 py-2">Role</th>
          <th className="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="border px-4 py-2">{user.name}</td>
            <td className="border px-4 py-2">{user.email}</td>
            <td className="border px-4 py-2">{user.employeeId}</td>
            <td className="border px-4 py-2">{user.designation}</td>
            <td className="border px-4 py-2">{user.role}</td>
            <td className="border px-4 py-2">
              <Button
                variant="destructive"
                onClick={() => onDeleteUser(user.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserList;
