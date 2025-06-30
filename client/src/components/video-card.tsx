import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Link, Trash2, Check } from "lucide-react";
import { type Video } from "@shared/schema";
import VideoPlayer from "./video-player";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/videos/${video.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Video deleted",
        description: "Video has been successfully deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const copyLink = async () => {
    const streamUrl = `${window.location.origin}/api/stream/${video.customId}`;
    try {
      await navigator.clipboard.writeText(streamUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      toast({
        title: "Link copied",
        description: "Streaming link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileExtension = (mimeType: string) => {
    const ext = mimeType.split('/')[1];
    return ext.toUpperCase();
  };

  return (
    <>
      <Card className="bg-dark-slate border-gray-700 hover:border-primary-indigo/50 transition-all video-card group">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-gray-800 rounded-t-lg overflow-hidden">
            {/* Video thumbnail placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-500" />
            </div>
            
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={() => setShowPlayer(true)}
                className="bg-primary-indigo hover:bg-blue-600 text-white rounded-full w-12 h-12 p-0"
              >
                <Play className="w-5 h-5 ml-1" />
              </Button>
            </div>
            
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h4 className="font-medium text-light-slate mb-2 line-clamp-2" title={video.title}>
              {video.title}
            </h4>
            <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
              <span>{formatBytes(video.size)}</span>
              <span>{getFileExtension(video.mimeType)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span>{new Date(video.createdAt!).toLocaleDateString()}</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyLink}
                  className="text-gray-400 hover:text-accent-emerald h-6 w-6 p-0"
                  title="Copy Link"
                >
                  {linkCopied ? <Check className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="p-2 bg-slate-grey rounded text-xs font-mono text-gray-300 overflow-hidden">
              /api/stream/{video.customId}
            </div>
          </div>
        </CardContent>
      </Card>

      {showPlayer && (
        <VideoPlayer
          videoId={video.customId}
          title={video.title}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
}
