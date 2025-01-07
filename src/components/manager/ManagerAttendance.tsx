import AttendanceTable from "../admin/AttendanceTable";

const ManagerAttendance = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-3xl font-bold tracking-tight">Attendance Logs</h2>
      <AttendanceTable />
    </div>
  );
};

export default ManagerAttendance;