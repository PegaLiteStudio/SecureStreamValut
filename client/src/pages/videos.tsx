import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Play,
  Download,
  Trash2,
  Copy,
  Clock,
  HardDrive,
  Eye,
  Calendar,
  Filter,
  Grid,
  List,
  MoreVertical,
  FileVideo
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Video } from "@shared/schema";
import VideoPlayer from "@/components/video-player";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Videos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/videos/all'],
    queryFn: async () => {
      const response = await fetch('/api/videos/all');
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json() as Video[];
    },
    refetchInterval: 5000,
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      return apiRequest(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos/all'] });
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.customId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSize = videos.reduce((sum, video) => sum + video.size, 0);
  const totalDuration = videos.reduce((sum, video) => sum + (video.duration || 0), 0);
  const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
  const avgDuration = videos.length > 0 ? totalDuration / videos.length : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/stream/${text}`);
    toast({
      title: "Copied!",
      description: "Video link copied to clipboard",
    });
  };

  const downloadVideo = (customId: string, title: string) => {
    const link = document.createElement('a');
    link.href = `/api/stream/${customId}`;
    link.download = `${title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteVideo = (videoId: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-slate-grey border-gray-600">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-16 rounded-lg mb-4" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo}
          title={videos.find(v => v.customId === selectedVideo)?.title || "Video"}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-light-slate">Video Library</h1>
          <p className="text-gray-400 mt-1">Manage and organize your video content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center space-x-1"
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center space-x-1"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search videos by title or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-grey border-gray-600 text-light-slate placeholder:text-gray-500"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-slate-grey border-gray-600 hover:border-primary-indigo/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Videos</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">{videos.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {filteredVideos.length !== videos.length && `${filteredVideos.length} filtered`}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-indigo/20 rounded-xl flex items-center justify-center">
                <FileVideo className="w-6 h-6 text-primary-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-600 hover:border-secondary-purple/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Storage</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">{formatBytes(totalSize)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {videos.length > 0 ? formatBytes(totalSize / videos.length) : '0 B'}
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-purple/20 rounded-xl flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-secondary-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-600 hover:border-accent-emerald/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Views</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-accent-emerald mt-1">All time views</p>
              </div>
              <div className="w-12 h-12 bg-accent-emerald/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-accent-emerald" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-600 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg Duration</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">{formatDuration(Math.round(avgDuration))}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {formatDuration(totalDuration)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <Card className="bg-slate-grey border-gray-600">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileVideo className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-light-slate mb-3">
              {searchTerm ? "No videos match your search" : "No videos uploaded yet"}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm 
                ? "Try adjusting your search terms or browse all videos" 
                : "Upload your first video to start building your media library"
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
          : "space-y-3"
        }>
          {filteredVideos.map((video) => (
            <Card key={video.id} className="bg-slate-grey border-gray-600 hover:border-primary-indigo/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary-indigo/10">
              <CardContent className={viewMode === "grid" ? "p-4" : "p-4"}>
                {viewMode === "grid" ? (
                  <div className="space-y-4">
                    {/* Video Thumbnail */}
                    <div className="aspect-video bg-dark-slate rounded-lg flex items-center justify-center group cursor-pointer relative overflow-hidden"
                         onClick={() => setSelectedVideo(video.customId)}>
                      <Play className="w-12 h-12 text-gray-400 group-hover:text-primary-indigo transition-colors group-hover:scale-110 transform duration-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                    </div>
                    
                    {/* Video Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-light-slate line-clamp-2 text-sm lg:text-base">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono">{video.customId}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <HardDrive className="w-3 h-3 mr-1" />
                            {formatBytes(video.size)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration(video.duration || 0)}
                          </span>
                        </div>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {video.views || 0}
                        </span>
                      </div>
                      
                      {/* Date */}
                      <p className="text-xs text-gray-500">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedVideo(video.customId)}
                        className="flex-1 h-8"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => copyToClipboard(video.customId)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadVideo(video.customId, video.title)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVideo(video.id, video.title)}
                            className="text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-16 h-10 bg-dark-slate rounded flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-gray-700 transition-colors group"
                      onClick={() => setSelectedVideo(video.customId)}
                    >
                      <Play className="w-4 h-4 text-gray-400 group-hover:text-primary-indigo" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-light-slate truncate text-sm lg:text-base">
                        {video.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                        <span className="font-mono">{video.customId}</span>
                        <span>{formatBytes(video.size)}</span>
                        <span>{formatDuration(video.duration || 0)}</span>
                        <span>{video.views || 0} views</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        size="sm"
                        onClick={() => setSelectedVideo(video.customId)}
                        className="hidden sm:flex"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Play
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedVideo(video.customId)} className="sm:hidden">
                            <Play className="w-4 h-4 mr-2" />
                            Play Video
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(video.customId)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadVideo(video.customId, video.title)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteVideo(video.id, video.title)}
                            className="text-red-400 focus:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}