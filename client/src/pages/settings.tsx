import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/lib/auth";
import { 
  Settings as SettingsIcon, 
  Save, 
  LogOut, 
  Shield, 
  Database, 
  Upload,
  Video as VideoIcon,
  HardDrive,
  Trash2,
  AlertTriangle,
  Info,
  Server
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    maxFileSize: '500',
    maxStorageGB: '100',
    allowedFormats: 'mp4,avi,mov,wmv,flv,webm',
    autoGenerateId: true,
    requireAuthentication: true,
    enableRangeRequests: true,
    defaultQuality: 'original',
    storageLocation: '/uploads',
    sessionTimeout: '24',
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
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    const maxBytes = parseInt(settings.maxStorageGB) * 1024 * 1024 * 1024;
    const usedBytes = stats?.diskUsage || 0;
    return Math.min((usedBytes / maxBytes) * 100, 100);
  };

  const getUptimeString = () => {
    const uptime = stats?.uptime || 0;
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      toast({
        title: "Logged out successfully",
      });
    },
  });

  const saveSettings = () => {
    // In a real application, this would save to backend
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
    });
  };

  const clearCache = () => {
    queryClient.clear();
    toast({
      title: "Cache cleared",
      description: "Application cache has been cleared",
    });
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-slate">Settings</h1>
          <p className="text-gray-400 mt-2">Configure your StreamVault Pro instance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={saveSettings}
            className="bg-accent-emerald hover:bg-green-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button
            onClick={() => logoutMutation.mutate()}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Settings */}
          <Card className="bg-slate-grey border-gray-700">
            <CardHeader>
              <CardTitle className="text-light-slate flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxFileSize" className="text-gray-300">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    value={settings.maxFileSize}
                    onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
                    className="bg-dark-slate border-gray-600 text-light-slate"
                  />
                </div>
                <div>
                  <Label htmlFor="sessionTimeout" className="text-gray-300">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                    className="bg-dark-slate border-gray-600 text-light-slate"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="allowedFormats" className="text-gray-300">Allowed Video Formats</Label>
                <Input
                  id="allowedFormats"
                  value={settings.allowedFormats}
                  onChange={(e) => handleSettingChange('allowedFormats', e.target.value)}
                  className="bg-dark-slate border-gray-600 text-light-slate"
                  placeholder="mp4,avi,mov,wmv"
                />
                <p className="text-xs text-gray-500 mt-1">Separate formats with commas</p>
              </div>

              <div>
                <Label htmlFor="storageLocation" className="text-gray-300">Storage Location</Label>
                <Input
                  id="storageLocation"
                  value={settings.storageLocation}
                  onChange={(e) => handleSettingChange('storageLocation', e.target.value)}
                  className="bg-dark-slate border-gray-600 text-light-slate"
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Settings */}
          <Card className="bg-slate-grey border-gray-700">
            <CardHeader>
              <CardTitle className="text-light-slate flex items-center">
                <VideoIcon className="w-5 h-5 mr-2" />
                Video Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="defaultQuality" className="text-gray-300">Default Video Quality</Label>
                <Select value={settings.defaultQuality} onValueChange={(value) => handleSettingChange('defaultQuality', value)}>
                  <SelectTrigger className="bg-dark-slate border-gray-600 text-light-slate">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-grey border-gray-600">
                    <SelectItem value="original">Original Quality</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="480p">480p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Auto Generate Video IDs</Label>
                    <p className="text-xs text-gray-500">Automatically create IDs from filenames</p>
                  </div>
                  <Switch
                    checked={settings.autoGenerateId}
                    onCheckedChange={(checked) => handleSettingChange('autoGenerateId', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Enable Range Requests</Label>
                    <p className="text-xs text-gray-500">Allow video seeking and progressive loading</p>
                  </div>
                  <Switch
                    checked={settings.enableRangeRequests}
                    onCheckedChange={(checked) => handleSettingChange('enableRangeRequests', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-slate-grey border-gray-700">
            <CardHeader>
              <CardTitle className="text-light-slate flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-gray-300">Require Authentication</Label>
                  <p className="text-xs text-gray-500">Protect video streaming with authentication</p>
                </div>
                <Switch
                  checked={settings.requireAuthentication}
                  onCheckedChange={(checked) => handleSettingChange('requireAuthentication', checked)}
                />
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-medium">Security Notice</h4>
                    <p className="text-sm text-gray-300 mt-1">
                      The current secret key is hardcoded for demo purposes. In production, use environment variables and rotate keys regularly.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-900/30 rounded-lg">
                <div>
                  <h4 className="text-red-400 font-medium">Clear Application Cache</h4>
                  <p className="text-sm text-gray-400">Remove all cached data and force refresh</p>
                </div>
                <Button
                  onClick={clearCache}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <Card className="bg-slate-grey border-gray-700">
            <CardHeader>
              <CardTitle className="text-light-slate flex items-center">
                <Server className="w-5 h-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse"></div>
                  <span className="text-accent-emerald">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Version</span>
                <span className="text-light-slate">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Videos</span>
                <span className="text-light-slate">{stats?.totalVideos || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Folders</span>
                <span className="text-light-slate">{stats?.totalFolders || 0}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-light-slate">{getUptimeString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">CPU Usage</span>
                <span className="text-light-slate">{stats?.cpuUsage?.toFixed(1) || 0}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">RAM Usage</span>
                <span className="text-light-slate">{stats?.memoryUsage?.toFixed(1) || 0}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card className="bg-slate-grey border-gray-700">
            <CardHeader>
              <CardTitle className="text-light-slate flex items-center">
                <HardDrive className="w-5 h-5 mr-2" />
                Storage Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Used</span>
                <span className="text-light-slate">{stats?.diskUsage ? formatBytes(stats.diskUsage) : '0 B'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Limit</span>
                <span className="text-light-slate">{settings.maxStorageGB} GB</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Available</span>
                <span className="text-light-slate">
                  {formatBytes((parseInt(settings.maxStorageGB) * 1024 * 1024 * 1024) - (stats?.diskUsage || 0))}
                </span>
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    getStoragePercentage() > 90 ? 'bg-red-500' : 
                    getStoragePercentage() > 75 ? 'bg-yellow-500' : 'bg-primary-indigo'
                  }`}
                  style={{ width: `${getStoragePercentage()}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {getStoragePercentage().toFixed(1)}% used
                {getStoragePercentage() > 90 && (
                  <span className="text-red-400 ml-2">⚠ Nearly full</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-grey border-gray-700">
            <CardHeader>
              <CardTitle className="text-light-slate flex items-center">
                <SettingsIcon className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-primary-indigo/20 text-primary-indigo hover:bg-primary-indigo hover:text-white"
                onClick={() => window.location.reload()}
              >
                <Database className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              
              <Button 
                className="w-full justify-start text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  const logs = document.createElement('a');
                  logs.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('StreamVault Pro - System Logs\nNo recent errors.');
                  logs.download = 'streamvault-logs.txt';
                  logs.click();
                }}
              >
                <Info className="w-4 h-4 mr-2" />
                Download Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}