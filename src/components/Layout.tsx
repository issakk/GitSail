import { Outlet, NavLink } from 'react-router-dom'
import { GitBranch, Settings, Home, Plus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useProjectStore } from '@/stores/useProjectStore'
import AddProjectDialog from './AddProjectDialog'
import { useState } from 'react'

export default function Layout() {
  const { projects, activeProjectId } = useProjectStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const activeProject = projects.find(p => p.id === activeProjectId)

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-64 border-r bg-card flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">GitSail</span>
        </div>

        {/* 主导航 */}
        <nav className="p-2 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )
            }
          >
            <Home className="h-4 w-4" />
            项目总览
          </NavLink>
          <button
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-left"
          >
            <Plus className="h-4 w-4" />
            添加项目
          </button>
        </nav>

        {/* 项目列表 */}
        <div className="flex-1 overflow-auto p-2">
          <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
            最近项目
          </div>
          <div className="space-y-1">
            {projects
              .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
              .slice(0, 10)
              .map((project) => (
                <NavLink
                  key={project.id}
                  to={`/project/${project.id}`}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors truncate',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    )
                  }
                  title={project.path}
                >
                  <GitBranch className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{project.name}</span>
                </NavLink>
              ))}
          </div>
        </div>

        {/* 底部设置 */}
        <div className="p-2 border-t">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )
            }
          >
            <Settings className="h-4 w-4" />
            设置
          </NavLink>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* 添加项目对话框 */}
      <AddProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  )
}
