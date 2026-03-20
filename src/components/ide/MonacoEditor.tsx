import { useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

// Monaco editor type
type MonacoEditor = Parameters<OnMount>[0];

interface MonacoEditorProps {
  value: string;
  language: 'html' | 'css' | 'javascript' | 'python' | 'java' | 'cpp' | 'c';
  onChange: (value: string) => void;
  readOnly?: boolean;
  highlightLine?: number;
  onSave?: () => void;
  theme?: 'vs-dark' | 'light';
}

export const MonacoEditor = ({ 
  value, 
  language, 
  onChange, 
  readOnly = false,
  highlightLine,
  onSave,
  theme = 'vs-dark'
}: MonacoEditorProps) => {
  const editorRef = useRef<MonacoEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
      fontLigatures: true,
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'languageDefined',
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      insertSpaces: true,
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      renderLineHighlight: 'all',
    });

    // Add save shortcut
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.();
    });

    // Focus the editor
    editor.focus();
  }, [onSave]);

  const handleChange: OnChange = useCallback((value) => {
    onChange(value || '');
  }, [onChange]);

  // Highlight specific line (for debugging)
  useEffect(() => {
    if (!editorRef.current || !highlightLine) return;

    const editor = editorRef.current;
    const monaco = (window as any).monaco;
    
    if (!monaco) return;

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(highlightLine, 1, highlightLine, 1),
        options: {
          isWholeLine: true,
          className: 'debug-line-highlight',
          glyphMarginClassName: 'debug-glyph',
          linesDecorationsClassName: 'debug-line-decoration',
        },
      },
    ]);
  }, [highlightLine]);

  const getMonacoLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      html: 'html',
      css: 'css',
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    return languageMap[lang] || 'plaintext';
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={value}
        theme={theme}
        onChange={handleChange}
        onMount={handleEditorMount}
        loading={
          <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading Editor...</span>
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
};
