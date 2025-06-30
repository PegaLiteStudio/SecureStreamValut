import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, X, CheckCircle } from "lucide-react";
import { type Folder } from "@shared/schema";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  currentFolderId: number | null;
}

export default function UploadModal({ open, onClose, currentFolderId }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [customId, setCustomId] = useState("");
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState<string>(currentFolderId?.toString() || "root");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['/api/folders/all'],
    queryFn: async () => {
      const response = await fetch('/api/folders/all', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch folders');
      return response.json();
    },
    enabled: open,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText || 'Upload failed'));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.open('POST', '/api/videos/upload');
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    },
    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Upload successful",
        description: "Video has been uploaded successfully",
      });
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        resetForm();
        onClose();
      }, 1000);
    },
    onError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFile(null);
    setCustomId("");
    setTitle("");
    setFolderId(currentFolderId?.toString() || "root");
    setDescription("");
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      if (!customId) {
        const id = selectedFile.name
          .replace(/\.[^/.]+$/, "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        setCustomId(id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !customId || !title) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('customId', customId);
    formData.append('title', title);
    if (folderId && folderId !== "root") {
      formData.append('folderId', folderId);
    }
    if (description) {
      formData.append('description', description);
    }

    uploadMutation.mutate(formData);
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-grey border-gray-700 text-light-slate max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload New Video</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {uploadProgress === 100 ? (
                    <CheckCircle className="w-5 h-5 text-accent-emerald" />
                  ) : (
                    <CloudUpload className="w-5 h-5 text-primary-indigo animate-pulse" />
                  )}
                  <span className="text-light-slate font-medium">
                    {uploadProgress === 100 ? 'Processing...' : `Uploading... ${uploadProgress}%`}
                  </span>
                </div>
                <Progress value={uploadProgress} className="w-full h-2" />
                <p className="text-sm text-gray-400 mt-2">
                  {file ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)` : ''}
                </p>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary-indigo/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudUpload className="w-8 h-8 text-primary-indigo" />
            </div>
            <h4 className="text-lg font-medium text-light-slate mb-2">
              {file ? file.name : "Drag and drop your video file"}
            </h4>
            <p className="text-gray-400 mb-4">or click to browse files</p>
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
              id="videoFile"
              disabled={isUploading}
            />
            <Button
              type="button"
              onClick={() => document.getElementById('videoFile')?.click()}
              className="bg-primary-indigo hover:bg-blue-600 text-white"
              disabled={isUploading}
            >
              Choose Video File
            </Button>
            {file && (
              <p className="text-sm text-gray-400 mt-2">
                Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customId" className="text-gray-300">Video ID *</Label>
              <Input
                id="customId"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="e.g., doraemon-nobita-episode-1"
                className="bg-dark-slate border-gray-600 text-light-slate placeholder-gray-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="folder" className="text-gray-300">Folder</Label>
              <Select value={folderId} onValueChange={setFolderId} disabled={isUploading}>
                <SelectTrigger className="bg-dark-slate border-gray-600 text-light-slate">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent className="bg-slate-grey border-gray-600">
                  <SelectItem value="root">Root Folder</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="title" className="text-gray-300">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="bg-dark-slate border-gray-600 text-light-slate placeholder-gray-400"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your video..."
              rows={3}
              className="bg-dark-slate border-gray-600 text-light-slate placeholder-gray-400 resize-none"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              className="bg-gray-700 hover:bg-gray-600 text-light-slate border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !file || !customId || !title}
              className="gradient-primary text-white"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
