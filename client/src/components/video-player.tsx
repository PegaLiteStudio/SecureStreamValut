import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoId, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-6xl bg-slate-grey rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-light-slate">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-light-slate"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-full"
            src={`/api/stream/${videoId}`}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
