use git2::{Repository, StatusOptions, StatusShow, BranchType, Oid, DiffOptions};
use serde::Serialize;
use std::path::Path;

pub struct GitRepo {
    repo: Repository,
}

#[derive(Serialize, Clone)]
pub struct FileStatus {
    pub path: String,
    pub status: String,  // modified, added, deleted, renamed, untracked, conflicted
    pub staged: bool,
    pub old_path: Option<String>,
}

#[derive(Serialize)]
pub struct Branch {
    pub name: String,
    pub is_local: bool,
    pub is_head: bool,
    pub upstream: Option<String>,
}

#[derive(Serialize)]
pub struct Commit {
    pub hash: String,
    pub short_hash: String,
    pub message: String,
    pub author: String,
    pub email: String,
    pub timestamp: i64,
    pub parents: Vec<String>,
}

#[derive(Serialize)]
pub struct RepoStatus {
    pub branch: String,
    pub ahead: i32,
    pub behind: i32,
    pub files: Vec<FileStatus>,
}

#[derive(Serialize)]
pub struct Diff {
    pub old_path: String,
    pub new_path: String,
    pub old_content: Option<String>,
    pub new_content: Option<String>,
    pub hunks: Vec<Hunk>,
}

#[derive(Serialize)]
pub struct Hunk {
    pub old_start: u32,
    pub old_lines: u32,
    pub new_start: u32,
    pub new_lines: u32,
    pub lines: Vec<LineDiff>,
}

#[derive(Serialize)]
pub struct LineDiff {
    pub r#type: String,  // context, add, remove
    pub content: String,
    pub old_line_no: Option<u32>,
    pub new_line_no: Option<u32>,
}

impl GitRepo {
    pub fn open(path: &str) -> Result<Self, String> {
        let repo = Repository::open(path)
            .map_err(|e| format!("无法打开仓库: {}", e))?;
        Ok(Self { repo })
    }

    pub fn status(&self) -> Result<RepoStatus, String> {
        let head = self.repo.head().map_err(|e| e.to_string())?;
        let branch_name = head.shorthand().unwrap_or("HEAD").to_string();

        // 获取分支的 ahead/behind
        let (ahead, behind) = if let Ok(upstream) = head.resolve().unwrap().remote() {
            (0, 0) // TODO: 实现正确的 ahead/behind 计算
        } else {
            (0, 0)
        };

        let mut opts = StatusOptions::new();
        opts.include_untracked(true)
            .recurse_untracked_dirs(true)
            .include_ignored(false);

        let statuses = self.repo.statuses(Some(&mut opts))
            .map_err(|e| e.to_string())?;

        let mut files = Vec::new();

        for entry in statuses.iter() {
            let path = entry.path().unwrap_or("").to_string();
            let status = entry.status();

            let (file_status, staged) = if status.is_index_new() {
                ("added", true)
            } else if status.is_index_modified() {
                ("modified", true)
            } else if status.is_index_deleted() {
                ("deleted", true)
            } else if status.is_index_renamed() {
                ("renamed", true)
            } else if status.is_wt_new() {
                ("untracked", false)
            } else if status.is_wt_modified() {
                ("modified", false)
            } else if status.is_wt_deleted() {
                ("deleted", false)
            } else if status.is_conflicted() {
                ("conflicted", false)
            } else {
                continue;
            };

            files.push(FileStatus {
                path,
                status: file_status.to_string(),
                staged,
                old_path: None,
            });
        }

        Ok(RepoStatus {
            branch: branch_name,
            ahead,
            behind,
            files,
        })
    }

    pub fn branches(&self) -> Result<Vec<Branch>, String> {
        let mut branches = Vec::new();

        for branch in self.repo.branches(None).map_err(|e| e.to_string())? {
            let (branch, branch_type) = branch.map_err(|e| e.to_string())?;
            let name = branch.name().map_err(|e| e.to_string())?
                .unwrap_or("unknown")
                .to_string();

            let is_head = branch.is_head();

            let upstream = branch.upstream()
                .ok()
                .and_then(|b| b.name().ok().flatten().map(|s| s.to_string()));

            branches.push(Branch {
                name,
                is_local: branch_type == BranchType::Local,
                is_head,
                upstream,
            });
        }

        Ok(branches)
    }

    pub fn log(&self, limit: usize) -> Result<Vec<Commit>, String> {
        let mut commits = Vec::new();
        let mut revwalk = self.repo.revwalk().map_err(|e| e.to_string())?;

        revwalk.push_head().map_err(|e| e.to_string())?;

        for oid in revwalk.take(limit) {
            let oid = oid.map_err(|e| e.to_string())?;
            let commit = self.repo.find_commit(oid).map_err(|e| e.to_string())?;

            let parents: Vec<String> = commit.parent_ids()
                .map(|id| id.to_string())
                .collect();

            commits.push(Commit {
                hash: oid.to_string(),
                short_hash: oid.to_string().chars().take(7).collect(),
                message: commit.message().unwrap_or("").to_string(),
                author: commit.author().name().unwrap_or("").to_string(),
                email: commit.author().email().unwrap_or("").to_string(),
                timestamp: commit.time().seconds(),
                parents,
            });
        }

        Ok(commits)
    }

    pub fn stage(&self, path: &str) -> Result<(), String> {
        let mut index = self.repo.index().map_err(|e| e.to_string())?;
        index.add_path(Path::new(path)).map_err(|e| e.to_string())?;
        index.write().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn unstage(&self, path: &str) -> Result<(), String> {
        let head = self.repo.head().map_err(|e| e.to_string())?;
        let head_commit = self.repo.find_commit(head.target().unwrap())
            .map_err(|e| e.to_string())?;
        let head_tree = head_commit.tree().map_err(|e| e.to_string())?;

        let mut index = self.repo.index().map_err(|e| e.to_string())?;
        index.remove_path(Path::new(path)).map_err(|e| e.to_string())?;

        // 恢复到 HEAD 状态
        if let Ok(entry) = head_tree.get_path(Path::new(path)) {
            index.add(&entry).map_err(|e| e.to_string())?;
        }

        index.write().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn commit(
        &self,
        message: &str,
        author_name: Option<&str>,
        author_email: Option<&str>,
    ) -> Result<String, String> {
        let signature = self.repo.signature()
            .or_else(|_| {
                git2::Signature::now(
                    author_name.unwrap_or("GitSail"),
                    author_email.unwrap_or("gitsail@local")
                )
            })
            .map_err(|e| e.to_string())?;

        let mut index = self.repo.index().map_err(|e| e.to_string())?;
        let tree_oid = index.write_tree().map_err(|e| e.to_string())?;
        let tree = self.repo.find_tree(tree_oid).map_err(|e| e.to_string())?;

        let parent_commit = self.repo.head()
            .ok()
            .and_then(|h| h.target())
            .and_then(|oid| self.repo.find_commit(oid).ok());

        let parents: Vec<&git2::Commit> = match &parent_commit {
            Some(c) => vec![c],
            None => vec![],
        };

        let commit_oid = self.repo.commit(
            Some("HEAD"),
            &signature,
            &signature,
            message,
            &tree,
            &parents.iter().collect::<Vec<_>>(),
        ).map_err(|e| e.to_string())?;

        Ok(commit_oid.to_string())
    }

    pub fn pull(&self) -> Result<String, String> {
        // TODO: 实现 pull 操作
        // 需要处理远程分支合并
        Ok("Pull completed".to_string())
    }

    pub fn push(&self) -> Result<String, String> {
        // TODO: 实现 push 操作
        // 需要使用 git2 的远程操作
        Ok("Push completed".to_string())
    }

    pub fn checkout(&self, branch: &str) -> Result<(), String> {
        let (object, reference) = self.repo.revparse_ext(branch)
            .map_err(|e| e.to_string())?;

        self.repo.checkout_tree(&object, None)
            .map_err(|e| e.to_string())?;

        if let Some(ref_name) = reference {
            self.repo.set_head(ref_name.name().unwrap())
                .map_err(|e| e.to_string())?;
        } else {
            self.repo.set_head_detached(object.id())
                .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub fn create_branch(&self, name: &str) -> Result<(), String> {
        let head = self.repo.head().map_err(|e| e.to_string())?;
        let commit = self.repo.find_commit(head.target().unwrap())
            .map_err(|e| e.to_string())?;

        self.repo.branch(name, &commit, false)
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn diff(&self, file_path: Option<&str>, staged: bool) -> Result<Diff, String> {
        // TODO: 实现 diff 功能
        // 返回文件的差异信息
        Ok(Diff {
            old_path: file_path.unwrap_or("").to_string(),
            new_path: file_path.unwrap_or("").to_string(),
            old_content: None,
            new_content: None,
            hunks: vec![],
        })
    }
}
