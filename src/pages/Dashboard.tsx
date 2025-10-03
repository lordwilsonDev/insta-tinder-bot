import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Upload, Bot, Activity } from "lucide-react";
import VideoUploader from "@/components/VideoUploader";
import ChatbotConfig from "@/components/ChatbotConfig";
import ActivityFeed from "@/components/ActivityFeed";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"videos" | "chatbot" | "activity">("videos");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
              AutoMate
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your videos and automate your social media
          </p>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <Button
            variant={activeTab === "videos" ? "default" : "outline"}
            onClick={() => setActiveTab("videos")}
            className={activeTab === "videos" ? "bg-gradient-to-r from-primary to-accent-blue" : ""}
          >
            <Upload className="w-4 h-4 mr-2" />
            Video Formatter
          </Button>
          <Button
            variant={activeTab === "chatbot" ? "default" : "outline"}
            onClick={() => setActiveTab("chatbot")}
            className={activeTab === "chatbot" ? "bg-gradient-to-r from-primary to-accent-blue" : ""}
          >
            <Bot className="w-4 h-4 mr-2" />
            AI Chatbot
          </Button>
          <Button
            variant={activeTab === "activity" ? "default" : "outline"}
            onClick={() => setActiveTab("activity")}
            className={activeTab === "activity" ? "bg-gradient-to-r from-primary to-accent-blue" : ""}
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </Button>
        </div>

        <div className="space-y-6">
          {activeTab === "videos" && <VideoUploader userId={user.id} />}
          {activeTab === "chatbot" && <ChatbotConfig userId={user.id} />}
          {activeTab === "activity" && <ActivityFeed userId={user.id} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
