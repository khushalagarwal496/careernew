import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: 'html' | 'css' | 'javascript';
  children?: FileNode[];
  content?: string;
}

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  onCreateFile?: (parentId: string | null, name: string, type: 'file' | 'folder') => void;
  isDark?: boolean;
}

const getFileIcon = (file: FileNode) => {
  if (file.type === 'folder') return null;
  
  switch (file.language) {
    case 'html':
      return <span className="text-orange-500 font-bold text-xs">&lt;&gt;</span>;
    case 'css':
      return <span className="text-blue-500 font-bold text-xs">#</span>;
    case 'javascript':
      return <span className="text-yellow-500 font-bold text-xs">JS</span>;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
};

const FileTreeItem = ({ 
  node, 
  depth = 0, 
  activeFileId, 
  onFileSelect,
  isDark = true
}: { 
  node: FileNode; 
  depth?: number; 
  activeFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  isDark?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const isActive = activeFileId === node.id;
  const isFolder = node.type === 'folder';

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm transition-colors text-sm",
          isActive && !isFolder 
            ? "bg-primary/20 text-primary" 
            : isDark ? "hover:bg-white/5" : "hover:bg-gray-200",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder && (
          <span className="w-4 h-4 flex items-center justify-center">
            {isOpen ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </span>
        )}
        
        <span className="w-4 h-4 flex items-center justify-center">
          {isFolder ? (
            isOpen ? (
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500" />
            )
          ) : (
            getFileIcon(node)
          )}
        </span>
        
        <span className={cn(
          "truncate",
          isActive && !isFolder && "font-medium"
        )}>
          {node.name}
        </span>
      </div>
      
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFileId={activeFileId}
              onFileSelect={onFileSelect}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer = ({ files, activeFileId, onFileSelect, isDark = true }: FileExplorerProps) => {
  const bgMain = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-100';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const textColor = isDark ? 'text-white' : 'text-gray-900';
  
  return (
    <div className={cn("h-full flex flex-col", bgMain, textColor)}>
      {/* Header */}
      <div className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b", borderColor)}>
        Explorer
      </div>
      
      {/* Project Name */}
      <div className={cn("px-3 py-2 text-sm font-medium border-b flex items-center gap-2", borderColor)}>
        <ChevronDown className="w-3 h-3" />
        <span>My Project</span>
      </div>
      
      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((file) => (
          <FileTreeItem
            key={file.id}
            node={file}
            activeFileId={activeFileId}
            onFileSelect={onFileSelect}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
};
