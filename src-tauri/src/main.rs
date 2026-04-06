// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod git;
mod project;
mod editor;
mod claude;

use commands::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // 项目相关
            get_project_info,
            validate_project_path,

            // Git 相关
            git_status,
            git_branches,
            git_commits,
            git_stage_file,
            git_unstage_file,
            git_commit,
            git_pull,
            git_push,
            git_checkout,
            git_create_branch,
            git_diff,

            // 文件系统相关
            read_directory,
            read_file,
            write_file,

            // Claude Code 相关
            launch_claude_code,
            check_claude_code_installed,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
