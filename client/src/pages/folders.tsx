import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FolderPlus, 
  Folder as FolderIcon, 
  Video as VideoIcon,
  ChevronRight,
  Home,
  Edit,
  Trash2,
  ArrowLeft
} from "lucide-react";
import FolderModal from "@/components/folder-modal";
import { type Folder, type Video } from "@shared/schema";

export default function Folders() {
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders = [], isLoading: foldersLoading } = useQuery<Folder[]>({
    queryKey: ['/api/folders', currentFolderId],
    queryFn: async () => {
      const response = await fetch(`/api/folders?parentId=${currentFolderId || ''}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch folders');
      return response.json();
    },
  });

  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['/api/videos', currentFolderId],
    queryFn: async () => {
      const response = await fetch(`/api/videos?folderId=${currentFolderId || ''}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    },
  });

  const { data: currentFolder } = useQuery<Folder>({
    queryKey: ['/api/folders', currentFolderId, 'single'],
    queryFn: async () => {
      if (!currentFolderId) return null;
      const response = await fetch(`/api/folders/${currentFolderId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch folder');
      return response.json();
    },
    enabled: !!currentFolderId,
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (folderId: number) => apiRequest('DELETE', `/api/folders/${folderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    },
  });

  const navigateToFolder = (folder: Folder) => {
    setBreadcrumb([...breadcrumb, folder]);
    setCurrentFolderId(folder.id);
  };

  const navigateBack = () => {
    if (breadcrumb.length === 0) return;
    
    const newBreadcrumb = [...breadcrumb];
    newBreadcrumb.pop();
    setBreadcrumb(newBreadcrumb);
    
    if (newBreadcrumb.length === 0) {
      setCurrentFolderId(null);
    } else {
      setCurrentFolderId(newBreadcrumb[newBreadcrumb.length - 1].id);
    }
  };

  const navigateToRoot = () => {
    setBreadcrumb([]);
    setCurrentFolderId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-light-slate">Folder Management</h1>
          <p className="text-gray-400 mt-2">Organize your videos into folders</p>
        </div>
        <Button
          onClick={() => setFolderModalOpen(true)}
          className="gradient-primary text-white"
        >
          <FolderPlus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={navigateToRoot}
          className="text-gray-400 hover:text-light-slate"
        >
          <Home className="w-4 h-4 mr-1" />
          Root
        </Button>
        {breadcrumb.map((folder, index) => (
          <div key={folder.id} className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 text-gray-500" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newBreadcrumb = breadcrumb.slice(0, index + 1);
                setBreadcrumb(newBreadcrumb);
                setCurrentFolderId(folder.id);
              }}
              className="text-gray-400 hover:text-light-slate"
            >
              {folder.name}
            </Button>
          </div>
        ))}
        {currentFolderId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            className="text-primary-indigo hover:text-blue-400 ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
      </div>

      {/* Folder Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Subfolders</p>
                <p className="text-3xl font-bold text-light-slate">{folders.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary-indigo/20 rounded-lg flex items-center justify-center">
                <FolderIcon className="w-6 h-6 text-primary-indigo" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Videos</p>
                <p className="text-3xl font-bold text-light-slate">{videos.length}</p>
              </div>
              <div className="w-12 h-12 bg-secondary-purple/20 rounded-lg flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-secondary-purple" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-grey border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Current Path</p>
                <p className="text-xl font-bold text-light-slate">
                  {currentFolder ? currentFolder.name : "Root"}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent-emerald/20 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-accent-emerald" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Folder Grid */}
      <Card className="bg-slate-grey border-gray-700">
        <CardHeader>
          <CardTitle className="text-light-slate">
            {currentFolder ? `Contents of "${currentFolder.name}"` : "Root Folder Contents"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {foldersLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-dark-slate rounded-lg p-4 animate-pulse">
                  <div className="aspect-video bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : folders.length === 0 && videos.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-light-slate mb-2">No items found</h3>
              <p className="text-gray-400 mb-4">This folder is empty. Create a new folder or upload videos.</p>
              <Button
                onClick={() => setFolderModalOpen(true)}
                className="gradient-primary text-white"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {folders.map((folder) => (
                <Card key={folder.id} className="bg-dark-slate border-gray-700 hover:border-primary-indigo/50 transition-all group">
                  <CardContent className="p-4">
                    <div 
                      className="aspect-video bg-gray-700 rounded flex items-center justify-center mb-4 cursor-pointer"
                      onClick={() => navigateToFolder(folder)}
                    >
                      <FolderIcon className="w-12 h-12 text-primary-indigo" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 
                        className="font-medium text-light-slate cursor-pointer hover:text-primary-indigo"
                        onClick={() => navigateToFolder(folder)}
                      >
                        {folder.name}
                      </h4>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400 h-6 w-6 p-0"
                          onClick={() => deleteFolderMutation.mutate(folder.id)}
                          disabled={deleteFolderMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Created {new Date(folder.createdAt!).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FolderModal 
        open={folderModalOpen} 
        onClose={() => setFolderModalOpen(false)}
        currentFolderId={currentFolderId}
      />
    </div>
  );
}