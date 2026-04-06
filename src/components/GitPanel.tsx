import { useState, useEffect } from 'react'
import { GitBranch, GitCommit, GitPullRequest, GitMerge, Plus, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { RepoStatus, Branch, Commit } from '@/types'

interface GitPanelProps {
  projectId: string
  projectPath: string
}

export function GitPanel({ projectId, projectPath }: GitPanelProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'history' | 'branches'>('changes')
  const [repoStatus, setRepoStatus] = useState<RepoStatus | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [commits, setCommits] = useState<Commit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')

  // TODO: 通过 Tauri 调用 Rust 获取 Git 状态
  const refreshStatus = async () => {
    setIsLoading(true)
    try {
      // 模拟数据
      setRepoStatus({
        ahead: 0,
        behind: 0,
        branch: 'main',
        clean: false,
        files: [
          { path: 'src/main.rs', status: 'modified', staged: true },
          { path: 'Cargo.toml', status: 'modified', staged: false },
          { path: 'README.md', status: 'untracked', staged: false },
        ]
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [projectPath])

  const stagedFiles = repoStatus?.files.filter(f => f.staged) || []
  const unstagedFiles = repoStatus?.files.filter(f => !f.staged) || []

  return (
    <div className="h-full flex flex-col bg-card">
      {/* 标签栏 */}
      <div className="flex items-center border-b">
        <button
          onClick={() => setActiveTab('changes')}
          className={cn(
            'px-4 py-2 text-sm border-b-2 transition-colors',
            activeTab === 'changes'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          变更 {repoStatus?.files.length ? `(${repoStatus.files.length})` : ''}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'px-4 py-2 text-sm border-b-2 transition-colors',
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          历史
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={cn(
            'px-4 py-2 text-sm border-b-2 transition-colors',
            activeTab === 'branches'
              ? 'border-primary text-primary'
              : 'border-transparent hover:text-primary'
          )}
        >
          分支
        </button>
        <div className="flex-1" />
        <button
          onClick={refreshStatus}
          disabled={isLoading}
          className="px-3 py-1.5 mr-2 hover:bg-accent rounded-md"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'changes' && (
          <div className="p-4 space-y-4">
            {/* 提交输入框 */}
            <div className="space-y-2">
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="提交信息 (按 Ctrl+Enter 提交)"
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              />
              <div className="flex gap-2">
                <button
                  disabled={!commitMessage || stagedFiles.length === 0}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
                >
                  <Check className="h-4 w-4 inline mr-1" />
                  提交
                </button>
                <button
                  disabled={repoStatus?.clean}
                  className="px-4 py-1.5 border rounded-md text-sm hover:bg-accent disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  暂存所有
                </button>
              </div>
            </div>

            {/* 已暂存文件 */}
            {stagedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  已暂存 ({stagedFiles.length})
                </h4>
                <div className="space-y-1">
                  {stagedFiles.map((file) => (
                    <FileItem key={file.path} file={file} />
                  ))}
                </div>
              </div>
            )}

            {/* 未暂存文件 */}
            {unstagedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  变更 ({unstagedFiles.length})
                </h4>
                <div className="space-y-1">
                  {unstagedFiles.map((file) => (
                    <FileItem key={file.path} file={file} />
                  ))}
                </div>
              </div>
            )}

            {repoStatus?.clean && (
              <div className="text-center py-8 text-muted-foreground">
                工作区干净，没有变更
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-4">
            <div className="text-center text-muted-foreground py-8">
              提交历史将在这里显示
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">分支列表</h4>
              <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-accent">
                <Plus className="h-3 w-3 inline mr-1" />
                新建分支
              </button>
            </div>
            <div className="text-center text-muted-foreground py-8">
              分支列表将在这里显示
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FileItem({ file }: { file: { path: string; status: string; staged: boolean } }) {
  const statusColors: Record<string, string> = {
    modified: 'text-yellow-500',
    added: 'text-green-500',
    deleted: 'text-red-500',
    renamed: 'text-blue-500',
    untracked: 'text-gray-400',
  }

  const statusLabels: Record<string, string> = {
    modified: 'M',
    added: 'A',
    deleted: 'D',
    renamed: 'R',
    untracked: '?',
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md group cursor-pointer">
      <input
        type="checkbox"
        checked={file.staged}
        onChange={() => {}}
        className="rounded"
      />
      <span className={cn('text-xs font-mono w-4', statusColors[file.status])}>
        {statusLabels[file.status]}
      </span>
      <span className="text-sm flex-1 truncate">{file.path}</span>
    </div>
  )
}
