import { useState, useMemo } from 'react';
import { RefreshCw, ExternalLink, Smartphone, Monitor, Tablet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WebPreviewProps {
  html: string;
  css: string;
  javascript?: string;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES: Record<ViewportSize, { width: string; icon: React.ReactNode; label: string }> = {
  desktop: { width: '100%', icon: <Monitor className="w-4 h-4" />, label: 'Desktop' },
  tablet: { width: '768px', icon: <Tablet className="w-4 h-4" />, label: 'Tablet' },
  mobile: { width: '375px', icon: <Smartphone className="w-4 h-4" />, label: 'Mobile' },
};

export const WebPreview = ({ html, css, javascript = '' }: WebPreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate the full HTML content using srcdoc (avoids cross-origin issues)
  const previewContent = useMemo(() => {
    const styleTag = `<style>${css}</style>`;
    const scriptTag = javascript ? `<script>${javascript}<\/script>` : '';
    
    let fullHtml = html;
    
    // Inject CSS before closing head tag, or at start if no head
    if (html.includes('</head>')) {
      fullHtml = html.replace('</head>', `${styleTag}</head>`);
    } else if (html.includes('<body>')) {
      fullHtml = html.replace('<body>', `${styleTag}<body>`);
    } else {
      fullHtml = `${styleTag}${html}`;
    }
    
    // Inject JavaScript before closing body tag
    if (scriptTag) {
      if (fullHtml.includes('</body>')) {
        fullHtml = fullHtml.replace('</body>', `${scriptTag}</body>`);
      } else {
        fullHtml = `${fullHtml}${scriptTag}`;
      }
    }
    
    return fullHtml;
  }, [html, css, javascript, refreshKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([previewContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Live Preview</span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Viewport Selector */}
          <div className="flex items-center bg-[#1e1e1e] rounded-md p-0.5 mr-2">
            {(Object.keys(VIEWPORT_SIZES) as ViewportSize[]).map((size) => (
              <Button
                key={size}
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  viewport === size ? "bg-primary/20 text-primary" : "text-muted-foreground"
                )}
                onClick={() => setViewport(size)}
                title={VIEWPORT_SIZES[size].label}
              >
                {VIEWPORT_SIZES[size].icon}
              </Button>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
            title="Refresh Preview"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleOpenInNewTab}
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Preview Frame */}
      <div className="flex-1 bg-white overflow-auto flex justify-center">
        <div 
          className={cn(
            "h-full transition-all duration-300 relative",
            viewport !== 'desktop' && "shadow-xl"
          )}
          style={{ 
            width: VIEWPORT_SIZES[viewport].width,
            maxWidth: '100%'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          <iframe
            key={refreshKey}
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Web Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};
