import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, X, Sparkles, Code, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  currentCode: string;
  currentLanguage: string;
  onInsertCode?: (code: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const AIAssistant = ({ 
  currentCode, 
  currentLanguage, 
  onInsertCode,
  isOpen,
  onClose,
  isDark = true
}: AIAssistantProps) => {
  const bgMain = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const bgHeader = isDark ? 'bg-[#252526]' : 'bg-gray-100';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const bgMessage = isDark ? 'bg-[#252526]' : 'bg-white';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI coding assistant. I can help you write, debug, and improve your code. What would you like help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const extractCodeBlocks = (content: string): string[] => {
    const codeBlockRegex = /```[\w]*\n?([\s\S]*?)```/g;
    const matches = [];
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessageContent = (content: string, messageId: string) => {
    const parts = content.split(/(```[\w]*\n?[\s\S]*?```)/g);
    
    const codeBg = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-900';
    const codeBorder = isDark ? 'border-[#333]' : 'border-gray-700';
    const codeHeaderBg = isDark ? 'bg-[#252526]' : 'bg-gray-800';
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const langMatch = part.match(/```(\w*)\n?/);
        const language = langMatch?.[1] || currentLanguage;
        const codeText = part.replace(/```\w*\n?/, '').replace(/```$/, '').trim();
        const blockId = `${messageId}-${index}`;
        
        return (
          <div key={index} className={cn("my-2 rounded-md overflow-hidden border", codeBg, codeBorder)}>
            <div className={cn("flex items-center justify-between px-3 py-1.5 border-b", codeHeaderBg, codeBorder)}>
              <span className="text-xs text-muted-foreground">{language}</span>
              <div className="flex items-center gap-1">
                {onInsertCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs gap-1"
                    onClick={() => onInsertCode(codeText)}
                  >
                    <Code className="w-3 h-3" />
                    Insert
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs gap-1"
                  onClick={() => handleCopyCode(codeText, blockId)}
                >
                  {copiedId === blockId ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <pre className="p-3 text-sm overflow-x-auto">
              <code className="text-gray-300">{codeText}</code>
            </pre>
          </div>
        );
      }
      
      return <span key={index} className="whitespace-pre-wrap">{part}</span>;
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const isBeginnerCode = currentCode.length < 100 || !currentCode.includes('function');
      const contextPrompt = currentCode 
        ? `\n\nCurrent code context (${currentLanguage}):\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\`` 
        : '';
      
      const systemInstruction = isBeginnerCode
        ? "You are a helpful coding assistant for beginners. Provide simple, well-commented solutions with line-by-line explanations. Always respond in English."
        : "You are a professional coding assistant. Provide concise, optimized solutions with brief explanations. Always respond in English.";

      const { data, error } = await supabase.functions.invoke('study-chat', {
        body: { 
          message: `${userMessage.content}${contextPrompt}`,
          systemPrompt: systemInstruction
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I apologize, but I could not generate a response. Please try again.",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn("h-full flex flex-col border-l", bgMain, borderColor)}>

      <div className={cn("flex items-center justify-between px-4 py-3 border-b", bgHeader, borderColor)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Coding help & suggestions</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : bgMessage
                )}
              >
                {msg.role === 'assistant' 
                  ? renderMessageContent(msg.content, msg.id)
                  : msg.content
                }
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className={cn("rounded-lg px-3 py-2", bgMessage)}>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className={cn("p-3 border-t", borderColor)}>
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about coding..."
            className={cn("min-h-[60px] max-h-[120px] resize-none", isDark ? "bg-[#252526] border-[#333]" : "bg-white border-gray-200")}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
