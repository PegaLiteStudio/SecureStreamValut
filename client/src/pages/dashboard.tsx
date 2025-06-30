import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { logout } from "@/lib/auth";
import { 
  Play, 
  LogOut, 
  Upload, 
  FolderPlus, 
  Video as VideoIcon, 
  Folder as FolderIcon, 
  BarChart, 
  Settings,
  Home,
  ChevronRight,
  Grid3X3,
  List,
  HardDrive,
  Eye,
  Clock
} from "lucide-react";
import VideoCard from "@/components/video-card";
import UploadModal from "@/components/upload-modal";
import FolderModal from "@/components/folder-modal";
import { type Video, type Folder } from "@shared/schema";

export default function Dashboard() {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading: videosLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos', currentFolderId],
    queryFn: async () => {
      const response = await fetch(`/api/videos?folderId=${currentFolderId || ''}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['/api/folders', currentFolderId],
    queryFn: async () => {
      const response = await fetch(`/api/folders?parentId=${currentFolderId || ''}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch folders');
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      toast({
        title: "Logged out successfully",
      });
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-400">
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-light-slate">Videos</span>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-light-slate mb-2">Video Library</h2>
          <p className="text-gray-400">Manage your video content and streaming links</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setFolderModalOpen(true)}
            className="bg-gray-700 hover:bg-gray-600 text-light-slate"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="gradient-primary text-white font-medium transform hover:scale-105 transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-grey border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Videos</p>
                    <p className="text-2xl font-bold text-light-slate">{stats?.totalVideos || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-indigo/20 rounded-lg flex items-center justify-center">
                    <VideoIcon className="w-6 h-6 text-primary-indigo" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-grey border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Storage Used</p>
                    <p className="text-2xl font-bold text-light-slate">
                      {stats?.totalStorage ? formatBytes(stats.totalStorage) : '0 B'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary-purple/20 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-secondary-purple" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-grey border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Folders</p>
                    <p className="text-2xl font-bold text-light-slate">{stats?.totalFolders || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent-emerald/20 rounded-lg flex items-center justify-center">
                    <FolderIcon className="w-6 h-6 text-accent-emerald" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-grey border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Duration</p>
                    <p className="text-2xl font-bold text-light-slate">
                      {stats?.avgDuration ? formatDuration(stats.avgDuration) : '0:00'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
      </div>

      {/* Video Grid */}
      <Card className="bg-slate-grey border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-light-slate">Recent Videos</h3>
            <div className="flex items-center space-x-3">
              <select className="bg-dark-slate border border-gray-600 rounded-lg px-3 py-2 text-light-slate text-sm focus:outline-none focus:ring-2 focus:ring-primary-indigo">
                <option>All Videos</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
              <div className="flex items-center space-x-1 bg-dark-slate rounded-lg p-1">
                <Button size="sm" className="bg-primary-indigo text-white">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-light-slate">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-dark-slate rounded-lg p-4 animate-pulse">
                  <div className="aspect-video bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <Card key={folder.id} className="bg-dark-slate border-gray-700 hover:border-primary-indigo/50 transition-all cursor-pointer">
                  <CardContent className="p-4" onClick={() => setCurrentFolderId(folder.id)}>
                    <div className="aspect-video bg-gray-700 rounded flex items-center justify-center mb-4">
                      <FolderIcon className="w-12 h-12 text-primary-indigo" />
                    </div>
                    <h4 className="font-medium text-light-slate">{folder.name}</h4>
                    <p className="text-sm text-gray-400">Folder</p>
                  </CardContent>
                </Card>
              ))}
              
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
              
              {/* Upload Placeholder */}
              <Card 
                className="bg-dark-slate border-2 border-dashed border-gray-600 hover:border-primary-indigo/50 transition-all cursor-pointer"
                onClick={() => setUploadModalOpen(true)}
              >
                <CardContent className="p-6 flex flex-col items-center justify-center min-h-[280px]">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-indigo/20 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 group-hover:text-primary-indigo transition-colors" />
                  </div>
                  <h4 className="font-medium text-light-slate mb-2">Upload New Video</h4>
                  <p className="text-sm text-gray-400 mb-4">Drag & drop or click to browse</p>
                  <Button size="sm" className="bg-primary-indigo hover:bg-blue-600 text-white">
                    Choose File
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
      <UploadModal 
        open={uploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        currentFolderId={currentFolderId}
      />
      
      <FolderModal 
        open={folderModalOpen} 
        onClose={() => setFolderModalOpen(false)}
        currentFolderId={currentFolderId}
      />
    </div>
  );
}
