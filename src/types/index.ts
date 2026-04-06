// 项目类型定义
export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  tags: string[];
  lastOpenedAt?: number;
  createdAt: number;
  remoteUrl?: string;
  branch?: string;
}

// Git提交信息
export interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  timestamp: number;
  parents: string[];
}

// Git分支
export interface Branch {
  name: string;
  isLocal: boolean;
  isHead: boolean;
  upstream?: string;
}

// Git文件状态
export interface FileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'untracked' | 'conflicted';
  staged: boolean;
  oldPath?: string;
}

// 仓库状态
export interface RepoStatus {
  ahead: number;
  behind: number;
  branch: string;
  clean: boolean;
  files: FileStatus[];
}

// 差异信息
export interface Diff {
  oldPath: string;
  newPath: string;
  oldContent?: string;
  newContent?: string;
  hunks: Hunk[];
}

export interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: LineDiff[];
}

export interface LineDiff {
  type: 'context' | 'add' | 'remove';
  content: string;
  oldLineNo?: number;
  newLineNo?: number;
}

// 文件系统项
export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
}

// 应用状态
export interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  recentProjects: string[];
}
