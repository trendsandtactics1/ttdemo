import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/services/localStorageService";

interface Message {
  id: string;
  taskId: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface SupabaseTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  assigned_to: string | null;
  assigned_by: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

const convertSupabaseTask = (supabaseTask: SupabaseTask): Task => {
  return {
    id: supabaseTask.id,
    title: supabaseTask.title,
    description: supabaseTask.description || "",
    assignedTo: supabaseTask.assigned_to || "",
    status: supabaseTask.status as Task["status"],
    createdAt: supabaseTask.created_at,
    updatedAt: supabaseTask.updated_at,
    dueDate: supabaseTask.due_date || new Date().toISOString(),
    assignedDate: supabaseTask.created_at, // Using created_at as assigned date
  };
};

const TaskChat = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId) return;

      try {
        const { data: taskData, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('id', taskId)
          .single();

        if (error) throw error;
        if (taskData) {
          setTask(convertSupabaseTask(taskData as SupabaseTask));
        }

        // Load messages from localStorage for now
        // TODO: Create messages table in Supabase
        const storedMessages = localStorage.getItem(`task_messages_${taskId}`);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Error fetching task:', error);
      }
    };

    fetchTask();

    // Subscribe to real-time task updates
    const channel = supabase
      .channel('task-chat')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `id=eq.${taskId}`,
        },
        (payload) => {
          if (payload.new) {
            setTask(convertSupabaseTask(payload.new as SupabaseTask));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [taskId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !taskId) return;

    const message: Message = {
      id: crypto.randomUUID(),
      taskId,
      sender: "admin", // In a real app, this would come from auth
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
    <div className="space-y-4">
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
                    message.sender === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.sender === "admin"
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