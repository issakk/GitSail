use tauri::command;
use serde::{Deserialize, Serialize};
use std::path::Path;

use crate::git::{GitRepo, FileStatus, Branch, Commit, Diff};
use crate::project::ProjectInfo;
use crate::editor::{read_file as editor_read_file, write_file as editor_write_file, list_directory};
use crate::claude::{launch_claude, is_claude_installed};

// ============== 项目相关命令 ==============

#[derive(Serialize)]
pub struct ProjectValidationResult {
    valid: bool,
    is_git_repo: bool,
    error: Option<String>,
}

#[command]
pub fn validate_project_path(path: String) -> Result<ProjectValidationResult, String> {
    let path = Path::new(&path);

    if !path.exists() {
        return Ok(ProjectValidationResult {
            valid: false,
            is_git_repo: false,
            error: Some("路径不存在".to_string()),
        });
    }

    if !path.is_dir() {
        return Ok(ProjectValidationResult {
            valid: false,
            is_git_repo: false,
            error: Some("路径不是目录".to_string()),
        });
    }

    // 检查是否是 git 仓库
    let git_dir = path.join(".git");
    let is_git_repo = git_dir.exists() && git_dir.is_dir();

    Ok(ProjectValidationResult {
        valid: true,
        is_git_repo,
        error: None,
    })
}

#[command]
pub fn get_project_info(path: String) -> Result<ProjectInfo, String> {
    let repo = GitRepo::open(&path)?;
    ProjectInfo::from_repo(&path, &repo)
}

// ============== Git 相关命令 ==============

#[derive(Serialize)]
pub struct RepoStatusResponse {
    branch: String,
    ahead: i32,
    behind: i32,
    clean: bool,
    files: Vec<FileStatus>,
}

#[command]
pub fn git_status(path: String) -> Result<RepoStatusResponse, String> {
    let repo = GitRepo::open(&path)?;
    let status = repo.status()?;

    Ok(RepoStatusResponse {
        branch: status.branch,
        ahead: status.ahead,
        behind: status.behind,
        clean: status.files.is_empty(),
        files: status.files,
    })
}

#[command]
pub fn git_branches(path: String) -> Result<Vec<Branch>, String> {
    let repo = GitRepo::open(&path)?;
    repo.branches()
}

#[command]
pub fn git_commits(path: String, limit: Option<usize>) -> Result<Vec<Commit>, String> {
    let repo = GitRepo::open(&path)?;
    repo.log(limit.unwrap_or(50))
}

#[command]
pub fn git_stage_file(path: String, file_path: String) -> Result<(), String> {
    let repo = GitRepo::open(&path)?;
    repo.stage(&file_path)
}

#[command]
pub fn git_unstage_file(path: String, file_path: String) -> Result<(), String> {
    let repo = GitRepo::open(&path)?;
    repo.unstage(&file_path)
}

#[derive(Deserialize)]
pub struct CommitRequest {
    message: String,
    author_name: Option<String>,
    author_email: Option<String>,
}

#[command]
pub fn git_commit(path: String, request: CommitRequest) -> Result<String, String> {
    let repo = GitRepo::open(&path)?;
    repo.commit(&request.message, request.author_name.as_deref(), request.author_email.as_deref())
}

#[command]
pub fn git_pull(path: String) -> Result<String, String> {
    let repo = GitRepo::open(&path)?;
    repo.pull()
}

#[command]
pub fn git_push(path: String) -> Result<String, String> {
    let repo = GitRepo::open(&path)?;
    repo.push()
}

#[command]
pub fn git_checkout(path: String, branch: String, create: Option<bool>) -> Result<(), String> {
    let repo = GitRepo::open(&path)?;
    if create.unwrap_or(false) {
        repo.create_branch(&branch)?;
    }
    repo.checkout(&branch)
}

#[command]
pub fn git_create_branch(path: String, branch: String, checkout: Option<bool>) -> Result<(), String> {
    let repo = GitRepo::open(&path)?;
    repo.create_branch(&branch)?;
    if checkout.unwrap_or(false) {
        repo.checkout(&branch)?;
    }
    Ok(())
}

#[command]
pub fn git_diff(path: String, file_path: Option<String>, staged: Option<bool>) -> Result<Diff, String> {
    let repo = GitRepo::open(&path)?;
    repo.diff(file_path.as_deref(), staged.unwrap_or(false))
}

// ============== 文件系统相关命令 ==============

#[derive(Serialize)]
pub struct FileItem {
    name: String,
    path: String,
    is_directory: bool,
    children: Option<Vec<FileItem>>,
}

#[command]
pub fn read_directory(path: String, recursive: Option<bool>) -> Result<Vec<FileItem>, String> {
    list_directory(&path, recursive.unwrap_or(false))
}

#[command]
pub fn read_file(path: String) -> Result<String, String> {
    editor_read_file(&path)
}

#[command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    editor_write_file(&path, &content)
}

// ============== Claude Code 相关命令 ==============

#[command]
pub fn check_claude_code_installed() -> Result<bool, String> {
    is_claude_installed().map_err(|e| e.to_string())
}

#[command]
pub fn launch_claude_code(project_path: String, claude_path: Option<String>) -> Result<(), String> {
    launch_claude(&project_path, claude_path.as_deref())
}
