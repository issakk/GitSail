use serde::Serialize;
use crate::git::GitRepo;

#[derive(Serialize)]
pub struct ProjectInfo {
    pub name: String,
    pub path: String,
    pub is_git_repo: bool,
    pub current_branch: Option<String>,
    pub remote_url: Option<String>,
    pub commit_count: i32,
}

impl ProjectInfo {
    pub fn from_repo(path: &str, repo: &GitRepo) -> Result<Self, String> {
        let name = std::path::Path::new(path)
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("Unknown")
            .to_string();

        // TODO: 获取分支信息和远程 URL

        Ok(ProjectInfo {
            name,
            path: path.to_string(),
            is_git_repo: true,
            current_branch: None,
            remote_url: None,
            commit_count: 0,
        })
    }
}
