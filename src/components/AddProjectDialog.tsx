import { useState, useRef } from 'react'
import { FolderOpen, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useProjectStore } from '@/stores/useProjectStore'

interface AddProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddProjectDialog({ open, onOpenChange }: AddProjectDialogProps) {
  const { addProject } = useProjectStore()
  const [path, setPath] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // TODO: 使用 Tauri 的 dialog API 选择文件夹
  const handleSelectFolder = async () => {
    // 暂时使用 input
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        const folderPath = files[0].path || files[0].webkitRelativePath.split('/')[0]
        setPath(folderPath)
        // 从路径提取默认名称
        const defaultName = folderPath.split(/[/\\]/).pop() || ''
        if (!name) setName(defaultName)
      }
    }
    input.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!path || !name) return

    setIsLoading(true)
    try {
      // TODO: 验证路径是否为有效的 git 仓库
      addProject({
        name,
        path,
        description,
        tags: [],
      })
      onOpenChange(false)
      // 重置表单
      setPath('')
      setName('')
      setDescription('')
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card w-full max-w-md rounded-lg border shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">添加项目</h2>
          <p className="text-sm text-muted-foreground">
            将 Git 仓库添加到管理列表
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 路径选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">项目路径</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="选择项目文件夹..."
                className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
                required
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="px-3 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">项目名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称"
              className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              required
            />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">描述（可选）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="项目描述..."
              rows={3}
              className="w-full px-3 py-2 border rounded-md text-sm bg-background resize-none"
            />
          </div>

          {/* 按钮 */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading || !path || !name}
              className={cn(
                'px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md transition-colors',
                (isLoading || !path || !name) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '添加'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
