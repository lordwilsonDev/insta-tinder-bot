import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MessageCircle, Instagram, Facebook } from "lucide-react";

interface ActivityFeedProps {
  userId: string;
}

interface Activity {
  id: string;
  platform: string;
  message_type: string;
  original_message: string;
  ai_response: string;
  created_at: string;
}

const ActivityFeed = ({ userId }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [userId]);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("chatbot_activity")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-5 h-5 text-primary" />;
      case "facebook":
        return <Facebook className="w-5 h-5 text-primary" />;
      default:
        return <MessageCircle className="w-5 h-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <p className="text-center text-muted-foreground">Loading activity...</p>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card border-border">
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your AI chatbot responses will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <Card key={activity.id} className="p-4 bg-gradient-card border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                {getPlatformIcon(activity.platform)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium capitalize">
                    {activity.platform}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Received:</span>
                    <p className="mt-1">{activity.original_message}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">AI Response:</span>
                    <p className="mt-1 text-primary">{activity.ai_response}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
