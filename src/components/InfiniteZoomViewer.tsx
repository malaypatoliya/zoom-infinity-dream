import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, MousePointer, Keyboard } from 'lucide-react';
import { toast } from 'sonner';

interface InfiniteZoomViewerProps {
  frames: string[];
}

export const InfiniteZoomViewer = ({ frames }: InfiniteZoomViewerProps) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<NodeJS.Timeout>();

  // Auto-play animation
  useEffect(() => {
    if (isAutoPlaying && frames.length > 0) {
      animationRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % frames.length);
      }, 150); // Adjust speed as needed
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isAutoPlaying, frames.length]);

  // Mouse wheel frame navigation
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1 : -1;
    setCurrentFrameIndex(prev => {
      const newIndex = prev + delta;
      return Math.max(0, Math.min(frames.length - 1, newIndex));
    });
  }, [frames.length]);

  // Mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPanPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentFrameIndex(prev => (prev - 1 + frames.length) % frames.length);
          break;
        case 'ArrowRight':
          setCurrentFrameIndex(prev => (prev + 1) % frames.length);
          break;
        case ' ':
          e.preventDefault();
          setIsAutoPlaying(prev => !prev);
          break;
        case 'r':
          reset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [frames.length]);

  // Add wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const reset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setCurrentFrameIndex(0);
    setIsAutoPlaying(false);
    toast.success('View reset');
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(prev => !prev);
    toast.success(isAutoPlaying ? 'Auto-play stopped' : 'Auto-play started');
  };

  if (frames.length === 0) {
    return (
      <Card className="p-8 text-center surface-glass">
        <p className="text-muted-foreground">No frames available. Please extract frames from a video first.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="p-4 surface-glass">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                onClick={toggleAutoPlay}
                variant={isAutoPlaying ? "default" : "outline"}
                size="sm"
                className="glow-effect"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button onClick={reset} variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Frame: {currentFrameIndex + 1} / {frames.length}
            </div>
          </div>

          {/* Frame slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Frame Position</label>
            <Slider
              value={[currentFrameIndex]}
              onValueChange={([value]) => setCurrentFrameIndex(value)}
              max={frames.length - 1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Zoom control */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom Level: {zoomLevel.toFixed(1)}x</label>
            <Slider
              value={[zoomLevel]}
              onValueChange={([value]) => setZoomLevel(value)}
              min={0.5}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Viewer */}
      <Card className="relative overflow-hidden surface-glass" style={{ height: '70vh' }}>
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={frames[currentFrameIndex]}
            alt={`Frame ${currentFrameIndex + 1}`}
            className="absolute inset-0 w-full h-full object-contain transition-transform duration-75"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
              transformOrigin: 'center'
            }}
            draggable={false}
          />
        </div>

        {/* Instructions overlay */}
        <div className="absolute top-4 left-4 surface-glass rounded-lg p-3 text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <MousePointer className="w-4 h-4 text-primary" />
            <span>Scroll to navigate frames, drag to pan</span>
          </div>
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4 text-primary" />
            <span>←/→ navigate, Space to play, R to reset</span>
          </div>
        </div>

        {/* Frame counter overlay */}
        <div className="absolute top-4 right-4 surface-glass rounded-lg px-3 py-2 text-sm font-mono">
          {currentFrameIndex + 1} / {frames.length}
        </div>
      </Card>
    </div>
  );
};