import LeaveRequestForm from "./leave-request/LeaveRequestForm";
import LeaveRequestTable from "./leave-request/LeaveRequestTable";

const LeaveRequest = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Leave Request</h2>
      <LeaveRequestForm />
      <LeaveRequestTable />
    </div>
  );
};

export default LeaveRequest;