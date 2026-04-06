import { useState } from 'react'
import { Settings as SettingsIcon, FolderOpen } from 'lucide-react'

export default function Settings() {
  const [claudePath, setClaudePath] = useState('claude')
  const [defaultEditor, setDefaultEditor] = useState('vscode')
  const [theme, setTheme] = useState('system')

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <div className="space-y-6">
        {/* Claude Code 设置 */}
        <section className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Claude Code</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Claude Code 路径
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={claudePath}
                  onChange={(e) => setClaudePath(e.target.value)}
                  placeholder="claude"
                  className="flex-1 px-3 py-2 border rounded-md text-sm bg-background"
                />
                <button
                  type="button"
                  className="px-3 py-2 border rounded-md hover:bg-accent"
                >
                  <FolderOpen className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Claude Code 的可执行文件路径，默认为系统 PATH 中的 claude
              </p>
            </div>
          </div>
        </section>

        {/* 编辑器设置 */}
        <section className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">编辑器</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                默认编辑器
              </label>
              <select
                value={defaultEditor}
                onChange={(e) => setDefaultEditor(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="internal">内置编辑器</option>
                <option value="vscode">VS Code</option>
                <option value="cursor">Cursor</option>
                <option value="idea">IntelliJ IDEA</option>
              </select>
            </div>
          </div>
        </section>

        {/* 外观设置 */}
        <section className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">外观</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">主题</label>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-4 py-2 rounded-md text-sm capitalize ${
                      theme === t
                        ? 'bg-primary text-primary-foreground'
                        : 'border hover:bg-accent'
                    }`}
                  >
                    {t === 'light' && '浅色'}
                    {t === 'dark' && '深色'}
                    {t === 'system' && '跟随系统'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 关于 */}
        <section className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">关于</h2>
          <div className="text-sm text-muted-foreground">
            <p>GitSail v0.1.0</p>
            <p>基于 Tauri + React 构建</p>
          </div>
        </section>
      </div>
    </div>
  )
}
