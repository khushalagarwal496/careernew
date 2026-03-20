import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Play, Lightbulb, AlertTriangle, CheckCircle, Loader2, BookOpen, Zap, Terminal, Copy, RotateCcw, Maximize2, Minimize2, Keyboard, Eye, Layout } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ErrorAnalysis {
  errorType: string;
  errorLine: number;
  errorMessage: string;
  correctedCode: string;
  explanation: string;
  conceptExplanation: string;
  practiceQuestions: {
    question: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    concept: string;
  }[];
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  exitCode: number;
}

interface Snippet {
  trigger: string;
  code: string;
  description: string;
  cursorOffset?: number;
}

type CompilerMode = 'code' | 'web';

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '🔧' },
];

const CODE_SNIPPETS: Record<string, Snippet[]> = {
  python: [
    { trigger: 'main', code: 'if __name__ == "__main__":\n    ', description: 'Main entry point', cursorOffset: 31 },
    { trigger: 'def', code: 'def function_name():\n    pass', description: 'Function definition', cursorOffset: 4 },
    { trigger: 'class', code: 'class ClassName:\n    def __init__(self):\n        pass', description: 'Class definition', cursorOffset: 6 },
    { trigger: 'fori', code: 'for i in range(10):\n    ', description: 'For loop with range', cursorOffset: 14 },
    { trigger: 'forr', code: 'for item in items:\n    ', description: 'For-each loop', cursorOffset: 9 },
    { trigger: 'while', code: 'while condition:\n    ', description: 'While loop', cursorOffset: 6 },
    { trigger: 'if', code: 'if condition:\n    ', description: 'If statement', cursorOffset: 3 },
    { trigger: 'ife', code: 'if condition:\n    pass\nelse:\n    pass', description: 'If-else statement', cursorOffset: 3 },
    { trigger: 'try', code: 'try:\n    pass\nexcept Exception as e:\n    print(e)', description: 'Try-except block', cursorOffset: 9 },
    { trigger: 'print', code: 'print("")', description: 'Print statement', cursorOffset: 7 },
    { trigger: 'inp', code: 'input("")', description: 'Input statement', cursorOffset: 7 },
    { trigger: 'list', code: '[] = []', description: 'List declaration', cursorOffset: 1 },
    { trigger: 'dict', code: '{} = {}', description: 'Dictionary declaration', cursorOffset: 1 },
    { trigger: 'lambda', code: 'lambda x: x', description: 'Lambda function', cursorOffset: 7 },
  ],
  javascript: [
    { trigger: 'log', code: 'console.log();', description: 'Console log', cursorOffset: 12 },
    { trigger: 'fn', code: 'function name() {\n    \n}', description: 'Function declaration', cursorOffset: 9 },
    { trigger: 'afn', code: 'const name = () => {\n    \n};', description: 'Arrow function', cursorOffset: 6 },
    { trigger: 'fori', code: 'for (let i = 0; i < length; i++) {\n    \n}', description: 'For loop', cursorOffset: 18 },
    { trigger: 'forof', code: 'for (const item of items) {\n    \n}', description: 'For-of loop', cursorOffset: 17 },
    { trigger: 'forin', code: 'for (const key in object) {\n    \n}', description: 'For-in loop', cursorOffset: 16 },
    { trigger: 'foreach', code: 'array.forEach((item) => {\n    \n});', description: 'ForEach method', cursorOffset: 6 },
    { trigger: 'map', code: 'array.map((item) => {\n    return item;\n});', description: 'Map method', cursorOffset: 6 },
    { trigger: 'filter', code: 'array.filter((item) => {\n    return true;\n});', description: 'Filter method', cursorOffset: 6 },
    { trigger: 'if', code: 'if (condition) {\n    \n}', description: 'If statement', cursorOffset: 4 },
    { trigger: 'ife', code: 'if (condition) {\n    \n} else {\n    \n}', description: 'If-else statement', cursorOffset: 4 },
    { trigger: 'switch', code: 'switch (key) {\n    case value:\n        break;\n    default:\n        break;\n}', description: 'Switch statement', cursorOffset: 8 },
    { trigger: 'try', code: 'try {\n    \n} catch (error) {\n    console.error(error);\n}', description: 'Try-catch block', cursorOffset: 10 },
    { trigger: 'async', code: 'async function name() {\n    \n}', description: 'Async function', cursorOffset: 15 },
    { trigger: 'await', code: 'await ', description: 'Await keyword', cursorOffset: 6 },
    { trigger: 'promise', code: 'new Promise((resolve, reject) => {\n    \n});', description: 'Promise', cursorOffset: 39 },
    { trigger: 'class', code: 'class ClassName {\n    constructor() {\n        \n    }\n}', description: 'Class definition', cursorOffset: 6 },
    { trigger: 'imp', code: "import { } from '';", description: 'Import statement', cursorOffset: 9 },
    { trigger: 'exp', code: 'export default ', description: 'Export default', cursorOffset: 15 },
  ],
  java: [
    { trigger: 'main', code: 'public static void main(String[] args) {\n    \n}', description: 'Main method', cursorOffset: 45 },
    { trigger: 'sout', code: 'System.out.println();', description: 'Print line', cursorOffset: 19 },
    { trigger: 'sin', code: 'Scanner scanner = new Scanner(System.in);', description: 'Scanner input', cursorOffset: 8 },
    { trigger: 'class', code: 'public class ClassName {\n    \n}', description: 'Class declaration', cursorOffset: 13 },
    { trigger: 'fori', code: 'for (int i = 0; i < length; i++) {\n    \n}', description: 'For loop', cursorOffset: 14 },
    { trigger: 'foreach', code: 'for (Type item : items) {\n    \n}', description: 'For-each loop', cursorOffset: 5 },
    { trigger: 'while', code: 'while (condition) {\n    \n}', description: 'While loop', cursorOffset: 7 },
    { trigger: 'dowhile', code: 'do {\n    \n} while (condition);', description: 'Do-while loop', cursorOffset: 9 },
    { trigger: 'if', code: 'if (condition) {\n    \n}', description: 'If statement', cursorOffset: 4 },
    { trigger: 'ife', code: 'if (condition) {\n    \n} else {\n    \n}', description: 'If-else statement', cursorOffset: 4 },
    { trigger: 'switch', code: 'switch (variable) {\n    case value:\n        break;\n    default:\n        break;\n}', description: 'Switch statement', cursorOffset: 8 },
    { trigger: 'try', code: 'try {\n    \n} catch (Exception e) {\n    e.printStackTrace();\n}', description: 'Try-catch block', cursorOffset: 10 },
    { trigger: 'method', code: 'public void methodName() {\n    \n}', description: 'Method declaration', cursorOffset: 12 },
    { trigger: 'array', code: 'Type[] arrayName = new Type[size];', description: 'Array declaration', cursorOffset: 0 },
    { trigger: 'list', code: 'List<Type> list = new ArrayList<>();', description: 'ArrayList declaration', cursorOffset: 5 },
  ],
  cpp: [
    { trigger: 'main', code: 'int main() {\n    \n    return 0;\n}', description: 'Main function', cursorOffset: 17 },
    { trigger: 'cout', code: 'cout << "" << endl;', description: 'Console output', cursorOffset: 8 },
    { trigger: 'cin', code: 'cin >> variable;', description: 'Console input', cursorOffset: 7 },
    { trigger: 'include', code: '#include <iostream>\nusing namespace std;\n', description: 'Include iostream', cursorOffset: 10 },
    { trigger: 'fori', code: 'for (int i = 0; i < n; i++) {\n    \n}', description: 'For loop', cursorOffset: 14 },
    { trigger: 'foreach', code: 'for (auto& item : container) {\n    \n}', description: 'Range-based for', cursorOffset: 11 },
    { trigger: 'while', code: 'while (condition) {\n    \n}', description: 'While loop', cursorOffset: 7 },
    { trigger: 'dowhile', code: 'do {\n    \n} while (condition);', description: 'Do-while loop', cursorOffset: 9 },
    { trigger: 'if', code: 'if (condition) {\n    \n}', description: 'If statement', cursorOffset: 4 },
    { trigger: 'ife', code: 'if (condition) {\n    \n} else {\n    \n}', description: 'If-else statement', cursorOffset: 4 },
    { trigger: 'switch', code: 'switch (variable) {\n    case value:\n        break;\n    default:\n        break;\n}', description: 'Switch statement', cursorOffset: 8 },
    { trigger: 'try', code: 'try {\n    \n} catch (exception& e) {\n    cerr << e.what() << endl;\n}', description: 'Try-catch block', cursorOffset: 10 },
    { trigger: 'class', code: 'class ClassName {\npublic:\n    ClassName() {}\n    ~ClassName() {}\nprivate:\n};', description: 'Class declaration', cursorOffset: 6 },
    { trigger: 'struct', code: 'struct StructName {\n    \n};', description: 'Struct declaration', cursorOffset: 7 },
    { trigger: 'func', code: 'void functionName() {\n    \n}', description: 'Function declaration', cursorOffset: 5 },
    { trigger: 'vector', code: 'vector<int> vec;', description: 'Vector declaration', cursorOffset: 8 },
  ],
  c: [
    { trigger: 'main', code: 'int main() {\n    \n    return 0;\n}', description: 'Main function', cursorOffset: 17 },
    { trigger: 'printf', code: 'printf("\\n");', description: 'Print formatted', cursorOffset: 8 },
    { trigger: 'scanf', code: 'scanf("%d", &variable);', description: 'Scan input', cursorOffset: 8 },
    { trigger: 'include', code: '#include <stdio.h>\n', description: 'Include stdio', cursorOffset: 10 },
    { trigger: 'includeh', code: '#include <stdlib.h>\n#include <string.h>\n', description: 'Common includes', cursorOffset: 10 },
    { trigger: 'fori', code: 'for (int i = 0; i < n; i++) {\n    \n}', description: 'For loop', cursorOffset: 14 },
    { trigger: 'while', code: 'while (condition) {\n    \n}', description: 'While loop', cursorOffset: 7 },
    { trigger: 'dowhile', code: 'do {\n    \n} while (condition);', description: 'Do-while loop', cursorOffset: 9 },
    { trigger: 'if', code: 'if (condition) {\n    \n}', description: 'If statement', cursorOffset: 4 },
    { trigger: 'ife', code: 'if (condition) {\n    \n} else {\n    \n}', description: 'If-else statement', cursorOffset: 4 },
    { trigger: 'switch', code: 'switch (variable) {\n    case value:\n        break;\n    default:\n        break;\n}', description: 'Switch statement', cursorOffset: 8 },
    { trigger: 'func', code: 'void functionName() {\n    \n}', description: 'Function declaration', cursorOffset: 5 },
    { trigger: 'struct', code: 'struct StructName {\n    \n};', description: 'Struct declaration', cursorOffset: 7 },
    { trigger: 'typedef', code: 'typedef struct {\n    \n} TypeName;', description: 'Typedef struct', cursorOffset: 21 },
    { trigger: 'array', code: 'int arr[SIZE];', description: 'Array declaration', cursorOffset: 4 },
    { trigger: 'malloc', code: 'int* ptr = (int*)malloc(sizeof(int) * size);', description: 'Dynamic allocation', cursorOffset: 5 },
  ],
};

const SAMPLE_CODES: Record<string, string> = {
  python: `# Python - Hello World
name = "Student"
print("Hello, " + name + "!")
print("Welcome to Smart Compiler!")

# Try some math
for i in range(1, 6):
    print(f"Number: {i}, Square: {i*i}")`,
  javascript: `// JavaScript - Hello World
const name = "Student";
console.log("Hello, " + name + "!");
console.log("Welcome to Smart Compiler!");

// Try some math
for (let i = 1; i <= 5; i++) {
    console.log("Number: " + i + ", Square: " + (i*i));
}`,
  java: `// Java - Hello World
public class Main {
    public static void main(String[] args) {
        String name = "Student";
        System.out.println("Hello, " + name + "!");
        System.out.println("Welcome to Smart Compiler!");
        
        // Try some math
        for (int i = 1; i <= 5; i++) {
            System.out.println("Number: " + i + ", Square: " + (i*i));
        }
    }
}`,
  cpp: `// C++ - Hello World
#include <iostream>
using namespace std;

int main() {
    string name = "Student";
    cout << "Hello, " << name << "!" << endl;
    cout << "Welcome to Smart Compiler!" << endl;
    
    // Try some math
    for (int i = 1; i <= 5; i++) {
        cout << "Number: " << i << ", Square: " << i*i << endl;
    }
    return 0;
}`,
  c: `// C - Hello World
#include <stdio.h>

int main() {
    char name[] = "Student";
    printf("Hello, %s!\\n", name);
    printf("Welcome to Smart Compiler!\\n");
    
    // Try some math
    for (int i = 1; i <= 5; i++) {
        printf("Number: %d, Square: %d\\n", i, i*i);
    }
    return 0;
}`,
};

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
        <nav>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Hello World!</h2>
            <p>This is a sample HTML page. Edit the code to see live changes!</p>
            <button onclick="alert('Hello!')">Click Me</button>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>`;

const SAMPLE_CSS = `/* Modern CSS Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

header {
    background: rgba(255, 255, 255, 0.95);
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 {
    color: #667eea;
    margin-bottom: 0.5rem;
}

nav a {
    margin-right: 1rem;
    color: #764ba2;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
}

nav a:hover {
    color: #667eea;
}

main {
    padding: 2rem;
    max-width: 800px;
    margin: 2rem auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

section h2 {
    color: #667eea;
    margin-bottom: 1rem;
}

button {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

footer {
    text-align: center;
    padding: 1rem;
    color: white;
}`;

const CodeCompiler = () => {
  const [mode, setMode] = useState<CompilerMode>('code');
  const [code, setCode] = useState('');
  const [htmlCode, setHtmlCode] = useState(SAMPLE_HTML);
  const [cssCode, setCssCode] = useState(SAMPLE_CSS);
  const [language, setLanguage] = useState('python');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [analysis, setAnalysis] = useState<ErrorAnalysis | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [showCorrectedCode, setShowCorrectedCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [snippetTrigger, setSnippetTrigger] = useState('');
  const [webActiveTab, setWebActiveTab] = useState<'html' | 'css'>('html');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);
  const cssTextareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();
  const { session } = useAuth();

  const lines = code.split('\n');
  const lineCount = lines.length;

  // Generate combined HTML for preview
  const getPreviewHtml = useCallback(() => {
    const styleTag = `<style>${cssCode}</style>`;
    // Inject CSS before closing head tag, or at start if no head
    if (htmlCode.includes('</head>')) {
      return htmlCode.replace('</head>', `${styleTag}</head>`);
    } else if (htmlCode.includes('<body>')) {
      return htmlCode.replace('<body>', `${styleTag}<body>`);
    }
    return `${styleTag}${htmlCode}`;
  }, [htmlCode, cssCode]);

  // Update iframe preview
  useEffect(() => {
    if (mode === 'web' && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(getPreviewHtml());
        doc.close();
      }
    }
  }, [mode, htmlCode, cssCode, getPreviewHtml]);

  // Get current word at cursor
  const getCurrentWord = useCallback(() => {
    if (!textareaRef.current) return { word: '', start: 0, end: 0 };
    
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = code.substring(0, cursorPos);
    const textAfterCursor = code.substring(cursorPos);
    
    const wordStartMatch = textBeforeCursor.match(/\w+$/);
    const wordEndMatch = textAfterCursor.match(/^\w*/);
    
    const wordStart = wordStartMatch ? cursorPos - wordStartMatch[0].length : cursorPos;
    const wordEnd = cursorPos + (wordEndMatch ? wordEndMatch[0].length : 0);
    const word = code.substring(wordStart, wordEnd);
    
    return { word, start: wordStart, end: wordEnd };
  }, [code]);

  // Filter snippets based on current word
  const updateSnippetSuggestions = useCallback(() => {
    const { word } = getCurrentWord();
    const snippets = CODE_SNIPPETS[language] || [];
    
    if (word.length >= 2) {
      const filtered = snippets.filter(s => 
        s.trigger.toLowerCase().startsWith(word.toLowerCase())
      );
      setFilteredSnippets(filtered);
      setShowSnippets(filtered.length > 0);
      setSnippetTrigger(word);
      setSelectedSnippetIndex(0);
    } else {
      setShowSnippets(false);
      setFilteredSnippets([]);
    }
  }, [getCurrentWord, language]);

  // Apply snippet
  const applySnippet = useCallback((snippet: Snippet) => {
    const { start, end } = getCurrentWord();
    const newCode = code.substring(0, start) + snippet.code + code.substring(end);
    setCode(newCode);
    setShowSnippets(false);
    
    if (textareaRef.current) {
      const newCursorPos = start + (snippet.cursorOffset || snippet.code.length);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
    
    toast({
      title: "✨ Snippet Inserted",
      description: `"${snippet.trigger}" → ${snippet.description}`,
    });
  }, [code, getCurrentWord, toast]);

  // Handle keyboard events for snippet navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSnippets && filteredSnippets.length > 0) {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        applySnippet(filteredSnippets[selectedSnippetIndex]);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSnippetIndex(prev => 
          prev < filteredSnippets.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSnippetIndex(prev => 
          prev > 0 ? prev - 1 : filteredSnippets.length - 1
        );
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSnippets(false);
        return;
      }
    }
  }, [showSnippets, filteredSnippets, selectedSnippetIndex, applySnippet]);

  // Update suggestions on code change
  useEffect(() => {
    const timer = setTimeout(updateSnippetSuggestions, 100);
    return () => clearTimeout(timer);
  }, [code, updateSnippetSuggestions]);

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setCode(SAMPLE_CODES[value] || '');
    setAnalysis(null);
    setExecutionResult(null);
    setShowSnippets(false);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter some code to run.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('code-run', {
        body: { code, language }
      });

      if (error) throw error;

      setExecutionResult(data);
      
      if (data.success) {
        toast({
          title: "Code Executed Successfully! ✅",
          description: "Check the output below.",
        });
      } else {
        toast({
          title: "Execution Error",
          description: "Your code has errors. Click 'Analyze & Fix' to get solutions.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error running code:', error);
      toast({
        title: "Execution Failed",
        description: "Could not run the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter some code to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('code-analyze', {
        body: { code, language },
      });

      if (error) throw error;

      if (data.hasError) {
        setAnalysis(data.analysis);
      } else {
        toast({
          title: "No Errors Found! ✅",
          description: "Your code looks correct. Try running it!",
        });
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    if (mode === 'web') {
      setHtmlCode(SAMPLE_HTML);
      setCssCode(SAMPLE_CSS);
    } else {
      setCode(SAMPLE_CODES[language] || '');
    }
    setAnalysis(null);
    setExecutionResult(null);
  };

  const handleClearCode = () => {
    if (mode === 'web') {
      setHtmlCode('');
      setCssCode('');
    } else {
      setCode('');
    }
    setAnalysis(null);
    setExecutionResult(null);
  };

  const handleCopyCode = () => {
    const textToCopy = mode === 'web' 
      ? (webActiveTab === 'html' ? htmlCode : cssCode)
      : code;
    navigator.clipboard.writeText(textToCopy);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard.",
    });
  };

  const handleApplyFix = () => {
    if (analysis?.correctedCode) {
      setCode(analysis.correctedCode);
      setAnalysis(null);
      setExecutionResult(null);
      toast({
        title: "Code Fixed!",
        description: "The corrected code has been applied. Now try running it!",
      });
    }
  };

  const getLineClass = (lineNumber: number) => {
    if (analysis && analysis.errorLine === lineNumber) {
      return 'bg-destructive/30 text-destructive font-bold';
    }
    return 'text-muted-foreground';
  };

  return (
    <div className={`min-h-screen bg-background py-8 px-4 ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary px-6 py-2 rounded-full mb-4 border border-primary/30">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-lg">Smart AI Compiler</span>
            <Badge variant="secondary" className="ml-2">Pro</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Code, Run & Learn Instantly
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Write your code with our powerful editor. Get real-time execution, instant error detection, and live HTML/CSS preview.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'code' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('code')}
              className="gap-2"
            >
              <Terminal className="w-4 h-4" />
              Code Compiler
            </Button>
            <Button
              variant={mode === 'web' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('web')}
              className="gap-2"
            >
              <Layout className="w-4 h-4" />
              HTML/CSS Editor
            </Button>
          </div>
        </div>

        {mode === 'web' ? (
          /* Web Editor Mode */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Editors */}
            <Card className="bg-card border-border shadow-xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-muted border-b border-border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-lg">Web Editor</span>
                      <p className="text-xs text-muted-foreground font-normal">
                        HTML & CSS with Live Preview
                      </p>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen">
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 bg-muted/30 border-b border-border flex-wrap">
                  <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-xs">
                    📝 Sample
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyCode} className="text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClearCode} className="text-xs">
                    <RotateCcw className="w-3 h-3 mr-1" /> Clear
                  </Button>
                </div>

                {/* Tabs for HTML/CSS */}
                <Tabs value={webActiveTab} onValueChange={(v) => setWebActiveTab(v as 'html' | 'css')} className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/30">
                    <TabsTrigger value="html" className="gap-2 data-[state=active]:bg-background">
                      <span className="text-orange-500">🔶</span> HTML
                    </TabsTrigger>
                    <TabsTrigger value="css" className="gap-2 data-[state=active]:bg-background">
                      <span className="text-blue-500">🔷</span> CSS
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="m-0">
                    <textarea
                      ref={htmlTextareaRef}
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      placeholder="<!-- Write your HTML here -->"
                      className="w-full min-h-[400px] bg-muted/20 border-none outline-none resize-none font-mono text-sm text-foreground p-4 leading-6"
                      spellCheck={false}
                    />
                  </TabsContent>
                  <TabsContent value="css" className="m-0">
                    <textarea
                      ref={cssTextareaRef}
                      value={cssCode}
                      onChange={(e) => setCssCode(e.target.value)}
                      placeholder="/* Write your CSS here */"
                      className="w-full min-h-[400px] bg-muted/20 border-none outline-none resize-none font-mono text-sm text-foreground p-4 leading-6"
                      spellCheck={false}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card className="bg-card border-border shadow-xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-muted border-b border-border">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <span className="text-lg">Live Preview</span>
                    <p className="text-xs text-muted-foreground font-normal">
                      Real-time rendering
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white min-h-[500px] relative">
                  <iframe
                    ref={iframeRef}
                    title="Live Preview"
                    className="w-full h-[500px] border-none"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Code Compiler Mode */
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Code Editor Section */}
            <Card className="bg-card border-border shadow-xl overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-muted border-b border-border">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Code className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-lg">Code Editor</span>
                      <p className="text-xs text-muted-foreground font-normal">
                        {lineCount} lines • {language.toUpperCase()}
                      </p>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[150px] bg-background">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <span className="flex items-center gap-2">
                              <span>{lang.icon}</span>
                              <span>{lang.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen">
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Toolbar */}
                <div className="flex items-center gap-1 px-3 py-2 bg-muted/30 border-b border-border flex-wrap">
                  <Button variant="ghost" size="sm" onClick={handleLoadSample} className="text-xs">
                    📝 Sample
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSnippets(!showSnippets)} 
                    className="text-xs"
                    title="View available code snippets"
                  >
                    <Keyboard className="w-3 h-3 mr-1" /> Snippets
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyCode} className="text-xs">
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleClearCode} className="text-xs">
                    <RotateCcw className="w-3 h-3 mr-1" /> Clear
                  </Button>
                  <div className="flex-1" />
                  <Badge variant="outline" className="text-xs hidden sm:flex">
                    Tab = Insert Snippet
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {LANGUAGES.find(l => l.value === language)?.icon} {language}
                  </Badge>
                </div>

                {/* Code Editor with Line Numbers */}
                <div className="relative flex bg-muted/20">
                  {/* Line Numbers */}
                  <div
                    ref={lineNumbersRef}
                    className="flex-shrink-0 bg-muted/50 border-r border-border select-none overflow-hidden"
                    style={{ width: '50px' }}
                  >
                    {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className={`px-2 text-right leading-6 text-xs font-mono ${getLineClass(num)}`}
                        style={{ minHeight: '24px' }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  {/* Code Input Area */}
                  <div className="flex-1 relative">
                    {/* Highlighted Code Display (for error line highlighting) */}
                    {analysis && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                        {lines.map((_, index) => {
                          const lineNumber = index + 1;
                          const isErrorLine = analysis.errorLine === lineNumber;
                          if (!isErrorLine) return null;
                          return (
                            <div
                              key={lineNumber}
                              className="absolute left-0 right-0 bg-destructive/20 border-l-4 border-destructive"
                              style={{
                                top: `${(lineNumber - 1) * 24}px`,
                                height: '24px',
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Snippet Autocomplete Dropdown */}
                    {showSnippets && filteredSnippets.length > 0 && (
                      <div className="absolute z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-[200px] overflow-y-auto"
                        style={{
                          top: '30px',
                          left: '16px',
                          minWidth: '280px',
                        }}
                      >
                        <div className="px-3 py-1.5 bg-muted border-b border-border">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Keyboard className="w-3 h-3" />
                            <span>Press <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] font-mono">Tab</kbd> to insert</span>
                          </div>
                        </div>
                        {filteredSnippets.map((snippet, index) => (
                          <div
                            key={snippet.trigger}
                            className={`px-3 py-2 cursor-pointer flex items-center gap-3 transition-colors ${
                              index === selectedSnippetIndex 
                                ? 'bg-primary/20 text-primary' 
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => applySnippet(snippet)}
                          >
                            <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-primary font-bold">
                              {snippet.trigger}
                            </code>
                            <span className="text-sm text-muted-foreground">{snippet.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <textarea
                      ref={textareaRef}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onScroll={handleScroll}
                      onKeyDown={handleKeyDown}
                      placeholder={`// Start coding in ${language}...\n// Type snippets like "fori", "main", "class" and press Tab\n// Or click "📝 Snippets" to see all available`}
                      className="w-full min-h-[400px] bg-transparent border-none outline-none resize-none font-mono text-sm text-foreground p-0 leading-6"
                      style={{ 
                        paddingLeft: '16px',
                        paddingTop: '0',
                        lineHeight: '24px',
                      }}
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Error Line Indicator */}
                {analysis && (
                  <div className="px-4 py-3 bg-destructive/10 border-t border-destructive/30 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-destructive">
                        Error on Line {analysis.errorLine}: {analysis.errorType}
                      </p>
                      <p className="text-xs text-destructive/80 mt-1">
                        {analysis.errorMessage}
                      </p>
                    </div>
                    <Button size="sm" onClick={handleApplyFix} className="bg-destructive hover:bg-destructive/90 text-white">
                      Fix Now
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 p-4 bg-muted/30 border-t border-border">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunning || isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                    size="lg"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleAnalyzeCode}
                    disabled={isAnalyzing || isRunning}
                    variant="outline"
                    className="flex-1 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-lg"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-5 h-5 mr-2" />
                        Analyze & Fix
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output & Analysis Section */}
            <div className="space-y-4">
              {/* Output Panel */}
              <Card className="bg-card border-border shadow-xl">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-muted border-b border-border">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Terminal className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <span className="text-lg">Console Output</span>
                      <p className="text-xs text-muted-foreground font-normal">
                        Real-time execution results
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {isRunning ? (
                    <div className="bg-muted rounded-lg p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <p className="text-muted-foreground font-medium">Executing your code...</p>
                      <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
                    </div>
                  ) : executionResult ? (
                    <div className="space-y-3">
                      {executionResult.success ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-500/10 px-4 py-2 rounded-lg">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Execution Successful</span>
                          <Badge variant="secondary" className="ml-auto">Exit: 0</Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-semibold">Execution Failed</span>
                          <Badge variant="destructive" className="ml-auto">Exit: {executionResult.exitCode}</Badge>
                        </div>
                      )}
                      
                      {executionResult.output && (
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-xs text-muted-foreground mb-2 font-medium">Output:</p>
                          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
                            {executionResult.output}
                          </pre>
                        </div>
                      )}
                      
                      {executionResult.error && (
                        <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
                          <p className="text-xs text-destructive mb-2 font-medium">Error:</p>
                          <pre className="font-mono text-sm text-destructive whitespace-pre-wrap overflow-x-auto">
                            {executionResult.error}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                        <Play className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium">Run your code to see output here</p>
                      <p className="text-xs text-muted-foreground mt-1">Click "Run Code" to execute</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Panel */}
              {analysis && (
                <Card className="bg-card border-border shadow-xl animate-in slide-in-from-right">
                  <CardHeader className="pb-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-lg">AI Analysis</span>
                        <p className="text-xs text-muted-foreground font-normal">
                          Learn from your mistakes
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {/* Explanation */}
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        What went wrong?
                      </h4>
                      <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
                    </div>

                    {/* Concept Explanation */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        Concept to Learn
                      </h4>
                      <p className="text-sm text-muted-foreground">{analysis.conceptExplanation}</p>
                    </div>

                    {/* Corrected Code Toggle */}
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCorrectedCode(!showCorrectedCode)}
                        className="w-full justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          View Corrected Code
                        </span>
                        <span>{showCorrectedCode ? '▲' : '▼'}</span>
                      </Button>
                      {showCorrectedCode && (
                        <div className="mt-2 bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap overflow-x-auto">
                            {analysis.correctedCode}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Practice Questions */}
                    {analysis.practiceQuestions && analysis.practiceQuestions.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-500" />
                          Practice Questions
                        </h4>
                        {analysis.practiceQuestions.map((q, index) => (
                          <div key={index} className="bg-muted rounded-lg p-3 border-l-4 border-purple-500">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={q.difficulty === 'Easy' ? 'secondary' : q.difficulty === 'Medium' ? 'default' : 'destructive'}>
                                {q.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{q.concept}</span>
                            </div>
                            <p className="text-sm text-foreground">{q.question}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeCompiler;
