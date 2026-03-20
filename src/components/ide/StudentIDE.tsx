import { useState } from 'react';
import { 
  Play, Bug, Save, RotateCcw, Maximize2, Minimize2, 
  Sparkles, StepForward, Square, PanelLeftClose, PanelLeft,
  FileCode, Eye, Sun, Moon, Code2, Globe, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileExplorer, FileNode } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { Console, ConsoleMessage } from './Console';
import { WebPreview } from './WebPreview';
import { AIAssistant } from './AIAssistant';
import { CodeAnalysis } from './CodeAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type IDEMode = 'web' | 'code' | 'analyze';
type ProgrammingLanguage = 'python' | 'java' | 'cpp' | 'c' | 'javascript';

const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
  { value: 'c', label: 'C', icon: '🔧' },
];

const SAMPLE_CODES: Record<ProgrammingLanguage, string> = {
  python: `# Python - Hello World
name = "Student"
print("Hello, " + name + "!")
print("Welcome to Career Compass IDE!")

# Try some math
for i in range(1, 6):
    print(f"Number: {i}, Square: {i*i}")`,
  javascript: `// JavaScript - Hello World
const name = "Student";
console.log("Hello, " + name + "!");
console.log("Welcome to Career Compass IDE!");

// Try some math
for (let i = 1; i <= 5; i++) {
    console.log("Number: " + i + ", Square: " + (i*i));
}`,
  java: `// Java - Hello World
public class Main {
    public static void main(String[] args) {
        String name = "Student";
        System.out.println("Hello, " + name + "!");
        System.out.println("Welcome to Career Compass IDE!");
        
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
    cout << "Welcome to Career Compass IDE!" << endl;
    
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
    printf("Welcome to Career Compass IDE!\\n");
    
    // Try some math
    for (int i = 1; i <= 5; i++) {
        printf("Number: %d, Square: %d\\n", i, i*i);
    }
    return 0;
}`,
};

// Web project files
const WEB_FILES: FileNode[] = [
  {
    id: 'folder-src',
    name: 'src',
    type: 'folder',
    children: [
      {
        id: 'file-index-html',
        name: 'index.html',
        type: 'file',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
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
            <p>This is a sample webpage. Edit the code to see live changes!</p>
            <button onclick="showMessage()">Click Me</button>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 My Website</p>
    </footer>
</body>
</html>`,
      },
      {
        id: 'file-styles-css',
        name: 'styles.css',
        type: 'file',
        language: 'css',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea, #764ba2);
    min-height: 100vh;
    color: #333;
}

header {
    background: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

header h1 { color: #667eea; }

nav a {
    margin-right: 1rem;
    color: #764ba2;
    text-decoration: none;
}

main {
    padding: 2rem;
    max-width: 800px;
    margin: 2rem auto;
    background: white;
    border-radius: 12px;
}

button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
}

footer {
    text-align: center;
    padding: 1rem;
    color: white;
}`,
      },
      {
        id: 'file-script-js',
        name: 'script.js',
        type: 'file',
        language: 'javascript',
        content: `function showMessage() {
    alert('Hello from JavaScript!');
    console.log('Button clicked!');
}

console.log('Page loaded!');`,
      },
    ],
  },
];

const findFileById = (files: FileNode[], id: string): FileNode | null => {
  for (const file of files) {
    if (file.id === id) return file;
    if (file.children) {
      const found = findFileById(file.children, id);
      if (found) return found;
    }
  }
  return null;
};

const updateFileContent = (files: FileNode[], id: string, content: string): FileNode[] => {
  return files.map(file => {
    if (file.id === id) return { ...file, content };
    if (file.children) return { ...file, children: updateFileContent(file.children, id, content) };
    return file;
  });
};

export const StudentIDE = () => {
  // Mode & Theme
  const [mode, setMode] = useState<IDEMode>('code');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Code mode state
  const [codeLanguage, setCodeLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState(SAMPLE_CODES.python);
  
  // Web mode state
  const [webFiles, setWebFiles] = useState<FileNode[]>(WEB_FILES);
  const [activeFileId, setActiveFileId] = useState<string>('file-index-html');
  
  // Common state
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAI, setShowAI] = useState(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugLine, setDebugLine] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  
  const { toast } = useToast();

  const activeFile = findFileById(webFiles, activeFileId);

  // Theme classes
  const bgMain = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const bgHeader = isDarkMode ? 'bg-[#323233]' : 'bg-white';
  const bgSidebar = isDarkMode ? 'bg-[#1e1e1e]' : 'bg-gray-100';
  const borderColor = isDarkMode ? 'border-[#333]' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  
  const getFileContent = (language: 'html' | 'css' | 'javascript'): string => {
    const srcFolder = webFiles.find(f => f.id === 'folder-src');
    if (!srcFolder?.children) return '';
    const fileMap: Record<string, string> = {
      html: 'file-index-html',
      css: 'file-styles-css',
      javascript: 'file-script-js',
    };
    const file = srcFolder.children.find(f => f.id === fileMap[language]);
    return file?.content || '';
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') setActiveFileId(file.id);
  };

  const handleWebCodeChange = (value: string) => {
    setWebFiles(prev => updateFileContent(prev, activeFileId, value));
  };

  const addConsoleMessage = (type: ConsoleMessage['type'], content: string) => {
    setConsoleMessages(prev => [...prev, {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    }]);
  };

  const handleLanguageChange = (value: string) => {
    const lang = value as ProgrammingLanguage;
    setCodeLanguage(lang);
    setCode(SAMPLE_CODES[lang]);
    setConsoleMessages([]);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleMessages([]);
    addConsoleMessage('info', 'Running code...');
    
    if (mode === 'web') {
      if (activeFile?.language === 'html' || activeFile?.language === 'css') {
        addConsoleMessage('success', 'Preview updated successfully!');
        setActiveTab('preview');
        setIsRunning(false);
        return;
      }
      
      if (activeFile?.language === 'javascript') {
        try {
          const logs: string[] = [];
          const originalLog = console.log;
          console.log = (...args) => {
            logs.push(args.map(a => String(a)).join(' '));
            originalLog.apply(console, args);
          };
          // eslint-disable-next-line no-new-func
          new Function(activeFile.content || '')();
          console.log = originalLog;
          logs.forEach(log => addConsoleMessage('output', log));
          addConsoleMessage('success', 'Execution completed!');
        } catch (error) {
          addConsoleMessage('error', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        setIsRunning(false);
        return;
      }
    }
    
    // Code mode - use API for Python, Java, C, C++
    try {
      const { data, error } = await supabase.functions.invoke('code-run', {
        body: { code, language: codeLanguage }
      });

      if (error) throw error;

      if (data.output) addConsoleMessage('output', data.output);
      if (data.error) addConsoleMessage('error', data.error);
      if (data.success && !data.error) {
        addConsoleMessage('success', 'Execution completed!');
      }
    } catch (error) {
      addConsoleMessage('error', `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDebug = () => {
    if (isDebugging) {
      setIsDebugging(false);
      setDebugLine(null);
      addConsoleMessage('info', 'Debug stopped.');
      return;
    }
    setIsDebugging(true);
    setDebugLine(1);
    addConsoleMessage('info', 'Debug mode started. Click "Next" to step through code.');
  };

  const handleNextStep = () => {
    const currentCode = mode === 'web' ? (activeFile?.content || '') : code;
    const lines = currentCode.split('\n');
    const nextLine = (debugLine || 0) + 1;
    
    if (nextLine > lines.length) {
      setIsDebugging(false);
      setDebugLine(null);
      addConsoleMessage('success', 'Debug completed.');
      return;
    }
    
    setDebugLine(nextLine);
    addConsoleMessage('info', `Line ${nextLine}: ${lines[nextLine - 1]?.trim() || '(empty)'}`);
  };

  const handleSave = () => {
    toast({ title: "Saved", description: "Your code has been saved." });
  };

  const handleReset = () => {
    if (mode === 'web') {
      setWebFiles(WEB_FILES);
    } else {
      setCode(SAMPLE_CODES[codeLanguage]);
    }
    setConsoleMessages([]);
    toast({ title: "Reset", description: "Code reset to default." });
  };

  const handleInsertCode = (insertCode: string) => {
    if (mode === 'web' && activeFile) {
      handleWebCodeChange((activeFile.content || '') + '\n' + insertCode);
    } else {
      setCode(code + '\n' + insertCode);
    }
    toast({ title: "Inserted", description: "Code added." });
  };

  const currentCode = mode === 'web' ? (activeFile?.content || '') : code;
  const currentLanguage = mode === 'web' ? (activeFile?.language || 'javascript') : codeLanguage;

  return (
    <div className={cn(
      "flex flex-col min-h-screen transition-colors",
      bgMain, textColor,
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-2 border-b", bgHeader, borderColor)}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm font-medium">Career Compass IDE</span>
          <Badge variant="secondary" className="text-xs">Pro</Badge>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <Tabs value={mode} onValueChange={(v) => setMode(v as IDEMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="code" className="text-xs gap-1.5 px-3">
                <Code2 className="w-3.5 h-3.5" />
                Code
              </TabsTrigger>
              <TabsTrigger value="web" className="text-xs gap-1.5 px-3">
                <Globe className="w-3.5 h-3.5" />
                Web
              </TabsTrigger>
              <TabsTrigger value="analyze" className="text-xs gap-1.5 px-3">
                <Search className="w-3.5 h-3.5" />
                Analyze
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {mode === 'code' && (
            <Select value={codeLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
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
          )}
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1">
          {mode === 'web' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="h-8 w-8 p-0"
            >
              {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Play className="w-4 h-4" />
            Run
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDebug}
            className={cn(
              "gap-1.5",
              isDebugging ? "text-red-600" : "text-orange-600"
            )}
          >
            {isDebugging ? <Square className="w-4 h-4" /> : <Bug className="w-4 h-4" />}
            {isDebugging ? 'Stop' : 'Debug'}
          </Button>
          
          {isDebugging && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextStep}
              className="gap-1.5 text-blue-600"
            >
              <StepForward className="w-4 h-4" />
              Next
            </Button>
          )}
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <Button variant="ghost" size="sm" onClick={handleSave} className="h-8 w-8 p-0">
            <Save className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-8 p-0">
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAI(!showAI)}
            className={cn("h-8 w-8 p-0", showAI && "text-primary")}
          >
            <Sparkles className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="h-8 w-8 p-0"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Analysis Mode */}
        {mode === 'analyze' ? (
          <CodeAnalysis isDark={isDarkMode} />
        ) : (
          <>
            {/* File Explorer (Web mode only) */}
            {mode === 'web' && showSidebar && (
              <div className={cn("w-52 shrink-0 border-r", bgSidebar, borderColor)}>
                <FileExplorer
                  files={webFiles}
                  activeFileId={activeFileId}
                  onFileSelect={handleFileSelect}
                />
              </div>
            )}

            {/* Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Mobile tabs for web mode */}
              {mode === 'web' && (
                <div className="lg:hidden border-b border-gray-200">
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'code' | 'preview')}>
                    <TabsList className="w-full justify-start rounded-none">
                      <TabsTrigger value="code" className="gap-2">
                        <FileCode className="w-4 h-4" />
                        Code
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              <div className="flex-1 flex overflow-hidden">
                {/* Code Editor */}
                <div className={cn(
                  "flex-1 flex flex-col min-w-0",
                  mode === 'web' && activeTab !== 'code' && "hidden lg:flex"
                )}>
                  {/* File tab for web mode */}
                  {mode === 'web' && activeFile && (
                    <div className={cn("flex items-center gap-2 px-4 py-1.5 border-b text-sm", bgHeader, borderColor)}>
                      {activeFile.language === 'html' && <span className="text-orange-500 font-bold">&lt;&gt;</span>}
                      {activeFile.language === 'css' && <span className="text-blue-500 font-bold">#</span>}
                      {activeFile.language === 'javascript' && <span className="text-yellow-600 font-bold">JS</span>}
                      <span>{activeFile.name}</span>
                    </div>
                  )}
                  
                  {/* Language indicator for code mode */}
                  {mode === 'code' && (
                    <div className={cn("flex items-center gap-2 px-4 py-1.5 border-b text-sm", bgHeader, borderColor)}>
                      <span>{LANGUAGES.find(l => l.value === codeLanguage)?.icon}</span>
                      <span>{LANGUAGES.find(l => l.value === codeLanguage)?.label}</span>
                    </div>
                  )}
                  
                  {/* Monaco Editor */}
                  <div className="flex-1">
                    <MonacoEditor
                      value={currentCode}
                      language={currentLanguage}
                      onChange={mode === 'web' ? handleWebCodeChange : setCode}
                      highlightLine={debugLine || undefined}
                      onSave={handleSave}
                      theme={isDarkMode ? 'vs-dark' : 'light'}
                    />
                  </div>
                  
                  {/* Console */}
                  <Console
                    messages={consoleMessages}
                    onClear={() => setConsoleMessages([])}
                    isCollapsed={isConsoleCollapsed}
                    onToggleCollapse={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                    isDark={isDarkMode}
                  />
                </div>

                {/* Web Preview (web mode only) */}
                {mode === 'web' && (
                  <div className={cn(
                    "w-1/2 border-l",
                    borderColor,
                    activeTab !== 'preview' && "hidden lg:block"
                  )}>
                    <WebPreview
                      html={getFileContent('html')}
                      css={getFileContent('css')}
                      javascript={getFileContent('javascript')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* AI Assistant */}
            {showAI && (
              <div className="w-80 shrink-0">
                <AIAssistant
                  currentCode={currentCode}
                  currentLanguage={currentLanguage}
                  onInsertCode={handleInsertCode}
                  isOpen={showAI}
                  onClose={() => setShowAI(false)}
                  isDark={isDarkMode}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentIDE;
