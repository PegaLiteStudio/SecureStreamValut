import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { FolderPlus } from "lucide-react";
import { type Folder } from "@shared/schema";

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
  currentFolderId: number | null;
}

export default function FolderModal({ open, onClose, currentFolderId }: FolderModalProps) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>(currentFolderId?.toString() || "");
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

  const createMutation = useMutation({
    mutationFn: (data: { name: string; parentId: number | null }) => 
      apiRequest('POST', '/api/folders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/folders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/folders/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: "Folder created",
        description: "Folder has been created successfully",
      });
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setParentId(currentFolderId?.toString() || "root");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a folder name",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      parentId: parentId && parentId !== "root" ? parseInt(parentId) : null,
    });
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-grey border-gray-700 text-light-slate max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <FolderPlus className="w-5 h-5 mr-2" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="folderName" className="text-gray-300">Folder Name *</Label>
            <Input
              id="folderName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="bg-dark-slate border-gray-600 text-light-slate placeholder-gray-400"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="parentFolder" className="text-gray-300">Parent Folder</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger className="bg-dark-slate border-gray-600 text-light-slate">
                <SelectValue placeholder="Select parent folder" />
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
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
              className="bg-gray-700 hover:bg-gray-600 text-light-slate border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="gradient-primary text-white"
            >
              {createMutation.isPending ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
