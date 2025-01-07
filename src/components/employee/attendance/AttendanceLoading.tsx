import { Skeleton } from "@/components/ui/skeleton";

const AttendanceLoading = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <Skeleton className="h-10 w-[200px]" />
      <div className="rounded-md border">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceLoading;