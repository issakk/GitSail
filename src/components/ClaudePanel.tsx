import { useState, useRef, useEffect } from 'react'
import { Send, Terminal, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface ClaudePanelProps {
  projectPath: string
}

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export function ClaudePanel({ projectPath }: ClaudePanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: `已在项目目录启动 Claude Code\n路径: ${projectPath}`,
      timestamp: Date.now()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // TODO: 通过 Tauri 调用 Claude Code
    // 模拟响应
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '这是 Claude 的模拟回复。实际使用时，这里会连接到 Claude Code CLI。',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border-l">
      {/* 头部 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Bot className="h-5 w-5 text-primary" />
        <span className="font-semibold">Claude Code</span>
        <div className="flex-1" />
        <button
          className="p-1.5 hover:bg-accent rounded-md"
          title="在终端中打开 Claude Code"
          onClick={() => {
            // TODO: 启动外部终端
          }}
        >
          <Terminal className="h-4 w-4" />
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' && 'flex-row-reverse'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              message.role === 'assistant' && 'bg-primary text-primary-foreground',
              message.role === 'user' && 'bg-secondary',
              message.role === 'system' && 'bg-muted'
            )}>
              {message.role === 'assistant' && <Bot className="h-4 w-4" />}
              {message.role === 'user' && <User className="h-4 w-4" />}
              {message.role === 'system' && <Terminal className="h-4 w-4" />}
            </div>
            <div className={cn(
              'max-w-[80%] rounded-lg px-3 py-2 text-sm',
              message.role === 'assistant' && 'bg-muted',
              message.role === 'user' && 'bg-primary text-primary-foreground',
              message.role === 'system' && 'bg-muted/50 text-muted-foreground text-xs'
            )}>
              <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-muted rounded-lg px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={3}
            className="flex-1 px-3 py-2 border rounded-md text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}
