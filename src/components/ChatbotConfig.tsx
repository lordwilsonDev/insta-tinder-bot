import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Bot, Save, Send } from "lucide-react";

interface ChatbotConfigProps {
  userId: string;
}

const ChatbotConfig = ({ userId }: ChatbotConfigProps) => {
  const [autoReply, setAutoReply] = useState(true);
  const [personality, setPersonality] = useState("friendly");
  const [customInstructions, setCustomInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setAutoReply(data.auto_reply_enabled);
        setPersonality(data.personality);
        setCustomInstructions(data.custom_instructions || "");
      }
    } catch (error: any) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("chatbot_settings")
        .upsert({
          user_id: userId,
          auto_reply_enabled: autoReply,
          personality,
          custom_instructions: customInstructions,
        });

      if (error) throw error;

      toast({
        title: "Settings saved!",
        description: "Your chatbot configuration has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testMessage.trim()) return;

    setTesting(true);
    setTestResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-response', {
        body: {
          message: testMessage,
          personality,
          customInstructions,
        },
      });

      if (error) throw error;

      setTestResponse(data.response);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Test failed",
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 bg-gradient-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI Chatbot Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Customize how your AI responds
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reply">Auto-Reply</Label>
              <p className="text-sm text-muted-foreground">
                Automatically respond to messages
              </p>
            </div>
            <Switch
              id="auto-reply"
              checked={autoReply}
              onCheckedChange={setAutoReply}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <select
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Custom Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Add specific instructions..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Example: "Always include emojis"
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent-blue hover:opacity-90"
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="text-xl font-semibold mb-4">Test Your Chatbot</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Send a test message to see how your AI will respond
        </p>

        <form onSubmit={handleTestMessage} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-message">Test Message</Label>
            <Input
              id="test-message"
              placeholder="Hey, what's up?"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent-blue hover:opacity-90"
            disabled={testing}
          >
            <Send className="w-4 h-4 mr-2" />
            {testing ? "Generating..." : "Test Response"}
          </Button>
        </form>

        {testResponse && (
          <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              AI Response:
            </p>
            <p className="text-primary">{testResponse}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatbotConfig;
