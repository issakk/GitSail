import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { GitBranch, Clock, Folder, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { projects, removeProject } = useProjectStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-6 space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">项目总览</h1>
          <p className="text-muted-foreground">
            管理 {projects.length} 个项目
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
          />
          <div className="flex border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'px-3 py-2 text-sm',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              网格
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-2 text-sm',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              )}
            >
              列表
            </button>
          </div>
        </div>
      </div>

      {/* 项目列表 */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          )}
        >
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onDelete={() => removeProject(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ProjectCardProps {
  project: {
    id: string
    name: string
    path: string
    description?: string
    tags: string[]
    lastOpenedAt?: number
    branch?: string
  }
  viewMode: 'grid' | 'list'
  onDelete: () => void
}

function ProjectCard({ project, viewMode, onDelete }: ProjectCardProps) {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '从未打开'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  if (viewMode === 'list') {
    return (
      <Link
        to={`/project/${project.id}`}
        className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow bg-card"
      >
        <div className="p-2 bg-primary/10 rounded-lg">
          <GitBranch className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{project.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{project.path}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.branch && (
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              {project.branch}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(project.lastOpenedAt)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </Link>
    )
  }

  return (
    <Link
      to={`/project/${project.id}`}
      className="group p-4 border rounded-lg hover:shadow-md transition-all bg-card"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <GitBranch className="h-5 w-5 text-primary" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // TODO: 在文件管理器中打开
            }}
            className="p-1.5 hover:bg-accent rounded-md"
            title="在文件管理器中打开"
          >
            <Folder className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold mb-1 truncate">{project.name}</h3>
      <p className="text-sm text-muted-foreground mb-3 truncate">{project.path}</p>

      {project.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex gap-1">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-secondary rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDate(project.lastOpenedAt)}
        </span>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 bg-muted rounded-full mb-4">
        <GitBranch className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">还没有项目</h3>
      <p className="text-muted-foreground max-w-sm">
        点击"添加项目"按钮，将你的 Git 仓库添加到管理列表中
      </p>
    </div>
  )
}
