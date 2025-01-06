import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Task, localStorageService } from "@/services/localStorageService";

interface Message {
  id: string;
  taskId: string;
  sender: string;
  content: string;
  timestamp: string;
}

const TaskChat = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (taskId) {
      const tasks = localStorageService.getTasks();
      const foundTask = tasks.find(t => t.id === taskId);
      if (foundTask) setTask(foundTask);

      // Load messages from localStorage
      const storedMessages = localStorage.getItem(`task_messages_${taskId}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    }
  }, [taskId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !taskId) return;

    const message: Message = {
      id: crypto.randomUUID(),
      taskId,
      sender: "employee", // In a real app, this would come from auth
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    localStorage.setItem(`task_messages_${taskId}`, JSON.stringify(updatedMessages));
    setNewMessage("");
  };

  if (!task) return <div>Task not found</div>;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{task.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="h-[400px] overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "employee" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === "employee"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskChat;