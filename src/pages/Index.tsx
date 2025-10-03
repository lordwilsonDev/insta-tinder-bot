import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Video, MessageSquare, Zap, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
                AutoMate
              </h1>
            </div>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent-blue hover:opacity-90"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              AI-Powered Social Media Automation
            </span>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Automate Your
            <br />
            <span className="bg-gradient-to-r from-primary via-accent-purple to-accent-blue bg-clip-text text-transparent">
              Social Media Life
            </span>
          </h2>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Format videos for any platform instantly and let AI handle all your
            DMs and comments. Save hours every day.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-to-r from-primary to-accent-blue hover:opacity-90 text-lg px-8"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-32">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-gradient-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Video Formatting</h3>
            <p className="text-muted-foreground">
              Upload once, get optimized versions for Instagram, TikTok, YouTube, and
              more - automatically.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Chatbot</h3>
            <p className="text-muted-foreground">
              Automatically respond to DMs and comments with your custom AI
              assistant that sounds just like you.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-card border border-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Time</h3>
            <p className="text-muted-foreground">
              Reclaim hours every day. Focus on creating while we handle the
              repetitive tasks.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to automate your life?</h3>
          <p className="text-muted-foreground mb-8">
            Join thousands of creators who are saving time every day
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-gradient-to-r from-primary to-accent-blue hover:opacity-90 text-lg px-8"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
