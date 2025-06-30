import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Video as VideoIcon, 
  Folder as FolderIcon,
  HardDrive,
  Clock,
  Calendar,
  Eye,
  Download,
  Users,
  Play,
  Wifi,
  Cpu,
  MemoryStick,
  Activity,
  Zap
} from "lucide-react";
import { type Video, type Folder } from "@shared/schema";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time data
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos/all'],
    queryFn: async () => {
      const response = await fetch('/api/videos/all', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['/api/folders/all'],
    queryFn: async () => {
      const response = await fetch('/api/folders/all', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch folders');
      return response.json();
    },
  });

  const { data: streamAnalytics } = useQuery({
    queryKey: ['/api/stream-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/stream-analytics', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch stream analytics');
      return response.json();
    },
    refetchInterval: 2000, // Update every 2 seconds
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideosByFormat = () => {
    const formats: { [key: string]: number } = {};
    videos.forEach(video => {
      const format = video.mimeType.split('/')[1].toUpperCase();
      formats[format] = (formats[format] || 0) + 1;
    });
    return Object.entries(formats).map(([format, count]) => ({ format, count }));
  };

  const getRecentUploads = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return videos.filter(video => 
      new Date(video.createdAt!) > thirtyDaysAgo
    ).length;
  };

  const getLargestVideos = () => {
    return [...videos]
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);
  };

  const getStorageByFolder = () => {
    const folderStorage: { [key: string]: number } = {};
    
    videos.forEach(video => {
      const folderName = folders.find(f => f.id === video.folderId)?.name || 'Root';
      folderStorage[folderName] = (folderStorage[folderName] || 0) + video.size;
    });

    return Object.entries(folderStorage)
      .map(([folder, size]) => ({ folder, size }))
      .sort((a, b) => b.size - a.size);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-light-slate">Analytics Dashboard</h1>
        <p className="text-gray-400 mt-2">Insights and statistics for your video library</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Videos</p>
                <p className="text-3xl font-bold text-light-slate">{videos?.length || 0}</p>
                <p className="text-xs text-accent-emerald mt-1">
                  +{getRecentUploads()} this month
                </p>
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
                <p className="text-3xl font-bold text-light-slate">
                  {videos?.length > 0 ? formatBytes(videos.reduce((sum, v) => sum + v.size, 0)) : '0 B'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg: {videos?.length > 0 ? formatBytes(videos.reduce((sum, v) => sum + v.size, 0) / videos.length) : '0 B'} per video
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
                <p className="text-3xl font-bold text-light-slate">{folders?.length || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {videos?.length > 0 ? Math.round(videos.length / Math.max(folders?.length || 1, 1)) : 0} videos per folder
                </p>
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
                <p className="text-3xl font-bold text-light-slate">
                  {videos?.length > 0 ? formatDuration(videos.reduce((sum, v) => sum + (v.duration || 0), 0) / videos.length) : '0:00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: {formatDuration(videos?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bandwidth</p>
                <p className="text-3xl font-bold text-light-slate">
                  {formatBytes(stats?.totalBandwidth || 0)}
                </p>
                <p className="text-xs text-accent-emerald mt-1">Live streaming data</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Wifi className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Streams</p>
                <p className="text-3xl font-bold text-light-slate">{streamAnalytics?.activeStreams || stats?.activeStreams || 0}</p>
                <p className="text-xs text-red-500 mt-1">Real-time monitoring</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Play className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">CPU Usage</p>
                <p className="text-3xl font-bold text-light-slate">{stats?.cpuUsage?.toFixed(1) || 0}%</p>
                <p className="text-xs text-purple-500 mt-1">Live system monitor</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">RAM Usage</p>
                <p className="text-3xl font-bold text-light-slate">
                  {stats?.totalMemory ? 
                    Math.round((stats.memoryUsage / 100) * (stats.totalMemory / 1024 / 1024)) : 0} MB
                </p>
                <p className="text-xs text-green-500 mt-1">
                  {stats?.memoryUsage?.toFixed(1) || 0}% of {stats?.totalMemory ? Math.round(stats.totalMemory / 1024 / 1024) : 0} MB
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <MemoryStick className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Formats */}
        <Card className="bg-slate-grey border-gray-700">
          <CardHeader>
            <CardTitle className="text-light-slate flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Video Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getVideosByFormat().map(({ format, count }) => {
                const percentage = (count / videos.length) * 100;
                return (
                  <div key={format} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-light-slate">{format}</span>
                      <span className="text-gray-400">{count} videos ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-indigo h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {getVideosByFormat().length === 0 && (
                <p className="text-gray-400 text-center py-4">No videos uploaded yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Storage by Folder */}
        <Card className="bg-slate-grey border-gray-700">
          <CardHeader>
            <CardTitle className="text-light-slate flex items-center">
              <FolderIcon className="w-5 h-5 mr-2" />
              Storage by Folder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getStorageByFolder().slice(0, 5).map(({ folder, size }) => {
                const percentage = stats?.totalStorage ? (size / stats.totalStorage) * 100 : 0;
                return (
                  <div key={folder} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-light-slate">{folder}</span>
                      <span className="text-gray-400">{formatBytes(size)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-secondary-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {getStorageByFolder().length === 0 && (
                <p className="text-gray-400 text-center py-4">No storage data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Largest Videos */}
        <Card className="bg-slate-grey border-gray-700">
          <CardHeader>
            <CardTitle className="text-light-slate flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Largest Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getLargestVideos().map((video, index) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-dark-slate rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-indigo/20 rounded-full flex items-center justify-center text-xs font-bold text-primary-indigo">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-light-slate font-medium">{video.title}</p>
                      <p className="text-xs text-gray-400">{video.customId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-light-slate font-medium">{formatBytes(video.size)}</p>
                    <p className="text-xs text-gray-400">{video.mimeType.split('/')[1].toUpperCase()}</p>
                  </div>
                </div>
              ))}
              {getLargestVideos().length === 0 && (
                <p className="text-gray-400 text-center py-4">No videos to display</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-slate-grey border-gray-700">
          <CardHeader>
            <CardTitle className="text-light-slate flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...videos]
                .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
                .slice(0, 5)
                .map((video) => (
                  <div key={video.id} className="flex items-center space-x-3 p-3 bg-dark-slate rounded-lg">
                    <div className="w-8 h-8 bg-accent-emerald/20 rounded-full flex items-center justify-center">
                      <VideoIcon className="w-4 h-4 text-accent-emerald" />
                    </div>
                    <div className="flex-1">
                      <p className="text-light-slate font-medium">{video.title}</p>
                      <p className="text-xs text-gray-400">
                        Uploaded {new Date(video.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{formatBytes(video.size)}</p>
                    </div>
                  </div>
                ))}
              {videos.length === 0 && (
                <p className="text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}