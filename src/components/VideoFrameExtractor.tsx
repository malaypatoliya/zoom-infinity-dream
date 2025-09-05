import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Film, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const FRAME_SIZE = 100;

interface VideoFrameExtractorProps {
  onFramesExtracted: (frames: string[]) => void;
}

export const VideoFrameExtractor = ({ onFramesExtracted }: VideoFrameExtractorProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const extractFrames = useCallback(async (video: HTMLVideoElement, frameCount: number = FRAME_SIZE) => {
    if (!canvasRef.current) return [];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const frames: string[] = [];
    const duration = video.duration;
    const interval = duration / frameCount;

    // Set canvas size to optimize for performance while maintaining quality
    const maxDimension = 800;
    const aspectRatio = video.videoWidth / video.videoHeight;
    
    if (video.videoWidth > video.videoHeight) {
      canvas.width = Math.min(maxDimension, video.videoWidth);
      canvas.height = canvas.width / aspectRatio;
    } else {
      canvas.height = Math.min(maxDimension, video.videoHeight);
      canvas.width = canvas.height * aspectRatio;
    }

    for (let i = 0; i < frameCount; i++) {
      const time = i * interval;
      
      // Set video time and wait for it to load
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
        video.currentTime = time;
      });

      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 with optimized quality
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      frames.push(frameData);
      
      // Update progress
      setProgress(((i + 1) / frameCount) * 100);
    }

    return frames;
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    setVideoFile(file);
    toast.success('Video loaded! Click Extract Frames to begin.');
  };

  const handleExtractFrames = async () => {
    if (!videoFile || !videoRef.current) return;

    setIsExtracting(true);
    setProgress(0);

    try {
      const video = videoRef.current;
      
      // Load video
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = URL.createObjectURL(videoFile);
      });

      toast.success('Video loaded successfully, extracting frames...');
      
      // Extract frames
      const frames = await extractFrames(video, FRAME_SIZE);
      
      if (frames.length > 0) {
        onFramesExtracted(frames);
        toast.success(`Successfully extracted ${frames.length} frames!`);
      } else {
        throw new Error('No frames were extracted');
      }
    } catch (error) {
      console.error('Error extracting frames:', error);
      toast.error('Failed to extract frames from video');
    } finally {
      setIsExtracting(false);
      setProgress(0);
    }
  };

  return (
    <Card className="p-6 surface-glass border-border/50">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold gradient-text mb-2">Video Frame Extractor</h2>
          <p className="text-muted-foreground">
            Upload a video to extract frames for infinite zoom
          </p>
        </div>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="lg"
            className="w-full h-16 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
            disabled={isExtracting}
          >
            <Upload className="w-6 h-6 mr-3" />
            {videoFile ? videoFile.name : 'Select Video File'}
          </Button>

          {videoFile && (
            <Button
              onClick={handleExtractFrames}
              size="lg"
              className="w-full glow-effect"
              disabled={isExtracting}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Extracting Frames...
                </>
              ) : (
                <>
                  <Film className="w-5 h-5 mr-2" />
                  Extract Frames
                </>
              )}
            </Button>
          )}

          {isExtracting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extracting frames...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Hidden video and canvas elements */}
        <video
          ref={videoRef}
          className="hidden"
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>
    </Card>
  );
};