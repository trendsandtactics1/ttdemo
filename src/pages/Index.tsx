import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-lg mx-4">
        <CardContent className="text-center py-6">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
          <p className="text-xl text-gray-600">Start building your amazing project here!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;