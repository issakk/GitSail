import { useState } from 'react'
import { X, FileCode } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Tab {
  id: string
  name: string
  path: string
  content: string
  language: string
  isDirty?: boolean
}

export function EditorPanel() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'main.rs',
      path: '/src/main.rs',
      content: `fn main() {
    println!("Hello, GitSail!");
}`,
      language: 'rust',
      isDirty: true
    }
  ])
  const [activeTabId, setActiveTabId] = useState('1')

  const activeTab = tabs.find(t => t.id === activeTabId)

  const closeTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id)
    }
  }

  // TODO: 集成 Monaco Editor
  // 暂时使用简单的 textarea
  return (
    <div className="h-full flex flex-col">
      {/* 标签栏 */}
      <div className="flex overflow-x-auto border-b bg-muted/50">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer border-r min-w-fit group',
              activeTabId === tab.id
                ? 'bg-background border-t-2 border-t-primary'
                : 'hover:bg-muted'
            )}
          >
            <FileCode className="h-3.5 w-3.5" />
            <span className={cn(tab.isDirty && 'italic')}>
              {tab.name}
              {tab.isDirty && ' *'}
            </span>
            <button
              onClick={(e) => closeTab(e, tab.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted-foreground/20 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 relative">
        {activeTab ? (
          <textarea
            value={activeTab.content}
            onChange={() => {
              // TODO: 更新内容
            }}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-background"
            spellCheck={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FileCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>选择文件开始编辑</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
