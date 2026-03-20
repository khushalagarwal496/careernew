import { useState } from 'react';
import { Search, AlertCircle, CheckCircle, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AnalysisResult {
  hasError: boolean;
  analysis: {
    errorType: string;
    errorLine: number;
    errorMessage: string;
    correctedCode: string;
    explanation: string;
    conceptExplanation: string;
    practiceQuestions: Array<{
      question: string;
      difficulty: string;
      concept: string;
    }>;
  } | null;
}

interface CodeAnalysisProps {
  isDark: boolean;
}

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '🔧' },
  { value: 'typescript', label: 'TypeScript', icon: '📘' },
];

export const CodeAnalysis = ({ isDark }: CodeAnalysisProps) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();

  const bgMain = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const bgCard = isDark ? 'bg-[#252526]' : 'bg-white';
  const borderColor = isDark ? 'border-[#3c3c3c]' : 'border-gray-200';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please paste your code to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('code-analyze', {
        body: { code, language }
      });

      if (error) throw error;

      setResult(data);
      
      if (data.hasError) {
        toast({
          title: "Issues Found",
          description: `Found ${data.analysis?.errorType || 'issues'} in your code.`,
        });
      } else {
        toast({
          title: "No Issues Found",
          description: "Your code looks good!",
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze code.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCode = async () => {
    if (result?.analysis?.correctedCode) {
      await navigator.clipboard.writeText(result.analysis.correctedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Corrected code copied to clipboard." });
    }
  };

  return (
    <div className={cn("flex flex-col h-full", bgMain, textColor)}>
      {/* Header */}
      <div className={cn("px-6 py-4 border-b", borderColor)}>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          Code Analysis
        </h2>
        <p className={cn("text-sm mt-1", textMuted)}>
          Paste your code below to identify syntax errors, logical bugs, and security issues.
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Input */}
        <div className={cn("w-1/2 flex flex-col border-r", borderColor)}>
          <div className={cn("px-4 py-3 border-b flex items-center justify-between", borderColor)}>
            <span className="text-sm font-medium">Your Code</span>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 p-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`Paste your ${LANGUAGES.find(l => l.value === language)?.label || ''} code here...`}
              className={cn(
                "h-full resize-none font-mono text-sm",
                isDark ? "bg-[#1e1e1e] border-[#3c3c3c]" : "bg-white"
              )}
            />
          </div>
          
          <div className={cn("px-4 py-3 border-t", borderColor)}>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !code.trim()}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze & Fix Code
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="w-1/2 flex flex-col">
          <div className={cn("px-4 py-3 border-b", borderColor)}>
            <span className="text-sm font-medium">Analysis Results</span>
          </div>
          
          <ScrollArea className="flex-1">
            {!result && !isAnalyzing && (
              <div className={cn("flex items-center justify-center h-full", textMuted)}>
                <div className="text-center p-8">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Paste your code and click "Analyze & Fix Code" to see results</p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
                  <p>Analyzing your code...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="p-4 space-y-4">
                {/* Status Banner */}
                <div className={cn(
                  "p-4 rounded-lg flex items-center gap-3",
                  result.hasError 
                    ? "bg-red-500/10 border border-red-500/30" 
                    : "bg-green-500/10 border border-green-500/30"
                )}>
                  {result.hasError ? (
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {result.hasError ? 'Issues Found' : 'No Issues Found'}
                    </p>
                    {result.hasError && result.analysis && (
                      <p className={cn("text-sm", textMuted)}>
                        {result.analysis.errorType} on line {result.analysis.errorLine}
                      </p>
                    )}
                  </div>
                </div>

                {result.hasError && result.analysis && (
                  <>
                    {/* Error Explanation */}
                    <div className={cn("rounded-lg border p-4", bgCard, borderColor)}>
                      <h3 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Error Explanation
                      </h3>
                      <p className={cn("text-sm mb-3", textMuted)}>
                        <strong>Error:</strong> {result.analysis.errorMessage}
                      </p>
                      <p className="text-sm">
                        {result.analysis.explanation}
                      </p>
                    </div>

                    {/* Corrected Code */}
                    <div className={cn("rounded-lg border p-4", bgCard, borderColor)}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-green-500 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Corrected Code
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyCode}
                          className="h-7 px-2 gap-1"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className={cn(
                        "text-sm font-mono p-3 rounded overflow-x-auto",
                        isDark ? "bg-[#1e1e1e]" : "bg-gray-100"
                      )}>
                        <code>{result.analysis.correctedCode}</code>
                      </pre>
                    </div>

                    {/* Concept Explanation */}
                    {result.analysis.conceptExplanation && (
                      <div className={cn("rounded-lg border p-4", bgCard, borderColor)}>
                        <h3 className="font-semibold text-blue-500 mb-2">
                          💡 Concept Explanation
                        </h3>
                        <p className="text-sm">
                          {result.analysis.conceptExplanation}
                        </p>
                      </div>
                    )}

                    {/* Practice Questions */}
                    {result.analysis.practiceQuestions && result.analysis.practiceQuestions.length > 0 && (
                      <div className={cn("rounded-lg border p-4", bgCard, borderColor)}>
                        <h3 className="font-semibold text-purple-500 mb-3">
                          📝 Practice Questions
                        </h3>
                        <div className="space-y-3">
                          {result.analysis.practiceQuestions.map((q, i) => (
                            <div key={i} className={cn("p-3 rounded-lg", isDark ? "bg-[#1e1e1e]" : "bg-gray-50")}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded",
                                  q.difficulty === 'Easy' && "bg-green-500/20 text-green-500",
                                  q.difficulty === 'Medium' && "bg-yellow-500/20 text-yellow-500",
                                  q.difficulty === 'Hard' && "bg-red-500/20 text-red-500"
                                )}>
                                  {q.difficulty}
                                </span>
                                <span className={cn("text-xs", textMuted)}>{q.concept}</span>
                              </div>
                              <p className="text-sm">{q.question}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {!result.hasError && (
                  <div className={cn("rounded-lg border p-4 text-center", bgCard, borderColor)}>
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium">Your code looks great!</p>
                    <p className={cn("text-sm mt-1", textMuted)}>
                      No syntax errors, logical bugs, or security issues were detected.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CodeAnalysis;
