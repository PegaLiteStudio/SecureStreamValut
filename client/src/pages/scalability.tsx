import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Users,
  Zap,
  Server,
  Gauge,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Wifi,
  Clock
} from "lucide-react";

interface StreamAnalytics {
  activeStreams: number;
  streamDetails: Array<{
    id: string;
    duration: number;
    clientId: string;
  }>;
  totalConcurrentLimit: number;
}

export default function Scalability() {
  const { data: streamAnalytics } = useQuery<StreamAnalytics>({
    queryKey: ['/api/stream-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/stream-analytics');
      if (!response.ok) throw new Error('Failed to fetch stream analytics');
      return response.json();
    },
    refetchInterval: 2000, // Update every 2 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const getPerformanceStatus = () => {
    if (!streamAnalytics || !stats) return 'unknown';
    
    const streamLoad = streamAnalytics.activeStreams / streamAnalytics.totalConcurrentLimit;
    const cpuLoad = stats.cpuUsage / 100;
    const memoryLoad = stats.memoryUsage / 100;
    
    if (streamLoad > 0.8 || cpuLoad > 0.8 || memoryLoad > 0.8) return 'high';
    if (streamLoad > 0.6 || cpuLoad > 0.6 || memoryLoad > 0.6) return 'medium';
    return 'low';
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-light-slate">System Scalability</h1>
          <p className="text-gray-400 mt-1">Monitor streaming performance and concurrent load</p>
        </div>
        <div className="flex items-center space-x-2">
          {performanceStatus === 'low' && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Optimal Performance
            </Badge>
          )}
          {performanceStatus === 'medium' && (
            <Badge variant="secondary" className="bg-yellow-600">
              <Activity className="w-3 h-3 mr-1" />
              Moderate Load
            </Badge>
          )}
          {performanceStatus === 'high' && (
            <Badge variant="destructive">
              <AlertTriangle className="w-3 h-3 mr-1" />
              High Load
            </Badge>
          )}
        </div>
      </div>

      {/* Real-time Streaming Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="bg-slate-grey border-gray-600 hover:border-primary-indigo/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Active Streams</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">
                  {streamAnalytics?.activeStreams || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Limit: {streamAnalytics?.totalConcurrentLimit || 50}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-indigo/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-600 hover:border-secondary-purple/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Bandwidth Usage</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">
                  {stats?.totalBandwidth ? `${(stats.totalBandwidth / (1024 * 1024)).toFixed(1)} MB/s` : '0 MB/s'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ~2.5 MB/s per stream
                </p>
              </div>
              <div className="w-12 h-12 bg-secondary-purple/20 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-secondary-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-600 hover:border-accent-emerald/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">CPU Load</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">
                  {stats?.cpuUsage?.toFixed(1) || '0'}%
                </p>
                <p className={`text-xs mt-1 ${
                  (stats?.cpuUsage || 0) > 80 ? 'text-red-400' : 
                  (stats?.cpuUsage || 0) > 60 ? 'text-yellow-400' : 'text-accent-emerald'
                }`}>
                  {(stats?.cpuUsage || 0) > 80 ? 'High load' : 
                   (stats?.cpuUsage || 0) > 60 ? 'Moderate' : 'Normal'}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-emerald/20 rounded-xl flex items-center justify-center">
                <Gauge className="w-6 h-6 text-accent-emerald" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-600 hover:border-orange-500/50 transition-colors">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Memory Usage</p>
                <p className="text-2xl lg:text-3xl font-bold text-light-slate">
                  {stats?.memoryUsage?.toFixed(1) || '0'}%
                </p>
                <p className={`text-xs mt-1 ${
                  (stats?.memoryUsage || 0) > 80 ? 'text-red-400' : 
                  (stats?.memoryUsage || 0) > 60 ? 'text-yellow-400' : 'text-orange-500'
                }`}>
                  {(stats?.memoryUsage || 0) > 80 ? 'Critical' : 
                   (stats?.memoryUsage || 0) > 60 ? 'High' : 'Healthy'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Active Streams */}
      <Card className="bg-slate-grey border-gray-600">
        <CardHeader>
          <CardTitle className="text-light-slate flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Active Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          {streamAnalytics?.streamDetails && streamAnalytics.streamDetails.length > 0 ? (
            <div className="space-y-3">
              {streamAnalytics.streamDetails.map((stream, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-dark-slate rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium text-light-slate">Video: {stream.id}</p>
                      <p className="text-xs text-gray-400">Client: {stream.clientId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-light-slate flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDuration(stream.duration)}
                    </p>
                    <p className="text-xs text-gray-400">streaming</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-400">No active streams</p>
              <p className="text-xs text-gray-500 mt-1">Streams will appear here when users start watching videos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scalability Recommendations */}
      <Card className="bg-slate-grey border-gray-600">
        <CardHeader>
          <CardTitle className="text-light-slate flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Scalability Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-light-slate">Current Capabilities</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  HTTP Range request support for efficient streaming
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Concurrent stream tracking and monitoring
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  1MB chunk-based streaming for reduced memory usage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Automatic cleanup on client disconnect
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-light-slate">Recommended Improvements</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Add CDN integration for global distribution
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Implement video transcoding for adaptive bitrate
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Add Redis caching for frequently accessed content
                </li>
                <li className="flex items-center">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Scale horizontally with load balancers
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-dark-slate rounded-lg">
            <h4 className="font-semibold text-light-slate mb-2">Current Estimated Limits</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Concurrent Streams</p>
                <p className="text-lg font-bold text-primary-indigo">~50</p>
              </div>
              <div>
                <p className="text-gray-400">Max Bandwidth</p>
                <p className="text-lg font-bold text-secondary-purple">~125 MB/s</p>
              </div>
              <div>
                <p className="text-gray-400">Storage Limit</p>
                <p className="text-lg font-bold text-accent-emerald">~100 GB</p>
              </div>
              <div>
                <p className="text-gray-400">Response Time</p>
                <p className="text-lg font-bold text-orange-500">&lt;200ms</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}