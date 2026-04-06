import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import { GitPanel } from '@/components/GitPanel'
import { FileExplorer } from '@/components/FileExplorer'
import { EditorPanel } from '@/components/EditorPanel'
import { ClaudePanel } from '@/components/ClaudePanel'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, setActiveProject } = useProjectStore()
  const project = projects.find((p) => p.id === id)

  useEffect(() => {
    if (id) {
      setActiveProject(id)
    }
  }, [id, setActiveProject])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">项目未找到</h2>
          <p className="text-muted-foreground mb-4">
            该项目可能已被删除或不存在
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 项目头部 */}
      <div className="px-6 py-4 border-b flex items-center justify-between bg-card">
        <div>
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.path}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-secondary rounded-full text-sm">
            {project.branch || 'main'}
          </span>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：文件浏览器 */}
        <div className="w-64 border-r flex-shrink-0">
          <FileExplorer projectPath={project.path} />
        </div>

        {/* 中间：编辑器 + Git */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 编辑器区域 */}
          <div className="flex-1 min-h-0">
            <EditorPanel />
          </div>

          {/* Git 面板 */}
          <div className="h-64 border-t">
            <GitPanel projectId={project.id} projectPath={project.path} />
          </div>
        </div>

        {/* 右侧：Claude 面板 */}
        <div className="w-96 border-l flex-shrink-0">
          <ClaudePanel projectPath={project.path} />
        </div>
      </div>
    </div>
  )
}
