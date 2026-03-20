import { useState } from 'react';
import { Terminal, Trash2, ChevronUp, ChevronDown, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface ConsoleMessage {
  id: string;
  type: 'output' | 'error' | 'info' | 'success';
  content: string;
  timestamp: Date;
}

interface ConsoleProps {
  messages: ConsoleMessage[];
  onClear: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isDark?: boolean;
}

const getMessageIcon = (type: ConsoleMessage['type']) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'info':
      return <Info className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
};

const getMessageClass = (type: ConsoleMessage['type']) => {
  switch (type) {
    case 'error':
      return 'text-red-400 bg-red-500/10';
    case 'success':
      return 'text-green-400 bg-green-500/10';
    case 'info':
      return 'text-blue-400 bg-blue-500/10';
    default:
      return 'text-gray-300';
  }
};

export const Console = ({ messages, onClear, isCollapsed = false, onToggleCollapse, isDark = true }: ConsoleProps) => {
  const bgMain = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const bgHeader = isDark ? 'bg-[#252526]' : 'bg-gray-100';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  
  return (
    <div className={cn(
      "flex flex-col border-t transition-all duration-200",
      bgMain, borderColor,
      isCollapsed ? "h-10" : "h-48"
    )}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-3 py-1.5 border-b", bgHeader, borderColor)}>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Console</span>
          {messages.length > 0 && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {messages.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onClear}
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Messages */}
      {!isCollapsed && (
        <ScrollArea className="flex-1">
          <div className="p-2 font-mono text-sm space-y-1">
            {messages.length === 0 ? (
              <div className="text-muted-foreground text-xs italic py-2 px-2">
                Console output will appear here...
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex items-start gap-2 px-2 py-1 rounded text-xs",
                    getMessageClass(msg.type)
                  )}
                >
                  {getMessageIcon(msg.type)}
                  <span className="text-gray-500 shrink-0">
                    [{msg.timestamp.toLocaleTimeString()}]
                  </span>
                  <pre className="whitespace-pre-wrap break-all flex-1">{msg.content}</pre>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
