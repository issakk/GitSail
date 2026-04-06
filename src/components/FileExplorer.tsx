import { useState, useEffect } from 'react'
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { FileItem as FileItemType } from '@/types'

interface FileExplorerProps {
  projectPath: string
}

export function FileExplorer({ projectPath }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItemType[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([projectPath]))
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  // TODO: 通过 Tauri 读取文件系统
  useEffect(() => {
    // 模拟文件数据
    setFiles([
      {
        name: 'src',
        path: `${projectPath}/src`,
        isDirectory: true,
        children: [
          { name: 'main.rs', path: `${projectPath}/src/main.rs`, isDirectory: false },
          { name: 'lib.rs', path: `${projectPath}/src/lib.rs`, isDirectory: false },
        ]
      },
      { name: 'Cargo.toml', path: `${projectPath}/Cargo.toml`, isDirectory: false },
      { name: 'README.md', path: `${projectPath}/README.md`, isDirectory: false },
      { name: '.gitignore', path: `${projectPath}/.gitignore`, isDirectory: false },
    ])
  }, [projectPath])

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedDirs(newExpanded)
  }

  const renderFileTree = (items: FileItemType[], depth = 0) => {
    return items.map((item) => (
      <div key={item.path}>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 cursor-pointer select-none hover:bg-accent',
            selectedFile === item.path && 'bg-accent'
          )}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (item.isDirectory) {
              toggleDir(item.path)
            } else {
              setSelectedFile(item.path)
              // TODO: 打开文件
            }
          }}
        >
          {item.isDirectory ? (
            <>
              {expandedDirs.has(item.path) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              {expandedDirs.has(item.path) ? (
                <FolderOpen className="h-4 w-4 text-yellow-500" />
              ) : (
                <Folder className="h-4 w-4 text-yellow-500" />
              )}
            </>
          ) : (
            <>
              <span className="w-3" />
              <File className="h-4 w-4 text-blue-400" />
            </>
          )}
          <span className="text-sm truncate">{item.name}</span>
        </div>
        {item.isDirectory &&
          expandedDirs.has(item.path) &&
          item.children &&
          renderFileTree(item.children, depth + 1)}
      </div>
    ))
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-medium">文件</span>
        <button className="p-1 hover:bg-accent rounded">
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-auto py-1">
        {renderFileTree(files)}
      </div>
    </div>
  )
}
