import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Facebook, Loader2, CheckCircle } from "lucide-react";

interface Video {
  id: string;
  title: string;
  original_url: string;
  created_at: string;
  formats: {
    id: string;
    platform: string;
    aspect_ratio: string;
    format_url: string;
  }[];
}

interface VideoListProps {
  userId: string;
}

const VideoList = ({ userId }: VideoListProps) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingTo, setUploadingTo] = useState<{ [key: string]: string | null }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadVideos();
  }, [userId]);

  const loadVideos = async () => {
    try {
      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (videosError) throw videosError;

      if (videosData) {
        const videosWithFormats = await Promise.all(
          videosData.map(async (video) => {
            const { data: formats } = await supabase
              .from("video_formats")
              .select("*")
              .eq("video_id", video.id);

            return {
              ...video,
              formats: formats || [],
            };
          })
        );

        setVideos(videosWithFormats);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading videos",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadToPlatform = async (videoId: string, platform: string, videoUrl: string) => {
    const key = `${videoId}-${platform}`;
    setUploadingTo({ ...uploadingTo, [key]: platform });

    try {
      const { data, error } = await supabase.functions.invoke("upload-to-platform", {
        body: {
          platform,
          videoUrl,
          videoId,
        },
      });

      if (error) throw error;

      toast({
        title: "Upload initiated!",
        description: `Your video is being uploaded to ${platform}.`,
      });

      // Log activity
      await supabase.from("chatbot_activity").insert({
        user_id: userId,
        platform,
        message_type: "video_upload",
        original_message: `Uploaded video to ${platform}`,
        ai_response: "Upload successful",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploadingTo({ ...uploadingTo, [key]: null });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="w-5 h-5" />;
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "facebook":
        return <Facebook className="w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="p-6 bg-gradient-card border-border text-center">
        <p className="text-muted-foreground">No videos uploaded yet. Upload your first video to get started!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Card key={video.id} className="p-6 bg-gradient-card border-border">
          <h3 className="text-xl font-semibold mb-4">{video.title}</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {video.formats.map((format) => {
              const key = `${video.id}-${format.platform}`;
              const isUploading = uploadingTo[key] === format.platform;

              return (
                <div
                  key={format.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(format.platform)}
                    <div>
                      <p className="font-medium capitalize">{format.platform}</p>
                      <p className="text-sm text-muted-foreground">{format.aspect_ratio}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUploadToPlatform(video.id, format.platform, format.format_url)}
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Upload"
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default VideoList;
