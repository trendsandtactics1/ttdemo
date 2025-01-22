import { useEffect, useState } from "react";
import { supabase } from "@/integrations/client";
import { UserFormData } from "@/types/user";

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserFormData[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }
      setUsers(data || []);
    };

    fetchUsers();
  }, []);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Users</h2>
      <table className="w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Employee ID</th>
            <th className="border border-gray-300 px-4 py-2">Designation</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.employeeId}>
              <td className="border border-gray-300 px-4 py-2">{user.name}</td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.employeeId}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {user.designation}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
