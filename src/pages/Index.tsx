import { useState } from 'react';
import { VideoFrameExtractor } from '@/components/VideoFrameExtractor';
import { InfiniteZoomViewer } from '@/components/InfiniteZoomViewer';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Film, Zap } from 'lucide-react';

const Index = () => {
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("extract");

  const handleFramesExtracted = (frames: string[]) => {
    setExtractedFrames(frames);
    setActiveTab("viewer");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold gradient-text animate-glow-pulse">
            Infinite Zoom
          </h1>
          <p className="text-xl text-muted-foreground">
            Extract frames from video and create mesmerizing infinite zoom experiences
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 surface-glass">
            <TabsTrigger value="extract" className="flex items-center space-x-2">
              <Film className="w-4 h-4" />
              <span>Extract Frames</span>
            </TabsTrigger>
            <TabsTrigger value="viewer" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Zoom Viewer</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="mt-6">
            <VideoFrameExtractor onFramesExtracted={handleFramesExtracted} />
          </TabsContent>

          <TabsContent value="viewer" className="mt-6">
            <InfiniteZoomViewer frames={extractedFrames} />
          </TabsContent>
        </Tabs>

        {/* Info Cards */}
        {extractedFrames.length === 0 && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 surface-glass text-center animate-float">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Film className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Upload Video</h3>
              <p className="text-sm text-muted-foreground">
                Select any video file to extract frames for zooming
              </p>
            </Card>

            <Card className="p-6 surface-glass text-center animate-float" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Auto Extract</h3>
              <p className="text-sm text-muted-foreground">
                Automatically extracts 50 optimized frames from your video
              </p>
            </Card>

            <Card className="p-6 surface-glass text-center animate-float" style={{ animationDelay: '0.4s' }}>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 border-2 border-white rounded-full animate-zoom-pulse" />
              </div>
              <h3 className="font-semibold mb-2">Infinite Zoom</h3>
              <p className="text-sm text-muted-foreground">
                Navigate through frames with smooth zoom and pan controls
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
