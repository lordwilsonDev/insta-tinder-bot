import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Instagram, Youtube, Facebook } from "lucide-react";

interface VideoUploaderProps {
  userId: string;
}

const VideoUploader = ({ userId }: VideoUploaderProps) => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Create database entry with actual URL
      const { data: videoData, error: dbError } = await supabase
        .from("videos")
        .insert({
          user_id: userId,
          title,
          original_url: publicUrl,
          status: "completed",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create format entries for different platforms
      const formats = [
        { platform: 'instagram', aspect_ratio: '9:16', format_url: publicUrl },
        { platform: 'youtube', aspect_ratio: '16:9', format_url: publicUrl },
        { platform: 'facebook', aspect_ratio: '1:1', format_url: publicUrl },
      ];

      const { error: formatsError } = await supabase
        .from("video_formats")
        .insert(
          formats.map(f => ({
            video_id: videoData.id,
            ...f,
          }))
        );

      if (formatsError) throw formatsError;

      toast({
        title: "Video uploaded!",
        description: "Your video has been formatted for different platforms.",
      });

      setTitle("");
      setFile(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="text-xl font-semibold mb-4">Upload Video</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              placeholder="My awesome video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video">Video File</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-accent-blue hover:opacity-90"
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Uploading..." : "Upload & Convert"}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-gradient-card border-border">
        <h3 className="text-xl font-semibold mb-4">Supported Formats</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Instagram className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium">Instagram Reels</p>
              <p className="text-sm text-muted-foreground">9:16 vertical</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Youtube className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium">YouTube</p>
              <p className="text-sm text-muted-foreground">16:9 horizontal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Facebook className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium">Facebook Feed</p>
              <p className="text-sm text-muted-foreground">1:1 square</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VideoUploader;
